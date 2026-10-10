#!/usr/bin/env node
/**
 * Testes das regras comerciais de disponibilidade (assets/js/availability.js).
 * Executado com node:test. Horários fixos em America/Sao_Paulo.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(ROOT, "assets/js/availability.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: "availability.js" });
const rules = sandbox.window.CASEIRINHOS_AVAILABILITY;

const at = (iso) => new Date(iso);

test("esfirras: quinta 19h (Brasília) liberado", () => {
  const state = rules.getState("esfirra", at("2025-10-09T22:00:00Z")); // 19h BRT
  assert.equal(state.allowed, true);
});

test("esfirras: quinta 17h (Brasília) bloqueado", () => {
  const state = rules.getState("esfirra", at("2025-10-09T20:00:00Z")); // 17h BRT
  assert.equal(state.allowed, false);
  assert.match(state.detail, /18h30/);
});

test("esfirras: quinta 22h30 (Brasília) bloqueado", () => {
  const state = rules.getState("esfirra", at("2025-10-10T01:30:00Z")); // 22h30 BRT
  assert.equal(state.allowed, false);
});

test("esfirras: segunda-feira bloqueado", () => {
  const state = rules.getState("esfirra", at("2025-10-06T22:00:00Z")); // segunda 19h BRT
  assert.equal(state.allowed, false);
});

test("pães: sábado liberado, quarta bloqueado", () => {
  assert.equal(rules.getState("bread", at("2025-10-11T15:00:00Z")).allowed, true);
  assert.equal(rules.getState("bread", at("2025-10-08T15:00:00Z")).allowed, false);
});

test("produto sob consulta nunca permite pedido direto", () => {
  const state = rules.getState("consult", at("2025-10-09T22:00:00Z"));
  assert.equal(state.allowed, false);
});

test("produto regular é sempre adicionável", () => {
  assert.equal(rules.getState("regular", at("2025-10-08T15:00:00Z")).allowed, true);
});

test("kind() classifica produtos do catálogo", () => {
  assert.equal(rules.kind({ category: "Esfirras" }), "esfirra");
  assert.equal(rules.kind({ slug: "pao-caseiro-doce" }), "bread");
  assert.equal(rules.kind({ consultPrice: true }), "consult");
  assert.equal(rules.kind({ category: "Amanteigados" }), "regular");
});
