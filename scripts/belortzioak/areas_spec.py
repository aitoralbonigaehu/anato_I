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
  myocardial wall of the heart tube round its lumen (the grey channel); the thin red outer layer is the
  pericardium, and the black clefts between the two are the pericardial cavity (where arrow 3 ends).
  The loop is read from its outflow down: 4 truncus arteriosus = the top of the tube (to y≈443),
  2 bulbus = its descending part (to y≈520), 1 ventricle = the bottom bend; the left lobe behind is the
  atrium, and 5 the atrioventricular sulcus is the external groove between it and the ventricle.
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
  the fusiform widening down to the pylorus; 7 duodenum = from there to where it passes behind the
  vitelline vein; 8 ventral pancreas = the oval bud left of the duodenum; 9 dorsal pancreas = the small
  knob on its right; 11 common bile duct = the duct from the duodenum to the branching under the liver;
  10 hepatic ducts = the white tubules at the liver's hilum; 12 gallbladder = the green oval (with the
  cystic duct); 13 intestinal loop = the whole hairpin, cranial limb to apex and caudal limb down;
  14 Meckel = the loop's apex, where the vitelline duct leaves; 16 cloaca = the green wedge at the tail;
  4 pharyngeal pouches = the four grey balloons between the arch arteries. Circles only: 1 mouth,
  2 Rathke, 3 pharynx (no edge of its own against the pouches), 15 vitelline duct, 17-20 (thin lines).
p21 · head and liver of the 3rd embryo: 1 mouth = the black oral cavity (the tongue is a hole in it);
  2 tongue = the light finger inside it; 3 pharynx = the dark-grey arched mass behind it (the cavity
  removed); 4 oesophagus = the hatched grey tube running down behind the pink artery; 8 left lobe = the
  upper cap of the liver; 9 falciform ligament = the white double line between the lobes; 7 right lobe =
  the main mass; 6 liver = both. 5 duodenum is under the liver ("azpian"): circle only.
p22 · sagittal 3rd embryo: 1 stomach = the dilated foot of the green foregut tube; 2 peritoneal cavity =
  the dark space running out into the cord; 3 large intestine = the green hindgut down to the
  urogenital sinus (purple); 4 rectum = its last piece past the sinus.
p23 · 8-week herniated loop (Langman's figure): ducts in yellow. 6 hepatic ducts = the two branches above
  their union; 7 common hepatic duct = the left of the two parallel tubes, 8 common bile duct = the right
  one with the trunk down to the duodenum (as the arrows point); 9 cystic duct = the narrow part to the
  gallbladder; 4 gallbladder = the pear; 2 ventral pancreas = the yellow bud inside the duodenal C;
  1 duodenum = the green C; 5 jejunum and ileum = the coiled lower limb, the far end and the upper limb
  back to the caecum; 11 caecum and appendix = the bud hanging from the upper limb on its stalk;
  10 Meckel = the bump at the apex. 3 dorsal pancreas has no outline of its own: circle only.
"""

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
        8: [{'ink': 'blue', 'seeds': [(480, 725)], 'clip': [(440, 706), (525, 706), (525, 742), (440, 742)]}],
        7: [{'ink': 'blue', 'seeds': [(477, 776), (520, 830)], 'clip': [(440, 742), (565, 742), (565, 856), (440, 856)]}],
        6: [{'ink': 'blue', 'seeds': [(523, 874), (480, 915), (545, 950)],
             'clip': [(455, 856), (553, 856), (553, 872), (548, 900), (562, 905), (565, 978), (470, 978), (455, 950)]}],
        5: [{'line': [(550, 860), (562, 885), (578, 913), (600, 929), (640, 931), (700, 929)], 'w': 12},
            {'ink': 'blue', 'seeds': [(1110, 772), (1138, 757)], 'clip': [(1050, 735), (1185, 735), (1185, 815), (1050, 815)]}],
    },
    'p07': {
        2: [{'ink': 'blue', 'seeds': [(265, 499)], 'clip': [(225, 455), (305, 455), (305, 555), (225, 555)]}],
        1: [{'ink': 'blue', 'seeds': [(224, 622)], 'clip': [(185, 555), (300, 555), (288, 600), (288, 695), (185, 695)]}],
        4: [{'ink': 'pink', 'seeds': [(347, 540)], 'clip': [(285, 495), (400, 495), (400, 600), (285, 600)]}],
        5: [{'ink': 'pink', 'seeds': [(347, 458)], 'clip': [(285, 412), (400, 412), (400, 495), (285, 495)]}],
        8: [{'ink': 'pink', 'seeds': [(306, 376)], 'clip': [(286, 346), (336, 346), (336, 412), (286, 412)]}],
        9: [{'ink': 'pink', 'seeds': [(300, 283), (300, 250)], 'clip': [(283, 230), (330, 230), (330, 346), (283, 346)]}],
        10: [{'ink': 'pink', 'seeds': [(250, 364)], 'clip': [(222, 344), (286, 344), (286, 384), (222, 384)]}],
        11: [{'ink': 'pink', 'seeds': [(231, 284), (150, 560), (293, 210)],
              'clip': [(240, 185), (320, 185), (320, 230), (283, 230), (283, 344), (222, 344), (222, 384), (195, 420), (180, 625), (100, 625), (100, 480), (160, 300)]}],
        12: [{'ink': 'pink', 'seeds': [(132, 929), (130, 700), (300, 1400)],
              'clip': [(95, 625), (168, 625), (168, 1230), (230, 1290), (500, 1290), (500, 1470), (95, 1470)], 'sub': [{'poly': [(50, 690), (97, 690), (95, 1000), (103, 1200), (115, 1300), (60, 1300)]}]}],
        13: [{'ink': 'pinklight', 'fill': False, 'all': True, 'min': 40, 'close': 5,
              'clip': [(168, 690), (290, 640), (440, 560), (560, 330), (866, 330), (866, 1125), (380, 1125), (300, 1135), (168, 1110)]}],
        15: [{'ink': 'pink', 'all': True, 'min': 8, 'grow': 3, 'clip': [(50, 690), (102, 690), (100, 1000), (108, 1200), (120, 1300), (60, 1300)]}],
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
        3: [{'ink': 'dark', 'seeds': [(600, 450), (470, 520), (445, 590), (510, 602)], 'close': 3, 'grow': 2, 'clip': [(505, 368), (592, 370), (662, 420), (668, 540), (642, 618), (560, 632), (440, 632), (412, 600), (430, 540), (470, 497), (505, 497), (505, 470), (498, 420)]}],
        4: [{'poly': [(503, 372), (535, 368), (560, 372), (575, 395), (572, 443), (507, 443), (504, 410)], 'sub': [{'ink': 'dark', 'seeds': [(600, 450), (470, 520), (445, 590), (510, 602)], 'close': 3, 'clip': [(505, 368), (592, 370), (662, 420), (668, 540), (642, 618), (560, 632), (440, 632), (412, 600), (430, 540), (470, 497), (505, 497), (505, 470), (498, 420)]}]}],
        2: [{'poly': [(507, 443), (572, 443), (582, 470), (600, 500), (605, 522), (548, 522), (520, 528), (515, 505), (515, 470)], 'sub': [{'ink': 'dark', 'seeds': [(600, 450), (470, 520), (445, 590), (510, 602)], 'close': 3, 'clip': [(505, 368), (592, 370), (662, 420), (668, 540), (642, 618), (560, 632), (440, 632), (412, 600), (430, 540), (470, 497), (505, 497), (505, 470), (498, 420)]}]}],
        1: [{'poly': [(548, 522), (605, 522), (612, 500), (640, 515), (655, 545), (657, 562), (640, 592), (610, 612), (573, 622), (520, 628), (482, 624), (478, 590), (510, 562), (540, 552)], 'sub': [{'ink': 'dark', 'seeds': [(600, 450), (470, 520), (445, 590), (510, 602)], 'close': 3, 'clip': [(505, 368), (592, 370), (662, 420), (668, 540), (642, 618), (560, 632), (440, 632), (412, 600), (430, 540), (470, 497), (505, 497), (505, 470), (498, 420)]}]}],
        5: [{'poly': [(512, 512), (522, 505), (538, 520), (550, 548), (540, 560), (520, 560), (508, 540)]}],
    },
    'p09': {
        5: [{'poly': [(346, 420), (361, 407), (392, 406), (400, 430), (398, 470), (390, 497), (362, 498), (348, 480)]}],
        6: [{'poly': [(394, 404), (445, 400), (452, 425), (446, 450), (430, 476), (402, 480), (399, 440)], 'sub': [{'ink': 'pink', 'all': True, 'min': 30, 'clip': [(380, 385), (500, 385), (500, 460), (380, 460)]}]},
            {'ink': 'blue', 'seeds': [(741, 1003)], 'clip': [(680, 960), (790, 960), (790, 1070), (680, 1070)]}],
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
        11: [{'ink': 'rose', 'fill': False, 'seeds': [(224, 429), (157, 428), (300, 255), (250, 300)], 'clip': [(110, 180), (360, 180), (415, 240), (415, 277), (290, 268), (240, 300), (238, 560), (195, 588), (175, 588), (110, 588)]}],
        10: [{'ink': 'rose', 'seeds': [(155, 613)], 'clip': [(115, 588), (180, 588), (182, 630), (115, 630)]}],
        12: [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 24, 'snap': 'rose', 'close': 5}],
        13: [{'ink': 'rose', 'seeds': [(266, 668)], 'clip': [(240, 640), (285, 640), (285, 690), (240, 700)], 'sub': [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 22}]}],
        14: [{'ink': 'rose', 'fill': False, 'seeds': [(363, 726), (300, 730), (420, 712)], 'clip': [(280, 700), (480, 700), (480, 730), (380, 735), (330, 790), (290, 760)], 'sub': [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 22}]}],
        15: [{'ink': 'rose', 'seeds': [(494, 825)], 'clip': [(465, 780), (530, 780), (530, 845), (465, 845)], 'sub': [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 22}]}],
        9: [{'ink': 'rose', 'all': True, 'min': 6, 'grow': 3, 'clip': [(60, 560), (165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845), (720, 920), (60, 920)], 'sub': [{'line': [(165, 572), (185, 610), (205, 650), (225, 690), (250, 730), (285, 765), (330, 795), (380, 815), (440, 835), (500, 848), (560, 855), (620, 858), (660, 855), (690, 845)], 'w': 22}, {'poly': [(0, 0), (1087, 0), (1087, 600), (0, 600)]}]}],
        16: [{'ink': 'rose', 'seeds': [(790, 525), (780, 540)], 'clip': [(750, 500), (840, 500), (840, 570), (750, 570)]},
             {'ink': 'rose', 'seeds': [(694, 618), (575, 740), (565, 785)], 'clip': [(548, 690), (600, 640), (690, 600), (708, 625), (600, 705), (590, 760), (600, 775), (575, 805), (550, 800)]}],
    },
    'p12': {
        2: [{'ink': 'rose', 'seeds': [(423, 840), (410, 800)], 'clip': [(385, 762), (432, 752), (445, 765), (450, 820), (456, 878), (388, 878), (380, 820)]}],
        5: [{'ink': 'rose', 'seeds': [(408, 750), (370, 725)], 'clip': [(342, 698), (372, 698), (395, 730), (432, 752), (385, 762), (360, 748), (336, 715)]}],
        6: [{'ink': 'rose', 'seeds': [(359, 672)], 'clip': [(330, 572), (382, 572), (378, 640), (368, 700), (338, 706), (342, 640)]}],
        20: [{'ink': 'rose', 'seeds': [(309, 702), (250, 740)], 'clip': [(195, 680), (342, 690), (352, 712), (330, 745), (285, 752), (250, 770), (240, 795), (195, 795)]}],
        7: [{'line': [(335, 556), (380, 553), (450, 551), (514, 549), (560, 537), (600, 524), (652, 498)], 'w': 10}],
        8: [{'ink': 'rose', 'fill': False, 'seeds': [(499, 573), (420, 600), (450, 630)], 'clip': [(386, 566), (530, 562), (540, 620), (505, 665), (420, 668), (388, 615)],
             'sub': [{'line': [(335, 556), (380, 553), (450, 551), (514, 549), (560, 537), (600, 524), (652, 498)], 'w': 10}]}],
        9: [{'ink': 'rose', 'seeds': [(266, 1087), (270, 900), (350, 1210)],
             'clip': [(238, 800), (310, 800), (312, 1080), (330, 1140), (370, 1200), (398, 1230), (398, 1262), (370, 1262), (320, 1215), (285, 1160), (262, 1110), (240, 1060), (238, 950)]}],
        '9.2': [{'ink': 'rose', 'all': True, 'min': 10, 'grow': 3, 'clip': [(195, 800), (239, 800), (239, 1060), (262, 1110), (285, 1160), (250, 1180), (195, 1100)]}],
        10: [{'line': [(384, 1254), (420, 1226), (448, 1198), (472, 1174), (500, 1150), (518, 1132)], 'w': 10, 'snap': 'rose', 'close': 5}],
        11: [{'line': [(404, 1256), (436, 1234), (460, 1218), (484, 1202), (500, 1186)], 'w': 10, 'snap': 'rose', 'close': 5}],
        13: [{'ink': 'rose', 'seeds': [(436, 1328)], 'clip': [(390, 1310), (440, 1306), (482, 1316), (484, 1342), (440, 1352), (398, 1358), (388, 1335)]}],
        14: [{'ink': 'rose', 'seeds': [(507, 1362), (560, 1391), (485, 1352)], 'clip': [(462, 1335), (500, 1342), (540, 1372), (585, 1376), (590, 1402), (530, 1402), (490, 1376), (458, 1360)]}],
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
        10: [{'poly': [(610, 1290), (640, 1275), (690, 1290), (720, 1305), (745, 1320), (762, 1345), (770, 1380), (765, 1410), (745, 1440), (700, 1445), (660, 1430), (625, 1405), (610, 1380)]}],
        11: [{'line': [(680, 1294), (705, 1304), (728, 1317), (748, 1334), (763, 1356)], 'w': 9}],
    },
    'p20': {
        # gut = the yellow-green endoderm pencil; each part is the gut ink inside its own stretch of the tube
        5: [{'ink': 'gut', 'clip': [(350, 588), (452, 588), (452, 720), (350, 720)], 'all': True}],
        6: [{'ink': 'gut', 'clip': [(350, 720), (480, 720), (470, 790), (438, 815), (350, 815)], 'all': True}],
        7: [{'ink': 'gut', 'clip': [(438, 815), (470, 790), (492, 806), (487, 834), (491, 849), (492, 900), (468, 900), (474, 838)], 'all': True}],
        8: [{'ink': 'gut', 'clip': [(433, 834), (475, 834), (475, 871), (433, 871)], 'all': True}],
        9: [{'poly': [(494, 853), (499, 848), (506, 849), (509, 855), (507, 863), (500, 866), (494, 862)]}],
        11: [{'ink': 'gut', 'clip': [(487, 834), (514, 821), (531, 819), (544, 838), (544, 857), (510, 854), (509, 849), (491, 849)], 'all': True}],
        10: [{'poly': [(526, 812), (535, 797), (548, 794), (554, 802), (549, 818), (532, 823)]}],
        12: [{'ink': 'gut', 'clip': [(546, 822), (622, 822), (622, 866), (546, 866)], 'all': True}],
        13: [{'ink': 'gut', 'clip': [(548, 925), (600, 900), (700, 880), (800, 815), (850, 790), (895, 795), (895, 860), (870, 880), (860, 960), (830, 1080), (860, 1130), (860, 1160), (735, 1160), (735, 1000), (800, 900), (700, 975), (548, 975)], 'all': True, 'fill': False}],
        14: [{'ink': 'gut', 'clip': [(858, 806), (872, 799), (886, 802), (888, 820), (886, 840), (870, 838), (860, 822)], 'all': True}],
        16: [{'ink': 'gut', 'clip': [(905, 945), (1005, 945), (1005, 1095), (905, 1095)], 'all': True}],
        4: [{'poly': [(452, 386), (470, 384), (478, 392), (479, 405), (478, 425), (475, 438), (462, 442), (457, 436), (454, 420), (447, 410), (446, 395)]},
            {'poly': [(526, 381), (540, 378), (552, 382), (558, 392), (558, 410), (557, 428), (552, 438), (540, 442), (530, 438), (526, 425), (522, 410), (521, 393)]},
            {'poly': [(640, 399), (660, 396), (676, 399), (681, 410), (681, 430), (678, 445), (670, 460), (663, 470), (652, 477), (636, 479), (628, 474), (627, 460), (632, 450), (636, 435), (636, 410)]},
            {'poly': [(722, 421), (745, 418), (760, 422), (767, 432), (768, 450), (760, 462), (748, 475), (742, 495), (738, 508), (725, 512), (714, 507), (709, 492), (710, 470), (713, 448), (715, 430)]}],
    },
    'p21': {
        1: [{'ink': 'black', 'clip': [(510, 590), (650, 590), (650, 800), (510, 800)], 'seeds': [(560, 650)], 'fill': False}],
        2: [{'poly': [(575, 680), (584, 676), (592, 688), (596, 710), (600, 740), (600, 760), (590, 770), (580, 767), (576, 745), (573, 715), (572, 690)]}],
        3: [{'ink': 'dark', 'clip': [(355, 560), (400, 545), (470, 546), (530, 553), (542, 572), (540, 600), (538, 640), (530, 690), (500, 706), (440, 702), (390, 692), (362, 662), (352, 610)], 'all': True, 'close': 7,
             'sub': [{'ink': 'black', 'clip': [(510, 590), (650, 590), (650, 800), (510, 800)], 'seeds': [(560, 650)], 'grow': 1}]}],
        4: [{'poly': [(325, 600), (350, 601), (346, 620), (338, 643), (325, 668), (318, 688), (305, 690), (300, 668), (301, 630), (310, 612)]}],
        8: [{'poly': [(471, 951), (489, 931), (522, 914), (564, 912), (592, 922), (608, 939), (617, 969), (617, 992), (592, 989), (569, 975), (542, 960), (508, 954), (481, 953)]}],
        9: [{'line': [(425, 980), (453, 964), (481, 957), (508, 957), (542, 962), (564, 978), (586, 994), (608, 1004), (622, 1007)], 'w': 7}],
        7: [{'poly': [(425, 985), (453, 969), (481, 962), (508, 962), (542, 967), (564, 983), (586, 999), (608, 1009), (624, 1014), (629, 1025), (614, 1062), (595, 1119), (582, 1169), (570, 1212), (551, 1256), (520, 1294), (482, 1316), (445, 1312), (401, 1287), (364, 1237), (348, 1169), (348, 1106), (357, 1056), (382, 1012), (410, 990)]}],
        6: [{'poly': [(471, 951), (489, 931), (522, 914), (564, 912), (592, 922), (608, 939), (617, 969), (624, 1014), (629, 1025), (614, 1062), (595, 1119), (582, 1169), (570, 1212), (551, 1256), (520, 1294), (482, 1316), (445, 1312), (401, 1287), (364, 1237), (348, 1169), (348, 1106), (357, 1056), (382, 1012), (410, 990), (425, 982), (453, 966)]}],
    },
    'p22': {
        1: [{'ink': 'gut', 'clip': [(392, 1035), (482, 1035), (482, 1172), (392, 1172)], 'all': True}],
        2: [{'ink': 'dark', 'clip': [(570, 1060), (960, 1060), (960, 1215), (570, 1215)], 'seeds': [(757, 1132)], 'close': 5}],
        3: [{'ink': 'gut', 'clip': [(578, 1240), (625, 1240), (668, 1330), (668, 1366), (578, 1366)], 'all': True, 'min': 80}],
        4: [{'ink': 'gut', 'clip': [(688, 1338), (752, 1338), (752, 1386), (688, 1386)], 'all': True}],
    },
    'p23': {
        6: [{'ink': 'yellow', 'clip': [(608, 752), (662, 752), (662, 817), (608, 817)], 'all': True}],
        7: [{'ink': 'yellow', 'clip': [(597, 817), (616, 817), (615, 878), (597, 878)], 'all': True}],
        8: [{'ink': 'yellow', 'clip': [(616, 817), (634, 817), (630, 880), (628, 901), (600, 901), (600, 878), (615, 878)], 'all': True}],
        9: [{'ink': 'yellow', 'clip': [(630, 843), (652, 843), (652, 888), (630, 888)], 'all': True}],
        4: [{'ink': 'yellow', 'clip': [(652, 836), (724, 836), (724, 892), (652, 892)], 'all': True}],
        2: [{'ink': 'yellow', 'clip': [(598, 902), (645, 902), (645, 1006), (598, 1006)], 'seeds': [(622, 960), (615, 985)]}],
        1: [{'ink': 'gut', 'clip': [(545, 898), (700, 898), (700, 1080), (545, 1080)], 'all': True, 'fill': False, 'min': 80,
             'sub': [{'ink': 'yellow', 'clip': [(598, 902), (645, 902), (645, 1006), (598, 1006)], 'seeds': [(622, 960), (615, 985)]}]}],
        5: [{'ink': 'gut', 'clip': [(735, 985), (1310, 985), (1310, 1118), (735, 1118)], 'all': True, 'fill': False, 'min': 80,
             'sub': [{'poly': [(1050, 990), (1128, 990), (1128, 1078), (1050, 1078)]}]},
            {'ink': 'gut', 'clip': [(1110, 840), (1310, 840), (1310, 985), (1110, 985)], 'all': True, 'fill': False, 'min': 80}],
        11: [{'ink': 'gut', 'clip': [(1050, 990), (1128, 990), (1128, 1078), (1050, 1078)], 'all': True, 'min': 60}],
        10: [{'ink': 'gut', 'clip': [(1262, 862), (1280, 859), (1293, 861), (1303, 871), (1303, 889), (1295, 896), (1275, 893), (1264, 885)], 'all': True}],
    },
}
