#!/usr/bin/env node
/**
 * Valida data/catalog.json + data/precos.json antes do build.
 * Falha com código 1 e mensagem clara quando encontra inconsistências.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"));
const problems = [];
const ok = (message) => console.log(`  ✓ ${message}`);

const precos = readJson("data/precos.json");
const catalog = readJson("data/catalog.json");
const products = catalog.products || [];
const items = precos.items || {};

console.log("validate-catalog");

const REMOVED = [/coco com chocolate/i, /maracuj[áa] puro/i, /amanteigado de coco/i];
const slugs = new Set();
const ids = new Set();
const names = new Set();

for (const product of products) {
  const label = product.name || product.slug || "?";
  for (const pattern of REMOVED) {
    if (pattern.test(`${product.name} ${product.slug}`)) problems.push(`produto removido presente: ${label}`);
  }
  if (slugs.has(product.slug)) problems.push(`slug duplicado: ${product.slug}`);
  slugs.add(product.slug);
  if (ids.has(product.id)) problems.push(`id duplicado: ${product.id}`);
  ids.add(product.id);
  if (names.has(product.name)) problems.push(`nome duplicado: ${product.name}`);
  names.add(product.name);

  if (!product.image || !existsSync(join(ROOT, product.image))) problems.push(`imagem ausente: ${label} (${product.image})`);
  if (!Number.isFinite(product.imageWidth) || !Number.isFinite(product.imageHeight)) {
    problems.push(`dimensões ausentes: ${label}`);
  }
  if (product.consultPrice && (product.options || []).length) problems.push(`consultPrice com opções: ${label}`);

  for (const option of product.options || []) {
    const price = items[option.priceKey];
    if (!Number.isFinite(price)) problems.push(`preço ausente em precos.json: ${label} → ${option.priceKey}`);
    else if (price <= 0) problems.push(`preço inválido: ${label} → ${option.priceKey} = ${price}`);
  }
}

for (const key of Object.keys(items)) {
  const used = products.some((product) => (product.options || []).some((option) => option.priceKey === key));
  if (!used) problems.push(`preço órfão em precos.json: ${key}`);
}

for (const redirect of catalog.redirects || []) {
  if (!products.some((product) => product.slug === redirect.to)) problems.push(`redirect inválido: ${redirect.from} → ${redirect.to}`);
}

if (problems.length) {
  console.error("\nFalhas:");
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}

ok(`${products.length} produtos válidos`);
ok(`${Object.keys(items).length} preços resolvidos`);
ok("nenhum produto removido (coco/maracujá puro)");
