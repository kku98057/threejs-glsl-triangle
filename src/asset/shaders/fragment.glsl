#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 pos = gl_FragCoord.xy;
    gl_FragColor = vec4(pos.x/512.,pos.y/512.,0.,1.);
}