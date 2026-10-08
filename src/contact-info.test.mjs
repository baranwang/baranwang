import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync(
	new URL("./components/header.tsx", import.meta.url),
	"utf8",
);
const sources = [
	readFileSync(new URL("./App.tsx", import.meta.url), "utf8"),
	readFileSync(new URL("./info/index.ts", import.meta.url), "utf8"),
	header,
].join("\n");

test("shows email and GitHub in the header without a phone number", () => {
	assert.match(header, /href=\{`mailto:\$\{INFO\.email\}`\}/);
	assert.match(header, /href=\{`https:\/\/github\.com\/\$\{INFO\.github\}`\}/);
	assert.doesNotMatch(sources, /phone|tel:/i);
});

test("does not expose the birth date", () => {
	assert.doesNotMatch(sources, /birth/i);
});
