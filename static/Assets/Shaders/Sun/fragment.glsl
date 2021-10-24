uniform vec3 uSurfaceColor;
uniform vec3 uDepthColor;

void main() {
    float strength = 1.0;

    vec3 color  = mix(uSurfaceColor, uDepthColor, strength);
    gl_FragColor = vec4(color, 1.0);
}
