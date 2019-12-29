import React, { Fragment, useState, useEffect, useRef, memo } from 'react';
import styled, { css } from 'styled-components';
import {
  Color,
  Box3,
  AmbientLight,
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
import LayersOutlineIcon from 'mdi-react/LayersOutlineIcon';

import Progressbar from './Progressbar';

const CanvasWrapper = styled.div`
  canvas {
    width: auto !important;
    height: auto !important;
    max-width: 100%;
    max-height: 100%;
    border-radius: 5px;
    overflow: none;
  }
  overflow: none;
  margin-top: 2rem;
  min-height: ${props => `${props.minHeight || 0}px`};
  background: #111;
  border-radius: 5px;
  position: relative;
  align-items: center;
  transition: width ease .5s;
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

const OptionsBar = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  border-radius: 5px;
  padding: 1rem;
  background: rgba(0,0,0,.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  button {
    margin-top: 12px;
  }

  button:first-child {
    margin-top: 0px;
  }
`;

const OptionsButton = styled(RenderButton)`
  padding: 0rem;
  box-shadow: none;
`;

const toRadian = (value) => value * Math.PI / 180;

function composeWireframe(modelComponents) {
  const wireframes = new Group();
  modelComponents.forEach((component) => {
    if (component.type === 'Mesh') {
      const wireframeGeometry = new WireframeGeometry(component.geometry);
      const wireframe = new LineSegments(wireframeGeometry);
      wireframe.material.depthTest = false;
      wireframe.material.opacity = .5;
      wireframe.material.color = new Color(0xBA20BB);
      wireframe.material.transparent = true;
      wireframe.castShadow = true;
      wireframe.receiveShadow = true;
      wireframe.position.set(component.position.x, component.position.y, component.position.z);
      wireframe.rotation.set(component.rotation.x, component.rotation.y, component.rotation.z, component.rotation.order);
      wireframe.scale.set(component.scale.x, component.scale.y, component.scale.z);
      wireframes.add(wireframe);
      if (component.children.length) {
        wireframes.add(composeWireframe(component.children));
      }
    } else if ((component.type === 'Group' || component.type === 'Object3D') && component.children.length) {
      const wireframe = composeWireframe(component.children);
      wireframe.position.set(component.position.x, component.position.y, component.position.z);
      wireframe.rotation.set(component.rotation.x, component.rotation.y, component.rotation.z, component.rotation.order);
      wireframe.scale.set(component.scale.x, component.scale.y, component.scale.z);
      wireframes.add(wireframe);
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
function zoomCameraViewportOnModel(controls, camera, modelSize, maxViewportSize) {
  const cameraFOVRad = toRadian(camera.fov);
  const isModelTooSmallInTheViewport = modelSize < maxViewportSize * .75;
  let newCameraDistance = camera.position.z;
  if (modelSize > maxViewportSize || isModelTooSmallInTheViewport) {
    const desiredSize = modelSize * 1.25; // 75 % of viewport
    newCameraDistance = Math.abs(desiredSize / 2 / Math.tan(cameraFOVRad / 2));
  }
  if (newCameraDistance < controls.minDistance) {
    controls.minDistance = newCameraDistance;
  }
  controls.maxDistance = newCameraDistance + 1000;
  return newCameraDistance;
}

function addAdditionalLight(scene, position) {
  const pointLight = new PointLight(0xffffff, 3, 100);
  pointLight.position.set(position.x, position.y, position.z);

  scene.add(pointLight);
}

// for SSR w/ gatsby
const renderer = typeof document !== 'undefined' && new WebGLRenderer({
  antialias: true
});
if (renderer) {
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2;
  renderer.setSize(1000, 1000);
  renderer.setClearColor(0x1F1F1F, .9);
}

const canvas = renderer.domElement;
const camera = new PerspectiveCamera(50, 1, 1, 10000);
camera.position.set(0, 0, 1000);

// for SSR w/ gatsby
const controls = typeof document !== 'undefined' && new OrbitControls(camera, canvas);
if (controls) {
  controls.enabled = true;
  controls.enableKeys = false;
  controls.enableDamping = true;
  controls.dampingFactor = .05;
  controls.rotateSpeed = .1;
  // controls.minDistance = .1;
  controls.minDistance = 50;
}

let animationId;

const useModelPreview = (url, { shouldRender, showWireframe, showPlane }) => {
  const data = useRef({
    camera: null,
    controls: null,
    scene: null,
    wireframe: null,
    meshes: new Group()
  });

  const [component, setComponent] = useState();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isInitialized, setInitialized] = useState(false);

  const isLoaded = loadingProgress === 100;

  useEffect(() => {
    if (shouldRender) {
      if (!isLoaded) {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        loader.setDRACOLoader(dracoLoader);

        loader.load(
          url,
          gltf => {
            const { scene } = gltf;
            data.current.scene = scene;
            const { meshes } = data.current;
            meshes.name = 'ModelMeshes';

            const sceneChildren = Array.prototype.slice.call(gltf.scene.children)
              .filter(child => (child.type === 'Group' || child.type === 'Object3D' && child.children.length) || child.type === 'Mesh');

            scene.add(new HemisphereLight(0xffffff, 0x808080, 1));
            
            const wireframe = composeWireframe(sceneChildren);
            wireframe.name = 'Wireframes';
            data.current.wireframe = wireframe;
            
            sceneChildren.forEach((child) => {
              if (child.type === 'Mesh' || (child.type === 'Group' || child.type === 'Object3D' && child.children.length)) {
                meshes.add(child);
                scene.remove(child);
              }
            });

            scene.add(meshes);

            const modelSize = new Box3().setFromObject(meshes).getSize();
            const cameraDistance = camera.position.distanceTo(meshes.position);
            // the max model size that can fit into the camera's fov
            const maxSize = Math.abs(Math.tan(toRadian(camera.fov / 2) * cameraDistance) * 2);
            const newCameraDistance = modelSize.y > modelSize.x
              ? zoomCameraViewportOnModel(controls, camera, modelSize.y, maxSize)
              : zoomCameraViewportOnModel(controls, camera, modelSize.x, maxSize);


            camera.position.set(camera.position.x, camera.position.y, newCameraDistance);
            camera.lookAt(meshes.position);

            addAdditionalLight(scene, new Vector3(modelSize.x, modelSize.y + 50, modelSize.z));

            const animate = () => {
              animationId = requestAnimationFrame(animate);
              controls.update();
              renderer.render(scene, camera);
            };

            animate();
            setInitialized(true);
          },
          xhr => {
            const progress = xhr.loaded / xhr.total * 100;
            if (progress === 100) {
              setComponent(renderer.domElement);
            }
            setLoadingProgress(progress);
          },
          error => console.error(error)
        );
      }
    }
    return () => {
      if (isInitialized) {
        cancelAnimationFrame(animationId);
        const { scene } = data.current;
        scene.dispose();
        renderer.dispose();
        renderer.clear();
        const canvas = renderer.domElement;
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    }
  }, [url, shouldRender, isLoaded, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      const { scene, meshes, wireframe } = data.current;
      if (showWireframe) {
        scene.remove(meshes);
        scene.add(wireframe);
      } else {
        scene.remove(wireframe);
        scene.add(meshes);
      }
    }
  }, [showWireframe, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      const { scene, meshes } = data.current;
      if (showPlane) {
        const meshSize = new Box3().setFromObject(meshes).getSize();
        const planeSize = meshSize.x * 2;
        const plane = new Mesh(
          new PlaneGeometry(planeSize, planeSize),
          new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide })
        );
        plane.name = 'Plane';
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.position.set(meshes.position.x, meshes.position.y - meshSize.y / 2, meshes.position.z);
        plane.rotateX(Math.PI / 2);
        scene.add(plane);
      } else {
        scene.remove(scene.children.find(c => c.name === 'Plane'));
      }
    }
  }, [showPlane, isInitialized]);

  return [component, loadingProgress];
}

export default memo(({ src }) => {
  const [wasRenderTriggered, triggerRender] = useState(false);
  const [isWireframeDisplayed, triggerWireframe] = useState(false);
  const [showPlane, triggerPlane] = useState(false);

  const [canvas, loadingProgress] = useModelPreview(
    src,
    { 
      shouldRender: wasRenderTriggered,
      showWireframe: isWireframeDisplayed,
      showPlane: showPlane
    }
  );

  const isLoaded = loadingProgress === 100;

  useEffect(() => {
    if (typeof document !== 'undefined' && isLoaded) {
      document.getElementById('canvasWrapper').appendChild(canvas);
    }
  }, [isLoaded]);

  return (
    <CanvasWrapper
      id="canvasWrapper"
      minHeight={!isLoaded ? 500 : 0}
      maxHeight={typeof window !== 'undefined' && window.innerHeight * .9}
      wasRenderTriggered={wasRenderTriggered && isLoaded}
    >
      {
        !isLoaded
        ? (
          <Fragment>
            <RenderButton
              onClick={() => triggerRender(true)}
            >
              <CubeOutlineIcon color="white" size={40} />
            </RenderButton>  
            <Progressbar progress={loadingProgress} />
          </Fragment>
        )
        : (
          <OptionsBar>
            <OptionsButton
              onClick={() => triggerWireframe(!isWireframeDisplayed)}
            >
              <GridIcon color="white" />
            </OptionsButton>
            <OptionsButton
              onClick={() => triggerPlane(!showPlane)}
            >
              <LayersOutlineIcon color="white" />
            </OptionsButton>
          </OptionsBar>
        )
      }
    </CanvasWrapper>
  )
})
