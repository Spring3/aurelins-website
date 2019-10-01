import React, { useState, useEffect, useRef } from 'react';
import { graphql } from 'gatsby';
import styled, { css } from 'styled-components';
import {
  Scene,
  Color,
  Box3,
  PerspectiveCamera,
  WebGLRenderer,
  HemisphereLight,
  Mesh,
  WireframeGeometry,
  LineSegments,
  Group,
  Vector3,
  DoubleSide,
  PointLight,
  PlaneGeometry,
  MeshBasicMaterial,
  LightShadow
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import OrbitControls from 'orbit-controls-es6';

import MainLayout from '../layouts/MainLayout';
import { withImagePreload } from '../hoc/withImagePreload';
import OGP from '../components/OGP';

const Wrapper = styled.article`
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(12, minmax(20px, 1fr));

  @media (max-width: 900px) {
    margin-top: 100px;
  }
`;

const ImageWrapper = styled.figure`
  grid-column: span 6;
  grid-gap: 1rem;
  margin: 0;

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 2rem;
  }

  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

const PreviewImage = withImagePreload(styled.img`
  margin-bottom: 2rem;
  height: auto;
  max-height: 600px;
  max-width: 100%;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0px 10px 15px 0px rgba(50, 50, 50, .3);
  

  ${({ isLoading }) => isLoading && css`
    filter: blur(10px);
  `}

  &:last-child {
    margin-bottom: 0;
  }
`);

const Description = styled.div`
  color: #AAA;
  grid-column: span 6;
  padding: 0rem 2rem 0rem 4rem;

  div {
    position: sticky;
    top: 2rem;
    h1 {
      margin-top: 1rem;
    }
    p {
      line-height: 1.5;
      text-align: justify;
    }
  }

  @media (max-width: 1450px) {
    grid-column: span 6;
  }

  @media (max-width: 1200px) {
    grid-column: span 12;
    padding: 0;
  }
`;

const CanvasWrapper = styled.div`
  canvas {
    width: auto !important;
    height: auto !important;
    max-width: 100%;
    border-radius: 5px;
  }
  margin-top: 2rem;
`;

const useModelPreview = (url, shouldRender, shouldShowWireframe) => {
  const camera = useRef();
  const renderer = useRef();
  const loader = useRef();
  const scene = useRef();
  const wireframe = useRef();
  const meshGroup = useRef();

  const [component, setComponent] = useState();
  const [renderInfo, updateRenderInfo] = useState({
    isLoaded: false,
    progress: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const _scene = new Scene();
      const _camera = new PerspectiveCamera(50, 1, 1, 10000);
      _camera.position.set(0, 0, 1000);
      
      const _renderer = new WebGLRenderer({
        antialias: true
      });
      _renderer.setPixelRatio(window.devicePixelRatio);

      _renderer.gammaOutput = true;
      _renderer.gammaFactor = 2;
      // _renderer.setClearColor(0x808080);
      _renderer.setSize(1000, 1000);

      const _loader = new GLTFLoader();
      const _dracoLoader = new DRACOLoader();
      _loader.setDRACOLoader(_dracoLoader);

      const hemisphereLight = new HemisphereLight(0xffffff, 0x808080, 1);
      _scene.add(hemisphereLight);

      scene.current = _scene;
      camera.current = _camera;
      renderer.current = _renderer;
      loader.current = _loader;
    }
    return () => {
      const canvas = document.querySelector('canvas');
      canvas.parentNode.removeChild(canvas);
      renderer.current.clear();
      renderer.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (shouldRender) {
      const canvas = renderer.current.domElement;

      const controls = new OrbitControls(camera.current, canvas);
      controls.enabled = true;
      controls.enableKeys = false;
      controls.keys = {
        LEFT: 65,
        UP: 87,
        RIGHT: 68,
        BOTTOM: 83
      };
      controls.enableDamping = true;      
      controls.dampingFactor = .05;
      controls.rotateSpeed = .1;
      controls.minDistance = 100;

      function toWireframe(children) {
        let wireframes = [];
        children.forEach((child) => {
          if (child.type === 'Mesh') {
            const wireframe = new WireframeGeometry(child.geometry);
            const line = new LineSegments(wireframe);
            line.material.depthTest = false;
            line.material.opacity = .5;
            line.material.color = new Color(0xBA20BB);
            line.rotateX(Math.PI / 2);
            line.material.transparent = true;
            wireframes.push(line);
          } else if (child.type === 'Group') {
            wireframes = wireframes.concat(toWireframe(child.children));
          }
        });
        return wireframes;
      }

      function fitModelIntoCameraViewport(modelSize, maxSize) {
        const cameraFovRad = camera.current.fov * Math.PI / 180;
        let newDistanceFromCamera = camera.current.position.z;
        if (modelSize > maxSize || modelSize < maxSize * .85) {
          newDistanceFromCamera = Math.abs(modelSize / 2 / Math.tan(cameraFovRad / 2));
        }

        if (newDistanceFromCamera < controls.minDistance) {
          controls.minDistance = newDistanceFromCamera;
        }
        controls.maxDistance = newDistanceFromCamera + 1000;

        return newDistanceFromCamera;
      }

      loader.current.load(
        url,
        gltf => {
          console.log('gltf', gltf);
          const group = new Group();
          scene.current.add(group);
          
          const wireframeGroup = new Group();
          const wireframes = toWireframe(gltf.scene.children);
          wireframes.forEach(child => wireframeGroup.add(child));
          wireframe.current = wireframeGroup;

          const whitelist = ['Mesh', 'Group'];
          gltf.scene.children
            .filter(child => whitelist.includes(child.type))
            .forEach(child => group.add(child));

          const modelSize = new Box3().setFromObject(group).getSize();
          const distance = camera.current.position.distanceTo(group.position);

          // the max size of an object that can fit into camera fov from camera center to the edge of camera's viewport
          const maxSize = Math.abs(Math.tan(camera.current.fov / 2 * Math.PI / 180) * distance) * 2;

          const newDistanceFromCamera = modelSize.y > modelSize.x
            ? fitModelIntoCameraViewport(modelSize.y, maxSize)
            : fitModelIntoCameraViewport(modelSize.x, maxSize);

          group.position.y -= modelSize.y / 2;
          wireframeGroup.position.y -= modelSize.y / 2;
          camera.current.position.set(camera.current.position.x, camera.current.position.y, newDistanceFromCamera);
          
          camera.current.lookAt(group.position);
          meshGroup.current = group;

          const plane = new Mesh(
            new PlaneGeometry(modelSize.x, modelSize.x),
            new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide })
          );
          plane.castShadow = false;
          plane.receiveShadow = true;
          plane.position.set(group.position.x, group.position.y, group.position.z);
          plane.rotateX(Math.PI / 2);
          scene.current.add(plane);

          const pointLight = new PointLight(0xffffff, 3, 100);
          pointLight.position.set(modelSize.x, modelSize.y + 50, modelSize.z);
          pointLight.shadow = new LightShadow(camera.current);
          scene.current.add(pointLight);
        },
        xhr => {
          const progress = xhr.loaded / xhr.total * 100;
          console.log(`${progress}% loaded`);
          if (progress === 100) {
            setComponent(canvas);
          }
          updateRenderInfo({
            isLoaded: progress === 100,
            progress
          });
        },
        error => console.error(error)
      );

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.current.render(scene.current, camera.current);
      }

      animate();
    }
  }, [shouldRender]);

  useEffect(() => {
    if (shouldShowWireframe) {
      scene.current.remove(meshGroup.current);
      scene.current.add(wireframe.current);
    } else {
      scene.current.remove(wireframe.current);
      scene.current.add(meshGroup.current);
    }
  }, [shouldShowWireframe]);

  return [component, renderInfo];
}

export default ({ data: { contentfulPortfolioItem = {} } }) => {
  const { previewImage, images } = contentfulPortfolioItem;
  const [itemImages, setImages] = useState([]);
  const [shouldRender, setShouldRender] = useState(false);
  const [wireframe, showWireframe] = useState(false);

  const [canvas, renderInfo] = useModelPreview(
    contentfulPortfolioItem.modelFile[0].file.url,
    shouldRender,
    wireframe
  );

  useEffect(() => {
    setImages([previewImage, ...images.filter(image => image.title !== previewImage.title)]);
  }, []);

  console.log(renderInfo);

  useEffect(() => {
    if (typeof document !== 'undefined' && renderInfo.isLoaded) {
      document.getElementById('canvas').appendChild(canvas);
    }
  }, [renderInfo.isLoaded]);

  return (
    <MainLayout>
      <OGP
        title={contentfulPortfolioItem.title}
        description={contentfulPortfolioItem.description}
        image={previewImage.fluid.src}
      />
      <Wrapper>
        <ImageWrapper>
          <div>
            {
              itemImages.map((image) => (
                <PreviewImage
                  preview={image.file.url}
                  src={image.fluid.src}
                  srcSet={image.fluid.srcSet}
                  sizes={image.fluid.sizes}
                  alt={image.description || image.title}
                />
              ))
            }
          </div>
          <CanvasWrapper
            id="canvas"
          >
          {
            shouldRender === false && (
              <button onClick={() => setShouldRender(true)}>Render</button>
            )
          }
          <button onClick={() => showWireframe(!wireframe)}>Wireframe</button>
          </CanvasWrapper>
        </ImageWrapper>
        <Description>
          <div>
            <h1>{contentfulPortfolioItem.title}</h1>
            <p>{contentfulPortfolioItem.description.internal.content}</p>
          </div>
        </Description>
      </Wrapper>
    </MainLayout>
  );
}

export const query = graphql`
  query getPortfolioItem($slug: String!) {
    contentfulPortfolioItem (slug: { eq: $slug }) {
      id
      images {
        title
        description
        file {
          url
        }
        fluid (maxWidth: 800, quality: 80) {
          src
          srcSet
          sizes
        }
      }
      description {
        internal {
          content
        }
      }
      slug
      title
      createdAt
      updatedAt
      tags
      previewImage {
        title
        description
        file {
          url
        }
        fluid (maxWidth: 800, quality: 80) {
          src
          srcSet
          sizes
        }
      }
      modelFile {
        title
        description
        file {
          url
          fileName
          contentType
        }
      }
    }
  }
`;
