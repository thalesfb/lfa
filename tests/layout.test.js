import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("o diagrama ocupa uma seção própria e usa a largura disponível", async () => {
  const styles = await readFile(resolve(projectRoot, "src/styles.css"), "utf8");

  assert.match(styles, /\.workspace\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(styles, /\.vending-machine\s*\{[^}]*width:\s*min\(100%,\s*760px\)/s);
});
