/**
 * The opening show's particle engine (WebGL2, no library). One set of N points (a 256-wide grid of ids) moves
 * between shapes: point lists kept in a float texture array (the notes' words, the week-5 embryo, the fetal skull,
 * the face at week 5 and week 10, the wordmark) and two shapes worked out in the shader (a drifting swarm, and the
 * zygote dividing into 2, 4, 8 and 16 cells). Each frame is one draw of the points into a half-float buffer, then a
 * small bloom and a finish (tone, vignette, grain).
 *
 * The engine draws what it is told (`Shot`); the timelines (intro.ts) decide what that is.
 */

export const SIDE = 256;
export const N = SIDE * SIDE;
/** Shapes worked out in the shader (layer numbers below 0). */
export const SWARM = -1;
export const CELLS = -2;

export type M4 = Float32Array;

export interface Shape {
  /** Texture layer (≥ 0) or SWARM / CELLS. */
  layer: number;
  /** Model matrix (column-major). */
  model: M4;
  /** Colour of a procedural shape, linear-ish 0..1 (texture shapes carry their own). */
  tint?: [number, number, number];
}

export interface Shot {
  t: number;
  a: Shape;
  b: Shape;
  /** 0 → a, 1 → b (each point at its own moment, see `spread`). */
  mix: number;
  /** How much the points' moments differ (0 all together .. 0.7 a long wave). */
  spread: number;
  /** -1..1: the wave runs from low to high along the axis (1), the other way (-1), or at random (0). */
  sweep: number;
  /** The wave's axis: 0 x (left to right, like writing), 1 y (default). */
  sweepAxis?: number;
  /** Turbulence while travelling (world units). */
  stir: number;
  /** A steady breath on the settled shape (world units). */
  drift: number;
  /** CELLS: divisions so far (0..4, fractional = dividing) and compaction (0..1). */
  cells: number;
  compact: number;
  /** View-projection matrix and camera position (for depth of field). */
  viewProj: M4;
  eye: [number, number, number];
  /** Distance kept sharp, and how fast the rest blurs. */
  focus: number;
  aperture: number;
  /** Overall light, point size (px at distance 1 at 1000 px tall), bloom. */
  exposure: number;
  size: number;
  bloom: number;
  /** Points drawn (≤ N): fewer on weak GPUs, and any prefix of a cloud is a fair thinner cloud. */
  count: number;
  /** Pointer in device pixels (bottom-left origin) and its push. */
  pointer: [number, number];
  push: number;
  /** Fade of the whole picture (0 black .. 1). */
  fade: number;
  /** The journey's warm ground behind the points (0 the film's black .. 1), and where its light is (0..1, y up). */
  ground?: number;
  groundAt?: [number, number];
  /** 0..1 how much colour comes from the shapes (vs a warm cream). */
  color: number;
  /** Sparkle on arrival (0..1). */
  flash: number;
  /** 0..1: perspective off (every point divided by the depth of `flatAt`), to lie under an orthographic render. */
  flatten?: number;
  flatAt?: [number, number, number];
  /** A shock wave on a beat: centre (world), age (s) and strength (0 none); the ring pushes and lights the points. */
  wave?: [number, number, number, number];
  waveAmp?: number;
  /** 0..1: points glow by how far they travel between a and b (the tissue that moves, lit while it moves). */
  moveGlow?: number;
}

const common = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;
`;

const pointsVS =
  common +
  `
uniform sampler2DArray pos, col;
uniform int layerA, layerB, sweepAxis;
uniform mat4 modelA, modelB, viewProj;
uniform vec3 tintA, tintB, eye;
uniform float t, mixK, spread, sweep, span, stir, drift, cells, compact, focus, aperture, size, resY, flash, colorK;
uniform vec2 pointer, res;
uniform float push, flatten, waveAmp, moveGlow;
uniform vec3 flatAt;
uniform vec4 wave;
out vec3 vColor;
out float vAlpha;
out float vBlur;

// An integer hash (PCG) of the float's bits: sin()-hashes lose precision at large ids on GPUs and line points up.
uint pcg(uint v){ uint s = v * 747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
float h1(float n){ return float(pcg(floatBitsToUint(n)) >> 8u) / 16777216.; }
vec3 h3(float n){ return vec3(h1(n), h1(n + 17.17), h1(n + 41.31)); }
vec3 onSphere(float n){
  vec2 r = vec2(h1(n * 1.31 + 3.1), h1(n * 0.77 + 9.7));
  float z = r.x * 2. - 1., a = r.y * 6.2831853, s = sqrt(1. - z * z);
  return vec3(s * cos(a), z, s * sin(a));
}
vec3 flow(vec3 p, float t){
  return vec3(
    sin(p.y * 1.7 + t * .9) + cos(p.z * 1.3 - t * .7),
    sin(p.z * 1.5 + t * .8) + cos(p.x * 1.9 + t * .5),
    sin(p.x * 1.4 - t * .6) + cos(p.y * 1.1 + t * .9)) * .5;
}
// The zygote and its divisions: each point belongs to one of 16 cells (its id's low bits); after l divisions its cell
// is the first l bits, halving along x, y, z, x in turn. Cells keep the zygote's volume (radius × 0.5^(1/3) each time).
vec3 cleave(float id){
  int c = int(mod(id, 16.));
  float l = clamp(cells, 0., 4.);
  float whole = floor(l), f = l - whole;
  f = f * f * (3. - 2. * f);
  vec3 centre = vec3(0.);
  float r = 1.;
  for (int b = 0; b < 4; b++){
    float fb = float(b);
    if (fb >= whole + 1.) break;
    float k = fb < whole ? 1. : f;
    float rb = pow(.5, (fb + 1.) / 3.);
    vec3 axis = b == 0 ? vec3(1., 0., 0.) : b == 1 ? vec3(0., 1., 0.) : b == 2 ? vec3(0., 0., 1.) : vec3(.7, .0, .7);
    float s = ((c >> b) & 1) == 1 ? 1. : -1.;
    centre += axis * s * rb * .5 * k;
    r = mix(r, rb, k);
  }
  // Compaction: the cells press together into one ball (the morula).
  centre *= 1. - .42 * compact;
  r *= 1. + .25 * compact;
  vec3 d = onSphere(id);
  // Mostly the membrane; some points inside (the cytoplasm), a few in a nucleus.
  float pick = h1(id * .37);
  float inner = pick < .06 ? .18 * h1(id * 2.1) : pick < .2 ? .35 + .5 * h1(id * 2.1) : 1.;
  return centre + d * r * inner * .5;
}
vec3 swarm(float id){
  vec3 d = onSphere(id + 5.);
  float r = pow(h1(id * .53), .45) * 3.2;
  return d * r;
}
vec4 shapeAt(int layer, ivec2 tc, float id, mat4 model, out vec3 tint, vec3 uTint){
  if (layer >= 0){
    vec4 p = texelFetch(pos, ivec3(tc, layer), 0);
    vec4 c = texelFetch(col, ivec3(tc, layer), 0);
    tint = c.rgb;
    return vec4((model * vec4(p.xyz, 1.)).xyz, c.a);
  }
  tint = uTint;
  vec3 q = layer == ${SWARM} ? swarm(id) : cleave(id);
  return vec4((model * vec4(q, 1.)).xyz, 1.);
}
void main(){
  float id = float(gl_VertexID);
  ivec2 tc = ivec2(gl_VertexID % ${SIDE}, gl_VertexID / ${SIDE});
  vec3 ta, tb;
  vec4 A = shapeAt(layerA, tc, id, modelA, ta, tintA);
  vec4 B = shapeAt(layerB, tc, id, modelB, tb, tintB);
  vec3 rnd = h3(id);
  // Each point's own moment: a wave along y (or at random), so a shape assembles rather than pops.
  float along = sweepAxis == 0 ? B.x : B.y;
  float order = sweep == 0. ? rnd.x : clamp(.5 + .5 * sweep * along / span, 0., 1.) * .8 + rnd.x * .2;
  float k = clamp((mixK - order * spread) / max(.0001, 1. - spread), 0., 1.);
  float e = k * k * (3. - 2. * k);
  vec3 p = mix(A.xyz, B.xyz, e);
  float travel = sin(3.14159 * e);
  p += flow(p * .8 + rnd, t * .7) * stir * travel;
  // The arc: points lift out of the line a little on their way, not straight across.
  p += normalize(rnd - .5 + 1e-4) * stir * .35 * travel;
  p += flow(p * 1.3, t * .35) * drift;
  // The beat's shock wave: a ring running out from the centre, pushing the points it passes and lighting them.
  float ring = 0.;
  if (waveAmp > 0.){
    vec3 off = p - wave.xyz;
    float r = length(off), front = wave.w * 3.4;
    ring = exp(-pow((r - front) / .3, 2.)) * exp(-wave.w * 2.2) * waveAmp;
    p += off / max(r, 1e-3) * ring * .16;
  }
  // What moves glows while it moves (the face's prominences as they come together).
  float moved = moveGlow > 0. ? moveGlow * smoothstep(.04, .22, length(B.xyz - A.xyz) / span) * travel : 0.;
  vec4 clip = viewProj * vec4(p, 1.);
  if (flatten > 0.){
    float nw = mix(clip.w, (viewProj * vec4(flatAt, 1.)).w, flatten);
    clip.z *= nw / clip.w;
    clip.w = nw;
  }
  // The pointer parts the cloud (in screen space, so it feels the same at any depth).
  vec2 sp = (clip.xy / clip.w * .5 + .5) * res;
  vec2 away = sp - pointer;
  float dist = length(away);
  float shove = push * exp(-dist * dist / (2. * 90. * 90. * (res.y / 1000.) * (res.y / 1000.)));
  sp += normalize(away + 1e-3) * shove * 60. * (res.y / 1000.);
  clip.xy = ((sp / res) * 2. - 1.) * clip.w;
  gl_Position = clip;
  float depth = length(p - eye);
  float blur = min(abs(depth - focus) * aperture, 6.);
  float w = mix(A.w, B.w, e);
  float px = size * (resY / 1000.) / max(.2, depth) * (.55 + .9 * rnd.y);
  gl_PointSize = clamp(px * (1. + blur), 1., 40.);
  vec3 tint = mix(ta, tb, e);
  vec3 cream = vec3(1., .86, .72);
  vColor = mix(cream, tint, colorK);
  vColor = mix(vColor, vec3(1., .93, .82), clamp(ring * .7 + moved * .35, 0., .8));
  float twinkle = flash * step(.86, rnd.z) * (.5 + .5 * sin(t * 9. + id));
  vAlpha = w * (.55 + .45 * rnd.z) / (1. + blur * blur * .8) * (1. + travel * .35 + ring * 2.2 + moved * 1.5) + twinkle;
  vBlur = blur;
}`;

const pointsFS =
  common +
  `
in vec3 vColor;
in float vAlpha;
in float vBlur;
uniform float exposure;
out vec4 o;
void main(){
  vec2 q = gl_PointCoord * 2. - 1.;
  float r2 = dot(q, q);
  if (r2 > 1.) discard;
  // Sharp points are a bright core; blurred ones a soft disc with a faint rim (a lens's bokeh).
  float core = exp(-r2 * 4.);
  float disc = smoothstep(1., .75, r2) * (.55 + .45 * r2);
  float a = mix(core, disc, clamp(vBlur * .5, 0., 1.));
  o = vec4(vColor * a * vAlpha * exposure, 1.);
}`;

const quadVS =
  common +
  `
out vec2 uv;
void main(){
  vec2 p = vec2(gl_VertexID == 1 ? 3. : -1., gl_VertexID == 2 ? 3. : -1.);
  uv = p * .5 + .5;
  gl_Position = vec4(p, 0., 1.);
}`;

const brightFS =
  common +
  `
in vec2 uv;
uniform sampler2D src;
uniform vec2 texel;
out vec4 o;
void main(){
  vec3 c = vec3(0.);
  for (int i = 0; i < 4; i++){
    vec2 d = vec2(i % 2 == 0 ? -1. : 1., i < 2 ? -1. : 1.) * texel;
    c += texture(src, uv + d).rgb;
  }
  c *= .25;
  float l = dot(c, vec3(.2126, .7152, .0722));
  o = vec4(c * smoothstep(.25, 1.1, l), 1.);
}`;

const blurFS =
  common +
  `
in vec2 uv;
uniform sampler2D src;
uniform vec2 dir;
out vec4 o;
void main(){
  vec3 c = texture(src, uv).rgb * .227027;
  c += (texture(src, uv + dir * 1.3846).rgb + texture(src, uv - dir * 1.3846).rgb) * .316216;
  c += (texture(src, uv + dir * 3.2308).rgb + texture(src, uv - dir * 3.2308).rgb) * .070270;
  o = vec4(c, 1.);
}`;

const finishFS =
  common +
  `
in vec2 uv;
uniform sampler2D scene, glow;
uniform float bloom, fade, t, ground;
uniform vec2 res, groundAt;
out vec4 o;
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
void main(){
  vec3 c = texture(scene, uv).rgb + texture(glow, uv).rgb * bloom;
  c = aces(c * 1.05);
  // A warm lift in the shadows and a soft vignette: the film's own ground, not pure black.
  vec2 d = uv - .5;
  d.x *= res.x / res.y;
  float v = smoothstep(1.15, .25, length(d));
  c = c * (.55 + .45 * v) + vec3(.016, .010, .008) * v;
  // The page's own ground under the points (the journey's warm light behind its picture).
  vec2 g0 = uv - groundAt;
  g0.x *= res.x / res.y;
  vec3 room = mix(vec3(.064, .060, .068), vec3(.145, .105, .094), smoothstep(.62, 0., length(g0)));
  c = max(c, c + room * ground * (1. - .5 * dot(c, vec3(.33))));
  float g = fract(sin(dot(gl_FragCoord.xy + t * 61., vec2(12.9898, 78.233))) * 43758.5453);
  c += (g - .5) * .018;
  c *= fade;
  o = vec4(pow(max(c, 0.), vec3(1. / 1.0)), 1.);
}`;

export interface Engine {
  /** Fill one texture layer with points (xyz + weight) and colours (rgb 0..1). */
  upload(layer: number, xyzw: Float32Array, rgb: Uint8Array): void;
  draw(s: Shot): void;
  resize(): void;
  /** Device pixels of the canvas. */
  readonly width: number;
  readonly height: number;
  setScale(k: number): void;
  dispose(): void;
}

export const LAYERS = 6;

/** Ready to draw, or throws (no WebGL2, no float targets are fine: the picture is drawn without bloom). */
export async function openEngine(canvas: HTMLCanvasElement, signal: AbortSignal): Promise<Engine> {
  const ctx = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance', desynchronized: false });
  if (!ctx) throw Error('WebGL2');
  const gl: WebGL2RenderingContext = ctx;
  const floatTargets = !!gl.getExtension('EXT_color_buffer_float');
  gl.getExtension('EXT_float_blend');
  const parallel = gl.getExtension('KHR_parallel_shader_compile');

  const programs: WebGLProgram[] = [];
  function link(vs: string, fs: string) {
    const p = gl!.createProgram()!;
    for (const [type, src] of [
      [gl!.VERTEX_SHADER, vs],
      [gl!.FRAGMENT_SHADER, fs],
    ] as const) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      gl!.attachShader(p, s);
    }
    gl!.linkProgram(p);
    programs.push(p);
    return p;
  }
  const prog = {
    points: link(pointsVS, pointsFS),
    bright: link(quadVS, brightFS),
    blur: link(quadVS, blurFS),
    finish: link(quadVS, finishFS),
  };
  // Compiled in the background where the browser can (the page keeps drawing), asked about only at the end.
  if (parallel) {
    const all = Object.values(prog);
    while (!all.every((p) => gl.getProgramParameter(p, parallel.COMPLETION_STATUS_KHR))) {
      await new Promise((r) => setTimeout(r, 16));
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    }
  }
  for (const p of Object.values(prog))
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const shaders = gl.getAttachedShaders(p) ?? [];
      throw Error(shaders.map((s) => gl.getShaderInfoLog(s)).join('\n') || gl.getProgramInfoLog(p) || 'link');
    }
  const uniforms = new Map<WebGLProgram, Record<string, WebGLUniformLocation | null>>();
  const U = (p: WebGLProgram, name: string) => {
    let m = uniforms.get(p);
    if (!m) uniforms.set(p, (m = {}));
    if (!(name in m)) m[name] = gl.getUniformLocation(p, name);
    return m[name];
  };

  const vao = gl.createVertexArray();
  // Points: positions and colours, one layer per shape.
  const posTex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, posTex);
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA32F, SIDE, SIDE, LAYERS);
  for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D_ARRAY, p, gl.NEAREST);
  const colTex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, colTex);
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, SIDE, SIDE, LAYERS);
  for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D_ARRAY, p, gl.NEAREST);

  // Render targets: the scene, and two small ones for the glow.
  type Target = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };
  let scene: Target | null = null,
    glowA: Target | null = null,
    glowB: Target | null = null;
  const target = (w: number, h: number): Target => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, floatTargets ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, floatTargets ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fb, tex, w, h };
  };
  const drop = (t: Target | null) => {
    if (!t) return;
    gl.deleteFramebuffer(t.fb);
    gl.deleteTexture(t.tex);
  };
  let scale = 1;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75) * scale;
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr)),
      h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (scene && canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    drop(scene);
    drop(glowA);
    drop(glowB);
    scene = target(w, h);
    const gw = Math.max(2, Math.round(w / 4)),
      gh = Math.max(2, Math.round(h / 4));
    glowA = target(gw, gh);
    glowB = target(gw, gh);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  resize();

  function quad(p: WebGLProgram, to: Target | null, bind: () => void) {
    gl.useProgram(p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, to?.fb ?? null);
    gl.viewport(0, 0, to?.w ?? canvas.width, to?.h ?? canvas.height);
    bind();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  return {
    get width() {
      return canvas.width;
    },
    get height() {
      return canvas.height;
    },
    setScale(k) {
      scale = k;
      resize();
    },
    upload(layer, xyzw, rgb) {
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, posTex);
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, SIDE, SIDE, 1, gl.RGBA, gl.FLOAT, xyzw);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, colTex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, SIDE, SIDE, 1, gl.RGBA, gl.UNSIGNED_BYTE, rgb);
    },
    resize,
    draw(s) {
      resize();
      const W = canvas.width,
        H = canvas.height;
      // 1. The points, added up.
      gl.bindFramebuffer(gl.FRAMEBUFFER, scene!.fb);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      const p = prog.points;
      gl.useProgram(p);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, posTex);
      gl.uniform1i(U(p, 'pos'), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, colTex);
      gl.uniform1i(U(p, 'col'), 1);
      gl.uniform1i(U(p, 'layerA'), s.a.layer);
      gl.uniform1i(U(p, 'layerB'), s.b.layer);
      gl.uniformMatrix4fv(U(p, 'modelA'), false, s.a.model);
      gl.uniformMatrix4fv(U(p, 'modelB'), false, s.b.model);
      gl.uniformMatrix4fv(U(p, 'viewProj'), false, s.viewProj);
      gl.uniform3fv(U(p, 'tintA'), s.a.tint ?? [1, 0.85, 0.7]);
      gl.uniform3fv(U(p, 'tintB'), s.b.tint ?? [1, 0.85, 0.7]);
      gl.uniform3fv(U(p, 'eye'), s.eye);
      gl.uniform1f(U(p, 't'), s.t);
      gl.uniform1f(U(p, 'mixK'), s.mix);
      gl.uniform1f(U(p, 'spread'), s.spread);
      gl.uniform1f(U(p, 'sweep'), s.sweep);
      gl.uniform1i(U(p, 'sweepAxis'), s.sweepAxis ?? 1);
      gl.uniform1f(U(p, 'span'), Math.max(0.01, Math.hypot(s.b.model[0], s.b.model[1], s.b.model[2])));
      gl.uniform1f(U(p, 'stir'), s.stir);
      gl.uniform1f(U(p, 'drift'), s.drift);
      gl.uniform1f(U(p, 'cells'), s.cells);
      gl.uniform1f(U(p, 'compact'), s.compact);
      gl.uniform1f(U(p, 'focus'), s.focus);
      gl.uniform1f(U(p, 'aperture'), s.aperture);
      gl.uniform1f(U(p, 'size'), s.size * Math.min(window.devicePixelRatio || 1, 1.75) * scale);
      gl.uniform1f(U(p, 'resY'), H / Math.min(window.devicePixelRatio || 1, 1.75) / scale);
      gl.uniform1f(U(p, 'flash'), s.flash);
      gl.uniform1f(U(p, 'colorK'), s.color);
      gl.uniform2f(U(p, 'pointer'), s.pointer[0], s.pointer[1]);
      gl.uniform2f(U(p, 'res'), W, H);
      gl.uniform1f(U(p, 'push'), s.push);
      gl.uniform1f(U(p, 'flatten'), s.flatten ?? 0);
      gl.uniform3fv(U(p, 'flatAt'), s.flatAt ?? [0, 0, 0]);
      gl.uniform4fv(U(p, 'wave'), s.wave ?? [0, 0, 0, 9]);
      gl.uniform1f(U(p, 'waveAmp'), s.waveAmp ?? 0);
      gl.uniform1f(U(p, 'moveGlow'), s.moveGlow ?? 0);
      gl.uniform1f(U(p, 'exposure'), s.exposure);
      gl.drawArrays(gl.POINTS, 0, Math.min(N, s.count));
      gl.disable(gl.BLEND);
      // 2. The glow: bright parts, small, blurred twice each way.
      quad(prog.bright, glowA, () => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, scene!.tex);
        gl.uniform1i(U(prog.bright, 'src'), 0);
        gl.uniform2f(U(prog.bright, 'texel'), 1 / W, 1 / H);
      });
      for (let i = 0; i < 2; i++) {
        quad(prog.blur, glowB, () => {
          gl.bindTexture(gl.TEXTURE_2D, glowA!.tex);
          gl.uniform1i(U(prog.blur, 'src'), 0);
          gl.uniform2f(U(prog.blur, 'dir'), (1 + i) / glowA!.w, 0);
        });
        quad(prog.blur, glowA, () => {
          gl.bindTexture(gl.TEXTURE_2D, glowB!.tex);
          gl.uniform1i(U(prog.blur, 'src'), 0);
          gl.uniform2f(U(prog.blur, 'dir'), 0, (1 + i) / glowA!.h);
        });
      }
      // 3. The finish, on screen.
      quad(prog.finish, null, () => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, scene!.tex);
        gl.uniform1i(U(prog.finish, 'scene'), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, glowA!.tex);
        gl.uniform1i(U(prog.finish, 'glow'), 1);
        gl.uniform1f(U(prog.finish, 'bloom'), s.bloom);
        gl.uniform1f(U(prog.finish, 'fade'), s.fade);
        gl.uniform1f(U(prog.finish, 'ground'), s.ground ?? 0);
        gl.uniform2f(U(prog.finish, 'groundAt'), s.groundAt?.[0] ?? 0.78, s.groundAt?.[1] ?? 0.52);
        gl.uniform1f(U(prog.finish, 't'), s.t);
        gl.uniform2f(U(prog.finish, 'res'), W, H);
      });
      gl.activeTexture(gl.TEXTURE0);
    },
    dispose() {
      drop(scene);
      drop(glowA);
      drop(glowB);
      gl.deleteTexture(posTex);
      gl.deleteTexture(colTex);
      gl.deleteVertexArray(vao);
      programs.forEach((p) => gl.deleteProgram(p));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}

// ———————————————————————————— small matrix helpers ————————————————————————————

export function perspective(fovY: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan(fovY / 2),
    nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) * nf;
  m[11] = -1;
  m[14] = 2 * far * near * nf;
  return m;
}

export function lookAt(eye: number[], at: number[], up = [0, 1, 0]): M4 {
  const z = norm([eye[0] - at[0], eye[1] - at[1], eye[2] - at[2]]);
  const x = norm(cross(up, z));
  const y = cross(z, x);
  const m = new Float32Array(16);
  m.set([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
  return m;
}

export function multiply(a: M4, b: M4): M4 {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}

/** Scale, then turn (yaw about y, then pitch about x), then move. */
export function model(scale: number, yaw: number, pitch: number, at: [number, number, number] = [0, 0, 0], roll = 0): M4 {
  const cy = Math.cos(yaw),
    sy = Math.sin(yaw),
    cp = Math.cos(pitch),
    sp = Math.sin(pitch),
    cr = Math.cos(roll),
    sr = Math.sin(roll);
  // R = Rz(roll) · Rx(pitch) · Ry(yaw)
  const ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy];
  const rx = [1, 0, 0, 0, cp, sp, 0, -sp, cp];
  const rz = [cr, sr, 0, -sr, cr, 0, 0, 0, 1];
  const mul3 = (a: number[], b: number[]) => {
    const o = new Array(9).fill(0);
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];
    return o;
  };
  const R = mul3(rz, mul3(rx, ry));
  const m = new Float32Array(16);
  m.set([R[0] * scale, R[1] * scale, R[2] * scale, 0, R[3] * scale, R[4] * scale, R[5] * scale, 0, R[6] * scale, R[7] * scale, R[8] * scale, 0, at[0], at[1], at[2], 1]);
  return m;
}

const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: number[]) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
