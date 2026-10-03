import json
from pathlib import Path
r=Path(__file__).resolve().parents[1]
out=[]
for var,file in [('HTML','index.html'),('APP','app.js'),('CSS','style.css')]:out.append('const '+var+'='+json.dumps((r/'source'/file).read_text())+';')
out.append('const CATALOG='+(r/'source/catalog.json').read_text()+';')
out.append('const IMAGES='+(r/'source/images.json').read_text()+';')
out.append((r/'source/server.js').read_text())
(r/'worker/index.js').write_text('\n'.join(out))
print('Worker assembled with all menu records, photos, interface and server-only AI support.')
