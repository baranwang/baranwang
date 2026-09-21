import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const sources = [
	app,
	readFileSync(new URL("./info/index.ts", import.meta.url), "utf8"),
	readFileSync(new URL("./components/header.tsx", import.meta.url), "utf8"),
].join("\n");

test("shows email in both web and print layouts without a phone number", () => {
	assert.match(app, /className="mt-4 flex flex-wrap gap-2"/);
	assert.match(app, /href=\{`mailto:\$\{INFO\.email\}`\}/);
	assert.doesNotMatch(sources, /phone|tel:/i);
});
