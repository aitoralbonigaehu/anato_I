"""Build the editable Blender 4.5 master. First run render.mjs --model.
blender -b -P scripts/intro-v2/studio.py -- [--proof | --render]
The transparent studio pass goes in ATLAS_FILM_STAGE (defaults to the temp directory).
"""
import base64
import json
import math
import os
import random
import sys
import tempfile
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

rng = random.Random(84052)
stage = Path(os.environ.get('ATLAS_FILM_STAGE', Path(tempfile.gettempdir()) / 'atlas-v2-film-stage'))
root = Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 5
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 3
scene.cycles.transparent_max_bounces = 3
if '--eevee' in sys.argv:
    scene.render.engine='BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples=8
scene.render.film_transparent = True
scene.render.resolution_x, scene.render.resolution_y = 1440, 810
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.compression = 15
scene.render.fps = 24
scene.frame_start, scene.frame_end = 1, 279
scene.render.filepath = str(stage) + os.sep
scene.view_settings.view_transform = 'AgX'
scene.world = bpy.data.worlds.new('Midnight studio')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.11,.15,.23,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .38

def collection(name):
    coll=bpy.data.collections.new(name)
    scene.collection.children.link(coll)
    return coll

def empty(name, coll):
    obj=bpy.data.objects.new(name,None)
    coll.objects.link(obj)
    return obj

def attach(obj,parent,coll):
    for container in list(obj.users_collection):
        container.objects.unlink(obj)
    coll.objects.link(obj)
    obj.parent=parent
    return obj

def paint(name,color,metal=0,rough=.32,emit=0,subsurface=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    m.diffuse_color=(*color,1)
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal
    p.inputs['Roughness'].default_value=rough
    p.inputs['Subsurface Weight'].default_value=subsurface
    p.inputs['Subsurface Scale'].default_value=.05
    p.inputs['Coat Weight'].default_value=.28
    p.inputs['Coat Roughness'].default_value=.20
    p.inputs['Emission Color'].default_value=(*color,1)
    p.inputs['Emission Strength'].default_value=emit
    return m

def tissue(name,dark,light):
    m=paint(name,light,.06,.30,0,.22)
    nt=m.node_tree; p=nt.nodes['Principled BSDF']
    noise=nt.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=5.8
    noise.inputs['Detail'].default_value=4.0;noise.inputs['Distortion'].default_value=.60
    ramp=nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position=.18;ramp.color_ramp.elements[0].color=(*dark,1)
    ramp.color_ramp.elements[1].position=.86;ramp.color_ramp.elements[1].color=(*light,1)
    nt.links.new(noise.outputs['Fac'],ramp.inputs[0]);nt.links.new(ramp.outputs[0],p.inputs['Base Color'])
    fine=nt.nodes.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=130;fine.inputs['Detail'].default_value=2
    bump=nt.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.19;bump.inputs['Distance'].default_value=.009
    nt.links.new(fine.outputs['Fac'],bump.inputs['Height']);nt.links.new(bump.outputs['Normal'],p.inputs['Normal'])
    return m

def membrane(name):
    m=paint(name,(.70,.32,.18),.24,.20)
    nt=m.node_tree;layer=nt.nodes.new('ShaderNodeLayerWeight')
    ramp=nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position=0;ramp.color_ramp.elements[0].color=(.075,.075,.075,1)
    ramp.color_ramp.elements[1].position=.99;ramp.color_ramp.elements[1].color=(.76,.76,.76,1)
    nt.links.new(layer.outputs['Facing'],ramp.inputs[0])
    nt.links.new(ramp.outputs[0],nt.nodes['Principled BSDF'].inputs['Alpha'])
    return m

def ball(name,loc,scale,mat,parent,coll):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=loc)
    o=attach(bpy.context.object,parent,coll);o.name=name;o.scale=scale
    for poly in o.data.polygons:poly.use_smooth=True
    o.data.materials.append(mat)
    return o

def strands(name,paths,radius,mat,parent,coll):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=1;c.bevel_depth=radius;c.bevel_resolution=2
    for path in paths:
        spline=c.splines.new('POLY');spline.points.add(len(path)-1)
        for p,xyz in zip(spline.points,path):
            p.co=(*xyz[:3],1)
            if len(xyz)>3:p.radius=xyz[3]
    o=bpy.data.objects.new(name,c);coll.objects.link(o);o.parent=parent;c.materials.append(mat)
    return o

def as_obj(name,vertices,triangles,mat,parent,coll):
    m=bpy.data.meshes.new(name);m.from_pydata(vertices.tolist(),[],triangles.tolist());m.update()
    m.polygons.foreach_set('use_smooth',np.ones(len(m.polygons),dtype=bool))
    o=bpy.data.objects.new(name,m);coll.objects.link(o);o.parent=parent;m.materials.append(mat)
    return o

def smooth(a,b,t):
    u=min(1,max(0,(t-a)/(b-a)));return u*u*(3-2*u)
def between(a,b,k):return a+(b-a)*k
def key(obj,prop,f):obj.keyframe_insert(data_path=prop,frame=f)
def active(coll,a,b):
    for obj in coll.objects:
        if obj.type=='EMPTY':continue
        for frame,hidden in [(1,a>1),(a,False),(b+1,True)]:
            obj.hide_render=hidden;key(obj,'hide_render',frame)
            obj.hide_viewport=hidden;key(obj,'hide_viewport',frame)

cell_coll=collection('01  ·  Zelula')
cell=empty('Oocyte — camera registration',cell_coll)
emb_coll=collection('02  ·  Enbrioia')
emb=empty('Five-week specimen',emb_coll)
vault_coll=collection('03  ·  Zuntzen barrena')
vault=empty('Interstitial filament vault',vault_coll)
title_coll=collection('04  ·  V2')
title=empty('V2 — release sculpture',title_coll)
skin=tissue('Translucent amber tissue',(.095,.014,.016),(.62,.245,.12))
nuclear=tissue('Chromatin',(.14,.018,.024),(.8,.27,.13))
ridge=tissue('Dorsal segments',(.27,.078,.038),(.91,.59,.31))
gold=paint('Champagne / polished bevels',(.78,.43,.16),.84,.19)
pearl=paint('Pearl filament',(.97,.66,.34),.38,.25,.36)
copper=paint('Copper filament',(.59,.16,.080),.50,.27,.18)
blue=paint('Petrol glass',(.042,.17,.22),.64,.26,.19)
wet=paint('Optic vesicle — dark garnet',(.075,.014,.012),.23,.13)
glaze=membrane('Amniotic membrane — grazing reflection')
ball('Zona / envelope',(0,0,0),(1,1,1),glaze,cell,cell_coll)
ball('Nucleus',(-.12,-.07,.08),(.46,.46,.46),nuclear,cell,cell_coll)
ball('Nucleolus',(-.24,-.02,.46),(.115,.11,.092),ridge,cell,cell_coll)
# The thin zona brush and twisting cortical fibres give the macro shot a visible scale.
hairs=[];loops=[]
for i in range(1300):
    a=rng.random()*math.tau;y=rng.uniform(-1,1);r=math.sqrt(1-y*y);n=np.array([r*math.cos(a),y,r*math.sin(a)])
    d=np.array([-.03*math.sin(a),.014,.022*math.cos(a)])
    L=rng.uniform(.023,.058)
    hairs.append([(*n,.77),(*(n*(1+L*.45)+d*.4),.55),(*(n*(1+L)+d),.15)])
strands('Cortical brush',hairs,.0019,pearl,cell,cell_coll)
for i in range(42):
    phase=rng.random()*math.tau;pitch=rng.uniform(-.7,.7);path=[]
    for u in np.linspace(0,1,95):
        a=phase+u*math.tau*.85;y=.72*math.sin(2.8*u+phase)+pitch*.22;r=math.sqrt(max(.03,1-y*y))
        path.append((r*math.cos(a)*.966,y*.966,r*math.sin(a)*.966,.25+.65*math.sin(math.pi*u)))
    loops.append(path)
strands('Cortex / fine threads',loops,.0017,copper,cell,cell_coll)
for i in range(27):
    p=Vector([rng.uniform(-1,1) for k in range(3)]).normalized()*rng.uniform(.55,.9)
    r=rng.uniform(.019,.060);ball('Organelle',p,(r,r*.8,r),ridge,cell,cell_coll)

raw=json.loads((stage/'embryo.json').read_text())
def xyz(p):
    x,y,z=p
    return np.array([-(y+2.6)*.43,(z-.22)*.43,-x*.43])
for i,m in enumerate(raw):
    source=np.frombuffer(base64.b64decode(m['p']),dtype='<f4').reshape(-1,3)
    verts=np.column_stack((-(source[:,1]+2.6)*.43,(source[:,2]-.22)*.43,-source[:,0]*.43))
    tris=np.frombuffer(base64.b64decode(m['i']),dtype='<u4').reshape(-1,3)
    if i==0:
        body_source=source;as_obj('Embryo — atlas surface',verts,tris,skin,emb,emb_coll)
    else:
        eye=verts.mean(axis=0);as_obj('Optic placode',verts,tris,wet,emb,emb_coll)
        sign=1 if eye[2]>0 else -1
        loop=[(eye[0]+.080*math.cos(a),eye[1]+.081*math.sin(a),eye[2]+.017*sign) for a in np.linspace(0,math.tau,60)]
        strands('Optic rim',[loop],.010,ridge,emb,emb_coll)
def surface(theta,out,x):
    pos=np.array([x,-2.8+(2.6+out)*math.cos(theta),(2.6+out)*math.sin(theta)])
    return xyz(body_source[np.argmin(np.sum((body_source-pos)**2,axis=1))])
for side in (-1,1):
    neural=[]
    for j,th in enumerate(np.linspace(-2.05,1.21,25)):
        taper=.36+.64*min(1,j/9)
        p=surface(th,.53*taper,side*.93*taper)
        o=ball('Paired somite %02d'%(j+1),p,(.11*taper,.075*taper,.055*taper),ridge,emb,emb_coll)
        o.rotation_euler[2]=th+.30
    for k in range(7):
        path=[]
        for u in np.linspace(0,1,74):
            th=-2.27+3.75*u;p=surface(th,.68+.028*k,side*(.49+.034*k))
            path.append((*p,.2+.8*math.sin(math.pi*u)))
        neural.append(path)
    strands('Dorsal light / longitudinal fibres',neural,.005,pearl,emb,emb_coll)
    # Rake tiny highlights along the carved pharyngeal folds.
    folds=[]
    for k in range(3):
        path=[]
        for u in np.linspace(0,1,21):
            q=surface(1.38+k*.17-.13*u,-.67+.83*u,side*.83)
            path.append((*q,.13+.82*math.sin(math.pi*u)))
        folds.append(path)
    strands('Pharyngeal folds',folds,.018,ridge,emb,emb_coll)
# Fine, branching tracery is an artistic surface treatment. Retain the atlas silhouette
# by projecting every branch onto the outer side of the specimen.
from mathutils.kdtree import KDTree
front=body_source[body_source[:,0]<0]
tree=KDTree(len(front))
for idx,pt in enumerate(front):tree.insert((pt[1],pt[2],pt[0]*.30),idx)
tree.balance()
def trace_pt(th,out):
    point=(-2.8+(2.6+out)*math.cos(th),(2.6+out)*math.sin(th),-.40)
    _,i,_=tree.find(point);p=xyz(front[i]);p[2]+=.010
    return p
branches=[];capillaries=[]
for j in range(34):
    start=rng.uniform(-1.86,2.24);length=rng.uniform(.19,.78);d=rng.choice((-1,1))
    width=rng.uniform(-.75,.65);phase=rng.uniform(0,6);wobble=rng.uniform(.09,.22)
    line=[]
    for u in np.linspace(0,1,30):
        q=trace_pt(start+d*u*length,width+wobble*math.sin(3.7*u+phase))
        line.append((*q,.17+.83*(1-u)))
    branches.append(line)
    for k in range(5):
        v=.13+k*.14;daughter=[]
        for u in np.linspace(0,1,18):
            q=trace_pt(start+d*(v+u*.18)*length,width+wobble*math.sin(3.7*v+phase)+math.sin(u*1.7)*(.12+.15*k/5)*(-1 if k%2 else 1))
            daughter.append((*q,.18+.75*(1-u)))
        capillaries.append(daughter)
strands('Surface / branching copper',branches,.010,copper,emb,emb_coll)
strands('Surface / branching gold',capillaries,.0045,pearl,emb,emb_coll)
# Delicate fluid envelope around the specimen; open curves catch the backlight without veiling the anatomy.
whorls=[]
for i in range(33):
    phase=rng.random()*math.tau;start=rng.random()*math.tau;length=rng.uniform(.7,3.8)
    path=[]
    for u in np.linspace(0,1,84):
        a=start+u*length
        path.append((1.54*math.cos(a)+.06*math.sin(3*a+phase),1.80*math.sin(a),.50*math.sin(2*a+phase)-.36,.1+.65*math.sin(math.pi*u)))
    whorls.append(path)
strands('Amnion / rim caustics',whorls,.003,pearl,emb,emb_coll)

# A travelling camera passes through nested, branching fibre arches. Local +Z points at the viewer.
arches=[[],[],[]]
for row in range(23):
    z=-row*.84
    for side in (-1,1):
        for k in range(6):
            phase=rng.uniform(-.16,.16);path=[]
            for u in np.linspace(0,1,39):
                x=side*((1-u**1.55)*(1.73+.15*math.sin(row*.7)) + .038*k*math.sin(math.pi*u))
                y=-1.3+3.0*u+.12*math.sin(math.pi*u*1.8+row*.27)
                path.append((x,y,z+.42*math.sin(math.pi*u)+k*.041+phase,.34+.66*(1-u)))
            arches[0 if k==0 else 1 if k%2 else 2].append(path)
        for j in range(3):
            path=[]
            for u in np.linspace(0,1,38):
                x=side*(1.60-.8*u+.07*math.sin(6*u+row))
                y=-.73+1.7*u+.13*j;path.append((x,y,z-1.55*u+.048*j,.2+.68*math.sin(math.pi*u)))
            arches[1].append(path)
for i,(mat,r) in enumerate([(ridge,.048),(pearl,.009),(blue,.017)]):
    strands('Vault ribs / '+mat.name,arches[i],r,mat,vault,vault_coll)
floor=[]
for k in range(65):
    x=rng.uniform(-2.5,2.5);phi=rng.random()*math.tau
    floor.append([(x+.11*math.sin(z*1.7+phi),-1.31+.10*math.sin(z*.96+phi),z) for z in np.linspace(2,-21,140)])
strands('Vault floor / longitudinal glass fibres',floor,.010,blue,vault,vault_coll)
for i in range(22):
    a=rng.random()*math.tau;r=rng.random()**.7*1.05
    p=(r*math.cos(a),r*math.sin(a)+.25,-17-rng.random()*4)
    rad=rng.uniform(.014,.045)
    ball('Vault / suspended light',p,(rad,rad,rad),pearl,vault,vault_coll)

fontfile=Path(os.environ.get('WINDIR','C:/Windows'))/'Fonts'/'segoeuib.ttf'
typ=bpy.data.curves.new('V2 letterforms','FONT');typ.body='V2'
if fontfile.exists():typ.font=bpy.data.fonts.load(str(fontfile))
typ.extrude=.049;typ.bevel_depth=.012;typ.bevel_resolution=4;typ.resolution_u=26;typ.space_character=1.03
letter=bpy.data.objects.new('V2 / bevelled casting',typ);title_coll.objects.link(letter);letter.parent=title;typ.materials.append(gold)
bpy.context.view_layer.update()
box=np.array([list(corner) for corner in letter.bound_box]);mid=(box.max(axis=0)+box.min(axis=0))/2
scale=3.12/(box[:,0].max()-box[:,0].min());letter.scale=(scale,)*3;letter.location=tuple(-mid*scale)
# Convert to editable mesh so the .blend carries the actual letters across machines without fonts.
bpy.context.view_layer.objects.active=letter;letter.select_set(True);bpy.ops.object.convert(target='MESH');letter.select_set(False)
def export_title(obj):
    bpy.context.view_layer.update()
    mesh=obj.data
    mesh.calc_loop_triangles()
    vertices=np.array([tuple(obj.matrix_basis@v.co) for v in mesh.vertices],dtype='<f4')
    indices=np.array([t.vertices[:] for t in mesh.loop_triangles],dtype='<u4')
    (stage/'title.json').write_text(json.dumps({
        'p':base64.b64encode(vertices.tobytes()).decode(),
        'i':base64.b64encode(indices.tobytes()).decode(),
    }))
export_title(letter)

rig=collection('Studio / travelling lights')
def area(name,at,target,energy,color,sx,sy):
    light=bpy.data.lights.new(name,'AREA');light.energy=energy;light.color=color;light.shape='RECTANGLE';light.size=sx;light.size_y=sy
    obj=bpy.data.objects.new(name,light);rig.objects.link(obj);obj.location=at;obj.rotation_euler=(Vector(target)-Vector(at)).to_track_quat('-Z','Y').to_euler();return obj
area('Softbox / ivory',(-3.6,3.8,2.1),(0,0,0),360,(1,.76,.53),3.8,1.35)
area('Edge / arctic',(3.1,1.5,-2),(0,0,0),820,(.24,.60,1),2.8,1.0)
area('Amber rim',(-1.8,-2.0,-1.4),(0,0,0),490,(1,.32,.125),3.6,.56)
strip=area('Moving strip / champagne',(2,.3,4),(0,0,0),470,(1,.91,.71),.7,5.4)
area('Vault / horizon',(0,.1,-11),(0,1,-6),550,(1,.48,.20),2,2)
camdata=bpy.data.cameras.new('Macro lens');cam=bpy.data.objects.new('Camera',camdata);rig.objects.link(cam);scene.camera=cam
camdata.sensor_fit='VERTICAL';camdata.sensor_height=24;camdata.lens=24/(2*math.tan(math.radians(16)))
cam.rotation_euler=(0,0,0)
for f in range(1,280):
    t=(f-1)/24
    e=smooth(1.85,4.1,t);v=smooth(5.65,8.55,t)
    cam.location=(0,0,6.9-(1-e)*2.0-.74*math.sin(math.pi*v));key(cam,'location',f)
    k=smooth(0,2.15,t);cell.location=(between(-.71,.04,k),.1,-.05)
    cell.scale=(between(1.96,.90,smooth(0,2.6,t)),)*3;cell.rotation_euler=(.1,.3+t*.17,-.11)
    emb.location=(.02,.05,0);emb.rotation_euler=(-.12+.14*v,-.8+.95*smooth(1.9,4.2,t)+.48*smooth(4.2,6.5,t),-.31+.21*e)
    title.location=(0,.32,0);title.rotation_euler=(between(.35,-.045,v),between(-1.34,-.14,v)+.12*smooth(8.3,11.5,t),between(-.14,.015,v))
    vault.location=(.21*math.sin(t*2),-.1,3.8+(t-5.8)*5.7);vault.rotation_euler=(.04,-.03,.12*math.cos(t*1.5))
    for obj in (cell,emb,title,vault):
        key(obj,'location',f);key(obj,'rotation_euler',f)
    key(cell,'scale',f)
    strip.data.energy=between(140,540,smooth(7.4,8.6,t));key(strip.data,'energy',f)
    strip.location.x=between(3.3,-1.65,smooth(7.4,11.2,t))
    strip.rotation_euler=(-strip.location).to_track_quat('-Z','Y').to_euler()
    key(strip,'location',f);key(strip,'rotation_euler',f)
active(cell_coll,1,66);active(emb_coll,67,141);active(vault_coll,142,182);active(title_coll,183,279)
for f,label in [(1,'Zelula'),(67,'Enbrioia'),(142,'Zuntzen barrena'),(183,'Ongi etorri · EnbrioAtlas V2')]:scene.timeline_markers.new(label,frame=f)
scene.frame_set(1)
for screen in bpy.data.screens:
    for area_ui in screen.areas:
        if area_ui.type=='VIEW_3D':
            view=area_ui.spaces.active
            view.region_3d.view_perspective='CAMERA'
            view.shading.color_type='MATERIAL'
            view.overlay.show_overlays=False
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(root/'scripts/intro-v2/EnbrioAtlas-V2.blend'),compress=True)
if '--proof' in sys.argv:
    for f in (16,95,123,163,198,245):
        scene.frame_set(f);scene.render.filepath=str(stage/('proof-%04d.png'%f));bpy.ops.render.render(write_still=True)
if '--render' in sys.argv:
    bpy.ops.render.render(animation=True)

