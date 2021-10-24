varying vec2 vUv;

void main () {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;


    vUv = uv;
    gl_Position = projectedPosition;
}



// uniform vec3 viewVector;
// varying float intensity;
// void main() {
//   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
//   vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
//   intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );
// }