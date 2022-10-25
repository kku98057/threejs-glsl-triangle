varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vScreenSpace;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    vec4 mvPosition = modelViewMatrix * vec4( position , 1.);



    gl_PointSize = 10. * (1. / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vScreenSpace = gl_Position.xy/gl_Position.w;
}