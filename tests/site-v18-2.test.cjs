const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const home=read('dist/index.html');
const catalog=JSON.parse(read('data/catalog.json'));
const prices=JSON.parse(read('data/precos.json'));
const combo=catalog.products.find(p=>p.slug==='combos-esfirras-abertas');
assert.equal(catalog.products.length,13);
assert.equal(catalog.version,'18.2');
assert.deepEqual(Object.values(prices['combos-esfirras-abertas']),[34,62,75,88]);
assert.deepEqual(Object.values(prices['esfirras-doces']),[55,55,50]);
assert.equal(combo.image,'assets/images/esfirras-bandejas-destaque.webp');
assert.match(combo.imageNote,/Imagem de apresentação/);
const photos=['esfirras-bandejas.webp','esfirras-bandeja-superior.webp','esfirras-bandeja-inferior.webp','esfirras-bandejas-destaque.webp'];
for (const photo of photos) {
 assert(exists(`assets/images/${photo}`),'Source photo missing '+photo);
 assert(exists(`dist/assets/images/${photo}`),'Published photo missing '+photo);
 assert(fs.statSync(path.join(root,'dist/assets/images',photo)).size>20000,'Photo unexpectedly small '+photo);
}
for (const icon of ['seta-topo.png','whatsapp-verde.png']) {
 assert(exists(`assets/icons/${icon}`),'Source icon missing '+icon);
 assert(exists(`dist/assets/icons/${icon}`),'Published icon missing '+icon);
 assert(home.includes(`assets/icons/${icon}`),'Floating icon not visible in markup '+icon);
}
assert.match(home,/<img class="float-top__image"[^>]+src="assets\/icons\/seta-topo\.png"/);
assert.match(home,/<img class="float-wa__image"[^>]+src="assets\/icons\/whatsapp-verde\.png"/);
assert.match(home,/aria-label="Voltar ao topo"/);
assert.match(home,/aria-label="Conversar com Caseirinhos do Ju no WhatsApp"/);
assert.match(home,/class="esfirra-gallery reveal"/);
assert.match(home,/assets\/images\/esfirras-bandejas\.webp/);
assert.match(home,/assets\/css\/v18-2\.css/);
for (const photo of ['esfirras-bandeja-superior.webp','esfirras-bandejas-destaque.webp','esfirras-bandeja-inferior.webp'])assert(home.includes(photo));
assert.match(home,/data-option-index="0"[^\n]+R\$ 34,00/);
assert.match(home,/data-option-index="3"[^\n]+R\$ 88,00/);
const detail=read('dist/produtos/combos-esfirras-abertas/index.html');
assert(detail.includes('esfirras-bandejas-destaque.webp'));
assert(detail.includes('Imagem de apresentação das bandejas'));
assert(!exists('dist/assets/source'), 'Original photo files must not be published');
const sw=read('dist/sw.js');assert.match(sw,/caseirinhos-v18-2-[0-9a-f]{12}/);
assert(sw.includes('assets/css/v18-2.css'));
assert(sw.includes('assets/icons/seta-topo.png'));
assert(sw.includes('assets/icons/whatsapp-verde.png'));
assert(!read('vercel.json').includes('python'));
console.log('PASS: V18.2 images, both supplied icons, prices, SEO route and Node build');
