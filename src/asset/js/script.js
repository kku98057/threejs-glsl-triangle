import * as THREE from "three";
import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertex.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// https://www.youtube.com/watch?v=_qJdpSr3HkM&t=139s

export default class App {
  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.container = document.querySelector(".webgl");
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(devicePixelRatio >= 2 ? 2 : 1);
    this.container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 2);
    this.time = 0;
    this.scene.add(this.camera);
    new OrbitControls(this.camera, this.renderer.domElement);
    this.addMesh();
    this.setLight();
    this.setResize();
    this.render();
  }
  setLight() {
    this.color = 0xffffff;
    this.intensity = 1;
    this.light = new THREE.DirectionalLight(this.color, this.intensity);
    this.scene.add(this.light);
  }
  addMesh() {
    this.geo = new THREE.SphereGeometry(1, 30, 30);
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector4() },
        progress: {
          type: "f",
          value: 0,
        },
        side: THREE.DoubleSide,
      },
    });

    this.mesh = new THREE.Mesh(this.geo, this.material);
    this.scene.add(this.mesh);
  }
  setResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }
  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;

    this.camera.updateProjectionMatrix();
  }
  update() {
    this.time += 0.1;
  }
  render() {
    this.renderer.render(this.scene, this.camera);
    this.update();
    requestAnimationFrame(this.render.bind(this));
  }
}
