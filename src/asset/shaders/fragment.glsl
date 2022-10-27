
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;
varying vec3 vPosition;


void main(){
  
    gl_FragColor = vec4(0.5+(vUv*sin(time))/2.,0.5 + vUv*sin(time));
}