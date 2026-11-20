import type { Item3 } from '@/lib/three-d/scene';
import { fragment, vertex } from './optics';
import { grainsFragment, grainsVertex, masks, motesFragment, motesVertex } from './grains';

type V2 = [number, number];
type Box = [number, number, number];
export type Exhibit = { items: Item3[]; rect: DOMRect; yaw: number; pitch: number };
export interface Shot {
  t: number;
  /** The heart's own clock (optics.ts `pulse`), when the film's time is slowed or warped; default `t`. */
  pulse?: number;
  box: Box;
  angles: V2;
  skin: number;
  grains: number;
  flat: number;
  focus: number;
  motes: number;
  exhibit?: Exhibit | null;
  clip?: DOMRect;
}
const finishFragment = `
precision highp float;
uniform sampler2D image;uniform vec2 resolution;out vec4 pixel;
void main(){
 vec2 uv=gl_FragCoord.xy/resolution,stepSize=3.5/resolution;vec4 c=texture(image,uv);vec3 halo=vec3(0.);
 for(int i=0;i<8;i++){
   float a=float(i)*.7854;
   vec3 p=texture(image,uv+stepSize*vec2(cos(a),sin(a))).rgb;
   halo+=p*smoothstep(.64,.90,dot(p,vec3(.2126,.7152,.0722)));
 }
 halo*=.022;pixel=vec4(c.rgb+halo,min(1.,c.a+max(halo.r,max(halo.g,halo.b))));
}`;
const palateVertex = `
precision highp float;
in vec3 pos,norm,ink;uniform vec2 angles,resolution;uniform vec3 viewBox;
out vec3 color;
void main(){
 float a=angles.x,b=angles.y;mat3 yaw=mat3(cos(a),0.,-sin(a),0.,1.,0.,sin(a),0.,cos(a));
 mat3 pitch=mat3(1.,0.,0.,0.,cos(b),sin(b),0.,-sin(b),cos(b));
 vec3 p=pitch*yaw*pos,n=normalize(pitch*yaw*norm);
 gl_Position=vec4((viewBox.xy+p.xy*viewBox.z)/resolution*2.-1.,-p.z*.06,1.);
 color=ink*(.56+.43*max(0.,dot(n,normalize(vec3(-.38,.6,.72)))))+.06*pow(1.-abs(n.z),2.);
}`;
const palateFragment = 'precision highp float;in vec3 color;out vec4 pixel;void main(){pixel=vec4(color,1.);}';

function packPalate(items: Item3[]) {
  const data = new Float32Array(items.reduce((n, item) => n + item.mesh.idx.length, 0) * 9);
  let at = 0;
  for (const { mesh, color, matrix } of items) {
    const c = parseInt(color.slice(1), 16),
      rgb = [(c >> 16) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255];
    for (const i of mesh.idx) {
      for (const [array, w] of [
        [mesh.pos, 1],
        [mesh.nrm, 0],
      ] as const) {
        const x = array[i * 3],
          y = array[i * 3 + 1],
          z = array[i * 3 + 2];
        if (matrix)
          for (let k = 0; k < 3; k++)
            data[at++] = matrix[k] * x + matrix[4 + k] * y + matrix[8 + k] * z + matrix[12 + k] * w;
        else {
          data[at++] = x;
          data[at++] = y;
          data[at++] = z;
        }
      }
      data.set(rgb, at);
      at += 3;
    }
  }
  return data;
}
async function loadBytes(name: string, signal: AbortSignal) {
  const r = await fetch('/intro-review/' + name, { signal });
  if (!r.ok || !r.body) throw Error(name);
  return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
}

export async function openProjector(canvas: HTMLCanvasElement, signal: AbortSignal, withGrains = true) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  if (!gl) throw Error('WebGL2');
  const [vol, cloud] = await Promise.all([
    loadBytes('week-five.vol.gz', signal),
    withGrains ? loadBytes('surface.bin.gz', signal) : null,
  ]);
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const programs: WebGLProgram[] = [],
    buffers: WebGLBuffer[] = [],
    vaos: WebGLVertexArrayObject[] = [];
  function link(vs: string, fs: string) {
    const p = gl!.createProgram()!;
    programs.push(p);
    for (const [type, text] of [
      [gl!.VERTEX_SHADER, vs],
      [gl!.FRAGMENT_SHADER, fs],
    ] as const) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, '#version 300 es\n' + text);
      gl!.compileShader(s);
      gl!.attachShader(p, s);
      gl!.deleteShader(s);
    }
    gl!.linkProgram(p);
    return p;
  }
  // Every program is handed to the driver first and asked about only once all are built: asked one by one,
  // each check waited for its compile, and the opening's "Sartu" screen froze for over a second. Where the
  // browser compiles in the background (KHR_parallel_shader_compile), the page keeps drawing meanwhile.
  const linked = {
    volume: link(vertex, fragment),
    finish: link(vertex, finishFragment),
    particles: cloud ? link(grainsVertex, grainsFragment) : null,
    motes: link(motesVertex, motesFragment),
    palate: link(palateVertex, palateFragment),
  };
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  if (parallel) {
    const pending = Object.values(linked).filter((p): p is WebGLProgram => !!p);
    while (!pending.every((p) => gl.getProgramParameter(p, parallel.COMPLETION_STATUS_KHR))) {
      await new Promise((r) => setTimeout(r, 16));
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    }
  }
  function pipeline(p: WebGLProgram) {
    if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) throw Error(gl!.getProgramInfoLog(p) || 'Shader');
    const vao = gl!.createVertexArray()!;
    vaos.push(vao);
    const u: Record<string, WebGLUniformLocation> = {};
    for (let i = 0; i < gl!.getProgramParameter(p, gl!.ACTIVE_UNIFORMS); i++) {
      const name = gl!.getActiveUniform(p, i)!.name;
      u[name] = gl!.getUniformLocation(p, name)!;
    }
    return {
      p,
      u,
      vao,
      use() {
        gl!.useProgram(p);
        gl!.bindVertexArray(vao);
      },
    };
  }
  const volume = pipeline(linked.volume),
    finish = pipeline(linked.finish);
  const particles = linked.particles ? pipeline(linked.particles) : null,
    motes = pipeline(linked.motes);
  const palate = pipeline(linked.palate);
  function buffer(data: ArrayBufferView<ArrayBuffer>, usage: number = gl!.STATIC_DRAW) {
    const buf = gl!.createBuffer()!;
    buffers.push(buf);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
    gl!.bufferData(gl!.ARRAY_BUFFER, data, usage);
    return buf;
  }
  function attribute(prog: WebGLProgram, name: string, size: number, type: number, stride = 0, offset = 0) {
    const loc = gl!.getAttribLocation(prog, name);
    gl!.enableVertexAttribArray(loc);
    gl!.vertexAttribPointer(loc, size, type, false, stride, offset);
  }
  let total = 0;
  if (particles && cloud) {
    total = cloud.byteLength / 6;
    const mask = masks(total);
    particles.use();
    // A plain loop: Float32Array.from with a mapping function took a few hundred ms on the opening's load.
    const raw = new Int16Array(cloud);
    const coords = new Float32Array(raw.length);
    for (let i = 0; i < raw.length; i++) coords[i] = raw[i] / 4096;
    buffer(coords);
    attribute(particles.p, 'surface', 3, gl.FLOAT);
    buffer(mask.text);
    attribute(particles.p, 'letter', 2, gl.FLOAT);
    const paper = buffer(new Float32Array(total * 2));
    attribute(particles.p, 'plate', 2, gl.FLOAT);
    void mask
      .plate()
      .then((arr) => {
        if (!signal.aborted) {
          gl.bindBuffer(gl.ARRAY_BUFFER, paper);
          gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
        }
      })
      .catch(() => {});
  }
  palate.use();
  const palateBuffer = buffer(new Float32Array(0), gl.DYNAMIC_DRAW);
  ['pos', 'norm', 'ink'].forEach((key, k) => attribute(palate.p, key, 3, gl.FLOAT, 36, k * 12));
  const tex = gl.createTexture()!,
    color = gl.createTexture()!,
    frame = gl.createFramebuffer()!,
    depth = gl.createRenderbuffer()!;
  gl.bindTexture(gl.TEXTURE_3D, tex);
  for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R])
    gl.texParameteri(gl.TEXTURE_3D, p, gl.CLAMP_TO_EDGE);
  for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_3D, p, gl.LINEAR);
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 64, 120, 130, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(vol));
  gl.bindTexture(gl.TEXTURE_2D, color);
  for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE);
  for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR);
  let lastItems: Item3[] | undefined,
    vertices = 0,
    width = 0,
    height = 0;
  function draw(shot: Shot, quality = 1) {
    const { t, box, angles, skin, grains, flat, focus, exhibit } = shot;
    const ratio = Math.min(devicePixelRatio || 1, 1.75, 2400 / Math.max(canvas.clientWidth, 1)) * quality;
    const w = Math.max(1, Math.round(canvas.clientWidth * ratio)),
      h = Math.max(1, Math.round(canvas.clientHeight * ratio));
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, frame);
    gl!.bindTexture(gl!.TEXTURE_2D, null);
    if (width !== w || height !== h) {
      width = canvas.width = w;
      height = canvas.height = h;
      gl!.bindTexture(gl!.TEXTURE_2D, color);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, color, 0);
      gl!.bindTexture(gl!.TEXTURE_2D, null);
      gl!.bindRenderbuffer(gl!.RENDERBUFFER, depth);
      gl!.renderbufferStorage(gl!.RENDERBUFFER, gl!.DEPTH_COMPONENT16, w, h);
      gl!.framebufferRenderbuffer(gl!.FRAMEBUFFER, gl!.DEPTH_ATTACHMENT, gl!.RENDERBUFFER, depth);
    }
    const x = box[0] * ratio,
      y = h - box[1] * ratio,
      scale = ratio * box[2];
    gl!.viewport(0, 0, w, h);
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    if (shot.motes > 0.001) {
      motes.use();
      gl!.uniform1f(motes.u.beatTime, t);
      gl!.uniform1f(motes.u.pixelRatio, ratio);
      gl!.uniform1f(motes.u.energy, shot.motes);
      gl!.drawArrays(gl!.POINTS, 0, w < h ? 190 : 380);
    }
    function view(p: ReturnType<typeof pipeline>) {
      p.use();
      gl!.uniform2f(p.u.resolution, w, h);
      gl!.uniform2f(p.u.angles, ...angles);
      gl!.uniform3f(p.u.viewBox, x, y, scale);
      gl!.uniform1f(p.u.beatTime, t);
    }
    if (shot.clip) {
      const r = shot.clip;
      gl!.enable(gl!.SCISSOR_TEST);
      gl!.scissor(r.x * ratio, h - r.bottom * ratio, r.width * ratio, r.height * ratio);
    }
    if (skin > 0.001) {
      view(volume);
      gl!.uniform1f(volume.u.beatTime, shot.pulse ?? t);
      gl!.uniform1f(volume.u.skin, skin);
      gl!.uniform1f(volume.u.focusRegion, focus);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    if (particles && grains > 0.001) {
      view(particles);
      const number = Math.min(
        total,
        Math.floor((canvas.clientWidth <= 1024 ? 73728 : 163840) * Math.min(1, quality * 1.2)),
      );
      gl!.uniform1f(particles.u.number, number);
      gl!.uniform1f(particles.u.flatness, flat);
      gl!.uniform1f(particles.u.energy, grains);
      gl!.uniform1f(particles.u.pixelRatio, ratio);
      gl!.blendFuncSeparate(gl!.ONE, gl!.ONE, gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.drawArrays(gl!.POINTS, 0, number);
    }
    gl!.disable(gl!.SCISSOR_TEST);
    if (exhibit) {
      const { rect, items } = exhibit;
      if (lastItems !== items) {
        const data = packPalate(items);
        lastItems = items;
        vertices = data.length / 9;
        gl!.bindBuffer(gl!.ARRAY_BUFFER, palateBuffer);
        gl!.bufferData(gl!.ARRAY_BUFFER, data, gl!.DYNAMIC_DRAW);
      }
      palate.use();
      gl!.uniform2f(palate.u.resolution, w, h);
      gl!.uniform2f(palate.u.angles, exhibit.yaw, exhibit.pitch);
      gl!.uniform3f(
        palate.u.viewBox,
        (rect.x + rect.width / 2) * ratio,
        h - (rect.y + rect.height / 2) * ratio,
        Math.min(rect.width / 8.1, rect.height / 5.5) * ratio,
      );
      gl!.enable(gl!.SCISSOR_TEST);
      gl!.scissor(rect.x * ratio, h - rect.bottom * ratio, rect.width * ratio, rect.height * ratio);
      gl!.disable(gl!.BLEND);
      gl!.enable(gl!.DEPTH_TEST);
      gl!.drawArrays(gl!.TRIANGLES, 0, vertices);
      gl!.disable(gl!.DEPTH_TEST);
      gl!.disable(gl!.SCISSOR_TEST);
    }
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.disable(gl!.BLEND);
    gl!.bindTexture(gl!.TEXTURE_2D, color);
    finish.use();
    gl!.uniform2f(finish.u.resolution, w, h);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    canvas.dataset.frame = t.toFixed(2);
  }
  return {
    draw,
    dispose() {
      buffers.forEach((b) => gl.deleteBuffer(b));
      vaos.forEach((v) => gl.deleteVertexArray(v));
      programs.forEach((p) => gl.deleteProgram(p));
      gl.deleteFramebuffer(frame);
      gl.deleteRenderbuffer(depth);
      gl.deleteTexture(color);
      gl.deleteTexture(tex);
    },
  };
}
export async function renderStudy(canvas: HTMLCanvasElement, time: number, signal: AbortSignal) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) throw Error('Mugimendu murriztua');
  const projector = await openProjector(canvas, signal, false);
  const draw = () => {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    projector.draw({
      t: time,
      box: [w * 0.518, h * 0.512, Math.min(h / 9.35, w / 8.3)],
      angles: [0.12 + (time - 8.75) * 0.12, -0.105],
      skin: 1,
      grains: 0,
      flat: 0,
      focus: 0,
      motes: 1,
    });
  };
  draw();
  const observer = new ResizeObserver(draw);
  observer.observe(canvas);
  return () => {
    observer.disconnect();
    projector.dispose();
  };
}
