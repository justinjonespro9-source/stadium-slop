"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { FAN_PHOTO_REVIEWS_SECTION_ID } from "@/lib/review-celebration";

/** Ensures helpful redirects land on the scorecard carousel, not the hero. */
export function SlopScorecardHelpfulAnchor() {
  const searchParams = useSearchParams();
  const helpful = searchParams.get("helpful");

  useEffect(() => {
    if (helpful !== "marked" && helpful !== "own") {
      return;
    }
    const section = document.getElementById(FAN_PHOTO_REVIEWS_SECTION_ID);
    if (!section) {
      return;
    }
    requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }, [helpful]);

  return null;
}
