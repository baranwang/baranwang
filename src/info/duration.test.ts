import assert from "node:assert/strict";
import test from "node:test";

import { parseDurationStart } from "./duration.ts";

test("parses the start month with either duration separator", () => {
	assert.equal(parseDurationStart("2019/05 ～ 2022/01"), 201905);
	assert.equal(parseDurationStart("2018/06 ~ 2019/05"), 201806);
});
