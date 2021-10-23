uniform vec3 uSurfaceColor;
uniform vec3 uDepthColor;

void main() {
    float colorStrength =  (2.0 * 1.0) + 1.5;
    vec3 color = mix(uDepthColor, uSurfaceColor, colorStrength);
    gl_FragColor = vec4(color, 1.0);
}
