import * as _THREE from "three";
import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertex.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dancer from "../3DTexture/model1.glb";
import * as dat from "dat.gui";
require("three-extend-material/src/ExtendMaterial");
// import "./extend";

export default class App {
  constructor() {
    gsap.registerPlugin(ScrollTrigger);
    window.THREE = _THREE;
    this.renderer = new THREE.WebGLRenderer();
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
    this.camera.position.set(0, 3, 10);

    this.time = 0;
    this.scene.add(this.camera);
    // new OrbitControls(this.camera, this.renderer.domElement);

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
    this.gui
      .add(this.settings, "progress", 0, 1, 0.01)
      .onChange((val) => (this.material2.uniforms.progress.value = val));
  }
  setLight() {
    this.color = 0xffffff;
    this.intensity = 1;
    this.light = new THREE.AmbientLight({
      color: 0xffffff,
      intensity: 0.8,
    });

    this.light2 = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 3, 0.3);
    this.light2.position.set(0, 2, 2);
    this.light2.target.position.set(0, 0, 0);
    this.light2.castShadow = true;
    this.light2.shadow.camera.near = 0.1;
    this.light2.shadow.camera.far = 12;

    this.light2.shadow.bias = 0.0001;
    this.light2.shadow.mapSize.width = 2048;
    this.light2.shadow.mapSize.height = 2048;

    this.scene.add(this.light, this.light2);
    this.gui.add(this.light2.position, "x", -10, 10, 0.01);
    this.gui.add(this.light2.position, "y", -10, 10, 0.01);
    this.gui.add(this.light2.position, "z", -10, 10, 0.01);
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
    floor.position.y = -1.1;

    floor.receiveShadow = true;
    this.scene.add(floor);
    // 정이십면체
    this.geo = new THREE.IcosahedronGeometry(1, 9);
    // sphereGeomatry로하 정의하면 가장자리로 갈수록 크기가 작아지므로 icoshedron을 사용
    // this.geo = new THREE.SphereGeometry(1, 32, 32).toNonIndexed();
    console.log(this.geo);
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
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

    // marterial3

    this.material2 = THREE.extendMaterial(THREE.MeshStandardMaterial, {
      class: THREE.CustomMaterial, // In this case ShaderMaterial would be fine too, just for some features such as envMap this is required

      vertexHeader: `attribute float aRandom; 
      attribute vec3 aCenter; 
          uniform float time;
          uniform float progress;
          
          mat4 rotationMatrix(vec3 axis, float angle) {
            axis = normalize(axis);
            float s = sin(angle);
            float c = cos(angle);
            float oc = 1.0 - c;
            
            return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                        0.0,                                0.0,                                0.0,                                1.0);
        }
        
        vec3 rotate(vec3 v, vec3 axis, float angle) {
          mat4 m = rotationMatrix(axis, angle);
          return (m * vec4(v, 1.0)).xyz;
        }
          
          `,
      vertex: {
        transformEnd: `
        
        
        
        //조합1번(토네이도)
        
        float prog = (position.y + 1.)/2.;
        float locprog = clamp((progress-0.8*prog)/0.2,0.,1.);

        
        locprog = progress;
        transformed = transformed - aCenter;

        transformed += 3.*normal * aRandom * locprog;

        transformed *= (1.-locprog);

        transformed += aCenter;

        transformed = rotate(transformed,vec3(0.,1.,1.),aRandom * locprog * 3.14 * 1.);
        

        //조합2번(토네이도2)
        // float prog = (position.x + 1.)/2.;
        // float locprog = clamp((progress-0.8*prog)/0.2,0.,1.);
        // transformed = transformed - aCenter;
        // transformed += 3.*normal * aRandom * locprog;
        // transformed *= (1.-locprog);
        // transformed += aCenter;
        // transformed = rotate(transformed,vec3(0.,1.,0.),aRandom * locprog * 3.14 * 1.);


        //조합2(circle)
        // float prog = (position.y + 1.)/2.;
        // float locprog = clamp((progress-0.8*prog)/0.2,0.,1.);
        // transformed = transformed - aCenter;
        // transformed += 3.*normal * aRandom * progress;
        // transformed *= (1.-progress);
        // transformed +=  aCenter;
        // transformed = rotate(transformed,vec3(0.,1.,0.),aRandom* progress*3.14*1.);

        



        `,
      },

      uniforms: {
        roughness: 0.75,
        time: {
          mixed: true, // Uniform will be passed to a derivative material (MeshDepthMaterial below)
          linked: true, // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
          value: 0,
        },
        progress: {
          mixed: true,
          linked: true,
          value: 0,
        },
      },
    });
    this.material2.uniforms.diffuse.value = new THREE.Color(0x0f0f0f);
    console.log(this.material2.uniforms.diffuse.value);

    // loader
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/"
    );
    this.loader.setDRACOLoader(this.dracoLoader);
    this.loader.load(dancer, (gltf) => {
      this.objects = [];
      gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
          this.objects.push(obj);
        }
      });

      this.objects.forEach((o) => {
        let s = 0.01;

        this.geo = o.geometry.toNonIndexed();
        o.geometry = this.geo.toNonIndexed();
        o.material = this.material2;
        o.castShadow = true;

        this.geo = o.geometry;

        let len = this.geo.attributes.position.count;
        let randoms = new Float32Array(len);
        let centers = new Float32Array(len * 3);

        for (let i = 0; i < len; i += 3) {
          let r = Math.random();
          randoms[i] = r;
          randoms[i + 1] = r;
          randoms[i + 2] = r;
          let x = this.geo.attributes.position.array[i * 3];
          let y = this.geo.attributes.position.array[i * 3 + 1];
          let z = this.geo.attributes.position.array[i * 3 + 2];

          let x1 = this.geo.attributes.position.array[i * 3 + 3];
          let y1 = this.geo.attributes.position.array[i * 3 + 4];
          let z1 = this.geo.attributes.position.array[i * 3 + 5];

          let x2 = this.geo.attributes.position.array[i * 3 + 6];
          let y2 = this.geo.attributes.position.array[i * 3 + 7];
          let z2 = this.geo.attributes.position.array[i * 3 + 8];

          let center = new THREE.Vector3(x, y, z)
            .add(new THREE.Vector3(x1, y1, z1))
            .add(new THREE.Vector3(x2, y2, z2))
            .divideScalar(3);
          centers.set([center.x, center.y, center.z], i * 3);
          centers.set([center.x, center.y, center.z], (i + 1) * 3);
          centers.set([center.x, center.y, center.z], (i + 2) * 3);
        }
        this.scene.add(gltf.scene);

        this.geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
        this.geo.setAttribute("aCenter", new THREE.BufferAttribute(centers, 3));

        o.customDepthMaterial = THREE.extendMaterial(THREE.MeshDepthMaterial, {
          template: this.material2,
        });

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        o.castShadow = true;
        o.receiveShadow = true;
      });
      this.camera.clearViewOffset();
      const tl = gsap
        .timeline({
          scrollTrigger: {
            trigger: ".webgl",
            scrub: 3,
            pin: true,
            end: "+=12000",
          },
        })
        .from(this.camera.position, {
          x: 0,
          y: 0,
          z: -20,
        })
        .to(this.material2.uniforms.diffuse.value, {
          r: 0.5,
          g: 0.2,
          b: 0.2,
        })
        .from(this.material2.uniforms.progress, {
          value: 1,
        })
        .to(this.camera.position, {
          x: 10,
          y: 3,
          z: 10,
        })
        .to(
          this.camera.rotation,
          {
            x: 0,
            y: Math.PI * 0.25,
            z: 0,
          },
          ">-=0.5"
        )
        .to(this.material2.uniforms.progress, {
          value: 1,
        })
        .to(this.material2.uniforms.diffuse.value, {
          r: 0.4,
          g: 0.4,
          b: 0.4,
        })
        .to(this.camera.rotation, {
          x: 0,
          y: 0,
          z: 0,
        })
        .to(
          this.camera.position,
          {
            x: 0,
            y: 3,
            z: 10,
          },
          ">-=0.5"
        )
        .to(this.material2.uniforms.progress, {
          value: 0,
        })
        .to(this.material2.uniforms.diffuse.value, {
          r: Math.random(),
          g: Math.random(),
          b: Math.random(),
        })
        .to(this.material2.uniforms.diffuse.value, {
          r: Math.random(),
          g: Math.random(),
          b: Math.random(),
        })
        .to(this.material2.uniforms.diffuse.value, {
          r: Math.random(),
          g: Math.random(),
          b: Math.random(),
        })
        .to(this.material2.uniforms.diffuse.value, {
          r: Math.random(),
          g: Math.random(),
          b: Math.random(),
        })
        .to(this.material2.uniforms.diffuse.value, {
          r: Math.random(),
          g: Math.random(),
          b: Math.random(),
        });
      // .to(this.camera.rotation, {
      //   x: 0,
      //   y: -0.5,
      //   z: 0,
      // });

      //
    }); ///load end
    this.mesh = new THREE.Mesh(this.geo, this.material2);
    window.addEventListener("scroll", () => {
      console.log(this.camera.rotation.y);
    });
    // this.scene.add(this.mesh);
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
    // this.mesh.rotation.x = this.time;
    // this.mesh.rotation.y = this.time;
    this.material.uniforms.time.value = this.time;
    this.material2.uniforms.time.value = this.time;
  }
  render() {
    this.renderer.render(this.scene, this.camera);
    this.update();
    requestAnimationFrame(this.render.bind(this));
  }
}
