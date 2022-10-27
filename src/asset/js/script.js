import * as THREE from "three";
import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertex.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

export default class App {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.container = document.querySelector(".webgl");
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor("#e9dbc2");
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    // 현실적인 빛의 값 설정
    this.renderer.physicallyCorrectLights = true;
    //  출력 렌더링 인코딩을 제어
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setPixelRatio(devicePixelRatio >= 2 ? 2 : 1);
    this.container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(10, 10, 10);
    this.time = 0;
    this.scene.add(this.camera);
    new OrbitControls(this.camera, this.renderer.domElement);

    this.addMesh();
    this.settings();
    this.setLight();
    this.setResize();
    this.render();
  }
  settings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }
  setLight() {
    this.color = 0xffffff;
    this.intensity = 1;
    this.light = new THREE.DirectionalLight(this.color, this.intensity);

    this.light2 = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 3, 0.3);
    this.light2.position.set(0, 2, 2);
    this.light2.target.position.set(0, 0, 0);
    this.light2.castShadow = true;
    this.light2.shadow.camera.near = 0.1;
    this.light2.shadow.camera.far = 9;

    this.light2.shadow.bias = 0.0001;
    this.light2.shadow.mapSize.width = 2048;
    this.light2.shadow.mapSize.height = 2048;

    this.scene.add(this.light, this.light2);
  }
  addMesh() {
    // 바닥
    let floor = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 15, 100, 100),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
      })
    );
    floor.rotation.x = -Math.PI * 0.5;
    floor.position.y = -1.8;

    floor.receiveShadow = true;
    this.scene.add(floor);
    // 정이십면체
    this.geo = new THREE.IcosahedronGeometry(1, 3);
    // sphereGeomatry로하 정의하면 가장자리로 갈수록 크기가 작아지므로 icoshedron을 사용
    this.geo = new THREE.SphereGeometry(1, 32, 32).toNonIndexed();
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
        progress: { type: "f", value: 0 },
      },
      fragmentShader: fragment,
      vertexShader: vertex,
      side: THREE.DoubleSide,

      // wireframe: true,
    });

    console.log(this.geo);

    let len = this.geo.attributes.position.count;
    let randoms = new Float32Array(len * 3);

    for (let i = 0; i < len; i += 3) {
      let r = Math.random();
      randoms[i] = r;
      randoms[i + 1] = r;
      randoms[i + 2] = r;
    }

    this.geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

    this.mesh = new THREE.Mesh(this.geo, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

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
    this.time += Math.random() * 0.1;
    // this.mesh.rotation.x = this.time;
    // this.mesh.rotation.y = this.time;
    this.material.uniforms.time.value = this.time;
    // this.material.uniforms.progress.value = this.settings.progress;
  }
  render() {
    this.renderer.render(this.scene, this.camera);
    this.update();
    requestAnimationFrame(this.render.bind(this));
  }
}
