export type PresentationVisualReviewStage = "draft" | "final";
export type PresentationVisualReviewVerdict = "pass" | "revise" | "reject";

export interface PresentationVisualReviewResponse {
  verdict: PresentationVisualReviewVerdict;
  summary: string;
}

export interface PresentationVisualReviewRequest {
  stage: PresentationVisualReviewStage;
  title: string;
  outline: string;
  previewSlides: string[];
}

export type PresentationVisualReviewer = (
  request: PresentationVisualReviewRequest,
) => Promise<PresentationVisualReviewResponse>;

export function parsePresentationVisualReviewResponse(
  _content: string,
): PresentationVisualReviewResponse {
  return {
    verdict: "pass",
    summary: "",
  };
}
