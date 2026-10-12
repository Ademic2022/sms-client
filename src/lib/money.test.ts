import { describe, expect, it } from "vitest";

import { localPhone, naira, ordinal, toKobo } from "./money";

describe("naira", () => {
  it("formats whole kobo as naira", () => {
    expect(naira(15_000_000)).toBe("₦150,000");
    expect(naira(150_050)).toBe("₦1,500.5");
    expect(naira(0)).toBe("₦0");
  });
  it("shows a dash for a missing amount", () => {
    expect(naira(null)).toBe("–");
    expect(naira(undefined)).toBe("–");
  });
});

describe("toKobo", () => {
  it("reads amounts the way people type them", () => {
    expect(toKobo("150,000")).toBe(15_000_000);
    expect(toKobo("₦ 1500.5")).toBe(150_050);
    expect(toKobo("1500.05")).toBe(150_005);
  });
  it("never rounds money: more than two decimal places is rejected", () => {
    expect(toKobo("10.005")).toBeNull();
  });
  it("rejects anything that is not an amount", () => {
    for (const bad of ["", "abc", "-500", "1.2.3", "1e5"]) expect(toKobo(bad)).toBeNull();
  });
  it("round-trips without floating point drift", () => {
    expect(toKobo("0.29")).toBe(29);
    expect(toKobo("19999999.99")).toBe(1_999_999_999);
  });
});

describe("ordinal", () => {
  it("gives class positions", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 101, 112].map(ordinal)).toEqual(
      ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "101st", "112th"],
    );
    expect(ordinal(null)).toBe("");
  });
});

describe("localPhone", () => {
  it("shows stored numbers the way Nigerians write them, on one line", () => {
    expect(localPhone("+2348031234567")).toBe("0803 123 4567");
  });
  it("leaves anything else alone", () => {
    expect(localPhone("08031234567")).toBe("08031234567");
    expect(localPhone(null)).toBe("");
  });
});
