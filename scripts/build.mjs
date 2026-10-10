#!/usr/bin/env node
/**
 * Caseirinhos do Ju — V23 build
 * ---------------------------------------------------------------------------
 * HTML + CSS + JavaScript puro. Node.js apenas para build. Sem dependências.
 *
 *   node scripts/build.mjs              -> gera dist/
 *   node scripts/build.mjs --emit-root  -> gera dist/ e sincroniza artefatos
 *                                          gerados na raiz (catálogo + páginas)
 *
 * Fonte central de dados:
 *   data/precos.json   (preços)
 *   data/catalog.json  (produtos, imagens, sabores, redirects)
 */
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = join(ROOT, "dist");
const EMIT_ROOT = process.argv.includes("--emit-root");

const SITE = "https://caseirinhosdoju.com.br";
const WHATSAPP = "5527996511588";
const COMPANY = "Caseirinhos do Ju";

const read = (path) => readFileSync(join(ROOT, path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const write = (path, content) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
};

const log = (msg) => process.stdout.write(`[build] ${msg}\n`);
const fail = (msg) => {
  process.stderr.write(`[build:error] ${msg}\n`);
  process.exit(1);
};

/* ------------------------------------------------------------------ data */
const precos = readJson("data/precos.json");
const catalog = readJson("data/catalog.json");
const priceItems = precos.items || {};
const products = Array.isArray(catalog.products) ? catalog.products : [];

if (!products.length) fail("data/catalog.json não contém produtos.");

const REMOVED = [/coco com chocolate/i, /maracuj[áa] puro/i, /amanteigado de coco/i];

function resolveOptions(product) {
  const options = Array.isArray(product.options) ? product.options : [];
  return options.map((option) => {
    const price = priceItems[option.priceKey];
    if (!Number.isFinite(price)) {
      fail(`preço ausente em data/precos.json para "${option.priceKey}" (${product.name}).`);
    }
    return { label: option.label, price };
  });
}

function productType(product) {
  if (product.consultPrice) return "consult";
  if (product.category === "Esfirras") return "esfirra";
  if (product.slug === "pao-caseiro-doce" || product.slug === "pao-caseiro-sal-cebola") return "bread";
  return "regular";
}

for (const product of products) {
  const haystack = [product.name, product.slug, product.description, product.badge].join(" ");
  for (const pattern of REMOVED) {
    if (pattern.test(haystack)) fail(`produto removido encontrado no catálogo: ${product.name}`);
  }
  if (product.consultPrice && (product.options || []).length) {
    fail(`${product.name}: consultPrice não pode ter opções com preço.`);
  }
  if (!product.image || !existsSync(join(ROOT, product.image))) {
    fail(`${product.name}: imagem ausente (${product.image}).`);
  }
  if (!Number.isFinite(product.imageWidth) || !Number.isFinite(product.imageHeight)) {
    fail(`${product.name}: imageWidth/imageHeight ausentes em data/catalog.json.`);
  }
}

const resolvedProducts = products.map((product) => ({ ...product, options: resolveOptions(product) }));

/* -------------------------------------------------------- catalog-data.js */
function buildCatalogData() {
  const payload = {
    version: String(catalog.version || "23.1"),
    currency: "BRL",
    products: resolvedProducts
  };
  return [
    "// AUTO-GENERATED. NÃO EDITE ESTE ARQUIVO.",
    "// Fonte: data/catalog.json + data/precos.json (gere com: node scripts/build.mjs)",
    `window.CASEIRINHOS_CATALOG = ${JSON.stringify(payload)};`,
    ""
  ].join("\n");
}

/* ------------------------------------------------------------- HTML utils */
const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const jsonLd = (data) => JSON.stringify(data).replace(/</g, "\\u003c");
const money = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
const absolute = (path) => new URL(path, `${SITE}/`).href;

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self'",
  "script-src-attr 'none'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "form-action 'self' https://wa.me"
].join("; ");

function waUrl(message) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function fill(template, values) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  );
}

/* ---------------------------------------------------- product page markup */
function renderProductPage(product) {
  const type = productType(product);
  const canonical = `${SITE}/produtos/${product.slug}/`;
  const title = `${product.name} | ${COMPANY}`;
  const description = product.description;
  const options = product.options || [];
  const flavors = Array.isArray(product.flavors) ? product.flavors : [];
  const startPrice = options.length ? Math.min(...options.map((option) => option.price)) : null;

  const availabilityBlock = product.availability
    ? `<div class="product-page__availability"><span aria-hidden="true"></span><div><small>Disponibilidade</small><strong>${esc(product.availability)}</strong></div></div>`
    : "";
  const shelfBlock = product.shelfLifeDays
    ? `<p class="product-page__shelf">Validade: ${Number(product.shelfLifeDays)} dias · verifique também a data e as orientações na embalagem.</p>`
    : "";
  const purchaseBlock = product.purchaseNote ? `<p class="product-page__shelf">${esc(product.purchaseNote)}</p>` : "";
  const imageNoteBlock = product.imageNote ? `<p class="product-page__shelf">${esc(product.imageNote)}</p>` : "";

  const priceBlock = product.consultPrice
    ? `<div class="product-page__price"><span class="price-consult">Valor sob consulta</span></div>`
    : `<div class="product-page__price"><span class="price-from">a partir de</span><strong>${money(startPrice)}</strong></div>`;

  const optionsBlock = !product.consultPrice && options.length
    ? `<ul class="product-page__options">${options
        .map((option) => `<li><span>${esc(option.label)}</span><strong>${money(option.price)}</strong></li>`)
        .join("")}</ul>`
    : "";

  const flavorsBlock = flavors.length
    ? `<div class="flavors"><h2>Sabores disponíveis</h2><ul>${flavors
        .map((flavor) => `<li>${esc(flavor)}</li>`)
        .join("")}</ul></div>`
    : "";

  const variantSelect = options.length
    ? `<label for="detailVariant">Tamanho / combo<select id="detailVariant">${options
        .map(
          (option) =>
            `<option value="${esc(option.label)}" data-price="${Number(option.price).toFixed(2)}">${esc(option.label)} · ${money(option.price)}</option>`
        )
        .join("")}</select></label>`
    : "";
  const flavorSelect = flavors.length
    ? `<label for="detailFlavor">Sabor<select id="detailFlavor">${flavors
        .map((flavor) => `<option value="${esc(flavor)}">${esc(flavor)}</option>`)
        .join("")}</select></label>`
    : "";
  const pickerBlock =
    type === "consult"
      ? ""
      : `<div class="product-page__picker">${variantSelect}${flavorSelect}<label for="detailQuantity">Quantidade<input id="detailQuantity" type="number" min="1" max="99" step="1" inputmode="numeric" value="1"></label></div>`;

  const orderMessage =
    type === "consult"
      ? `Olá! Vim pelo site do ${COMPANY} e gostaria de consultar o valor e a disponibilidade do ${product.name}. Aguardo confirmação.`
      : `Olá! Vim pelo site do ${COMPANY} e gostaria de pedir ${product.name}. Aguardo confirmação de disponibilidade.`;
  const enquiryMessage = `Olá! Vim pelo site do ${COMPANY} e gostaria de SOLICITAR UMA ENCOMENDA de ${product.name} para uma data a combinar. Sei que não é um pedido imediato; aguardo confirmação de disponibilidade, data e retirada/entrega.`;
  const orderLabel = type === "consult" ? "Consultar pelo WhatsApp →" : "Pedir pelo WhatsApp →";

  const offers = product.consultPrice
    ? undefined
    : options.map((option) => ({
        "@type": "Offer",
        priceCurrency: "BRL",
        price: Number(option.price).toFixed(2),
        description: option.label || product.name,
        url: canonical
      }));
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: absolute(product.image),
    brand: { "@type": "Brand", name: COMPANY },
    category: product.category,
    url: canonical,
    ...(offers ? { offers } : {})
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: COMPANY, item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: product.name, item: canonical }
    ]
  };

  const template = read("templates/product-page.html");
  return fill(template, {
    CSP,
    TITLE: esc(title),
    DESCRIPTION: esc(description),
    NAME: esc(product.name),
    CATEGORY: esc(product.category),
    SLUG: esc(product.slug),
    CANONICAL: canonical,
    IMAGE: esc(product.image),
    IMAGE_WIDTH: String(product.imageWidth),
    IMAGE_HEIGHT: String(product.imageHeight),
    OG_IMAGE: absolute(product.image),
    OG_IMAGE_WIDTH: String(product.imageWidth),
    OG_IMAGE_HEIGHT: String(product.imageHeight),
    AVAILABILITY_BLOCK: availabilityBlock,
    SHELF_BLOCK: shelfBlock,
    PURCHASE_NOTE_BLOCK: purchaseBlock,
    IMAGE_NOTE_BLOCK: imageNoteBlock,
    PRICE_BLOCK: priceBlock,
    OPTIONS_BLOCK: optionsBlock,
    FLAVORS_BLOCK: flavorsBlock,
    PICKER_BLOCK: pickerBlock,
    TYPE: type,
    ORDER_URL: esc(waUrl(orderMessage)),
    ENQUIRY_URL: esc(waUrl(enquiryMessage)),
    ORDER_LABEL: orderLabel,
    JSONLD: jsonLd([productSchema, breadcrumb])
  });
}

function renderRedirect(redirect) {
  const target = products.find((product) => product.slug === redirect.to);
  if (!target) fail(`redirect "${redirect.from}" aponta para slug inexistente "${redirect.to}".`);
  const template = read("templates/redirect.html");
  return fill(template, {
    TARGET_URL: `${SITE}/produtos/${target.slug}/`,
    TARGET_REL: `../${target.slug}/`,
    TARGET_NAME: esc(target.name)
  });
}

/* ------------------------------------------------------------------- dist */
function copyDir(from, to) {
  cpSync(from, to, { recursive: true });
}

function cacheVersion() {
  const hash = createHash("sha256");
  const walk = (dir) => {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      const stats = statSync(full);
      if (stats.isDirectory()) walk(full);
      else if (/\.(css|js|html|webp|png|jpg|svg)$/.test(entry)) hash.update(readFileSync(full));
    }
  };
  walk(join(ROOT, "assets"));
  hash.update(readFileSync(join(ROOT, "index.html")));
  return hash.digest("hex").slice(0, 12);
}

function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, priority: "1.0" },
    ...resolvedProducts.map((product) => ({ loc: `${SITE}/produtos/${product.slug}/`, priority: "0.8" }))
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) =>
        `  <url><loc>${url.loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${url.priority}</priority></url>`
    ),
    "</urlset>",
    ""
  ].join("\n");
}

function writeStatic(targetRoot) {
  const files = ["index.html", "404.html", "offline.html", "manifest.webmanifest", "robots.txt"];
  for (const file of files) write(join(targetRoot, file), read(file));
  write(join(targetRoot, ".nojekyll"), "");
  const sw = read("sw.js").replace(/__CACHE_VERSION__/g, cacheVersion());
  write(join(targetRoot, "sw.js"), sw);
}

function writeCatalogData(targetRoot) {
  write(join(targetRoot, "assets/js/catalog-data.js"), buildCatalogData());
}

function writeProductPages(targetRoot) {
  for (const product of resolvedProducts) {
    write(join(targetRoot, "produtos", product.slug, "index.html"), renderProductPage(product));
  }
  for (const redirect of catalog.redirects || []) {
    write(join(targetRoot, "produtos", redirect.from, "index.html"), renderRedirect(redirect));
  }
}

/* ---------------------------------------------------------------- execute */
log("limpando dist/");
try {
  rmSync(DIST, { recursive: true, force: true });
} catch (error) {
  log(`aviso: não foi possível limpar dist/ (${error.message}); seguindo com sobrescrita.`);
}
mkdirSync(DIST, { recursive: true });

log("copiando assets/");
copyDir(join(ROOT, "assets"), join(DIST, "assets"));

log("gerando páginas de produto");
writeProductPages(DIST);
writeCatalogData(DIST);
log("gerando páginas estáticas, sitemap e robots");
writeStatic(DIST);
write(join(DIST, "sitemap.xml"), generateSitemap());

if (EMIT_ROOT) {
  log("sincronizando artefatos gerados na raiz (--emit-root)");
  writeProductPages(ROOT);
  writeCatalogData(ROOT);
  write(join(ROOT, ".nojekyll"), "");
  write(join(ROOT, "sitemap.xml"), generateSitemap());
}

const count = readdirSync(join(DIST, "produtos")).length;
log(`ok · ${resolvedProducts.length} produtos · ${count} pastas de produto · versão de cache ${cacheVersion()}`);
