import http.server, threading, os, pathlib, urllib.parse
from playwright.sync_api import sync_playwright
DIST=pathlib.Path('/home/claude/ironx/app/dist'); OUT='/home/claude/ironx/shots'
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory=str(DIST),**k)
    def translate_path(self,path):
        p=urllib.parse.urlparse(path).path; f=super().translate_path(path)
        if p=='/': return str(DIST/'index.html')
        if os.path.exists(f+'.html'): return f+'.html'
        return f
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8779),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
names=[]
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2); pg=ctx.new_page()
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=f'{OUT}/h_{n}.png'); names.append(n)
    pg.goto('http://127.0.0.1:8779/fil'); pg.wait_for_timeout(2500); shot('fil')
    pg.get_by_text('Bravo', exact=True).first.click(); pg.wait_for_timeout(300)
    pg.get_by_text('Bravo !').first.click()  # toggle back? no: keep; click comments via count
    pg.get_by_text('Bravo', exact=True).first.click(); shot('fil_bravo')
    pg.get_by_text('4', exact=True).first.click(); shot('commentaires')
    pg.get_by_placeholder('').first.fill('Monstre 💪') if pg.get_by_placeholder('').count() else None
    pg.keyboard.press('Enter'); shot('commentaire_envoye')
    pg.go_back(); pg.wait_for_timeout(800)
    pg.get_by_text('Partager').first.click(); shot('partager')
    pg.get_by_text('Copier').click(); pg.wait_for_timeout(600)
    # créer
    pg.goto('http://127.0.0.1:8779/fil/creer'); pg.wait_for_timeout(1500); shot('creer')
    pg.locator('img').nth(0).click(); pg.wait_for_timeout(300); pg.get_by_text('Suivant').click(); shot('editeur')
    pg.get_by_text('Iron', exact=True).first.click(force=True); pg.get_by_text('Musique').click(); pg.wait_for_timeout(400); pg.get_by_text('Night Drive', exact=True).first.click(force=True); shot('editeur_son')
    pg.get_by_text('Suivant').last.click(); shot('publier')
    pg.get_by_text('#ironx').click(); pg.get_by_text('Publier', exact=True).last.click(); shot('fil_mon_post')
    pg.goto('http://127.0.0.1:8779/fil/story'); shot('story')
    pg.goto('http://127.0.0.1:8779/fil/profil'); shot('profil')
    print('errors:', errs[:5]); b.close()
srv.shutdown()
from PIL import Image
ims=[Image.open(f'{OUT}/h_{n}.png').convert('RGB').resize((390,844)) for n in names]
sheet=Image.new('RGB',(len(ims)*400+10,864),(30,30,40))
for i,im in enumerate(ims): sheet.paste(im,(10+i*400,10))
sheet.save('/home/claude/ironx/module_fil.png'); print('ok', names)
