"""Rend les écrans de l'app (export web) à 390x844 et les place à côté des maquettes."""
import sys, subprocess, time, http.server, threading, functools, pathlib, os
from playwright.sync_api import sync_playwright
from PIL import Image
DIST=pathlib.Path('/home/claude/ironx/app/dist'); MOCK=pathlib.Path('/tmp/claude-0/-home-claude/0926393a-b6e6-5c7f-9759-56e68812d303/scratchpad')
pairs=[a.split('=') for a in sys.argv[2:]]  # route=MockName
out=sys.argv[1]
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory=str(DIST),**k)
    def translate_path(self,path):
        import urllib.parse; p=urllib.parse.urlparse(path).path
        f=super().translate_path(path)
        if p=='/' : return str(DIST/'index.html')
        if not os.path.exists(f) and os.path.exists(f+'.html'): return f+'.html'
        return f
    def log_message(self,*a): pass
h=H
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8765),h); threading.Thread(target=srv.serve_forever,daemon=True).start()
shots=[]
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
    for route,mock in pairs:
        pg=ctx.new_page(); pg.goto(f'http://127.0.0.1:8765{route}'); pg.wait_for_timeout(2500)
        f=f'/home/claude/ironx/shots/app_{mock}.png'; os.makedirs('/home/claude/ironx/shots',exist_ok=True); pg.screenshot(path=f); shots.append((f,mock)); pg.close()
    b.close()
srv.shutdown()
# maquette : rend.py produit des planches ; on rend chaque maquette seule
tiles=[]
for f,mock in shots:
    subprocess.run(['python3','rend.py',f'/home/claude/ironx/shots/mock_{mock}.png',mock],cwd=MOCK,check=True)
    m=Image.open(f'/home/claude/ironx/shots/mock_{mock}.png').convert('RGB'); a=Image.open(f).convert('RGB').resize((390,844))
    m=m.crop((24,20,24+390,20+844)) if m.size[0]>400 else m
    tiles.append((m,a))
W=(390*2+30)*len(tiles)+40; sheet=Image.new('RGB',(W,884),(30,30,40))
x=20
for m,a in tiles:
    sheet.paste(m,(x,20)); sheet.paste(a,(x+400,20)); x+=390*2+30
sheet.save(out); print('ok',out)
