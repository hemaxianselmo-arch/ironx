"""Parcours réel de la séance dans l'export web : démarre, valide des séries, record, termine."""
import http.server, threading, os, pathlib, sys
from playwright.sync_api import sync_playwright
DIST=pathlib.Path('/home/claude/ironx/app/dist'); OUT='/home/claude/ironx/shots'; os.makedirs(OUT,exist_ok=True)
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory=str(DIST),**k)
    def translate_path(self,path):
        import urllib.parse; p=urllib.parse.urlparse(path).path; f=super().translate_path(path)
        if p=='/': return str(DIST/'index.html')
        if os.path.exists(f+'.html'): return f+'.html'
        return f
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8766),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2); pg=ctx.new_page()
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto('http://127.0.0.1:8766/seance'); pg.wait_for_timeout(2500)
    pg.get_by_text('Démarrer').first.click(); pg.wait_for_timeout(1500); pg.screenshot(path=f'{OUT}/f1_encours.png')
    pg.get_by_text('Valider la série').click(); pg.wait_for_timeout(800); pg.screenshot(path=f'{OUT}/f2_repos.png')
    pg.get_by_text('Passer').click(); pg.wait_for_timeout(500)
    # ouvrir la saisie : toucher les gros chiffres
    pg.get_by_text('reps').first.click(); pg.wait_for_timeout(800); pg.screenshot(path=f'{OUT}/f3_saisie.png')
    # taper 112,5 kg × 3 → record
    for k in ['1','1','5']: pg.get_by_text(k, exact=True).last.click()
    pg.get_by_text('reps').last.click(); pg.get_by_text('4', exact=True).last.click(); pg.get_by_text('OK', exact=True).click(); pg.wait_for_timeout(1200); pg.screenshot(path=f'{OUT}/f4_record.png')
    pg.get_by_text('Continuer la séance').click(); pg.wait_for_timeout(800)
    pg.get_by_text('Terminer', exact=True).first.click(); pg.wait_for_timeout(1500); pg.screenshot(path=f'{OUT}/f5_resume.png')
    pg.get_by_text('Publier dans le fil').click(); pg.wait_for_timeout(1200); pg.screenshot(path=f'{OUT}/f6_seance.png')
    pg.get_by_text('Tout voir').click(); pg.wait_for_timeout(1000); pg.screenshot(path=f'{OUT}/f7_historique.png')
    print('errors:', errs[:5])
    b.close()
srv.shutdown()
from PIL import Image
ims=[Image.open(f'{OUT}/f{i}_{n}.png').convert('RGB').resize((390,844)) for i,n in enumerate(['encours','repos','saisie','record','resume','seance','historique'],1)]
sheet=Image.new('RGB',(len(ims)*400+10,864),(30,30,40))
for i,im in enumerate(ims): sheet.paste(im,(10+i*400,10))
sheet.save('/home/claude/ironx/flow2.png'); print('ok')
