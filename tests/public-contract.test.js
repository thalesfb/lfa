import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (file) => readFile(resolve(projectRoot, file), "utf8");

test("a interface pública apresenta os elementos essenciais de uma máquina de vendas", async () => {
  const html = await readProjectFile("index.html");

  assert.match(html, /class="[^"]*\bvending-machine\b/);
  for (const marker of [
    'id="product-window"',
    'id="machine-display"',
    'id="coin-slot"',
    'id="purchase-panel"',
    'id="delivery-tray"',
    'id="collect-button"',
  ]) {
    assert.match(html, new RegExp(marker.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")), `marcador ausente: ${marker}`);
  }

  assert.match(html, /Máquina de vendas/i);
  assert.match(html, /Como a máquina decide/i);
  assert.match(html, /caminho percorrido/i);
  assert.match(html, /id="diagram-reading-guide"/);
  assert.match(html, /id="diagram-mobile-fallback"/);
  assert.match(html, /id="mobile-transition-body"/);
  assert.match(html, /viewBox="0 0 1080 430"/);
  for (const marker of [
    'id="transition-example-q0-5"',
    'id="transition-example-q0-10"',
    'id="transition-example-q0-25"',
    'id="transition-example-q15-10"',
  ]) {
    assert.match(html, new RegExp(marker.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")), `exemplo ausente: ${marker}`);
  }
});

test("a comunicação pública não expõe fluxo interno de revisão ou publicação", async () => {
  const [html, readme] = await Promise.all([
    readProjectFile("index.html"),
    readProjectFile("README.md"),
  ]);
  const publicText = `${html}\n${readme}`.toLowerCase();

  for (const internalPhrase of [
    "revisão humana",
    "revisado",
    "manual review",
    "human review",
    "sem publicação",
    "não está pronto para merge",
    "codex",
  ]) {
    assert.equal(publicText.includes(internalPhrase), false, `texto interno encontrado: ${internalPhrase}`);
  }
});
