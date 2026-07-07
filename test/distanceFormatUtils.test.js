import test from "node:test";
import assert from "node:assert/strict";
import {
    formatDistanceFromBooking,
    formatDistanceFromMeters,
    formatDistanceValueWithUnit,
    metersToDisplayDistanceValue,
    parseDistanceUnit,
} from "../src/utils/distanceFormatUtils.js";

test("parseDistanceUnit normalizes tenant/backend units", () => {
    assert.equal(parseDistanceUnit("km"), "Km");
    assert.equal(parseDistanceUnit("KM"), "Km");
    assert.equal(parseDistanceUnit("miles"), "Miles");
    assert.equal(parseDistanceUnit("Miles"), "Miles");
    assert.equal(parseDistanceUnit(null), null);
});

test("metersToDisplayDistanceValue converts raw backend meters to tenant unit values", () => {
    assert.equal(metersToDisplayDistanceValue(2500, "Km"), "2.50");
    assert.equal(metersToDisplayDistanceValue(1609.344, "Miles"), "1.00");
    assert.equal(metersToDisplayDistanceValue("not-a-number", "Km"), "");
});

test("formatDistanceFromBooking prefers backend display fields", () => {
    assert.equal(
        formatDistanceFromBooking({ distance: 1609.344, distance_value: 1, distance_unit: "miles" }, "Km"),
        "1.00 Miles"
    );
});

test("formatDistanceFromBooking falls back to raw meters and selected unit", () => {
    assert.equal(formatDistanceFromBooking({ distance: 2500 }, "Km"), "2.50 Km");
    assert.equal(formatDistanceFromBooking({ distance: 1609.344 }, "Miles"), "1.00 Miles");
});

test("formatDistanceValueWithUnit keeps non-numeric values display-safe", () => {
    assert.equal(formatDistanceValueWithUnit("pending", "Km"), "pending Km");
    assert.equal(formatDistanceValueWithUnit("", "Miles"), "");
});

test("formatDistanceFromMeters hides missing raw distance values", () => {
    assert.equal(formatDistanceFromMeters(null, "Km"), "-");
    assert.equal(formatDistanceFromMeters(0, "Miles"), "-");
});
