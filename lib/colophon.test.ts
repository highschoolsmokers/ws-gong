import { test } from "node:test";
import assert from "node:assert/strict";
import pkg from "../package.json" with { type: "json" };
import { major, stack, tools } from "./colophon.ts";

const installed = { ...pkg.dependencies, ...pkg.devDependencies };
const credited = [...stack, ...tools].flatMap((e) => e.packages);

test("every package the colophon credits is installed", () => {
  const missing = credited.filter((name) => !(name in installed));
  assert.deepEqual(missing, [], "colophon names packages the site doesn't use");
});

test("every runtime dependency is credited in the colophon", () => {
  const uncredited = Object.keys(pkg.dependencies).filter(
    (name) => !credited.includes(name),
  );
  assert.deepEqual(
    uncredited,
    [],
    "add these to lib/colophon.ts (stack or tools)",
  );
});

test("stack versions come from package.json", () => {
  assert.match(stack[0].label, new RegExp(`^Next\\.js ${major("next")} `));
  assert.ok(/^\d+$/.test(major("next")!), "major() reads a plain number");
  assert.match(
    stack.at(-1)!.label,
    new RegExp(`Node\\.js ${pkg.engines.node.replace(/^[^\d]*/, "")} `),
  );
});
