import http.server, threading, os, pathlib, urllib.parse
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
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8791),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
names=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2).new_page()
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    def shot(n): pg.wait_for_timeout(800); pg.screenshot(path=f'{OUT}/x_{n}.png'); names.append(n)
    U='http://127.0.0.1:8791'
    pg.goto(U+'/seance/bibliotheque'); pg.wait_for_timeout(2000); pg.locator('input').first.fill('Hac'); pg.get_by_text('Jambes').click(); shot('recherche')
    pg.goto(U+'/seance/editeur?id=push'); pg.wait_for_timeout(2000); shot('editeur')
    pg.get_by_text('Normale').first.click(); pg.get_by_text('Échauffement', exact=True).first.click(); pg.get_by_text('Enchaîner avec le suivant').first.click(); shot('editeur_types')
    pg.goto(U+'/seance'); pg.wait_for_timeout(1500); pg.get_by_text('Démarrer').first.click(); pg.wait_for_timeout(1200)
    pg.get_by_text('+2,5').click(); pg.get_by_text('+2,5').click(); shot('plus25_sans_valider')
    pg.get_by_text('RPE', exact=False).first.click(); shot('rpe_panel'); pg.get_by_text('8,5', exact=True).click()
    pg.get_by_text('Échec').first.click(); pg.get_by_text('Repos', exact=False).first.click(); shot('repos_panel'); pg.get_by_text('2:00', exact=True).first.click()
    pg.get_by_text('Valider la série').click(); pg.wait_for_timeout(600); pg.get_by_text('Passer').click(); pg.wait_for_timeout(400)
    pg.get_by_text('Série 1', exact=False).first.click(); shot('modifier_serie_validee')
    for k in ['1','0','0']: pg.get_by_text(k, exact=True).last.click()
    pg.get_by_text('OK', exact=True).click(); shot('serie_modifiee')
    print('errors:', errs[:5]); b.close()
srv.shutdown()
ims=[Image.open(f'{OUT}/x_{n}.png').convert('RGB').resize((390,844)) for n in names]
sheet=Image.new('RGB',(len(ims)*400+10,864),(30,30,40))
for i,im in enumerate(ims): sheet.paste(im,(10+i*400,10))
sheet.save('/home/claude/ironx/fix_seance.png'); print('ok', names)
