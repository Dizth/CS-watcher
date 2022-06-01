import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer;
let cloudParticles = []
const canvas = document.getElementsByTagName("canvas")[0];

  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight,1,1000);

  //lights
  let ambient = new THREE.AmbientLight(0x555555);
  scene.add(ambient);

  let directionalLight = new THREE.DirectionalLight(0xff8c19);
  directionalLight.position.set(0,0,1);
  scene.add(directionalLight);

  let orangeLight = new THREE.PointLight(0xcc6600,50,600,1.7);
  orangeLight.position.set(10,120,100);
  scene.add(orangeLight);  
  
  let redLight = new THREE.PointLight(0xd8547e,50,800,1.7);
  redLight.position.set(50,100,-270);
  scene.add(redLight);

  let blueLight = new THREE.PointLight(0x0000AA,500,300,1.7);
  blueLight.position.set(0,10,-100);
  scene.add(blueLight);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });

  renderer.setSize(window.innerWidth,window.innerHeight);
  scene.fog = new THREE.FogExp2(0x03544e, 0.0002);
  renderer.setClearColor(0x00558A);
  document.body.appendChild(renderer.domElement);

  // const controls = new OrbitControls(camera, renderer.domElement) //(penser à inclure une position à la caméra)
  // controls.enableZoom = false
  // controls.enableDamping = true 
 
  //bloom
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0.040; // dispersion des nuages
  bloomPass.strength = 0.8; //intensity of glow
  bloomPass.radius = 0;
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.renderToScreen = true;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  //bg
const starGeometry = new THREE.SphereGeometry(950, 64, 64); // Création de la sphère englobant la camera
const starMaterial = new THREE.MeshBasicMaterial({
  map: THREE.ImageUtils.loadTexture("./img/galaxy.png"),
  side: THREE.BackSide // Permet de faire pointer la texture vers l'interieur de la forme
});
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
// starMesh.layers.set(1);
scene.add(starMesh);

    // charger l'image de nuage
  let loader = new THREE.TextureLoader(); 
  loader.load("./img/smoke.png", function(texture){ // le paramètre de la fonction = smoke.png
    let cloudGeo = new THREE.PlaneBufferGeometry(500,500); // ajout d'une geo plate
    let cloudMaterial = new THREE.MeshStandardMaterial({ // ajout de la texture au material (possibilité de reflection/refraction)
      map:texture,
      transparent: true
    });

    //Création des nuages
    for(let i = 0; i < 50; i++) {
        let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
        cloud.position.set(
          Math.random()*800 -400,
          1,
          Math.random()* -700 + -150
        );
        cloud.material.opacity = 0.02;
        cloudParticles.push(cloud)
        scene.add(cloud);
      }
  });

  let bloomStr = 0
  let bloomRad = 0

  //animation + rendu
function render() {
  cloudParticles.forEach(cloud => {
      cloud.rotation.z -= 0.0035
  })
  starMesh.rotation.y += 0.00035

  if (bloomPass.strength < 2 && bloomStr == 0) {
    bloomPass.strength += 0.003
  } else {
    bloomStr = 1
  }

  if (bloomStr == 1) {
    bloomPass.strength -= 0.003
      if (bloomPass.strength <= 1.2) {
        bloomStr = 0
      }
  }

  if (bloomPass.radius <= 0 && bloomRad == 0) {
    bloomPass.radius += 0.003
  } else {
    bloomRad = 1
  }

  if (bloomRad == 1) {
    bloomPass.radius -= 0.003
      if (bloomPass.radius <= -2) {
        bloomRad = 0
      }
  }

  // camera.layers.set(1);
  bloomComposer.render();
  requestAnimationFrame(render)
  // controls.update()
}

//resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

render()