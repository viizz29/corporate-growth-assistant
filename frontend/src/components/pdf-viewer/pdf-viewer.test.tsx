import { describe, it, expect, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

import PdfViewer from "./pdf-viewer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const URL = "https://example.com/file.pdf";

describe("PdfViewer", () => {
  it("shows loading skeleton initially", () => {
    const { container } = render(<PdfViewer url={URL} />);

    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load PDF")).not.toBeInTheDocument();
  });

  it("clears loading when iframe fires onLoad", async () => {
    const { container } = render(<PdfViewer url={URL} />);

    const iframe = container.querySelector("iframe") as HTMLIFrameElement;
    act(() => {
      iframe.dispatchEvent(new Event("load"));
    });

    await waitFor(() => {
      expect(container.querySelector(".MuiSkeleton-root")).not.toBeInTheDocument();
    });
  });

  it("renders iframe with src and height on success", () => {
    const { container } = render(<PdfViewer url={URL} />);

    const iframe = container.querySelector("iframe") as HTMLElement;
    expect(iframe).toHaveAttribute("src", URL);
    expect(iframe).toHaveStyle({ height: "800px" });
  });

  it("shows error alert and removes iframe when iframe fires onError", async () => {
    const { container } = render(<PdfViewer url={URL} />);

    const iframe = container.querySelector("iframe") as HTMLIFrameElement;
    const propsKey = Object.keys(iframe).find((key) =>
      key.startsWith("__reactProps")
    ) as string;
    const props = (iframe as unknown as Record<string, unknown>)[propsKey] as {
      onError: () => void;
    };
    act(() => {
      props.onError();
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to load PDF")).toBeInTheDocument();
    });
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("renders download link with href and download attribute", () => {
    render(<PdfViewer url={URL} />);

    const link = screen.getByTestId("DownloadIcon").closest("a") as HTMLAnchorElement;
    expect(link).toHaveAttribute("href", URL);
    expect(link).toHaveAttribute("download");
  });

  it("renders open in new tab link with target and rel attributes", () => {
    render(<PdfViewer url={URL} />);

    const link = screen.getByTestId("OpenInNewIcon").closest("a") as HTMLAnchorElement;
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders provided title", () => {
    render(<PdfViewer url={URL} title="My Document" />);

    expect(screen.getByText("My Document")).toBeInTheDocument();
  });

  it("falls back to default title when no title is provided", () => {
    render(<PdfViewer url={URL} />);

    expect(screen.getByText("PDF Viewer")).toBeInTheDocument();
  });
});
