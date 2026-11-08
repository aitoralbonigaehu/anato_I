"""
Where every named structure of the circulatory and digestive figures lies, in the figure's own pixels.

Each item is a list of regions (see areas.py): `ink` + `clip` + `seeds` (the structure's coloured
pencil, inside a polygon that cuts it from the next vessel of the same colour), `line` + `w` (+ `snap`
ink) for a vessel along its centre line, or `poly` for an outline drawn by hand.

How each extent was decided (plate by plate, from the drawing and the anatomy it shows):

p11 · veins of the 2nd embryo (lateral view, ~5–6 weeks; body wall removed):
  2 anterior cardinal: the head vein from the forebrain back to where it turns down behind the heart,
    as far as the common cardinal trunk (y≈548).
  1 common cardinal (Cuvier): the short trunk from that junction to the sinus venosus (the rounded
    light-blue chamber, not named here, left out).
  3 posterior cardinal: the dorsal band along the back of the mesonephros, from the junction to the tail.
  4 subcardinal: the thin vein arching over the top of the mesonephros and down its ventral border,
    with its anastomoses to the posterior cardinal.
  8 hepatocardiac channel: from the sinus venosus to where the vessel enters the liver.
  7 ductus venosus: that vessel's course through the liver, down to where it divides below it.
  6 portal vein: the ring of vitelline anastomoses round the duodenum below the liver.
  5 left umbilical vein: in the cord, and the vein the corrected notes circle inside the embryo
    (from the liver's lower edge towards the body wall).
p07 · arteries and veins of a 4-week embryo (left side; heart tube, yolk sac, connecting stalk):
  2 atrium: the blue chamber above the sinus. 1 sinus venosus: the blue confluence below it, where the
    common cardinal, umbilical and vitelline veins open. 4 ventricle / 5 bulbus: the red pear, its round
    lower part and its upper part. 8 aortic sac: the dilation above the bulbus where the arches arise.
  9 first arch: from the sac up over the pharynx. 10 second arch: the bar from the sac to the dorsal aorta.
  11 dorsal aorta: from the arches down behind the heart to the common cardinal. 12 descending aorta:
    from there down the back and round into the tail.
  13 vitelline arteries: the aorta's ventral branches and their network over the yolk sac.
  15 intersegmental arteries: the small dorsal branches of the aorta.
  14 umbilical artery: from the caudal aorta up into the connecting stalk.
  19/18/20 anterior, common and posterior cardinal veins along the left side.
  17 umbilical vein: the long trunk from the sinus down the body wall and into the stalk.
  16 vitelline veins: the blue network over the yolk sac, draining into the sinus.
p08 · sagittal section through the heart loop (~4 weeks): red = mesoderm. The thick red S is the
  myocardial wall of the heart tube round its one lumen (the grey channel); the thin red outer layer is
  the pericardium, and the black crescent between the two (with the small black fold under the loop) is
  the pericardial cavity (arrow 3). The lumen runs from the atrium (the box behind, its own dark lumen,
  not named) through 5, the atrioventricular canal (the short grey channel under the loop's inner fold),
  into 1 the ventricle (the bottom bend), up 2 the bulbus (between the inner fold and the thick right
  wall) and 4 the truncus (the top: both walls up to the apex, where the pericardium reflects off it).
  The four are one tissue (HEART) cut on shared lines: 4|2 slanting at y≈470→450, 2|1 at y 526, 5 is
  x 514–551 from the roof (y 512) down, the inner fold above it
  staying with 2.
p09 · the heart opened in frontal section (~5 weeks), and a small external view below:
  5 sinus venosus: the left lobe with its dark lumen; 6 right atrium: the chamber between it and the
  outflow tract; 7 left atrium: the chamber right of the outflow, above the cushion. 9 endocardial
  cushion: the round pale mass at the centre. 1 right ventricle: the pale chamber below, with
  4 its trabeculae (the dark comb); 2 left ventricle: right of the septum; 3 the interventricular
  foramen above the muscular septum and the septum itself. 8 venous valves, 10 right AV orifice,
  11 septum primum, 12 ostium primum are too small and too ambiguous in this drawing to outline
  honestly: they keep their spotlight on the arrow tip.
  In the small external heart: 6 the blue right atrium, 7 the top (left atrial) lobe, 1 and 2 the
  ventricular mass either side of the interventricular line.
p10 · arteries of the 2nd embryo (~6 weeks, lateral view):
  The aortic sac/truncus rises from the heart (its cut end) up and back; from it the arches loop up
  to the dorsal aorta: 3 the third arch (the front loop), 4 the fourth (middle), 5 the sixth (the back
  loop, with its ventral limb to the trunk). 6 common carotid: the ventral vessel from the sac to where
  the third arch leaves it; 7 external carotid: its continuation forward; 8 internal carotid: the third
  arch's dorsal end and the dorsal aorta's continuation into the head. 11 dorsal aortae: the paired
  longitudinal vessels (the notes name both "ladders") from the arches down to where they fuse, with
  the dorsal aorta segment above the arches. 10 subclavian: the loop at the foot of the outer one.
  12 descending aorta: from the fusion round to the tail; 13 coeliac trunk, 14 superior mesenteric
  (with its branches to the gut loop), 15 inferior mesenteric: its ventral branches; 9 intersegmental
  arteries: the small dorsal spikes. 16 umbilical arteries: from the caudal aorta up beside the
  allantois into the cord. 1 pulmonary trunk and 2 ascending aorta point at the outflow of the small
  external heart, too small to divide honestly: spotlight only.
p12 · arteries of the 3rd embryo (~7 weeks), with the right atrium opened:
  The vessels drawn whole are the right-side ones (the left common carotid 3 and left subclavian 4
  are short cut stumps: spotlight only). 2 ascending aorta: the trunk from the heart up to the
  origins of the branches; 5 brachiocephalic trunk: from there up and back to its bifurcation into
  20 the right subclavian (back, with its branches) and 6 the right common carotid (up), which divides
  into 7 the internal carotid (the vessel running forward under the skull base to the brain) and
  8 the external carotid (its branches forward and down to the face). 9 descending aorta: from the
  arch down the back to where its branches leave, with 9.2 the intercostal arteries (dorsal spikes).
  10 coeliac trunk and 11 superior mesenteric: the two parallel ventral branches; 12 inferior
  mesenteric is hidden behind the plexus (spotlight). 13 common iliac: the trunk below the plexus;
  14 external iliac: its branch down and forward; 15 internal iliac: the start of the vessel that
  goes on up as 16 the umbilical arteries into the cord. 1 pulmonary arteries (thin grey lines) and
  the heart's interior (septum primum/secundum, ostium secundum, foramen ovale, sinus, caval
  openings, pulmonary veins 19) are too small to outline honestly: spotlight only.
p13 · the heart of the 3rd embryo from the left: 1 left ventricle = the darker oval behind;
  2 right ventricle = the paler chamber in front and below it; 3 right atrium = the blue chamber
  where the caval veins open (the trunk further left is the veins themselves, left out);
  4 left atrium = the band above the ventricles, under the pulmonary (purple) tissue.
p14 · veins of the 3rd embryo (~7–8 weeks): 4 subclavian, joining the internal jugular (the vertical
  vein above, unnamed) to form 2 the right brachiocephalic vein, which 3 the left brachiocephalic
  (crossing from the far side) joins to make 1 the superior vena cava, down to the right atrium (the
  blue swelling, unnamed). 6 inferior vena cava: the trunk below the atrium; 7 ductus venosus: its
  branch to the liver; 9 portal vein: the vein descending from there to 10 the superior mesenteric,
  which runs with its artery along the midgut loop. 8 left umbilical vein: in the cord.
  5 azygos and intercostal veins: the vein along the back, with its dorsal branches.
p18 · the 4-week embryo of p07, for the gut: 1 first pharyngeal pouch = the region between the first
  and second arch arteries (inside the red loop); 2 second pouch = the region just below the second
  arch artery; 3 thyroid primordium has no outline of its own in this drawing (spotlight only);
  4 liver primordium = the grey bud under the heart; 5 yolk sac = the whole sac to its outline;
  6 allantois = the darker strip along the connecting stalk.
p19 · the sagittal section of p08, for the gut: 7 stomodeum = the white oral pit under the head;
  9 Rathke's pouch = the small pocket rising from its roof; 8 buccopharyngeal membrane = the thin wall
  between the pit and the foregut; 10 cloaca = the dilated end of the hindgut; 11 cloacal membrane =
  its ventral wall, where it meets the surface ectoderm.
p20 · gut of the 2nd embryo (yellow-green endoderm pencil). The tube is cut into its own stretches:
  5 oesophagus = the narrow tube from under the lung bud (mauve) to where it widens (y 720); 6 stomach =
  the fusiform widening down to the pylorus; 7 duodenum = from there down behind the vitelline vein and on
  to the second vein (the loop starts past it); 8 ventral pancreas = the oval bud left of the duodenum; 9 dorsal pancreas = the small
  knob on its right; 11 common bile duct = the duct from the duodenum to the branching under the liver;
  10 hepatic ducts = the striped tubules at the liver's hilum, right of the vein; 12 gallbladder = the green oval (with the
  cystic duct); 13 intestinal loop = the whole hairpin, cranial limb to apex and caudal limb down
  (not the vitelline vein, which turns teal where it runs along its upper side);
  14 Meckel = the loop's apex, where the vitelline duct leaves; 16 cloaca = the green wedge at the tail;
  4 pharyngeal pouches = the four grey balloons between the arch arteries. Circles only: 1 mouth,
  2 Rathke, 3 pharynx (no edge of its own against the pouches), 15 vitelline duct, 17-20 (thin lines).
p21 · head and liver of the 3rd embryo: 1 mouth = the black oral cavity (the tongue is a hole in it);
  2 tongue = the light finger inside it; 3 pharynx = the dark-grey arched mass behind it (the cavity
  removed); 4 oesophagus = the striated grey tube, up to the pink artery drawn over its side; 8 left lobe = the
  upper crescent of the liver; 9 falciform ligament = the band between the two white lines that part
  the lobes; 7 right lobe = the main mass below it (each traced along those lines); 6 liver = both. 5 duodenum is under the liver ("azpian"): circle only.
p22 · sagittal 3rd embryo: 1 stomach = the dilated foot of the green foregut tube; 2 peritoneal cavity =
  the dark space running out into the cord; 3 large intestine = the green hindgut down to the
  urogenital sinus (purple); 4 rectum = its last piece past the sinus.
p23 · 8-week herniated loop (Langman's figure): ducts in yellow. 6 hepatic ducts = the two branches above
  their union; 7 common hepatic duct = the left of the two parallel tubes, 8 common bile duct = the right
  one (pale) with the trunk down to the duodenum (as the arrows point), cut along the gap between them; 9 cystic duct = the narrow part to the
  gallbladder; 4 gallbladder = the pear; 2 ventral pancreas = the yellow bud inside the duodenal C;
  1 duodenum = the green C, cut from 5 across the tube at x≈650 (the descending colon above stays out); 5 jejunum and ileum = the coiled lower limb, the far end and the upper limb
  back to the caecum; 11 caecum and appendix = the bud hanging from the upper limb on its stalk;
  10 Meckel = the bump at the apex. 3 dorsal pancreas has no outline of its own: circle only.
"""

# p08: the heart tube (myocardium round its lumen), traced along its outer edge: the left wall of the
# truncus, the inner fold, the atrial opening (x 514), the bottom wall's lower edge and, on the right, the
# middle of the pericardial crescent, which is then carved out (so the cut follows the crescent exactly).
HEART8 = {'poly': [(503, 396), (508, 384), (516, 376), (540, 375), (549, 379), (558, 385), (566, 394),
                   (572, 402), (578, 408), (584, 420), (595, 432), (604, 444), (615, 456), (623, 468),
                   (630, 480), (637, 492), (639, 505), (640, 528), (639, 546), (634, 556), (628, 562),
                   (620, 568), (612, 579), (604, 586), (596, 591), (588, 596), (580, 602), (572, 605),
                   (564, 608), (556, 607), (548, 606), (540, 603), (534, 598), (528, 590), (520, 582),
                   (514, 578), (514, 512), (535, 512), (538, 507), (539, 490), (535, 484), (530, 476),
                   (523, 468), (517, 460), (514, 448), (511, 434), (507, 421), (503, 410)],
          'sub': [{'ink': 'dark', 'seeds': [(600, 450)], 'close': 3, 'grow': 0,
                   'clip': [(556, 380), (600, 392), (662, 440), (668, 540), (640, 566), (600, 470), (560, 400)]}]}

SPEC = {
    'p11': {
        2: [{'ink': 'blue', 'seeds': [(600, 330), (400, 420), (395, 520)],
             'clip': [(345, 230), (1260, 230), (1260, 480), (450, 480), (440, 548), (345, 548)]}],
        1: [{'ink': 'blue', 'seeds': [(420, 578)],
             'clip': [(342, 548), (478, 548), (478, 620), (342, 620)]}],
        3: [{'ink': 'blue', 'seeds': [(320, 600), (312, 750), (305, 900), (700, 1265)],
             'clip': [(270, 548), (342, 548), (342, 625), (355, 640), (350, 700), (345, 850), (352, 900), (362, 1000),
                      (392, 1060), (448, 1100), (512, 1140), (608, 1180), (720, 1212), (832, 1240), (960, 1255),
                      (1000, 1300), (270, 1300)]}],
        4: [{'line': [(333, 872), (349, 861), (381, 854), (408, 859), (426, 870), (445, 893), (463, 925), (476, 956), (486, 980),
                       (500, 1003), (540, 1024), (574, 1044), (646, 1084), (718, 1132), (790, 1172)], 'w': 13}],
        8: [{'ink': 'blue', 'seeds': [(480, 725), (470, 690)], 'clip': [(440, 674), (467, 670), (474, 684), (486, 696), (496, 702), (503, 712), (525, 730), (525, 742), (440, 742)]}],
        7: [{'ink': 'blue', 'seeds': [(477, 776), (520, 830)], 'clip': [(440, 742), (565, 742), (565, 856), (440, 856)]}],
        6: [{'ink': 'blue', 'seeds': [(523, 874), (480, 915), (545, 950)],
             'clip': [(455, 856), (553, 856), (553, 872), (548, 900), (562, 905), (565, 978), (470, 978), (455, 950)]}],
        5: [{'line': [(551, 858), (561, 884), (574, 906), (588, 921), (605, 928), (640, 929), (690, 929), (712, 926)], 'w': 12},
            {'ink': 'blue', 'seeds': [(1110, 772), (1138, 757)], 'clip': [(1050, 735), (1185, 735), (1185, 815), (1050, 815)]}],
    },
    'p07': {
        2: [{'ink': 'blue', 'seeds': [(265, 499)], 'clip': [(225, 455), (305, 455), (305, 555), (225, 555)]}],
        1: [{'ink': 'blue', 'seeds': [(224, 622)], 'clip': [(185, 555), (300, 555), (288, 600), (288, 695), (185, 695)]}],
        4: [{'ink': 'pink', 'seeds': [(347, 540)], 'clip': [(285, 495), (400, 495), (400, 600), (285, 600)]}],
        5: [{'ink': 'pink', 'seeds': [(347, 458)], 'clip': [(285, 412), (400, 412), (400, 495), (285, 495)]}],
        8: [{'ink': 'pink', 'seeds': [(306, 376)], 'clip': [(286, 346), (336, 346), (336, 412), (286, 412)]}],
        # 1st arch: leaves the dorsal aorta's band at ~(280, 268) and runs down to the aortic sac
        9: [{'ink': 'pink', 'seeds': [(291, 300), (295, 330)], 'clip': [(266, 271), (299, 264), (305, 300), (308, 346), (284, 346), (279, 300)]}],
        10: [{'ink': 'pink', 'seeds': [(250, 364)], 'clip': [(222, 344), (276, 344), (276, 366), (283, 370), (283, 384), (222, 384)]}],
        # dorsal aorta: the broad band from the cranial tip down the back (both arches leave from it)
        11: [{'ink': 'pink', 'seeds': [(231, 284), (150, 560), (293, 210), (300, 240)],
              'clip': [(240, 185), (325, 185), (325, 262), (299, 264), (266, 271), (279, 300), (283, 344), (222, 344), (222, 384), (195, 420), (180, 625), (100, 625), (100, 480), (160, 300)]}],
        12: [{'ink': 'pink', 'seeds': [(132, 929), (130, 700), (300, 1400)],
              'clip': [(95, 625), (168, 625), (168, 1230), (230, 1290), (500, 1290), (500, 1470), (95, 1470)], 'sub': [{'poly': [(40, 690), (97, 690), (98, 950), (102, 1000), (112, 1045), (116, 1080), (120, 1170), (124, 1215), (134, 1260), (145, 1300), (156, 1340), (40, 1340)]}]}],
        13: [{'ink': 'pinklight', 'fill': False, 'all': True, 'min': 40, 'close': 5,
              'clip': [(168, 690), (290, 640), (440, 560), (560, 330), (866, 330), (866, 1125), (380, 1125), (300, 1135), (168, 1110)]}],
        # intersegmental arteries: the short dorsal spikes off the aorta (left of its trunk's own edge)
        15: [{'ink': 'pink', 'all': True, 'min': 8, 'grow': 2, 'clip': [(40, 690), (97, 690), (98, 950), (102, 1000), (112, 1045), (116, 1080), (120, 1170), (124, 1215), (134, 1260), (145, 1300), (156, 1340), (40, 1340)]}],
        14: [{'ink': 'pink', 'seeds': [(497, 1160), (380, 1250)], 'clip': [(380, 1128), (560, 1128), (560, 1200), (400, 1200), (400, 1290), (360, 1290), (360, 1200)]}],
        19: [{'ink': 'blue', 'seeds': [(91, 499), (200, 260)], 'clip': [(40, 185), (300, 185), (300, 230), (180, 330), (150, 450), (140, 612), (118, 630), (40, 630)]}],
        18: [{'ink': 'blue', 'seeds': [(153, 642)], 'clip': [(105, 612), (186, 612), (186, 680), (118, 680), (105, 640)]}],
        20: [{'ink': 'blue', 'seeds': [(71, 1011), (80, 700), (150, 1345)],
              'clip': [(30, 630), (105, 630), (118, 680), (130, 700), (110, 1300), (200, 1330), (200, 1400), (30, 1400)]}],
        17: [{'ink': 'blue', 'seeds': [(240, 900), (462, 1184), (516, 1186)],
              'clip': [(190, 695), (285, 695), (285, 1150), (560, 1140), (560, 1215), (300, 1290), (190, 1290)]}],
        16: [{'ink': 'blue', 'fill': False, 'all': True, 'min': 60,
              'clip': [(288, 600), (400, 515), (500, 330), (866, 330), (866, 1120), (288, 1120)]}],
    },
    'p08': {
        3: [{'ink': 'dark', 'seeds': [(600, 450)], 'close': 3, 'grow': 2,
             'clip': [(556, 380), (600, 392), (662, 440), (668, 540), (640, 566), (600, 470), (560, 400)]},
            {'ink': 'dark', 'seeds': [(510, 602)], 'close': 3, 'grow': 2,
             'clip': [(496, 580), (532, 590), (545, 612), (520, 620), (494, 618)]},
            {'line': [(534, 611), (548, 612), (564, 612), (580, 608), (590, 603)], 'w': 4}],
        4: [{'poly': [(400, 300), (700, 300), (700, 448), (620, 450), (510, 474), (400, 474)], 'and': [HEART8]}],
        2: [{'poly': [(400, 474), (510, 474), (620, 450), (700, 448), (700, 526), (551, 526), (537, 512), (537, 490), (400, 490)], 'and': [HEART8]}],
        1: [{'poly': [(551, 526), (700, 526), (700, 700), (551, 700)], 'and': [HEART8]}],
        5: [{'poly': [(400, 490), (537, 490), (537, 512), (551, 526), (551, 700), (400, 700)], 'and': [HEART8]}],
    },
    'p09': {
        # a whole and a part drawn inside it: both stay whole
        '_nest': [(1, 4)],
        5: [{'poly': [(346, 420), (361, 407), (392, 406), (400, 430), (398, 470), (390, 497), (362, 498), (348, 480)]}],
        6: [{'poly': [(394, 404), (445, 400), (452, 425), (446, 450), (430, 476), (402, 480), (399, 440)], 'sub': [{'ink': 'pink', 'all': True, 'min': 30, 'clip': [(380, 385), (500, 385), (500, 460), (380, 460)]}]},
            {'ink': 'blue', 'seeds': [(741, 1003)], 'clip': [(702, 960), (790, 960), (790, 1070), (680, 1070), (680, 1010), (702, 1000)]}],
        7: [{'poly': [(458, 398), (520, 398), (532, 420), (522, 448), (500, 450), (486, 440), (468, 446), (456, 430)], 'sub': [{'ink': 'pink', 'all': True, 'min': 30, 'clip': [(380, 385), (500, 385), (500, 460), (380, 460)]}]},
            {'ink': 'notwhite', 'seeds': [(819, 983)], 'clip': [(782, 960), (862, 960), (862, 1016), (782, 1012)], 'sub': [{'ink': 'blue', 'all': True, 'clip': [(680, 960), (790, 960), (790, 1070), (680, 1070)]}]}],
        9: [{'poly': [(455, 452), (470, 447), (486, 454), (491, 470), (483, 485), (466, 489), (455, 476)]}],
        1: [{'poly': [(408, 479), (433, 476), (480, 494), (502, 491), (512, 547), (520, 585), (505, 580), (424, 560), (385, 519), (392, 488)]},
            {'ink': 'notwhite', 'seeds': [(800, 1061)], 'clip': [(745, 1012), (838, 1014), (860, 1130), (745, 1130)], 'sub': [{'ink': 'blue', 'all': True, 'clip': [(680, 960), (790, 960), (790, 1070), (680, 1070)]}]}],
        2: [{'poly': [(505, 457), (524, 435), (549, 447), (574, 510), (577, 572), (561, 604), (530, 601), (517, 572), (505, 494)]},
            {'ink': 'notwhite', 'seeds': [(858, 1080)], 'clip': [(838, 1014), (900, 1014), (900, 1160), (860, 1160)]}],
        3: [{'poly': [(482, 463), (506, 460), (512, 494), (522, 540), (534, 598), (526, 602), (514, 560), (502, 500), (484, 494)]}],
        4: [{'ink': 'notwhite', 'all': True, 'min': 15, 'close': 5, 'clip': [(430, 503), (470, 500), (500, 506), (506, 556), (433, 556)]}],
    },
    'p10': {
        3: [{'ink': 'rose', 'seeds': [(423, 315)], 'clip': [(410, 276), (440, 276), (440, 352), (408, 352)]}],
        4: [{'ink': 'rose', 'seeds': [(382, 345), (356, 300)], 'clip': [(345, 270), (372, 270), (372, 330), (395, 350), (388, 360), (345, 340)]}],
        5: [{'ink': 'rose', 'seeds': [(306, 315), (350, 335)], 'clip': [(290, 268), (318, 268), (318, 322), (380, 330), (385, 348), (300, 348), (290, 330)]}],
        6: [{'ink': 'rose', 'seeds': [(409, 361)], 'clip': [(392, 350), (430, 350), (432, 372), (395, 375)]}],
        7: [{'ink': 'rose', 'seeds': [(458, 350), (520, 360)], 'clip': [(430, 335), (560, 320), (565, 380), (432, 372)]}],
        8: [{'ink': 'rose', 'seeds': [(518, 285), (600, 270)], 'clip': [(415, 240), (720, 240), (720, 320), (560, 320), (440, 290), (415, 280)]}],
        11: [{'ink': 'rose', 'fill': False, 'seeds': [(224, 429), (157, 428), (300, 255), (250, 300)], 'clip': [(110, 180), (360, 180), (415, 240), (415, 277), (290, 268), (240, 300), (238, 560), (228, 604), (172, 628), (168, 592), (175, 588), (110, 588)]}],
        10: [{'ink': 'rose', 'seeds': [(155, 613)], 'clip': [(115, 586), (170, 586), (170, 622), (115, 630)]}],
        12: [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 24, 'snap': 'rose', 'close': 5,
              # from where the two dorsal aortae fuse (above that line they are 11)
              'sub': [{'poly': [(100, 500), (300, 500), (300, 594), (228, 604), (172, 628), (100, 640)]}, {'poly': [(172, 617), (187, 617), (187, 635), (172, 637)]}]},
             # its first stretch is broader than the line: the whole width, short of the dorsal spikes (9)
             {'ink': 'rose', 'seeds': [(203, 630), (215, 670)], 'clip': [(187, 621), (228, 604), (223, 640), (230, 660), (238, 685), (247, 700), (250, 712), (218, 712), (205, 685), (197, 660), (190, 640)]},
             # and on, paler under the tail's overlay, round to where the umbilical arteries leave
             {'line': [(632, 857), (642, 852), (651, 841), (660, 827), (667, 812), (670, 803)], 'w': 11, 'snap': 'rose', 'close': 5}],
        13: [{'ink': 'rose', 'seeds': [(266, 668)], 'clip': [(240, 640), (285, 640), (285, 690), (240, 700)], 'sub': [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 22}]}],
        14: [{'ink': 'rose', 'fill': False, 'seeds': [(363, 726), (300, 730), (420, 712)], 'clip': [(280, 700), (480, 700), (480, 730), (380, 735), (330, 790), (290, 760)], 'sub': [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 22}]}],
        15: [{'ink': 'rose', 'seeds': [(494, 825)], 'clip': [(465, 780), (530, 780), (530, 845), (465, 845)], 'sub': [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 22}]}],
        9: [{'ink': 'rose', 'all': True, 'min': 6, 'grow': 3, 'clip': [(60, 560), (165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845), (720, 920), (60, 920)], 'sub': [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 22}, {'poly': [(0, 0), (1087, 0), (1087, 600), (0, 600)]}, {'poly': [(115, 586), (170, 586), (170, 622), (115, 630)]}]},
            # the first spike, just below the fusion, whose root the line above would take
            {'ink': 'rose', 'seeds': [(182, 626)], 'clip': [(172, 617), (187, 617), (187, 635), (172, 637)]}],
        16: [{'ink': 'rose', 'seeds': [(790, 525), (780, 540)], 'clip': [(750, 500), (840, 500), (840, 570), (750, 570)]},
             {'ink': 'rose', 'seeds': [(694, 618), (575, 740), (565, 785)], 'clip': [(548, 690), (600, 640), (690, 600), (708, 625), (600, 705), (590, 760), (600, 775), (575, 805), (550, 800)]},
            # from the aorta's end, under the allantois, to where the vessel turns up
            {'line': [(670, 801), (656, 797), (635, 798), (612, 796), (590, 792)], 'w': 11, 'snap': 'rose', 'close': 5}],
    },
    'p12': {
        2: [{'ink': 'rose', 'seeds': [(423, 840), (410, 800)], 'clip': [(385, 762), (432, 752), (445, 765), (450, 820), (456, 878), (388, 878), (380, 820)]}],
        5: [{'ink': 'rose', 'seeds': [(408, 750), (370, 725)], 'clip': [(342, 698), (372, 698), (395, 730), (432, 752), (385, 762), (360, 748), (336, 715)]}],
        6: [{'ink': 'rose', 'seeds': [(359, 672)], 'clip': [(345, 621), (395, 621), (388, 645), (372, 700), (338, 706), (343, 650)]}],
        20: [{'ink': 'rose', 'seeds': [(309, 702), (250, 740)], 'clip': [(195, 680), (342, 690), (352, 712), (330, 745), (285, 752), (250, 770), (240, 795), (195, 795)]}],
        # the carotid splits at y≈621 round a small loop: its left limb runs on into the upper vessel and the
        # pale salmon one under the skull base (7, internal); the right limb, with the branches down to the
        # face, is 8 (external). The hook going back from the loop's top is not named.
        7: [{'ink': 'rose', 'seeds': [(368, 600), (420, 566), (500, 547)], 'clip': [(358, 622), (378, 622), (379, 612), (378, 590), (386, 577), (399, 573), (417, 570), (434, 569), (452, 565), (470, 561), (488, 558), (510, 550), (532, 541), (532, 527), (510, 536), (488, 544), (452, 551), (435, 555), (400, 557), (368, 560), (362, 570), (358, 585)]},
            {'line': [(506, 549), (531, 545), (569, 534), (600, 524), (631, 511), (652, 499)], 'w': 8}],
        8: [{'ink': 'rose', 'fill': False, 'seeds': [(499, 573), (385, 600), (420, 600), (450, 630)], 'clip': [(379, 621), (379, 590), (386, 578), (400, 574), (452, 566), (488, 559), (532, 542), (545, 600), (540, 625), (505, 665), (420, 668), (395, 621)],
             'sub': [{'poly': [(358, 622), (378, 622), (379, 612), (378, 590), (386, 577), (399, 573), (417, 570), (434, 569), (452, 565), (470, 561), (488, 558), (510, 550), (532, 541), (532, 527), (510, 536), (488, 544), (452, 551), (435, 555), (400, 557), (368, 560), (362, 570), (358, 585)]}, {'line': [(506, 549), (531, 545), (569, 534), (600, 524), (631, 511), (652, 499)], 'w': 8}]}],
        # the aorta's dorsal edge, traced row by row (the intercostal spikes beyond it are 9.2)
        9: [{'ink': 'rose', 'seeds': [(266, 1087), (270, 900), (350, 1210)],
             'clip': [(310, 800), (312, 1080), (330, 1140), (370, 1200), (398, 1226), (413, 1236), (413, 1262), (360, 1262), (347, 1240), (338, 1230), (327, 1220), (319, 1210), (310, 1200), (298, 1190), (288, 1180), (280, 1170), (274, 1160), (268, 1150), (263, 1140), (258, 1130), (254, 1120), (252, 1110), (247, 1100), (247, 1090), (240, 1080), (240, 1070), (237, 1060), (234, 1050), (230, 1040), (229, 1020), (225, 1010), (223, 1000), (224, 990), (224, 940), (226, 930), (230, 920), (234, 910), (237, 900), (238, 880), (241, 870), (242, 860), (241, 840), (242, 820), (242, 800)]}],
        # 'red', not 'rose': the vertebrae beside the spikes are an orange that 'rose' would take
        '9.2': [{'ink': 'red', 'all': True, 'min': 10, 'grow': 3, 'clip': [(195, 800), (242, 800), (242, 820), (241, 840), (242, 860), (241, 870), (238, 880), (237, 900), (234, 910), (230, 920), (226, 930), (224, 940), (224, 990), (223, 1000), (225, 1010), (229, 1020), (230, 1040), (234, 1050), (237, 1060), (240, 1070), (240, 1080), (247, 1090), (247, 1100), (252, 1110), (254, 1120), (258, 1130), (263, 1140), (268, 1150), (274, 1160), (250, 1180), (195, 1100)]}],
        10: [{'line': [(413, 1243), (424, 1232), (436, 1217), (444, 1200), (452, 1185), (462, 1170), (476, 1155), (492, 1142), (508, 1132), (519, 1126)], 'w': 12, 'snap': 'rose', 'close': 5},
             # and its branch to the left (towards the stomach and spleen)
             {'line': [(424, 1168), (446, 1167), (462, 1168)], 'w': 10, 'snap': 'rose', 'close': 5}],
        11: [{'line': [(425, 1248), (438, 1236), (450, 1222), (462, 1208), (472, 1198), (486, 1188), (499, 1182)], 'w': 12, 'snap': 'rose', 'close': 5}],
        13: [{'ink': 'rose', 'seeds': [(436, 1328)], 'clip': [(390, 1310), (440, 1306), (482, 1316), (484, 1342), (440, 1352), (398, 1358), (388, 1335)]}],
        14: [{'ink': 'rose', 'seeds': [(507, 1362), (560, 1391), (485, 1352)], 'clip': [(462, 1335), (500, 1342), (540, 1372), (585, 1376), (590, 1402), (530, 1402), (490, 1376), (458, 1360)]},
             # with its branches down (towards the limb)
             {'ink': 'rose', 'seeds': [(470, 1390), (490, 1415), (550, 1415)], 'clip': [(459, 1372), (500, 1380), (530, 1400), (600, 1403), (600, 1434), (459, 1434)]}],
        15: [{'ink': 'rose', 'seeds': [(599, 1359)], 'clip': [(576, 1398), (598, 1398), (632, 1322), (612, 1310)]}],
        16: [{'ink': 'rose', 'all': True, 'min': 30, 'fill': False, 'clip': [(622, 1318), (640, 1240), (700, 1168), (800, 1112), (1045, 1105), (1045, 1150), (800, 1175), (705, 1225), (655, 1300), (634, 1330)]}],
    },
    'p13': {
        1: [{'poly': [(497, 848), (520, 838), (560, 842), (600, 858), (622, 880), (625, 915), (612, 940), (585, 952), (555, 950), (530, 935), (512, 912), (500, 880)]}],
        2: [{'poly': [(472, 872), (490, 860), (500, 880), (512, 912), (530, 935), (555, 950), (585, 952), (612, 940), (632, 950), (600, 984), (540, 998), (482, 995), (470, 960), (471, 920)]}],
        3: [{'ink': 'blue', 'seeds': [(435, 880), (440, 950)], 'clip': [(400, 838), (442, 845), (468, 870), (476, 920), (472, 1000), (420, 1004), (402, 960)]}],
        4: [{'poly': [(478, 826), (500, 820), (530, 821), (555, 834), (562, 848), (520, 838), (497, 848), (482, 846)]}],
    },
    'p14': {
        4: [{'ink': 'blue', 'seeds': [(290, 742)], 'clip': [(262, 718), (303, 718), (303, 765), (262, 765)]}],
        2: [{'ink': 'blue', 'seeds': [(323, 752)], 'clip': [(303, 722), (352, 722), (352, 768), (303, 768)]}],
        3: [{'ink': 'blue', 'seeds': [(396, 737), (430, 728)], 'clip': [(352, 700), (470, 700), (470, 762), (352, 765)]}],
        1: [{'ink': 'blue', 'seeds': [(358, 812)], 'clip': [(300, 768), (376, 765), (380, 800), (374, 882), (330, 884), (302, 830)]}],
        6: [{'ink': 'blue', 'seeds': [(440, 1059), (420, 950)], 'clip': [(380, 905), (470, 895), (455, 945), (455, 995), (480, 1010), (480, 1125), (395, 1128), (385, 1000)]}],
        7: [{'ink': 'blue', 'seeds': [(513, 992), (480, 965)], 'clip': [(455, 942), (528, 942), (528, 996), (505, 990), (480, 980), (455, 990)]}],
        9: [{'ink': 'blue', 'seeds': [(507, 1021)], 'clip': [(480, 988), (516, 988), (512, 1066), (480, 1066)]}],
        10: [{'ink': 'blue', 'all': True, 'min': 20, 'clip': [(498, 1062), (540, 1074), (838, 1074), (838, 1102), (540, 1102), (494, 1082)]}],
        8: [{'ink': 'blue', 'seeds': [(982, 1106), (900, 1100)], 'clip': [(838, 1062), (1032, 1062), (1032, 1142), (838, 1142)]}],
        5: [{'ink': 'blue', 'fill': False, 'seeds': [(220, 976), (230, 850), (260, 1150)], 'clip': [(190, 805), (300, 805), (300, 1110), (335, 1130), (335, 1200), (190, 1200)]}],
    },
    'p18': {
        1: [{'poly': [(252, 382), (272, 350), (295, 320), (305, 324), (310, 360), (309, 390), (290, 393)]}],
        2: [{'poly': [(226, 406), (262, 400), (283, 410), (282, 438), (252, 444), (228, 436)]}],
        4: [{'poly': [(308, 652), (330, 645), (370, 643), (390, 650), (393, 680), (350, 691), (310, 690)]}],
        5: [{'poly': [(335, 705), (395, 692), (420, 640), (470, 580), (530, 470), (583, 380), (650, 365), (740, 370), (810, 410), (850, 480), (872, 580),
                      (875, 700), (850, 820), (810, 890), (740, 980), (690, 1023), (637, 1077), (620, 1110), (540, 1120), (400, 1125), (340, 1120), (325, 900)]}],
        6: [{'poly': [(525, 1212), (548, 1215), (570, 1240), (600, 1265), (620, 1290), (615, 1300), (590, 1287), (560, 1263), (535, 1246), (522, 1228)]}],
    },
    'p19': {
        7: [{'poly': [(572, 305), (600, 304), (614, 311), (614, 331), (585, 334), (571, 328)]}],
        9: [{'poly': [(585, 276), (595, 272), (603, 285), (603, 300), (592, 303), (586, 292)]}],
        8: [{'line': [(575, 277), (567, 300), (559, 324), (552, 343)], 'w': 9}],
        10: [{'poly': [(610, 1290), (640, 1275), (690, 1290), (720, 1305), (745, 1320), (762, 1345), (770, 1380), (765, 1410), (745, 1440), (700, 1445), (660, 1430), (625, 1405), (610, 1380)],
              # less its ventral wall, which is 11
              'sub': [{'line': [(684, 1291), (700, 1298), (726, 1312), (746, 1329), (762, 1349), (770, 1372), (771, 1392)], 'w': 8}]}],
        11: [{'line': [(684, 1291), (700, 1298), (726, 1312), (746, 1329), (762, 1349), (770, 1372), (771, 1392)], 'w': 8}],
    },
    'p20': {
        # a whole and a part drawn inside it: both stay whole
        '_nest': [(13, 14)],
        # gut = the yellow-green endoderm pencil; each part is the gut ink inside its own stretch of the tube
        5: [{'ink': 'gut', 'clip': [(350, 588), (452, 588), (452, 720), (350, 720)], 'all': True}],
        6: [{'ink': 'gut', 'clip': [(350, 720), (480, 720), (470, 790), (438, 815), (350, 815)], 'all': True}],
        7: [{'ink': 'gut', 'clip': [(438, 815), (470, 790), (492, 806), (487, 834), (491, 849), (492, 900), (468, 900), (474, 838)], 'all': True},
            # it comes out from under the vein and runs on to the loop, behind the second vein
            {'ink': 'gut', 'clip': [(492, 895), (548, 895), (548, 940), (492, 940)], 'all': True}],
        8: [{'ink': 'gut', 'clip': [(433, 834), (475, 834), (475, 871), (433, 871)], 'all': True}],
        9: [{'poly': [(494, 853), (499, 848), (506, 849), (509, 855), (507, 863), (500, 866), (494, 862)]}],
        11: [{'ink': 'gut', 'clip': [(487, 834), (514, 821), (531, 819), (544, 838), (544, 857), (510, 854), (509, 849), (491, 849)], 'all': True}],
        10: [{'poly': [(526, 796), (531, 794), (553, 808), (553, 814), (548, 821), (543, 821), (533, 809)], 'grow': 0}],
        12: [{'ink': 'gut', 'clip': [(546, 822), (622, 822), (622, 866), (546, 866)], 'all': True}],
        13: [{'ink': 'gut', 'clip': [(548, 925), (600, 900), (700, 880), (800, 815), (850, 790), (895, 795), (895, 860), (870, 880), (860, 960), (830, 1080), (860, 1130), (860, 1160), (735, 1160), (735, 1000), (800, 900), (700, 975), (548, 975)], 'all': True, 'fill': False,
              # the vitelline vein turns teal where it runs along the loop's upper side: not gut
              'sub': [{'poly': [(560, 895), (590, 895), (606, 910), (622, 922), (702, 922), (706, 932), (702, 941), (660, 948), (620, 949), (610, 941), (590, 937), (575, 932), (566, 918)]}]}],
        14: [{'ink': 'gut', 'clip': [(858, 806), (872, 799), (886, 802), (888, 820), (886, 840), (870, 838), (860, 822)], 'all': True}],
        16: [{'ink': 'gut', 'clip': [(905, 945), (1005, 945), (1005, 1095), (905, 1095)], 'all': True}],
        4: [{'poly': [(452, 386), (470, 384), (478, 392), (479, 405), (478, 425), (475, 438), (462, 442), (457, 436), (454, 420), (447, 410), (446, 395)]},
            {'poly': [(526, 381), (540, 378), (552, 382), (558, 392), (558, 410), (557, 428), (552, 438), (540, 442), (530, 438), (526, 425), (522, 410), (521, 393)]},
            {'poly': [(640, 399), (660, 396), (676, 399), (681, 410), (681, 430), (678, 445), (670, 460), (663, 470), (652, 477), (636, 479), (628, 474), (627, 460), (632, 450), (636, 435), (636, 410)]},
            {'poly': [(722, 421), (745, 418), (760, 422), (767, 432), (768, 450), (760, 462), (748, 475), (742, 495), (738, 508), (725, 512), (714, 507), (709, 492), (710, 470), (713, 448), (715, 430)]}],
    },
    'p21': {
        # a whole and a part drawn inside it: both stay whole
        '_nest': [(6, 7), (6, 8), (6, 9)],
        1: [{'ink': 'black', 'clip': [(510, 590), (650, 590), (650, 800), (510, 800)], 'seeds': [(560, 650)], 'fill': False}],
        2: [{'poly': [(575, 680), (584, 676), (592, 688), (596, 710), (600, 740), (600, 760), (590, 770), (580, 767), (576, 745), (573, 715), (572, 690)]}],
        3: [{'ink': 'dark', 'clip': [(355, 560), (400, 545), (470, 546), (530, 553), (542, 572), (540, 600), (538, 640), (530, 690), (500, 706), (440, 702), (390, 692), (362, 662), (352, 610)], 'all': True, 'close': 7,
             'sub': [{'ink': 'black', 'clip': [(510, 590), (650, 590), (650, 800), (510, 800)], 'seeds': [(560, 650)], 'grow': 1}]}],
        4: [{'poly': [(320, 601), (356, 600), (349, 609), (341, 623), (333, 643), (324, 666), (317, 689), (313, 697), (310, 697), (306, 683), (303, 660), (306, 640), (311, 623)], 'grow': 1}],  # the striated tube, up to the artery drawn over its side
        8: [{'poly': [(469, 953), (486, 936), (509, 921), (529, 914), (551, 911), (571, 914), (589, 923), (603, 936), (611, 951), (616, 969), (617, 986), (621, 1002), (606, 999), (586, 985), (560, 965), (529, 956), (471, 956)], 'grow': 0}],
        9: [{'poly': [(440, 973), (471, 956), (529, 956), (560, 965), (586, 985), (606, 999), (623, 1004), (623, 1013), (586, 994), (560, 974), (529, 963), (486, 963), (437, 977)], 'grow': 0}],
        7: [{'poly': [(437, 977), (486, 963), (529, 963), (560, 974), (586, 994), (623, 1013), (629, 1025), (614, 1062), (595, 1119), (582, 1169), (570, 1212), (551, 1256), (520, 1294), (482, 1316), (445, 1312), (401, 1287), (364, 1237), (348, 1169), (348, 1106), (357, 1056), (382, 1012), (410, 990)], 'grow': 0}],
        6: [{'poly': [(469, 953), (486, 936), (509, 921), (529, 914), (551, 911), (571, 914), (589, 923), (603, 936), (611, 951), (616, 969), (617, 986), (621, 1002), (623, 1013), (629, 1025), (614, 1062), (595, 1119), (582, 1169), (570, 1212), (551, 1256), (520, 1294), (482, 1316), (445, 1312), (401, 1287), (364, 1237), (348, 1169), (348, 1106), (357, 1056), (382, 1012), (410, 990), (437, 977), (469, 960)]}],
    },
    'p22': {
        1: [{'ink': 'gut', 'clip': [(392, 1035), (482, 1035), (482, 1172), (392, 1172)], 'all': True}],
        2: [{'ink': 'dark', 'clip': [(570, 1060), (960, 1060), (960, 1215), (570, 1215)], 'seeds': [(757, 1132)], 'close': 5}],
        3: [{'ink': 'gut', 'clip': [(578, 1240), (625, 1240), (668, 1330), (668, 1366), (578, 1366)], 'all': True, 'min': 80}],
        4: [{'ink': 'gut', 'clip': [(688, 1338), (752, 1338), (752, 1386), (688, 1386)], 'all': True}],
    },
    'p23': {
        # a whole and a part drawn inside it: both stay whole
        '_nest': [(5, 10)],
        6: [{'ink': 'yellow', 'clip': [(608, 752), (662, 752), (662, 817), (608, 817)], 'all': True}],
        # two strands run down from the hepatic ducts' junction: 7 the left one, 8 the right one (pale, under the
        # yellow threshold, so it is drawn) and the single duct below where they meet; the cut follows the gap
        7: [{'ink': 'yellow', 'clip': [(597, 817), (622, 817), (620, 824), (618, 835), (617, 845), (616, 858), (617, 870), (612, 878), (597, 878)], 'all': True}],
        8: [{'ink': 'yellow', 'clip': [(634, 817), (630, 880), (628, 901), (600, 901), (600, 878), (612, 878), (617, 870), (616, 858), (617, 845), (618, 835), (620, 824), (622, 817)], 'all': True},
            {'poly': [(622, 817), (629, 817), (628, 830), (626, 843), (626, 858), (624, 868), (617, 868), (616, 858), (617, 845), (618, 835), (620, 824)], 'grow': 0}],
        9: [{'ink': 'yellow', 'clip': [(630, 843), (652, 843), (652, 888), (630, 888)], 'all': True}],
        4: [{'ink': 'yellow', 'clip': [(652, 836), (724, 836), (724, 892), (652, 892)], 'all': True}],
        2: [{'ink': 'yellow', 'clip': [(598, 902), (645, 902), (645, 1006), (598, 1006)], 'seeds': [(622, 960), (615, 985)]}],
        1: [{'ink': 'gut', 'clip': [(545, 898), (700, 898), (700, 1000), (680, 1000), (657, 1066), (647, 1100), (545, 1100)], 'all': True, 'fill': False, 'min': 80,
             'sub': [{'ink': 'yellow', 'clip': [(598, 902), (645, 902), (645, 1006), (598, 1006)], 'seeds': [(622, 960), (615, 985)]}]}],
        5: [{'ink': 'gut', 'clip': [(657, 1066), (680, 1072), (730, 1072), (748, 1064), (760, 1050), (760, 985), (1310, 985), (1310, 1118), (647, 1118), (647, 1100)], 'all': True, 'fill': False, 'min': 80,
             'sub': [{'poly': [(1050, 980), (1128, 980), (1128, 1078), (1050, 1078)]}]},
            {'ink': 'gut', 'clip': [(1110, 840), (1310, 840), (1310, 985), (1110, 985)], 'all': True, 'fill': False, 'min': 80}],
        11: [{'ink': 'gut', 'clip': [(1050, 980), (1128, 980), (1128, 1078), (1050, 1078)], 'all': True, 'min': 60}],
        10: [{'ink': 'gut', 'clip': [(1262, 862), (1280, 859), (1293, 861), (1303, 871), (1303, 889), (1295, 896), (1275, 893), (1264, 885)], 'all': True}],
    },
}
