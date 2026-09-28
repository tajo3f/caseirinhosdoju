#!/usr/bin/env node
/**
 * Caseirinhos do Ju — build estático para Vercel / GitHub / Gemini.
 * Apenas Node.js, sem Python e sem pacotes npm externos.
 * Altere preços em data/precos.json, catálogo em data/catalog.json, CSS em assets/css/.
 * `node scripts/build.mjs` regenera o catálogo, páginas de produtos, SEO, cache e dist/.
 */
import { readFile, writeFile, mkdir, rm, cp, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SOURCE_PRODUCTS = path.join(ROOT, 'produtos');
const WEBSITE = String(process.env.SITE_URL || 'https://caseirinhosdoju.com.br/').replace(/\/*$/, '/');
const WHATSAPP = '5527996511588';
const COMPANY = 'Caseirinhos do Ju';
const ENCODING = 'utf8';
const f = (...parts) => path.join(ROOT, ...parts);
const url = (relative) => new URL(relative, WEBSITE).href;
const escapeHTML = (input) => String(input ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
const jsJSON = (input) => JSON.stringify(input).replace(/</g, '\\u003c');
const money = (price) => `R$ ${Number(price).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
const formattedPrice = (price) => Number(price).toFixed(2);
const whatsappLink = (message) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
const read = async (...parts) => readFile(f(...parts), ENCODING);
const write = async (relative, value) => {const target = f(relative);await mkdir(path.dirname(target), {recursive:true});await writeFile(target,value,ENCODING);};
const assert = (condition, message) => {if(!condition) throw new Error(message);};
const changeOnce = (input, match, replacement, label) => {
  let n = 0;
  const value = input.replace(match, (...args) => {n++;return typeof replacement === 'function' ? replacement(...args) : replacement;});
  assert(n === 1, `Não foi possível atualizar ${label}: ${n} ocorrências`);
  return value;
};

async function catalog() {
  const payload = JSON.parse(await read('data','catalog.json'));
  const prices = JSON.parse(await read('data','precos.json'));
  assert(Array.isArray(payload.products) && payload.products.length > 0, 'Catálogo vazio ou inválido');
  const ids = payload.products.map(x=>x.id), slugs = payload.products.map(x=>x.slug);
  assert(new Set(ids).size === ids.length, 'IDs de produtos duplicados');
  assert(new Set(slugs).size === slugs.length, 'URLs de produtos duplicadas');
  const bySlug = new Map(payload.products.map(x=>[x.slug,x]));
  for (const [slug, variants] of Object.entries(prices)) {
    // Keys beginning with _ are an informational price table (not a purchase option).
    if (slug.startsWith('_')) continue;
    assert(bySlug.has(slug), `Preço aponta para produto inexistente: ${slug}`);
    assert(variants && typeof variants === 'object' && !Array.isArray(variants) && Object.keys(variants).length,'Preço inválido: '+slug);
    const product = bySlug.get(slug);
    product.options = Object.entries(variants).map(([label, raw]) => {
      assert(typeof raw==='number' && Number.isFinite(raw) && raw>0,`Preço inválido: ${slug}/${label}`);
      return {label,price:raw};
    });
    delete product.consultPrice;
  }
  for (const product of payload.products) {
    assert(typeof product.image === 'string' && product.image.startsWith('assets/images/'), `Imagem inválida para ${product.slug}`);
    assert((await stat(f(product.image))).isFile(),`Imagem ausente: ${product.image}`);
    assert(product.consultPrice || (Array.isArray(product.options) && product.options.length > 0), `Produto sem opção: ${product.slug}`);
  }
  return payload;
}

function renderProduct(product, styles) {
  const name = escapeHTML(product.name), slug = escapeHTML(product.slug);
  const description = escapeHTML(product.description), category = escapeHTML(product.category);
  const availability = escapeHTML(product.availability || '');
  const shelf = Number(product.shelfLifeDays || 0);
  const restricted = product.category==='Esfirras' || ['pao-caseiro-doce','pao-caseiro-sal-cebola'].includes(product.slug);
  const consult = Boolean(product.consultPrice);
  const pageUrl = url(`produtos/${product.slug}/`);
  const imageUrl = url(product.image);
  const options = product.options || [];
  const firstPrice = options.length ? Math.min(...options.map(x=>x.price)) : 0;
  const priceHTML = consult ? '<span class="price-consult">Valor sob consulta</span>' :
    (options.length>1 ? '<span class="price-from">a partir de</span>' : '') + `<strong>${money(firstPrice)}</strong>`;
  const list = consult ? '<li>Consulte valor e disponibilidade pelo WhatsApp.</li>' :
    options.map(opt=>`<li><span>${escapeHTML(opt.label)}</span><strong>${money(opt.price)}</strong></li>`).join('');
  const availableHTML = availability ? `<div class="product-page__availability"><span aria-hidden="true"></span><div><small>Disponibilidade</small><strong>${availability}</strong></div></div>` : '';
  const shelfHTML = shelf>0 ? `<p class="product-page__shelf"><strong>Validade: ${shelf} dias</strong> · verifique também a data e as orientações na embalagem.</p>` : '';
  const flavors = product.flavors || [];
  const specialHTML = product.purchaseNote ? `<p class="product-page__shelf">${escapeHTML(product.purchaseNote)}</p>` : '';
  const illustrativeHTML = product.imageIllustrative ? '<p class="product-page__shelf">Imagem ilustrativa · foto real em breve.</p>' : '';
  const imageNoteHTML = product.imageNote ? `<p class="product-page__shelf">${escapeHTML(product.imageNote)}</p>` : '';
  const flavorsHTML = flavors.length ? `<div class="flavors"><h2>Sabores disponíveis</h2><ul>${flavors.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></div>` : '';
  let picker = '';
  if (!consult && options.length) {
    picker = '<div class="product-page__picker"><label for="detailVariant">Tamanho / combo<select id="detailVariant">' +
      options.map(opt=>`<option value="${escapeHTML(opt.label)}" data-price="${formattedPrice(opt.price)}">${escapeHTML(opt.label)} · ${money(opt.price)}</option>`).join('') + '</select></label>';
    if (flavors.length) picker += '<label for="detailFlavor">Sabor<select id="detailFlavor">' + flavors.map(flavor=>`<option value="${escapeHTML(flavor)}">${escapeHTML(flavor)}</option>`).join('') + '</select></label>';
    picker += '<label for="detailQuantity">Quantidade<input id="detailQuantity" type="number" min="1" max="99" step="1" inputmode="numeric" value="1"></label></div>';
  }
  const orderUrl = whatsappLink(`Olá! Vim pelo site do ${COMPANY} e gostaria de pedir ${product.name}. Aguardo confirmação de disponibilidade.`);
  const enquiryUrl = whatsappLink(`Olá! Vim pelo site do ${COMPANY} e gostaria de SOLICITAR UMA ENCOMENDA de ${product.name} para uma data a combinar. Sei que não é pedido imediato; aguardo confirmação.`);
  const type = product.category==='Esfirras' ? 'esfirra' : restricted ? 'bread' : consult ? 'consult' : 'regular';
  const data = `id="productOrderAction" data-product-type="${type}" data-product-name="${name}" data-order-url="${escapeHTML(orderUrl)}" data-enquiry-url="${escapeHTML(enquiryUrl)}"`;
  const action = restricted ? `<a class="btn btn--primary product-page__action-pending" ${data} aria-disabled="true">Verificando disponibilidade…</a>` :
    `<a class="btn btn--primary" ${data} href="${escapeHTML(orderUrl)}" target="_blank" rel="noopener noreferrer">${consult?'Consultar pelo WhatsApp →':'Pedir pelo WhatsApp →'}</a>`;
  const offers = consult ? [] : options.map(opt=>({'@type':'Offer',priceCurrency:'BRL',price:formattedPrice(opt.price),description:opt.label||product.name,url:pageUrl}));
  const productSchema = {'@context':'https://schema.org','@type':'Product',name:product.name,description:product.description,image:imageUrl,brand:{'@type':'Brand',name:COMPANY},category:product.category,url:pageUrl};
  if (offers.length) productSchema.offers = offers;
  const breadcrumb = {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:COMPANY,item:WEBSITE},{'@type':'ListItem',position:2,name:product.name,item:pageUrl}]};
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#6a2b12">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>${name} | ${COMPANY}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="product">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${COMPANY}">
  <meta property="og:title" content="${name} | ${COMPANY}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="../../assets/icons/icon-32.png">
  <link rel="stylesheet" href="../../assets/css/style.css">
  <link rel="stylesheet" href="../../assets/css/vfx.css">
  <link rel="stylesheet" href="../../assets/css/upgrade.css">
  <style>${styles}</style>
  <link rel="stylesheet" href="../../assets/css/v12.css">
  <link rel="stylesheet" href="../../assets/css/v14.css">
  <link rel="stylesheet" href="../../assets/css/v15.css">
  <link rel="stylesheet" href="../../assets/css/v16.css">
  <link rel="stylesheet" href="../../assets/css/v18.css">
  <script type="application/ld+json">${jsJSON([productSchema,breadcrumb])}</script>
</head>
<body class="product-page">
  <header class="product-page__header"><div class="shell"><a class="product-page__brand" href="../../index.html"><img src="../../assets/images/logo.webp" alt="${COMPANY}" width="54" height="54"><span>${COMPANY}</span></a><span class="product-page__promise" aria-label="Pedido simples pelo WhatsApp"><span>atendimento</span><strong>Escolha com facilidade</strong></span><a class="product-page__back" href="../../index.html#cardapio">← Voltar ao cardápio</a></div></header>
  <main class="product-page__main"><div class="shell product-page__grid">
    <figure class="product-page__media" data-product-slug="${slug}" data-vfx-glare><img src="../../${escapeHTML(product.image)}" alt="${name} - ${COMPANY}" width="1000" height="1000" fetchpriority="high"></figure>
    <section class="product-page__copy"><span class="kicker">${category}</span><h1>${name}</h1><p>${description}</p>${availableHTML}${shelfHTML}${specialHTML}${illustrativeHTML}${imageNoteHTML}<div class="product-page__price">${priceHTML}</div><ul class="product-page__options">${list}</ul>${flavorsHTML}${picker}<div id="productLiveStatus" class="product-page__live" role="status" ${restricted?'':'hidden'}>${restricted?'Verificando horário de Brasília…':''}</div><div class="product-page__actions">${action}<a class="btn btn--secondary" href="../../index.html#cardapio">Continuar escolhendo</a></div><p class="product-page__note">A disponibilidade, retirada, entrega e eventual taxa são confirmadas diretamente pelo atendimento no WhatsApp.</p></section>
  </div></main>
  <script src="../../assets/js/availability.js" defer></script>
  <script src="../../assets/js/product-page.js" defer></script>
  <script src="../../assets/js/vfx.js" defer></script>
</body>
</html>`;
}

async function build() {
  const payload = await catalog();
  const css = await read('templates','product-style.css');
  const script = '// AUTO-GENERATED. NÃO EDITE ESTE ARQUIVO.\n// Fonte: data/catalog.json + data/precos.json\nwindow.CASEIRINHOS_CATALOG = ' + jsJSON(payload) + ';\n';
  await write('assets/js/catalog-data.js',script);
  await rm(SOURCE_PRODUCTS,{recursive:true,force:true});
  await mkdir(SOURCE_PRODUCTS,{recursive:true});
  for (const product of payload.products) {
    await write(`produtos/${product.slug}/index.html`, renderProduct(product,css));
  }
  const legacy = {'casadinho-maracuja-puro':'amanteigado-maracuja-puro','casadinho-maracuja-chocolate':'amanteigado-maracuja-chocolate'};
  for (const [oldSlug, newSlug] of Object.entries(legacy)) {
    const destination = `../${newSlug}/`;
    await write(`produtos/${oldSlug}/index.html`,`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${url(`produtos/${newSlug}/`)}"><meta http-equiv="refresh" content="0;url=${destination}"><title>Produto atualizado</title></head><body><p>O nome do produto foi atualizado. <a href="${destination}">Acessar produto correto</a>.</p></body></html>`);
  }
  await rm(DIST,{recursive:true,force:true});
  await mkdir(DIST,{recursive:true});
  for(const filename of ['index.html','404.html','offline.html','manifest.webmanifest','sw.js','.nojekyll']) await cp(f(filename),path.join(DIST,filename));
  await cp(f('assets'),path.join(DIST,'assets'),{recursive:true,filter:(entry)=>!entry.startsWith(f('assets','source'))});
  await cp(SOURCE_PRODUCTS,path.join(DIST,'produtos'),{recursive:true});
  let html = await read('index.html');
  html = changeOnce(html,/<link rel="canonical" href="[^"]+">/,`<link rel="canonical" href="${WEBSITE}">`,'canonical');
  if (/<meta property="og:url"/.test(html)) html=changeOnce(html,/<meta property="og:url" content="[^"]+">/,`<meta property="og:url" content="${WEBSITE}">`,'og:url');
  else html=changeOnce(html,/<meta property="og:type" content="website">/,`<meta property="og:type" content="website">\n  <meta property="og:url" content="${WEBSITE}">`,'og:url');
  html=changeOnce(html,/content="(?:https?:\/\/[^" ]+\/)?assets\/images\/og-caseirinhos\.jpg"/,`content="${url('assets/images/og-caseirinhos.jpg')}"`,'og:image');
  const combo = payload.products.find(item=>item.id===11), drink=payload.products.find(item=>item.id===12), sweets=payload.products.find(item=>item.id===13);
  const prices = JSON.parse(await read('data','precos.json'));
  assert(combo?.options?.length===4 && drink?.options?.length===1 && sweets?.options?.length===3,'Cards de preço sem produtos vinculados');
  for(const [index,opt] of combo.options.entries()) {
    const pattern = new RegExp(`(<article[^>]*data-combo-id="11"[^>]*data-option-index="${index}"[^>]*>[^\\n]*?<strong[^>]*>)R\\$[^<]+(</strong>)`);
    html=changeOnce(html,pattern,(_,head,tail)=>`${head}${money(opt.price)}${tail}`,`combo ${index}`);
  }
  html=changeOnce(html,/(<div class="drink-card__buy"><strong>)R\$[^<]+(<\/strong>)/,(_,head,tail)=>`${head}${money(drink.options[0].price)}${tail}`,'bebida');
  // One definitive combo price table feeds both online cards and the informative direct-sale list.
  for (const [index, units] of [6, 12, 15, 18].entries()) {
    const pattern = new RegExp(`(<strong data-street-units="${units}">)R[$][^<]+(</strong>)`);
    html=changeOnce(html,pattern,(_,head,tail)=>`${head}${money(combo.options[index].price)}${tail}`,`tabela de esfirras ${units} unidades`);
  }
  for (const option of sweets.options) {
    const label=option.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(<strong data-sweet-flavor="${label}">)R\\$[^<]+(</strong>)`);
    html=changeOnce(html,pattern,(_,head,tail)=>`${head}${money(option.price)}${tail}`,`esfirra doce ${option.label}`);
  }
  await writeFile(path.join(DIST,'index.html'),html,ENCODING);
  let notFound=await read('404.html');
  notFound=notFound.replace('src="assets/images/logo.webp"',`src="${url('assets/images/logo.webp')}"`).replace('href="./"',`href="${WEBSITE}"`);
  await writeFile(path.join(DIST,'404.html'),notFound,ENCODING);
  const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',`  <url><loc>${WEBSITE}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,...payload.products.map(item=>`  <url><loc>${url(`produtos/${item.slug}/`)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`),'</urlset>'].join('\n')+'\n';
  await writeFile(path.join(DIST,'sitemap.xml'),sitemap,ENCODING);
  await writeFile(path.join(DIST,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${url('sitemap.xml')}\n`,ENCODING);
  // Service worker cache key includes all generated content, scripts and images.
  const digest = createHash('sha256');
  const core = ['index.html','assets/js/catalog-data.js','assets/js/app.js','assets/js/availability.js','assets/js/product-page.js','assets/js/v14-ui.js','assets/js/v15-ui.js','assets/js/v16-ui.js','assets/css/style.css','assets/css/upgrade.css','assets/css/v12.css','assets/css/v13.css','assets/css/v14.css','assets/css/v15.css','assets/css/v16.css','assets/css/v18.css','assets/css/v18-2.css'];
  for(const name of core) {digest.update(name);digest.update(await readFile(path.join(DIST,name)));}
  for (const folder of ['images', 'icons']) {
    for (const name of (await readdir(path.join(DIST,'assets',folder))).sort()) {
      const file=path.join(DIST,'assets',folder,name);
      if ((await stat(file)).isFile()) {digest.update(`assets/${folder}/${name}`);digest.update(await readFile(file));}
    }
  }
  const cacheId=`caseirinhos-v18-2-${digest.digest('hex').slice(0,12)}`;
  const worker=await readFile(path.join(DIST,'sw.js'),ENCODING);
  assert(/const CACHE = "[^"]+";/.test(worker),'Service worker sem identificador de cache');
  await writeFile(path.join(DIST,'sw.js'),worker.replace(/const CACHE = "[^"]+";/,`const CACHE = "${cacheId}";`),ENCODING);
  console.log(`OK: ${payload.products.length} produtos, preços atualizados, SEO e cache ${cacheId}. Publicação em dist/ (Node.js, sem Python).`);
}

build().catch(error=>{console.error(`FALHA NO BUILD: ${error.message}`);process.exitCode=1;});
