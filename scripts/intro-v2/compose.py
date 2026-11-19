"""Compose the 46-second welcome film from the transparent Blender studio plates.
python scripts/intro-v2/compose.py landscape  (or portrait, add --proof for a contact sheet)
Requires NumPy, OpenCV, Pillow and ffmpeg. Run studio.py --render first.
"""
import argparse
from functools import lru_cache
import os
from pathlib import Path
import subprocess
import tempfile

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

args = argparse.ArgumentParser()
args.add_argument("format", choices=("portrait", "landscape"))
args.add_argument("--proof", action="store_true")
opts = args.parse_args()
portrait = opts.format == "portrait"
W, H = (768, 960) if portrait else (1440, 810)
FPS, SECONDS = 24, 46
stage = Path(os.environ.get("ATLAS_FILM_STAGE", Path(tempfile.gettempdir()) / "atlas-v2-film-stage"))
out = Path(__file__).resolve().parents[2] / "public/intro-v2"
cv2.setNumThreads(3)
rng = np.random.default_rng(1718)
tau = np.pi * 2


def smooth(a, b, t):
    u = np.clip((t-a)/(b-a), 0, 1)
    return u*u*(3-2*u)


def blend(a, b, f):
    return a+(b-a)*f


@lru_cache(maxsize=3)
def plate(n):
    image = cv2.imread(str(stage / f"{n:04}.png"), cv2.IMREAD_UNCHANGED)
    if image is None:
        raise FileNotFoundError(f"Missing Blender plate {n}")
    return image


scale = (.78 if portrait else .94)*H/plate(108).shape[0]
def sample(n, count):
    src = plate(n)
    luma = cv2.cvtColor(src[:, :, :3], cv2.COLOR_BGR2GRAY).astype(np.float32)/255
    alpha = src[:, :, 3].astype(np.float32)/255
    edges = cv2.Canny(np.uint8(luma*alpha*255), 24, 64)/255.
    weight = alpha*(.045 + luma**1.55 + 1.9*edges)
    indices = rng.choice(weight.size, count, p=(weight/weight.sum()).ravel())
    y, x = np.unravel_index(indices, weight.shape)
    order = np.lexsort((y, x//16))
    x, y = x[order], y[order]
    points = np.stack(((x-src.shape[1]/2)*scale/H, (y-src.shape[0]/2)*scale/H), axis=1)
    return points, luma[y,x], edges[y,x]


N = 17300
body, light, rim = sample(108, N)
title, metal, _ = sample(245, N)
# Nearby points stay neighbours. Give each point a stable horizontal order, a
# feeding lane and a release time based on its ultimate position on the specimen.
rank = np.linspace(0, 1, N)
coin = rng.random(N)
lane = np.clip(np.floor((body[:,1]+.49)*13), 0, 12)
along = rank*1.40-.70
phase = (lane-6)*.055
spread = rng.normal(size=(N,2))
start = np.column_stack((along*1.8, (lane-6)*.054+.21*np.sin(along*6+phase*5))) + spread*[.09,.070]
lag = 5.4*rank+1.35*(body[:,1]+.45)+coin*1.45
size = 28 + 102*light + 43*rim + rng.random(N)*50
warm = np.stack((size*(.27+.39*light), size*(.51+.36*light), size), axis=1)
ice = (rim>.5) & (body[:,0]>.02)
warm[ice] = warm[ice][:,::-1]*[1.15,1.06,.96]
stars = rng.random((155,4))
yy, xx = np.ogrid[-.5:.5:H*1j, -W/(2*H):W/(2*H):W*1j]
fog = np.exp(-5*(xx**2 + yy**2*1.6))
background = np.stack([6+15*fog,5+7*fog,7+11*fog],axis=-1).astype(np.uint8)
gold = (103,200,255)


def path(u, row, t):
    # Twisted ribbon in perspective: individual lanes can be followed through the crossing.
    x = (u-.5)*1.62
    a = x*5.1 + .34*np.sin(t*.22) + row*.105
    y = .19*np.sin(a) + (row-6)*.019*np.cos(a) - x*.18
    return x, y


def spark_layer(t):
    layer = np.zeros((H,W,3),np.uint8)
    # Leading pearl, drawn in subpixel coordinates with a tapering train.
    sweep = smooth(-1.0,6.5,t)
    head = blend(.31,.69,sweep) if portrait else blend(.19,.84,sweep)
    line_alpha = (1-smooth(10,18,t))
    for j in range(13):
        lead = head-(j%4)*.056
        u = np.linspace(max(0,lead-.55),max(.0001,lead),135)
        x,y = path(u,j,t)
        coords = np.int32(np.column_stack((W/2+x*H,H/2+y*H))*16)
        strength = line_alpha*(.18+.50*(1-abs(j-6)/7))*smooth(-.1,2.5+j*.24,t)
        if strength>.003:
            cv2.polylines(layer,[coords],False,tuple(int(k*strength) for k in gold),1,cv2.LINE_AA,4)
    if t < 10:
        x,y=path(head,6,t)
        center = (int(W/2+x*H),int(H/2+y*H))
        a = 1-smooth(6.5,10,t)
        cv2.circle(layer,center,3,tuple(int(k*a) for k in (183,238,255)),-1,cv2.LINE_AA)
        for r in range(8,0,-1):
            cv2.line(layer,(center[0]-r*3,center[1]),(center[0]+r*3,center[1]),tuple(int(k*a/(r+1)) for k in gold),1,cv2.LINE_AA)
    x,y = path(rank,lane,t)
    track = np.column_stack((x,y)) + spread*[.003,.0017]
    gather = smooth(.2+coin*4.3,5.6+coin*2.0,t)[:,None]
    p = blend(start,track,gather)
    gather_body = smooth(6.9+lag,13.2+lag,t)
    curl = np.sin(np.pi*gather_body)
    p = blend(p,body,gather_body[:,None])
    p[:,1] -= curl*(.14+.14*rank)
    p[:,0] += curl*(lane-6)*.012
    # Bring out depth at the silhouette, then pass through the illuminated dorsal rim.
    push = smooth(24.8,28.4,t)
    p = p*(1+push*1.7)+np.array([.35,.17])*push
    form_title = smooth(27.3+rank*2.5,32.6+rank*2.5,t)
    arc = np.sin(np.pi*form_title)
    p = blend(p,title,form_title[:,None])
    p[:,1] += arc*(.16+.15*np.sin(rank*tau))
    home = smooth(37.7+(1-rank)*2.7,42+(1-rank)*2.4,t)
    p = blend(p,body,home[:,None])
    p[:,1] -= np.sin(np.pi*home)*(.15+.11*rank)
    p[:,0] += np.sin(np.pi*home)*(lane-6)*.024
    # Keep a sparse, bright vanguard distinguishable from the softer group behind it.
    appear = smooth(-.3+coin*6+rank*2.4,1.4+coin*6+rank*2.4,t)
    gain = appear*(.57+.43*gather_body)*(1-.95*smooth(21.6,24.8,t)*(1-smooth(28,31,t)))
    gain *= 1-.88*smooth(33.3,35.6,t)*(1-smooth(37.6,40,t))
    gain *= .85+.55*curl
    px = W*.5+p[:,0]*H
    py = H*.5+p[:,1]*H
    inside = (px>=1)&(px<W-2)&(py>=1)&(py<H-2)
    px,py,ink = px[inside],py[inside],warm[inside]*gain[inside,None]
    # Bilinear splats maintain individual grains through subpixel movement.
    ix,iy=px.astype(int),py.astype(int)
    fx,fy=px-ix,py-iy
    buf = np.zeros((H,W,3),dtype=np.float32)
    for dx,dy,w in [(0,0,(1-fx)*(1-fy)),(1,0,fx*(1-fy)),(0,1,(1-fx)*fy),(1,1,fx*fy)]:
        np.add.at(buf,(iy+dy,ix+dx),ink*w[:,None])
    points = cv2.convertScaleAbs(buf, alpha=2.15)
    layer=cv2.add(layer,points)
    for x,y,z,f in stars:
        x = int((x+.004*np.sin(t*.19+f*9))*W); y = int((y+.005*np.cos(t*.23+f*7))*H)
        v=int(14+z**3*68)
        cv2.circle(layer,(x,y),int(z>.94)+1,(int(v*.72),int(v*.85),v),-1,cv2.LINE_AA)
    small=cv2.resize(layer,(W//5,H//5),interpolation=cv2.INTER_AREA)
    bloom=cv2.resize(cv2.GaussianBlur(small,(0,0),2.7),(W,H))
    return cv2.addWeighted(layer,1,bloom,2.4,0)


def overlay(frame,n,opacity,zoom=1,shift=(0,0)):
    if opacity<=0:
        return
    src=plate(n)
    s=scale*zoom
    # Sample only the visible region while zooming through the specimen.
    mat=np.float32([[s,0,W*(.5)-s*src.shape[1]/2+H*shift[0]],[0,s,H*.5-s*src.shape[0]/2+H*shift[1]]])
    view=cv2.warpAffine(src,mat,(W,H),flags=cv2.INTER_LINEAR)
    alpha=np.uint8(view[:,:,3]*opacity)
    a=cv2.merge([alpha]*3)
    frame[:]=cv2.add(cv2.multiply(view[:,:,:3],a,scale=1/255),cv2.multiply(frame,255-a,scale=1/255))


def lettering():
    pic=Image.new("RGBA",(W,H))
    draw=ImageDraw.Draw(pic)
    fonts=Path(os.environ.get("WINDIR","C:/Windows"))/"Fonts"
    for name,msg,fs,y,color in [("georgiai.ttf","Ongi etorri",.039,.722,"#eac19b"),("segoeuisl.ttf","EnbrioAtlas",.080,.794,"#fff1dd")]:
        font=ImageFont.truetype(str(fonts/name),round(H*fs))
        draw.text((W/2,H*y),msg,font=font,anchor="ms",fill=color)
    return cv2.cvtColor(np.asarray(pic),cv2.COLOR_RGBA2BGRA)


text_image=lettering()
def frame(t):
    img=background.copy()
    sparks=spark_layer(t)
    # The particle specimen matches plate 108 pixel-for-pixel at the material reveal.
    if 21.7<t<29:
        n=108+round(29*smooth(22.6,27.4,t))
        dive=smooth(24.8,28.4,t)
        overlay(img,n,smooth(21.7,24.5,t)*(1-smooth(27.05,28.55,t)),1+1.7*dive,(.35*dive,.17*dive))
    if 27<t<31.8:
        overlay(img,142+round(39*smooth(27,31.8,t)),smooth(27,28.7,t)*(1-smooth(29.2,31.8,t)),1.25 if not portrait else 1.6)
    if 33<t<40:
        overlay(img,245+round(32*smooth(33,39,t)),smooth(33,35.7,t)*(1-smooth(37.55,39.95,t)))
    if t>43:
        overlay(img,108,.25*smooth(43,45.4,t))
    img=cv2.add(img,sparks)
    text_alpha=smooth(33.7,35.65,t)*(1-smooth(37.8,39.65,t))
    if text_alpha:
        a=cv2.merge([np.uint8(text_image[:,:,3]*text_alpha)]*3)
        img=cv2.add(cv2.multiply(text_image[:,:,:3],a,scale=1/255),cv2.multiply(img,255-a,scale=1/255))
    return img


if opts.proof:
    times=[0,3,6,10,13,16,20,24.6,28.8,32.5,36.7,41,45.95]
    thumbs=[]
    for t in times:
        img=cv2.resize(frame(t),(340,round(H*340/W)))
        cv2.putText(img,str(t),(6,18),cv2.FONT_HERSHEY_SIMPLEX,.55,(230,230,230),1,cv2.LINE_AA)
        thumbs.append(img)
    while len(thumbs)%3: thumbs.append(thumbs[-1]*0)
    cv2.imwrite(str(stage/f"journey-{opts.format}.jpg"),np.vstack([np.hstack(thumbs[i:i+3]) for i in range(0,len(thumbs),3)]))
else:
    dest=out/f"{opts.format}.mp4"
    pending=stage/f"journey-{opts.format}.mp4"
    with subprocess.Popen(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","rawvideo","-pixel_format","bgr24",
                           "-video_size",f"{W}x{H}","-framerate",str(FPS),"-i","pipe:0","-an","-c:v","libx264",
                           "-threads","4","-preset","medium","-crf","19","-maxrate","4200k","-bufsize","6000k",
                           "-pix_fmt","yuv420p","-movflags","+faststart",str(pending)],stdin=subprocess.PIPE) as ff:
        for i in range(SECONDS*FPS):
            img=frame(i/FPS)
            ff.stdin.write(img.tobytes())
            if i%144==0: print(opts.format,i//FPS,"seconds rendered",flush=True)
        ff.stdin.close()
        if ff.wait(): raise RuntimeError("Video encoder failed")
    pending.replace(dest)
    cv2.imwrite(str(out/f"{opts.format}.webp"),frame(36.5),[cv2.IMWRITE_WEBP_QUALITY,92])
    cv2.imwrite(str(out/f"{opts.format}-arrival.webp"),img,[cv2.IMWRITE_WEBP_QUALITY,96])
