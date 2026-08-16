import { describe, it, expect } from "vitest";

import i18n from "./config";

function translationBundle(language: string): Record<string, string> {
  return i18n.getResourceBundle(language, "translation") as Record<
    string,
    string
  >;
}

describe("i18n config", () => {
  it("uses English as the fallback language", () => {
    expect(i18n.options.fallbackLng).toEqual(["en"]);
  });

  it("registers en and hi translation bundles", () => {
    const en = translationBundle("en");
    const hi = translationBundle("hi");

    expect(Object.keys(en).length).toBeGreaterThan(0);
    expect(Object.keys(hi).length).toBeGreaterThan(0);
  });

  it("the hi bundle contains every key present in the en bundle", () => {
    const en = translationBundle("en");
    const hi = translationBundle("hi");

    const missing = Object.keys(en).filter((key) => !(key in hi));
    expect(missing).toEqual([]);
  });

  it("translates a sample of shared keys", () => {
    expect(i18n.t("appTitle", { lng: "en" })).toBe("Corporate Growth Assistant");
    expect(i18n.t("appTitle", { lng: "hi" })).toBe("कॉर्पोरेट ग्रोथ असिस्टेंट");
    expect(i18n.t("welcomeMessage", { lng: "en" })).toBe(
      "Welcome to your dashboard",
    );
    expect(i18n.t("welcomeMessage", { lng: "hi" })).toBe(
      "आपके डैशबोर्ड में आपका स्वागत है",
    );
  });
});
