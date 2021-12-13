varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float scrollSpeed;
const int ss = 5;
vec4 dirBlur(sampler2D tex, vec2 uv, vec2 angle) {
  vec4 acc = vec4(0.);

  const float delta = 2.0 / float(ss);

  for (float i = -1.0; i <= 1.0; i += delta) {
    acc += texture2D(tex, vec2(.0, .1 * scrollSpeed) + uv -
                              vec2(angle.x * i, angle.y * i));
  }

  return vec4(delta * acc.rgba);
}
void main() {
  vec2 newUV = vUv;
  float area = smoothstep(0.4, 0., 1. - vUv.y); //* smoothstep(0.7,0.5,vUv.y);
  area = pow(area, 4.);
  newUV.x += 100. * (vUv.x) * 0.1 * area * scrollSpeed;
  vec4 texture = texture2D(tDiffuse, newUV);
  float r = radians(0.);
  vec2 direction = vec2(sin(r), cos(r));
  // vec4 texture = dirBlur(tDiffuse, newUV, (scrollSpeed*10.)*direction);
  float x = texture2D(tDiffuse, newUV + vec2(0.1, 0.0)).r;
  float y = texture2D(tDiffuse, newUV + vec2(-0.001, 0.0)).g;
  float z = texture2D(tDiffuse, newUV + vec2(0., 0.1)).b;

  float mod = step(0.9, fract(newUV.x * 60.));
  float bonus = mod * area * scrollSpeed;
  // texture -= vec4(bonus);
  //   texture.g += y  * scrollSpeed*1.;
  //    texture.r += x * scrollSpeed*10.;

  gl_FragColor = vec4(texture);
  //   gl_FragColor = vec4(area,0.,0.,1.);
}