varying vec2 vUv;
varying vec3 vPos;
varying float vDist;

uniform sampler2D uImage;
uniform float time;
uniform float uHoverState;
uniform vec2 uHover;
uniform float scrollSpeed;
uniform float uClick;

float circle(in vec2 uv, in vec2 pos, in float _radius) {
  float dist = distance(uv * vec2(3., 1.), pos * vec2(3., 1.));
  return 1. - smoothstep(_radius - (.001), _radius + (.001), dist);
}

void main() {
  // vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
  float flooredHover = floor((uHover.x * 2. - 1.) * 5.);
  vec2 newUV = (vUv * 2.) - 1.;
  vec2 gUV = newUV * vec2(5, 3.);
  vec2 flooredUV = floor(gUV);
  float x = mod(flooredUV.x, 2.);
  float y = mod(flooredUV.y, 2.);
  float highway = step(0.05, fract(gUV.x)); // - step(0.05, fract(1. - gUV.x));
  // vec2 newUV = vUv;
  vec4 image = texture2D(uImage, vUv * vec2(1., 1.));
  vec3 colorA = vec3(.2, .1, .1);
  vec3 colorB = vec3(.8, .13, .1);
  vec3 ombreToGreen = vec3(.255, .686, .929);
  vec3 ombreBlue = vec3(.255, .286, .329);
  vec3 ombreGreen = vec3(.255, .329, .306);
  vec3 ombreYellow = vec3(.429, .314, .2555);

  float dist = circle(vec2(vUv.x, vUv.y), uHover, .05);

  // dist = step(.5 ,dist);
  if (image.a - .0005 < 0.) {
    image.a = 0.;

  } else {
    image.rgb = image.rgb; // mix(vec3(1.),vec3(1.),scrollSpeed);
  }

  vec4 line = vec4(1. - newUV.x * 1.6, 0., 0., 1.) * step(-1., newUV.y); //*x*y;

  //   res = min(vec4(highway), image);
  vec4 mx = mix(
      vec4(highway),
      vec4(highway * 0.5 + scrollSpeed * 0.5, 0., scrollSpeed * 0.5, highway),
      scrollSpeed);
  vec4 high = vec4(highway);
  if (flooredHover == flooredUV.x && uHoverState > 0.001) {
    high.rgb *= 1. - uHoverState * mix(vec3(1.) - vec3(1., 1., 0.),
                                       vec3(1.) - colorB, uHoverState);
  };
  // high.rgb *= smoothstep(uClick - .9, uClick + .9, 1. - vUv.y);
  // high.rgb -= 0.5 + flooredUV.x * 0.1;
  // high -= dist * uHoverState;
  gl_FragColor = vec4(high);
}
