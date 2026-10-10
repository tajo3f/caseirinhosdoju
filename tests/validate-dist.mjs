#!/usr/bin/env node
/**
 * Auditoria do build (dist/). Verifica integridade de links, canonical,
 * sitemap, ausência de produtos removidos, ausência de segredos e de padrões
 * de JavaScript perigoso. Exige que `node scripts/build.mjs` já tenha rodado.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SITE = "https://caseirinhosdoju.com.br";
const problems = [];
const ok = (message) => console.log(`  ✓ ${message}`);

if (!existsSync(DIST)) {
  console.error("dist/ não encontrado. Rode: node scripts/build.mjs");
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(DIST);
const htmlFiles = files.filter((file) => extname(file) === ".html");
const textFiles = files.filter((file) => /\.(html|js|css|json|xml|txt|webmanifest)$/.test(file));

console.log("validate-dist");

/* 1. Links internos existem ------------------------------------------------- */
const EXTERNAL = /^(?:[a-z]+:)?\/\//i;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const attrs = [...html.matchAll(/(?:href|src)\s*=\s*"([^"]*)"/gi)].map((match) => match[1]);
  for (const raw of attrs) {
    const value = raw.trim();
    if (!value || value.startsWith("#")) continue;
    if (EXTERNAL.test(value) || /^(?:mailto|tel|data|javascript):/i.test(value)) continue;
    const clean = value.split("#")[0].split("?")[0];
    if (!clean) continue;
    const target = clean.endsWith("/")
      ? join(dirname(file), clean, "index.html")
      : resolve(dirname(file), clean);
    if (!existsSync(target)) problems.push(`link quebrado em ${file.replace(DIST, "dist")}: ${value}`);
  }
}
if (!problems.length) ok(`links internos OK em ${htmlFiles.length} páginas HTML`);

/* 2. Canonical única e exata ------------------------------------------------ */
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  // Páginas noindex (404/offline) não precisam de canonical.
  if (/name=["']robots["'][^>]*noindex/i.test(html)) continue;
  const canonicals = [...html.matchAll(/<link[^>]*rel=["']canonical["'][^>]*>/gi)];
  if (canonicals.length !== 1) problems.push(`canonical ausente/duplicada em ${file.replace(DIST, "dist")} (${canonicals.length})`);
}
const home = readFileSync(join(DIST, "index.html"), "utf8");
const homeCanonical = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.exec(home)?.[1];
if (homeCanonical !== `${SITE}/`) problems.push(`canonical da home incorreta: ${homeCanonical}`);
if (!problems.length) ok("canonical única e exata em todas as páginas");

/* 3. Sitemap cobre as páginas de produto ------------------------------------ */
const sitemap = readFileSync(join(DIST, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
for (const loc of locs) {
  const rel = loc.replace(`${SITE}/`, "");
  const target = rel === "" ? join(DIST, "index.html") : join(DIST, rel, "index.html");
  if (!existsSync(target)) problems.push(`URL do sitemap sem arquivo: ${loc}`);
}
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
for (const product of catalog.products) {
  if (!locs.includes(`${SITE}/produtos/${product.slug}/`)) problems.push(`produto fora do sitemap: ${product.slug}`);
}
if (!problems.length) ok(`sitemap consistente (${locs.length} URLs)`);

/* 4. Produtos removidos não reaparecem -------------------------------------- */
const REMOVED = [/coco com chocolate/i, /maracuj[áa] puro/i, /amanteigado de coco/i];
for (const file of textFiles) {
  const content = readFileSync(file, "utf8");
  for (const pattern of REMOVED) {
    if (pattern.test(content)) problems.push(`produto removido em ${file.replace(DIST, "dist")}`);
  }
}
if (!problems.length) ok("nenhum produto removido no build");

/* 5. JavaScript perigoso ---------------------------------------------------- */
const DANGEROUS = [/\beval\s*\(/, /new\s+Function\s*\(/, /document\s*\.\s*write\s*\(/];
for (const file of files.filter((item) => extname(item) === ".js")) {
  const content = readFileSync(file, "utf8");
  for (const pattern of DANGEROUS) {
    if (pattern.test(content)) problems.push(`padrão perigoso em ${file.replace(DIST, "dist")}: ${pattern}`);
  }
}
if (!problems.length) ok("sem eval / new Function / document.write");

/* 6. Segredos --------------------------------------------------------------- */
const SECRETS = [
  /api[_-]?key\s*[:=]\s*["'][^"']{8,}/i,
  /secret\s*[:=]\s*["'][^"']{8,}/i,
  /password\s*[:=]\s*["'][^"']{6,}/i,
  /service_role/i,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/,
  /\bsk-[A-Za-z0-9]{20,}/,
  /\bghp_[A-Za-z0-9]{20,}/,
  /\bAIza[0-9A-Za-z_-]{30,}/
];
for (const file of textFiles) {
  const content = readFileSync(file, "utf8");
  for (const pattern of SECRETS) {
    if (pattern.test(content)) problems.push(`possível segredo em ${file.replace(DIST, "dist")}: ${pattern}`);
  }
}
if (!problems.length) ok("nenhum segredo detectado");

/* 7. Catálogo gerado -------------------------------------------------------- */
const catalogData = readFileSync(join(DIST, "assets/js/catalog-data.js"), "utf8");
const json = JSON.parse(/window\.CASEIRINHOS_CATALOG\s*=\s*(\{[\s\S]*\});/.exec(catalogData)[1]);
if (json.version !== String(catalog.version || "")) problems.push(`versão do catálogo inesperada: ${json.version} (esperado ${catalog.version})`);
if (json.products.length !== catalog.products.length) problems.push("quantidade de produtos divergente no catálogo gerado");
for (const product of json.products) {
  if (!Number.isFinite(product.imageWidth) || !Number.isFinite(product.imageHeight)) problems.push(`dimensões ausentes no catálogo gerado: ${product.slug}`);
}
if (!problems.length) ok(`catálogo gerado válido (v${json.version}, ${json.products.length} produtos)`);

if (problems.length) {
  console.error("\nFalhas:");
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
console.log("\nvalidate-dist: tudo certo.");
