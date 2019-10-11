import React, { Fragment, useState, useEffect, useRef, memo } from 'react';
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
  DoubleSide,
  PointLight,
  PlaneGeometry,
  MeshBasicMaterial,
  LightShadow,
  Vector3
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import OrbitControls from 'orbit-controls-es6';
import CubeOutlineIcon from 'mdi-react/CubeOutlineIcon';
import GridIcon from 'mdi-react/GridIcon';

import Progressbar from './Progressbar';

const CanvasWrapper = styled.div`
  canvas {
    width: auto !important;
    height: auto !important;
    max-width: 100%;
    border-radius: 5px;
  }
  margin-top: 2rem;
  min-height: ${props => `${props.minHeight || 0}px`};
  background: #111;
  border-radius: 5px;
  position: relative;
  align-items: center;
  ${(props) => !props.wasRenderTriggered && css `
    display: flex;
    flex-direction: column;
    justify-content: center;
  `}
`;

const RenderButton = styled.button`
  background: #0C0C0C;
  border: 2px solid #555;
  box-shadow: 0px 0px 30px black;
  border-radius: 5px;
  padding: 1.5rem;
  position: relative;
  cursor: pointer;

  svg {
    vertical-align: middle;
  }

  &:hover {
    box-shadow: none;
    border-color: white;
  }
`;

const toRadian = (value) => value * Math.PI / 180;

const useModelPreview = (url, { shouldRender, showWireframe }) => {
  const data = useRef({
    camera: undefined,
    controls: undefined,
    renderer: undefined,
    loader: undefined,
    scene: undefined,
    wireframe: undefined,
    meshes: undefined
  });

  const [component, setComponent] = useState();
  const [renderInfo, updateRenderInfo] = useState({
    isLoaded: false,
    progress: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scene = new Scene();
      const camera = new PerspectiveCamera(50, 1, 1, 10000);
      camera.position.set(0, 0, 1000);

      const renderer = new WebGLRenderer({
        antialias: true
      });
      renderer.shadowMap.enabled = true;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.gammaOutput = true;
      renderer.gammaFactor = 2;
      renderer.setSize(1000, 1000);
      renderer.setClearColor(0x1F1F1F);
      renderer.setClearAlpha(.9);

      const loader = new GLTFLoader();

      const dracoLoader = new DRACOLoader();
      loader.setDRACOLoader(dracoLoader);

      const hemisphereLight = new HemisphereLight(0xffffff, 0x808080, 1);
      
      scene.add(hemisphereLight);

      data.current.scene = scene;
      data.current.camera = camera;
      data.current.renderer = renderer;
      data.current.loader = loader;
    }

    return () => {
      const { renderer } = data.current;
      const canvas = renderer.domElement;
      canvas.parentNode.removeChild(canvas);
      renderer.clear();
      renderer.dispose();
      data.current.scene = new Scene();
    };
  }, []);

  useEffect(() => {
    if (shouldRender) {
      const { renderer, camera, loader, scene } = data.current;
      const canvas = renderer.domElement;

      const controls = new OrbitControls(camera, canvas);
      controls.enabled = true;
      controls.enableKeys = false;
      controls.enableDamping = true;
      controls.dampingFactor = .05;
      controls.rotateSpeed = .1;
      controls.minDistance = 100;
      data.current.controls = controls;

      function composeWireframe(modelComponents) {
        let wireframes = [];
        modelComponents.forEach((component) => {
          if (component.type === 'Mesh') {
            const wireframeGeometry = new WireframeGeometry(component.geometry);
            const wireframe = new LineSegments(wireframeGeometry);
            wireframe.material.depthTest = false;
            wireframe.material.opacity = .5;
            wireframe.material.color = new Color(0xBA20BB);
            wireframe.material.transparent = true;
            wireframe.rotateX(Math.PI / 2);
            wireframes.push(wireframe);
          } else if (component.type === 'Group') {
            wireframes = wireframes.concat(composeWireframe(component.children));
          }
        });
        return wireframes;
      }

      /**
        *  Quick math to not forget wtf is happening
        * 
        *               / |   C - distance from camera to the model
        *             /   |     
        *            /    | <- B - max model size that fits the viewPort (maxViewportSize)    
        * (camera) /____C_|
        *      (fov)\     | \ 0 /    )
        *             \   |   |      ) -> (modelSize)
        *               \ |  | |     )
        * We set a rule that the model must always fit at least 85% of camera's viewport
        * fov is the angle of camera's viewport
        * Since we know the fov in radians, we know current distance and maxViewportSize
        * We can calculate the new distance from camera to model on which the model will
        * fit the viewport
        * 
        * Distance splits the viewport into 2 triangles, so it's easy to calculate
        * the new distance by making sure that HALF the model size fits HALF the viewport
        * We can do so from a formula of a tan of half the fov in radians
        * 
        * Tan (fov /2) = B / 2 / C
        *
        * If the model is bigger that current maxViewportSize (B) or smaller than 85% of it
        * Then we take the new maxViewportSize for the model size
        * and get the new distance from the formula above
        * 
        *                /  | \       /  )
        *              /    |  \ ( ) /   )
        *            /      |     |      )
        * (camera) /__new C_|     |      ) -> new B (maxViewportSize = modelSize)
        *      (fov)\       |    \  \    )
        *             \     |    |  |    )
        *               \   |    |  |    )
        * 
        * New C = modelSize / 2 / tan(fov / 2)
        * We abs it cause tan can be negative, but distance can't be
        * 
      */
      function zoomCameraViewportOnModel(modelSize, maxViewportSize) {
        const { camera, controls } = data.current;
        const cameraFOVRad = toRadian(camera.fov);
        const isModelTooSmallInTheViewport = modelSize < maxViewportSize * .85;
        let newCameraDistance = camera.position.z;

        if (modelSize > maxViewportSize || isModelTooSmallInTheViewport) {
          newCameraDistance = Math.abs(modelSize / 2 / Math.tan(cameraFOVRad / 2));
        }

        if (newCameraDistance < controls.minDistance) {
          controls.minDistance = newCameraDistance;
        }
        controls.maxDistance = newCameraDistance + 1000;

        return newCameraDistance;
      }

      function addPlane(size, position) {
        const { scene } = data.current;
        const plane = new Mesh(
          new PlaneGeometry(size, size),
          new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide })
        );
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.position.set(position.x, position.y, position.z);
        plane.rotateX(Math.PI / 2);
        scene.add(plane);
      }

      function addAdditionalLight(position) {
        const { scene } = data.current;
        const pointLight = new PointLight(0xffffff, 3, 100);
        pointLight.position.set(position.x, position.y, position.z);
        scene.add(pointLight);
      }

      loader.load(
        url,
        gltf => {
          console.log('gltf', gltf);
          const modelMeshes = new Group();
          modelMeshes.name = 'ModelMeshes';
          scene.add(modelMeshes);

          const wireframeGroup = new Group();
          wireframeGroup.name = 'Wireframes';
          const wireframes = composeWireframe(gltf.scene.children);
          wireframes.forEach(child => wireframeGroup.add(child));
          data.current.wireframe = wireframeGroup;

          gltf.scene.children.forEach((child) => {
            if (child.type === 'Mesh' || child.type === 'Group') {
              modelMeshes.add(child);
            }
          });

          const modelSize = new Box3().setFromObject(modelMeshes).getSize();
          const cameraDistance = camera.position.distanceTo(modelMeshes.position);
          // the max model size that can fit into the camera's fov
          const maxSize = Math.abs(Math.tan(toRadian(camera.fov / 2) * cameraDistance) * 2);
          const newCameraDistance = modelSize.y > modelSize.x
            ? zoomCameraViewportOnModel(modelSize.y, maxSize)
            : zoomCameraViewportOnModel(modelSize.x, maxSize);

          // make sure that Vector3.zero is in the middle of the model
          modelMeshes.position.y -= modelSize.y / 2;
          wireframeGroup.position.y -= modelSize.y / 2;

          camera.position.set(camera.position.x, camera.position.y, newCameraDistance);
          camera.lookAt(modelMeshes.position);
          data.current.meshes = modelMeshes;

          addPlane(modelSize.x, modelMeshes.position);
          addAdditionalLight(new Vector3(modelSize.x, modelSize.y + 50, modelSize.z));
        },
        xhr => {
          const progress = xhr.loaded / xhr.total * 100;
          console.log(`${progress}% loaded`);
          const isLoaded = progress === 100;
          if (isLoaded) {
            setComponent(data.current.renderer.domElement);
          }
          updateRenderInfo({
            isLoaded,
            progress
          });
        },
        error => console.error(error)
      );

      function animate() {
        const { controls, renderer, scene, camera } = data.current;
        requestAnimationFrame(animate);
        if (controls) {
          controls.update();
        }
        renderer.render(scene, camera);
      }

      animate();
    }
  }, [shouldRender]);

  useEffect(() => {
    const { scene, meshes, wireframe } = data.current;
    if (showWireframe) {
      scene.remove(meshes);
      scene.add(wireframe);
    } else {
      scene.remove(wireframe);
      scene.add(meshes);
    }
  }, [showWireframe]);

  return [component, renderInfo];
}

export default memo(({ src }) => {
  const [wasRenderTriggered, triggerRender] = useState(false);
  const [isWireframeDisplayed, triggerWireframe] = useState(false);

  const [canvas, renderInfo] = useModelPreview(
    src,
    { 
      shouldRender: wasRenderTriggered,
      showWireframe: isWireframeDisplayed
    }
  );

  useEffect(() => {
    if (typeof document !== 'undefined' && renderInfo.isLoaded) {
      document.getElementById('canvasWrapper').appendChild(canvas);
    }
  }, [renderInfo.isLoaded]);

  return (
    <CanvasWrapper
      id="canvasWrapper"
      minHeight={!renderInfo.isLoaded ? 500 : 0}
    >
      {
        !renderInfo.isLoaded
        ? (
          <Fragment>
            <RenderButton
              onClick={() => triggerRender(true)}
            >
              <CubeOutlineIcon color="white" size={40} />
            </RenderButton>  
            <Progressbar progress={renderInfo.progress} />
          </Fragment>
        )
        : (
          <button
            onClick={() => triggerWireframe(!isWireframeDisplayed)}
          >
            <GridIcon color="white" />
          </button>
        )
      }
    </CanvasWrapper>
  )
})
