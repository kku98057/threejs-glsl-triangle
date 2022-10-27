varying vec2 vUv;
varying vec3 vPosition;
uniform float time;
attribute float aRandom;
void main() {

    vUv = uv;

    vec3 pos = position;
    // pos.x +=aRandom* sin((uv.y + uv.x+ time)*10.)*0.5;

    // 원래대로 돌아오게
    pos += aRandom * (0.5* sin(time) + 0.5) * normal;
    vec4 mvPosition = modelViewMatrix * vec4( pos , 1.);
    gl_PointSize = 10. * (1. / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}