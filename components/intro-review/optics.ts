// The camera basis is shared with the surface particles, the volume and the plate transition.
export const camera = `
uniform vec2 resolution,angles;
uniform vec3 viewBox;
vec3 centre=vec3(0.,-2.43,.18);
vec3 forward(){return vec3(cos(angles.x)*cos(angles.y),sin(angles.x)*cos(angles.y),sin(angles.y));}
vec3 rightward(){return vec3(sin(angles.x),-cos(angles.x),0.);}
vec3 upward(){return cross(rightward(),forward());}
vec2 projectAt(vec3 p){vec3 d=p-centre;return viewBox.xy+viewBox.z*vec2(dot(d,rightward()),dot(d,upward()));}
`;
export const vertex = `
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}
`;
export const fragment =
  `
precision highp float;
precision highp sampler3D;
uniform sampler3D atlas;
uniform float beatTime,skin,focusRegion;
out vec4 pixel;
` +
  camera +
  `
const vec3 lo=vec3(-1.72,-6.3,-3.83),hi=vec3(1.72,1.25,4.27);
vec4 sampleAt(vec3 p){return texture(atlas,(p-lo)/(hi-lo));}
float distAt(vec3 p){return (sampleAt(p).r-.5)*1.6;}
vec3 normalAt(vec3 p){
 vec2 e=vec2(.046,0.);
 return normalize(vec3(distAt(p+e.xyy)-distAt(p-e.xyy),distAt(p+e.yxy)-distAt(p-e.yxy),distAt(p+e.yyx)-distAt(p-e.yyx)));
}
float pulse(float t){float a=fract((t-7.5)*1.42);return exp(-pow((a-.19)/.11,2.))+.22*exp(-pow((a-.45)/.14,2.));}
void main(){
 vec3 rd=forward(),ro=centre-9.*rd+((gl_FragCoord.x-viewBox.x)*rightward()+(gl_FragCoord.y-viewBox.y)*upward())/viewBox.z;
 vec3 inv=1./(rd+vec3(.000001)),a=(lo-ro)*inv,b=(hi-ro)*inv;
 vec3 entry=min(a,b),exitAt=max(a,b);
 float depth=max(entry.x,max(entry.y,entry.z)),end=min(exitAt.x,min(exitAt.y,exitAt.z));
 if(depth>=end)discard;
 bool found=false;
 for(int i=0;i<56;i++){
   float d=distAt(ro+rd*depth);
   if(d<.005){found=true;break;}
   depth+=max(.008,d*.80);if(depth>end)break;
 }
 if(!found||depth>end)discard;
 vec3 p=ro+rd*depth,n=normalAt(p);
 float axial=clamp((2.75-atan(p.z,p.y+2.8))/5.35,0.,1.);
 float reveal=smoothstep(axial-.16,axial+.16,1.5*skin-.12);
 if(reveal<.001)discard;
 float thickness=0.,blood=0.,somites=0.,cord=0.;
 // Density channels already contain the diffusion falloff; no procedural noise
 // or secondary light marches inside this integration loop.
 float ds=min(.118,(end-depth)/38.);
 for(int i=0;i<64;i++){
   float l=(float(i)+.5)*ds;if(depth+l>end)break;
   vec4 v=sampleAt(p+rd*l);
   float density=1.-smoothstep(.47,.515,v.r);
   float absorb=exp(-.72*thickness);
   thickness+=ds*density;
   blood+=ds*v.g*absorb;somites+=ds*v.a*absorb;cord+=ds*v.b*absorb;
 }
 vec3 key=normalize(vec3(.83,.30,.48)),fill=normalize(vec3(-.48,-.22,.65));
 float incidence=max(0.,dot(-rd,n)),rim=pow(1.-incidence,2.);
 float grazing=pow(.5+.5*dot(n,key),2.0),thin=exp(-1.12*thickness);
 float wrap=clamp((dot(n,fill)+.48)/1.48,0.,1.);
 float shade=exp(-2.9*max(0.,-distAt(p+fill*.49)));
 vec3 ivory=vec3(.89,.82,.79),warm=vec3(1.,.66,.40);
 vec3 col=ivory*(.047+.43*wrap*shade)+warm*thin*(.28+.82*grazing);
 col+=warm*rim*(.42+1.32*grazing);
 col+=ivory*(.08+.13*wrap)*(1.-exp(-thickness));
 col+=somites*vec3(.66,.34,.26)+cord*vec3(.12,.16,.22);
 // Hemoglobin absorbs the shorter wavelengths. Both depth and diffuse
 // excitation contribute, so the buried pulse has no projected edge.
 float perfusion=1.-exp(-blood*(2.5+.29*pulse(beatTime)));
 col*=exp(-perfusion*vec3(.10,1.03,.86));
 col+=vec3(.24,.010,.023)*perfusion;
 vec3 reflected=reflect(rd,n);
 float wet=pow(max(0.,dot(reflected,normalize(vec3(-.32,.60,.73)))),22.);
 col+=ivory*wet*.24;
 vec3 eye=vec3(abs(p.x)-.99,p.y+4.54,p.z-1.295);
 col*=1.-.24*exp(-dot(eye*vec3(3.,6.,6.),eye*vec3(3.,6.,6.)));
 float focus=focusRegion==1.?somites*3.:focusRegion==2.?blood*1.8:focusRegion==3.?
    exp(-pow((p.y+3.10)/.72,2.)-pow((p.z-2.28)/.43,2.)):0.;
 col+=vec3(.55,.27,.09)*clamp(focus,0.,1.);
 col=pow(1.-exp(-1.48*col),vec3(.60));
 float alpha=reveal*smoothstep(0.,.055,thickness)*(.88+.12*(1.-thin));
 pixel=vec4(col*alpha,alpha);
}`;
