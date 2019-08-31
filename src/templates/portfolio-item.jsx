import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import styled, { css } from 'styled-components';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  HemisphereLight,
  Mesh
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

let camera;
let scene;
let renderer;
let geometry;
let material;
let light;
let loader;
let dracoLoader;
let controls;

export default ({ data: { contentfulPortfolioItem = {} } }) => {
  const { previewImage, images } = contentfulPortfolioItem;
  const [itemImages, setImages] = useState([]);

  useEffect(() => {
    setImages([previewImage, ...images.filter(image => image.title !== previewImage.title)]);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      scene = new Scene();
      camera = new PerspectiveCamera(75, 1, 1, 1000);
      camera.position.set(0, 0, 500);
      
      renderer = new WebGLRenderer({
        antialias: true
      });

      renderer.gammaOutput = true;
      renderer.gammaFactor = 2.2;
      renderer.setClearColor(0x808080);
      renderer.setSize(1000, 1000);

      loader = new GLTFLoader();
      dracoLoader = new DRACOLoader();
      loader.setDRACOLoader(dracoLoader);
      

      light = new HemisphereLight( 0xffffbb, 0x080820, 1 );
      scene.add(light);

      window.document.body.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enabled = true;
      controls.maxDistance = 1500;
      controls.minDistance = 0;

      loader.load(
        contentfulPortfolioItem.modelFile[0].file.url,
        (gltf) => {
          scene.add(gltf.scene);

          // gltf.animations; // Array<THREE.AnimationClip>
          // gltf.scene; // THREE.Scene
          // gltf.scenes; // Array<THREE.Scene>
          // gltf.cameras; // Array<THREE.Camera>
          // gltf.asset; 
        },
        (xhr) => {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        (error) => {
          console.error(error);
        }
      );

      // geometry = new BoxGeometry(1, 1, 1);
      // material = new MeshBasicMaterial({ color: '0x00ff00' });
      // var cube = new Mesh(geometry, material);

      // scene.add(gltf.scene);

      // camera.position.z = 5;

      function resize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
      }

      function animate() {
        if (resize(renderer)) {
          camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
          camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }

      animate();

    }
  }, []);

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
