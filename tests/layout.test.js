import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("o diagrama ocupa uma seção própria e usa a largura disponível", async () => {
  const styles = await readFile(resolve(projectRoot, "src/styles.css"), "utf8");

  assert.match(styles, /\.workspace\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(styles, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.workspace,\s*\.trace-grid,\s*\.model-section\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(styles, /\.vending-machine\s*\{[^}]*width:\s*min\(100%,\s*920px\)/s);
  assert.match(styles, /\.diagram-mobile-fallback\s*\{[^}]*display:\s*none/);
  assert.match(styles, /@media\s*\(max-width:\s*620px\)[\s\S]*?\.diagram-wrap\s*\{\s*display:\s*none;/);
  assert.match(styles, /@media\s*\(max-width:\s*620px\)[\s\S]*?\.diagram-mobile-fallback\s*\{\s*display:\s*block;/);
});

test("rótulos pequenos, tabela móvel e botão de retirada continuam legíveis", async () => {
  const styles = await readFile(resolve(projectRoot, "src/styles.css"), "utf8");

  assert.match(styles, /--readable-copy:\s*1rem/);
  assert.match(styles, /\.screen-label,[\s\S]*?\.machine-brand-subtitle,[\s\S]*?\{[^}]*font-size:\s*var\(--readable-copy\)/s);
  assert.match(styles, /\.coin-caption\s*\{[^}]*font-size:\s*1rem/s);
  assert.match(styles, /\.diagram-meta\s*\{[^}]*font-size:\s*1rem/s);
  assert.match(styles, /\.mobile-transition-table\s*\{[^}]*font-size:\s*1rem/s);
  assert.match(styles, /\.mobile-transition-table-wrap\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(styles, /@media\s*\(max-width:\s*620px\)[\s\S]*?\.machine-controls\s*\{[^}]*display:\s*block/);
  assert.match(styles, /@media\s*\(max-width:\s*620px\)[\s\S]*?\.coin-slot,\s*\.slot-caption\s*\{\s*display:\s*none/);
  assert.match(styles, /@media\s*\(max-width:\s*620px\)[\s\S]*?\.model-cards\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /\.model-card small\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(styles, /\.diagram-scope-note\s*\{[^}]*text-transform:\s*none/s);
  assert.match(styles, /\.collect-button\s*\{[^}]*min-height:\s*44px/s);
});
