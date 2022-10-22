import * as THREE from "three";
import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertex.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import fragment from "./fragment.glsl"
export default class App {
  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.container = document.querySelector(".webgl");
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(devicePixelRatio >= 2 ? 2 : 1);
    this.container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);
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
    this.uniforms = {
      u_time: { type: "f", value: 1.0 },
      u_resolution: { type: "v2", value: new THREE.Vector2() },
    };

    this.geo = new THREE.PlaneGeometry(3, 3, 10, 10);
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader: fragment,
      vertexColors: vertex,
      side: THREE.DoubleSide,
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
    this.time += 0.01;
    this.mesh.rotation.x = this.time;
    this.mesh.rotation.y = this.time;
  }
  render() {
    this.renderer.render(this.scene, this.camera);
    this.update();
    requestAnimationFrame(this.render.bind(this));
  }
}
