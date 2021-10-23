uniform vec3 uSurfaceColor;
uniform vec3 uDepthColor;

void main() {
    // float colorStrength = (2.0 * 3.0) + 5.0;
    vec3 color = mix(uDepthColor, uSurfaceColor, 2.0);

    gl_FragColor = vec4(color, 1.0);
}
