import { camera } from './optics';

export const lines = [
  'Somitek egitura bilaterala dute,',
  'hau da, bikoteak dira eta hodi neuralaren',
  'bi aldeetan kokatzen dira.',
]; // content/notes-text/w4.ts, w4/3.1/p4/s1

export const grainsVertex =
  `
precision highp float;
in vec3 surface;in vec2 letter,plate;
uniform float beatTime,flatness,energy,pixelRatio,number;
out vec3 tint;out float power;
` +
  camera +
  `
float h(float k){return fract(sin(mod(k,3001.)*12.9898)*43758.5453);}
void main(){
 float id=float(gl_VertexID),seed=h(id),s=h(id*.73+11.);
 float a=atan(surface.z,surface.y+2.8),outward=length(surface.yz-vec2(-2.8,0.))-2.6;
 float side=abs(surface.x),along=clamp((1.58-a)/3.98,0.,1.);
 float segment=round((a-.2/3.15)/(.6/3.15));
 float crest=cos((a-.2/3.15)*6.2831853/(.6/3.15));
 float birth=5.20+.53*along,landmark=0.;
 tint=vec3(.98,.78,.63);
 if(outward>.20 && side<.31 && a<1.72){birth=2.9+along*.95;tint=vec3(.76,.79,.98);landmark=.44;}
 else if(outward>.14 && side<.88 && a<1.51 && crest>-.18){
   birth=3.27+1./1.42+max(0.,8.-segment)/(1.42*8.);
   landmark=.74+.74*smoothstep(.1,.96,crest);tint=vec3(1.,.70,.49);
 }else if(side>.96 && (abs(a-.78)<.24||abs(a+.82)<.23)){birth=6.35+.26*step(a,0.);}
 else if(surface.z>1.85 && surface.y< -2.51){birth=5.24+.42*along;tint=vec3(.98,.72,.61);}
 else if(surface.y< -2.45 && surface.z>.45 && surface.z<1.8){birth=5.95;tint=vec3(.91,.39,.42);}
 birth+=s*.23;
 float departure=smoothstep(1.45+seed*.82,3.22+s*.55,beatTime);
 float u=max(0.,(beatTime-birth)*4.8);
 float settle=1.-(1.+u)*exp(-u);
 vec2 page=resolution*.5+letter*min(resolution.x*.85,resolution.y*1.20);
 float lane=floor(s*11.)-5.;
 // The source line and glyph position determine the feeding stream. Individual
 // cohorts peel off this current as their anatomical region becomes ready.
 float flow=letter.x*2.5+.28*sin(beatTime*.61+letter.y*2.);
 float phase=flow*3.4+beatTime*.44+lane*.081;
 vec3 route=vec3(.8*cos(phase)+lane*.055,-2.43-flow*4.9,
                 .22+1.38*sin(phase)+lane*.060+letter.y*.85);
 vec2 pos=mix(page,projectAt(mix(route,surface,settle)),departure);
 pos=mix(pos,viewBox.xy+plate*viewBox.z*3.85,flatness);
 float defocus=min(1.,abs(dot(surface-centre,forward())-.82)*.55);
 float fly=sin(3.14159*departure);
 // A passing highlight resolves individual somite pairs against the feeding current.
 float arrival=landmark*smoothstep(.4,.78,settle)*(1.-smoothstep(.35,1.4,beatTime-birth-.62));
 gl_PointSize=clamp(pixelRatio*(.94+seed*.98+.85*defocus+1.85*fly+.80*arrival),1.,7.);
 gl_Position=vec4(pos/resolution*2.-1.,0.,1.);
 tint=mix(vec3(.98,.86,.72),tint,departure);
 float visible=mix(.63,.24+.66*settle+.22*fly+arrival,departure);
 power=visible*energy*smoothstep(0.,.55,beatTime)*(.72+.28*seed)/(1.+defocus)*clamp(90000./number,.45,1.25);
}`;
export const grainsFragment = `
precision highp float;
in vec3 tint;in float power;out vec4 pixel;
void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;
 float a=power*exp(-r*3.1);pixel=vec4(tint*a,a);}
`;

export function masks(count: number) {
  const sheet = document.createElement('canvas');
  sheet.width = 900;
  sheet.height = 300;
  const pen = sheet.getContext('2d', { willReadFrequently: true })!;
  pen.fillStyle = 'white';
  pen.font = 'italic 39px Georgia';
  pen.textAlign = 'center';
  lines.forEach((line, i) => pen.fillText(line, 450, 92 + i * 56));
  function pixels(c: HTMLCanvasElement, ink: boolean) {
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    const points: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      const weight = ink ? 1 - (data[i] + data[i + 1] + data[i + 2]) / 765 : data[i + 3] / 255;
      if (weight > (ink ? 0.23 : 0.4)) points.push(i / 4);
    }
    const target = new Float32Array(count * 2);
    let state = 1827;
    function rand() {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    }
    const unit = ink ? c.height / 2 : c.width;
    for (let j = 0; j < count; j++) {
      const p = points[Math.floor(rand() * points.length)] ?? 0;
      target[j * 2] = ((p % c.width) + rand() - c.width / 2) / unit;
      target[j * 2 + 1] = (c.height / 2 - Math.floor(p / c.width) - rand()) / unit;
    }
    return target;
  }
  return {
    text: pixels(sheet, false),
    async plate() {
      const img = new Image();
      img.src = '/belortzioak-irudiak/p03.webp';
      await img.decode();
      const page = document.createElement('canvas');
      page.width = 190;
      page.height = 222;
      page.getContext('2d')!.drawImage(img, 0, 0, 190, 222);
      return pixels(page, true);
    },
  };
}

export const motesVertex = `
precision highp float;
uniform float beatTime,pixelRatio,energy;uniform vec2 resolution;out float depth;
float rand(float x){return fract(sin(x*13.16)*7214.978);}
void main(){
 float i=float(gl_VertexID)+1.;depth=rand(i*1.153);
 vec2 p=fract(vec2(rand(i*2.191),rand(i*.769))+vec2(.0018,-.0011)*beatTime*(.4+depth));
 gl_Position=vec4(p*2.-1.,0.,1.);
 gl_PointSize=pixelRatio*(1.1+14.*pow(depth,5.));
}`;
export const motesFragment = `
precision highp float;
uniform float energy;in float depth;out vec4 pixel;
void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;
float a=exp(-r*(3.+2.*depth))*(.27-.22*depth)*energy;pixel=vec4(vec3(.94,.75,.62)*a,a);}
`;
