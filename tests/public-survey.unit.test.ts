import { describe, expect, it } from "vitest";
import {
  allowsAnonymous,
  getPublicSurveyRef,
  isSurveyInWindow,
  isUuid,
} from "@/lib/survey/public-survey";

describe("public survey helpers", () => {
  it("detects uuids used as survey refs", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isUuid("community-pulse")).toBe(false);
    expect(isUuid("550e8400-e29b-41d4-a716")).toBe(false);
  });

  it("prefers slug over id for public urls", () => {
    expect(
      getPublicSurveyRef({ id: "abc", slug: "community-pulse" })
    ).toBe("community-pulse");
    expect(getPublicSurveyRef({ id: "abc", slug: null })).toBe("abc");
  });

  it("enforces the survey schedule window", () => {
    const now = new Date("2026-08-30T12:00:00.000Z");
    expect(
      isSurveyInWindow({ starts_at: null, ends_at: null }, now)
    ).toEqual({ ok: true });
    expect(
      isSurveyInWindow(
        { starts_at: "2026-09-01T00:00:00.000Z", ends_at: null },
        now
      )
    ).toEqual({ ok: false, reason: "not_started" });
    expect(
      isSurveyInWindow(
        { starts_at: null, ends_at: "2026-08-01T00:00:00.000Z" },
        now
      )
    ).toEqual({ ok: false, reason: "ended" });
  });

  it("reads allow_anonymous from settings", () => {
    expect(allowsAnonymous({ allow_anonymous: true })).toBe(true);
    expect(allowsAnonymous({ allow_anonymous: false })).toBe(false);
    expect(allowsAnonymous({})).toBe(false);
  });
});
