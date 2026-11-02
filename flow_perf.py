import http.server, threading, os, pathlib, urllib.parse, json, time, random
from playwright.sync_api import sync_playwright
from PIL import Image
DIST=pathlib.Path('/home/claude/ironx/app/dist'); OUT='/home/claude/ironx/shots'
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory=str(DIST),**k)
    def translate_path(self,path):
        p=urllib.parse.urlparse(path).path; f=super().translate_path(path)
        if p=='/': return str(DIST/'index.html')
        if os.path.exists(f+'.html'): return f+'.html'
        return f
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8792),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
now=int(time.time()*1000); D=86400000; random.seed(3)
# --- séances de muscu sur 16 semaines, progression réaliste
hist=[]
plans=[("push","Push",[("bench",100,6),("incline-db",30,10),("lateral",12,15),("pushdown",30,12)]),("pull","Pull",[("row",80,8),("lat-pulldown",65,10),("curl-bar",35,10)]),("legs","Legs",[("squat",120,5),("rdl",100,8),("leg-ext",50,15)]),("lower-b","Bas B",[("deadlift",150,4),("hip-thrust",120,10)])]
for w in range(16,-1,-1):
    for di,(tid,name,exos) in enumerate(plans):
        t=now-w*7*D-(6-di*2)*D+9*3600000
        if t>now: continue
        prog=(16-w)/16
        sess={"id":f"s{w}{di}","templateId":tid,"name":name,"program":"PPL","startedAt":t,"endedAt":t+58*60000,"photo":"photo-bench","exos":[]}
        for (eid,kg,reps) in exos:
            k=round((kg*(0.88+0.14*prog))/2.5)*2.5
            sets=[{"kg":k,"reps":reps,"done":True,"rpe":8+(i==2)} for i in range(3)]
            if w==0 and eid in("bench","squat"): sets[2]["pr"]=True; sets[2]["kg"]=k+2.5
            sess["exos"].append({"exoId":eid,"rest":120,"sets":sets})
        hist.append(sess)
hist.sort(key=lambda s:-s["startedAt"])
workout={"active":None,"history":hist}
runs=[]
for w in range(10,-1,-1):
    t=now-w*7*D-3*D; dur=int(5000/1000*(300-w*2.5)); runs.append({"id":f"r{w}","sport":"course","at":t,"distance":5000,"duration":dur,"splits":[dur//5+random.randint(-6,6) for _ in range(5)],"hr":162,"kind":"endurance","name":"5 km"})
runs.append({"id":"r10k","sport":"course","at":now-20*D,"distance":10000,"duration":2900,"splits":[290]*10,"hr":168,"kind":"sortie longue","name":"10 km"})
runs.append({"id":"frac1","sport":"course","at":now-5*D,"distance":3200,"duration":1200,"kind":"fractionne","name":"8 × 400 m","hr":172,"intervals":{"n":8,"dist":400,"times":[88,87,88,89,88,90,89,91],"rest":90}})
runs.append({"id":"frac0","sport":"course","at":now-19*D,"distance":3200,"duration":1230,"kind":"fractionne","name":"8 × 400 m","hr":170,"intervals":{"n":8,"dist":400,"times":[92,91,91,93,92,94,93,95],"rest":90}})
hy=[{"id":"h1","at":now-45*D,"division":"open","stations":[252,190,258,352,270,140,281,418],"runs":[265,275,280,290,295,300,305,310],"roxzone":240,"hr":165,"name":"Simulation"},{"id":"h2","at":now-7*D,"division":"open","stations":[245,178,260,340,268,132,272,398],"runs":[260,268,272,281,286,290,296,302],"roxzone":228,"hr":166,"name":"Simulation"}]
street=[{"id":"t1","at":now-90*D,"move":"pullup","value":15,"variant":"strict"},{"id":"t2","at":now-30*D,"move":"pullup","value":17,"variant":"strict"},{"id":"t3","at":now-3*D,"move":"pullup","value":18,"variant":"strict"},{"id":"t4","at":now-3*D,"move":"dips","value":32,"variant":"strict"},{"id":"t5","at":now-10*D,"move":"frontlever","value":12,"variant":"straddle"},{"id":"t6","at":now-2*D,"move":"pullup-w","value":32.5,"variant":"strict"},{"id":"t7","at":now-40*D,"move":"muscleup","value":6,"variant":"strict"}]
wods=[{"id":"w1","at":now-12*D,"name":"Fran","format":"fortime","result":355,"rx":True,"movements":"21-15-9 thrusters · tractions","benchmark":True},{"id":"w2","at":now-2*D,"name":"Cindy","format":"amrap","result":18012,"rounds":18,"reps":12,"rx":True,"movements":"5 tractions, 10 pompes, 15 squats","cap":1200,"benchmark":True}]
def dk(t): import datetime; d=datetime.datetime.fromtimestamp(t/1000); return d.strftime('%Y-%m-%d')
well={dk(now-k*D):{"day":dk(now-k*D),"sleep":7.5-(k%3)*0.5,"hrRest":52+(k%4),"hrv":68-(k%5)*2,"soreness":2+(k%2),"energy":4,"stress":2,"motivation":5} for k in range(0,14)}
goals=[{"id":"g1","kind":"exo1rm","label":"120 kg au couché","ref":"bench","from":104,"to":120,"unit":"kg","deadline":now+60*D,"createdAt":now-60*D},{"id":"g2","kind":"run","label":"5 km sous 22:00","ref":"5000","from":1500,"to":1320,"unit":"s","deadline":now+40*D,"createdAt":now-50*D,"lower":True},{"id":"g3","kind":"hyrox","label":"Hyrox sous 1 h 20","from":5400,"to":4800,"unit":"s","deadline":now+30*D,"createdAt":now-45*D,"lower":True}]
blocks=[{"id":"b1","name":"Force","focus":"force","weeks":[{"label":"volume","intensity":[70,75],"volumeDelta":0},{"label":"volume","intensity":[75,80],"volumeDelta":10},{"label":"intensité","intensity":[80,85],"volumeDelta":0},{"label":"intensité","intensity":[82,87],"volumeDelta":-10},{"label":"pic","intensity":[88,95],"volumeDelta":-25},{"label":"décharge","intensity":[60,65],"volumeDelta":-40}],"startAt":now-22*D,"targetLabel":"Squat","targetValue":"150","active":True}]
chall=[{"id":"c1","title":"Bats ton 5 km","sub":"contre toi","kind":"self","from":1500,"to":1320,"cur":1365,"unit":"s","deadline":now+6*D,"lower":True,"createdAt":now-20*D}]
acts={"runs":runs,"hyrox":hy,"street":street,"wods":wods,"wellness":well,"goals":goals,"blocks":blocks,"challenges":chall}
profile={"prenom":"Hemaxi","pseudo":"hemaxi","sexe":0,"naissance":"1986-04-12","niveau":2,"unit":0,"taille":178,"poids":82,"goal":"muscle","poidsVise":86,"seances":4,"jours":[0,1,3,4],"duree":1,"creneau":2,"rappel":True,"disciplines":["bodybuilding","hyrox","course","street","crossfit","powerlifting"],"salle":None,"visibilite":0,"onboarded":True}
auth={"accounts":{"hemaxi@test.fr":{"email":"hemaxi@test.fr","hash":"x","profile":profile,"createdAt":now,"lastLogin":now}},"session":"hemaxi@test.fr","lastEmail":"hemaxi@test.fr"}
seed={"ironx.workout.v1":workout,"ironx.activities.v1":acts,"ironx.profile.v1":profile,"ironx.auth.v1":auth}
SCREENS=["perf","perf/record?id=bench","perf/classements","perf/muscles","perf/charge","perf/tendances","perf/objectifs","perf/endurance","perf/rapport","perf/comparer-hyrox","perf/radar-hyrox","perf/course","perf/fractionne","perf/street","perf/forme","perf/standards","perf/ameliorer","perf/regularite","perf/annee","perf/bloc","perf/semaine","perf/defis","perf/saisie-course","perf/saisie-hyrox","perf/saisie-street","perf/saisie-wod","seance/modes","seance/mode-course","seance/mode-hyrox","seance/mode-wod","seance/mode-street","seance/mode-power","seance"]
names=[]
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
    ctx.add_init_script("(()=>{const s="+json.dumps(seed)+"; if(!localStorage.getItem('seeded')){for(const k in s) localStorage.setItem(k, JSON.stringify(s[k])); localStorage.setItem('seeded','1');}})()")
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    for sc in SCREENS:
        n=sc.replace('/','_').replace('?id=','_'); pg.goto('http://127.0.0.1:8792/'+sc); pg.wait_for_timeout(1800); pg.screenshot(path=f'{OUT}/p_{n}.png', full_page=True); names.append(n)
    print('errors:', errs[:8]); b.close()
srv.shutdown()
# planches de 6, hauteur tronquée à 1400px (full page)
for k in range(0,len(names),6):
    grp=names[k:k+6]; ims=[]
    for n in grp:
        im=Image.open(f'{OUT}/p_{n}.png').convert('RGB'); im=im.resize((390, int(im.height*390/im.width))); ims.append(im.crop((0,0,390,min(im.height,1500))))
    sheet=Image.new('RGB',(len(ims)*400+10,1520),(30,30,40))
    for i,im in enumerate(ims): sheet.paste(im,(10+i*400,10))
    sheet.save(f'/home/claude/ironx/perf_{k//6+1}.png')
print('ok', len(names))
