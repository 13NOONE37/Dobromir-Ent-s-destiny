uniform vec3 uSurfaceColor;
uniform vec3 uDepthColor;
varying vec2 vUv;

void main() {
    float strength = 1.0 - distance(vUv, vec2(0.5)) * 10.0;

    gl_FragColor = vec4(strength, strength, strength, 1.0);
}
// varying float intensity;
// void main() {
//   vec3 glow = vec3(0, 1,1) * intensity;
//   gl_FragColor = vec4( glow, 1.0 );
// }