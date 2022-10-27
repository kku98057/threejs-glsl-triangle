varying vec2 vUv;
varying vec3 vPosition;
uniform float time;
attribute float aRandom;
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
void main() {

    vUv = uv;

    vec3 pos = position;
    // pos.x +=aRandom* sin((uv.y + uv.x+ time)*10.)*0.5;

 
    // 원래대로 돌아오게
    

    pos += aRandom * (0.5* sin(time) + 0.5) * normal ;
    vec3 transformd = rotate(pos,vec3(0.,1.,0.),time*3.14*3.);
    transformd += sin(aRandom)*aRandom * normal;

    
    vec4 mvPosition = modelViewMatrix * vec4( transformd , 1.);
    gl_PointSize = 10. * (1. / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}