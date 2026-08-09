/**
 * @vitest-environment happy-dom
 *
 * Unit tests for CSV export helpers (no network).
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EXPORT_DATASETS,
  getExportDataset,
  sanitizeExportFilename,
  triggerBrowserDownload,
} from "@/lib/export/csv-export";

describe("EXPORT_DATASETS", () => {
  it("includes coupons, email opt-ins, surveys, and questions", () => {
    const ids = EXPORT_DATASETS.map((d) => d.id);
    expect(ids).toContain("coupons");
    expect(ids).toContain("issued_coupons");
    expect(ids).toContain("email_opt_ins");
    expect(ids).toContain("surveys");
    expect(ids).toContain("survey_questions");
    expect(ids).toContain("survey_responses");
  });

  it("marks only survey_responses as requiring a survey id", () => {
    expect(getExportDataset("survey_responses")?.requiresSurveyId).toBe(true);
    expect(getExportDataset("coupons")?.requiresSurveyId).toBeFalsy();
    expect(getExportDataset("email_opt_ins")?.requiresSurveyId).toBeFalsy();
  });
});

describe("sanitizeExportFilename", () => {
  it("accepts safe basenames and strips .csv", () => {
    expect(sanitizeExportFilename("responses-abc123")).toBe("responses-abc123");
    expect(sanitizeExportFilename("export.file_1.csv")).toBe("export.file_1");
  });

  it("rejects unsafe characters", () => {
    expect(() => sanitizeExportFilename("bad;drop")).toThrow(/Filename/);
    expect(() => sanitizeExportFilename("path/../x")).toThrow(/Filename/);
  });
});

describe("triggerBrowserDownload", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an object URL, clicks an anchor, and revokes the URL", () => {
    const blob = new Blob(["id,survey_id\n1,2"], { type: "text/csv" });
    const createObjectURL = vi.fn(() => "blob:mock-url");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const click = vi.fn();
    const remove = vi.fn();
    const anchor = {
      href: "",
      download: "",
      rel: "",
      click,
      remove,
    } as unknown as HTMLAnchorElement;

    const createElement = vi
      .spyOn(document, "createElement")
      .mockReturnValue(anchor);
    const appendChild = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation((node) => node);

    triggerBrowserDownload(blob, "responses-test.csv");

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(createElement).toHaveBeenCalledWith("a");
    expect(anchor.href).toBe("blob:mock-url");
    expect(anchor.download).toBe("responses-test.csv");
    expect(appendChild).toHaveBeenCalledWith(anchor);
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
