const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const file=p=>fs.readFileSync(path.join(root,p),'utf8');
const prices=JSON.parse(file('data/precos.json'));
const source=JSON.parse(file('data/catalog.json'));
assert.equal(source.products.length,13);
assert.equal(source.products.find(x=>x.slug==='esfirras-doces').imageIllustrative,true);
assert.equal(source.products.find(x=>x.slug==='esfirras-doces').options.length,3);
assert.deepEqual(Object.values(prices['combos-esfirras-abertas']),[34,62,75,88]);
assert.equal('_venda_direta_esfirras' in prices,false,'Prices must not be duplicated');
assert.deepEqual(Object.values(prices['esfirras-doces']),[55,55,50]);
assert.equal(fs.existsSync(path.join(root,'ferramentas','editor-precos.html')),true);
assert.equal(fs.existsSync(path.join(dist,'ferramentas')),false);
assert(!file('vercel.json').includes('python'));
assert(!file('.github/workflows/pages.yml').includes('python'));
assert(fs.existsSync(path.join(dist,'produtos','esfirras-doces','index.html')));
assert.equal((file('dist/sitemap.xml').match(/<loc>/g)||[]).length,14);
const home=file('dist/index.html');
assert.match(home,/<strong data-street-units="6">R\$ 34,00<\/strong>/);
assert.match(home,/<strong data-sweet-flavor="Romeu e Julieta">R\$ 50,00<\/strong>/);
assert.match(home,/data-option-index="3"[^\n]+R\$ 88,00/);
for(const [index,units] of [6,12,15,18].entries()) {
  const price=prices['combos-esfirras-abertas'][Object.keys(prices['combos-esfirras-abertas'])[index]];
  const priceText='R$ '+price.toFixed(2).replace('.',',');
  assert.ok(home.includes(`data-street-units="${units}">${priceText}</strong>`),'Direct and online prices differ: '+units);
}
const wa=file('assets/js/app.js');assert.match(wa,/Esfirras doces: confirmar a quantidade/);
assert.match(file('assets/js/availability.js'),/18 \* 60 \+ 30/);
const generated=JSON.parse(file('dist/assets/js/catalog-data.js').replace(/^.*?=\s*/s,'').replace(/;\s*$/,''));
assert.equal(generated.products.length,13);
assert(!generated.products.some(x=>x.slug.startsWith('_')));
const pages=['index.html',...source.products.map(x=>`produtos/${x.slug}/index.html`)];
for(const page of pages){
  const html=file(`dist/${page}`);
  for(const result of html.matchAll(/\b(?:src|href)="([^"#?]+)"/g)){
    const link=result[1];
    if(/^(?:https?:|mailto:|tel:|data:|\/\/)/.test(link))continue;
    const full=path.resolve(path.dirname(path.join(dist,page)),link);
    assert(full.startsWith(dist+path.sep) || full===dist, `${page} escapes document root: ${link}`);
    assert(fs.existsSync(full),`${page}: missing ${link}`);
  }
  for(const schema of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>JSON.parse(schema[1]),`${page} invalid SEO JSON`);
}
for(const asset of fs.readdirSync(path.join(root,'assets','js')))if(asset.endsWith('.js'))execFileSync(process.execPath,['--check',path.join(root,'assets','js',asset)]);
execFileSync(process.execPath,['--check',path.join(root,'sw.js')]);
execFileSync(process.execPath,['--check',path.join(root,'scripts','build.mjs')]);
assert(!fs.readdirSync(path.join(root,'scripts')).some(x=>x.endsWith('.py')));
console.log(`PASS: ${source.products.length} products, ${pages.length} pages, links, JS, SEO and no Python`);
