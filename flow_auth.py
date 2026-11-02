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
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8782),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
names=[]
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2); pg=ctx.new_page()
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=f'{OUT}/a_{n}.png'); names.append(n)
    U='http://127.0.0.1:8782'
    pg.goto(U+'/'); pg.wait_for_timeout(2500)
    pg.get_by_text('Créer un compte').click(); pg.wait_for_timeout(800)
    pg.get_by_text('Créer mon compte').click(); shot('compte_erreur')
    pg.get_by_placeholder('prenom@exemple.fr').fill('hemaxi@test.fr'); pg.locator('input[type=password]').fill('ironx123'); pg.get_by_text('voir').click(); shot('compte_rempli')
    pg.get_by_text('Créer mon compte').click(); shot('disciplines')
    # aller au profil via l'accueil : on simule onboarding terminé
    pg.goto(U+'/onboarding/plan'); pg.wait_for_timeout(1500); pg.get_by_text("C'est parti").click(); shot('accueil')
    pg.locator('text=IX').first.click() if pg.locator('text=IX').count() else pg.locator('text=HE').first.click()
    pg.wait_for_timeout(500)
    if 'profil' not in pg.url: pg.goto(U+'/profil')
    shot('profil')
    pg.get_by_text('Se déconnecter').click(); shot('bienvenue')
    pg.get_by_text('Se connecter').first.click(); shot('connexion')
    pg.locator('input[type=email]').fill('hemaxi@test.fr'); pg.locator('input[type=password]').fill('mauvais'); pg.get_by_text('Se connecter').last.click(); shot('connexion_erreur')
    pg.locator('input[type=password]').fill('ironx123'); pg.get_by_text('Se connecter').last.click(); shot('accueil_reconnecte')
    # onglets du bas
    pg.mouse.click(270,795); shot('onglet_nutrition')
    pg.mouse.click(345,795); shot('onglet_salle')
    pg.mouse.click(120,795); shot('onglet_fil')
    print('errors:', errs[:5]); b.close()
srv.shutdown()
from PIL import Image
ims=[Image.open(f'{OUT}/a_{n}.png').convert('RGB').resize((390,844)) for n in names]
sheet=Image.new('RGB',(len(ims)*400+10,864),(30,30,40))
for i,im in enumerate(ims): sheet.paste(im,(10+i*400,10))
sheet.save('/home/claude/ironx/module_compte.png'); print('ok', names)
