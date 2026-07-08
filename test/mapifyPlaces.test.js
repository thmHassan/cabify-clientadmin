import test from "node:test";
import assert from "node:assert/strict";
import { toMapifyBoundaryCountryCode } from "../src/utils/map/mapifyBoundaryCountry.js";

test("toMapifyBoundaryCountryCode maps country names to Mapify boundary codes", () => {
    assert.equal(toMapifyBoundaryCountryCode("United States"), "USA");
    assert.equal(toMapifyBoundaryCountryCode("United Kingdom"), "GBR");
    assert.equal(toMapifyBoundaryCountryCode("Pakistan"), "PAK");
});

test("toMapifyBoundaryCountryCode omits unsupported long country names", () => {
    assert.equal(toMapifyBoundaryCountryCode("Not A Real Country"), null);
    assert.equal(toMapifyBoundaryCountryCode(""), null);
});
