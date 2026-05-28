"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";

import {
  SLOP_SCORECARD_FRONT_EVENT,
  SLOP_SCORECARD_TOGGLE_EVENT
} from "@/components/slop-scorecard-flip-card";

type SlopScorecardCarouselProps = {
  children: ReactNode;
  /** Shown under controls on mobile */
  swipeHint?: boolean;
};

function dispatchOnCard(
  container: HTMLElement | null,
  index: number,
  eventName: string
) {
  const card = container?.querySelector<HTMLElement>(
    `[data-card-index="${index}"]`
  );
  card?.dispatchEvent(new CustomEvent(eventName));
}

export function SlopScorecardCarousel({
  children,
  swipeHint = true
}: SlopScorecardCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardCount, setCardCount] = useState(0);

  const childArray = Children.toArray(children);
  const count = childArray.length;

  useEffect(() => {
    setCardCount(count);
    if (activeIndex >= count && count > 0) {
      setActiveIndex(count - 1);
    }
  }, [count, activeIndex]);

  const updateActiveFromScroll = useCallback(() => {
    const root = scrollRef.current;
    if (!root) {
      return;
    }
    const cards = root.querySelectorAll<HTMLElement>("[data-card-index]");
    if (cards.length === 0) {
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const centerX = rootRect.left + rootRect.width / 2;
    let bestIndex = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const idx = Number(card.dataset.cardIndex);
      if (!Number.isFinite(idx)) {
        return;
      }
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = idx;
      }
    });

    setActiveIndex(bestIndex);

    cards.forEach((card) => {
      const idx = Number(card.dataset.cardIndex);
      const active = Number.isFinite(idx) && idx === bestIndex;
      card.setAttribute("data-active", active ? "true" : "false");
    });
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) {
      return;
    }
    updateActiveFromScroll();
    root.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveFromScroll);
    return () => {
      root.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [updateActiveFromScroll, count]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || count === 0) {
      return;
    }
    root.querySelectorAll<HTMLElement>("[data-card-index]").forEach((card) => {
      const idx = Number(card.dataset.cardIndex);
      card.setAttribute("data-active", idx === activeIndex ? "true" : "false");
    });
  }, [activeIndex, count]);

  const scrollToIndex = useCallback((index: number) => {
    const root = scrollRef.current;
    if (!root) {
      return;
    }
    const card = root.querySelector<HTMLElement>(`[data-card-index="${index}"]`);
    card?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
    setActiveIndex(index);
    root.querySelectorAll<HTMLElement>("[data-card-index]").forEach((card) => {
      const idx = Number(card.dataset.cardIndex);
      card.setAttribute("data-active", idx === index ? "true" : "false");
    });
    dispatchOnCard(root, index, SLOP_SCORECARD_FRONT_EVENT);
  }, []);

  const goPrev = () => {
    if (cardCount <= 1) {
      return;
    }
    scrollToIndex(Math.max(0, activeIndex - 1));
  };

  const goNext = () => {
    if (cardCount <= 1) {
      return;
    }
    scrollToIndex(Math.min(cardCount - 1, activeIndex + 1));
  };

  const flipActive = () => {
    dispatchOnCard(scrollRef.current, activeIndex, SLOP_SCORECARD_TOGGLE_EVENT);
  };

  const showFrontActive = () => {
    dispatchOnCard(scrollRef.current, activeIndex, SLOP_SCORECARD_FRONT_EVENT);
  };

  if (count === 0) {
    return null;
  }

  const carouselControls =
    cardCount > 1 ? (
      <div className="slop-scorecard-carousel-controls grid w-full max-w-[21.5rem] grid-cols-3 gap-2 px-1 sm:max-w-md">
        <button
          type="button"
          onClick={goPrev}
          disabled={activeIndex <= 0}
          className="slop-scorecard-nav-pill slop-scorecard-nav-pill--secondary"
          aria-label="Previous scorecard"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={flipActive}
          className="slop-scorecard-nav-pill slop-scorecard-nav-pill--primary"
          aria-label="Flip active scorecard to details"
        >
          Details
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={activeIndex >= cardCount - 1}
          className="slop-scorecard-nav-pill slop-scorecard-nav-pill--secondary"
          aria-label="Next scorecard"
        >
          Next
        </button>
      </div>
    ) : (
      <div className="slop-scorecard-carousel-controls flex justify-center">
        <button
          type="button"
          onClick={flipActive}
          className="min-h-10 rounded-full border border-[var(--slop-card-orange)]/55 bg-[color:rgba(255,90,20,0.16)] px-5 py-2 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--slop-card-orange-bright)] transition hover:border-[var(--slop-card-orange)] hover:bg-[color:rgba(255,90,20,0.24)]"
        >
          Details
        </button>
      </div>
    );

  return (
    <div className="slop-scorecard-carousel-wrap">
      {cardCount > 1 ? (
        <p className="slop-scorecard-carousel-index mb-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center text-[0.58rem] font-bold tabular-nums text-[var(--slop-card-gray)]">
          <span>
            {activeIndex + 1} / {cardCount}
          </span>
          <span aria-hidden className="text-[var(--slop-card-gray-dim)]">
            ·
          </span>
          <button
            type="button"
            className="font-black uppercase tracking-[0.08em] text-[var(--slop-card-orange)] underline-offset-2 hover:text-[var(--slop-card-orange-bright)] hover:underline"
            onClick={showFrontActive}
          >
            Front
          </button>
        </p>
      ) : null}

      <div
        ref={scrollRef}
        className="slop-card-carousel slop-scorecard-rolodex"
        role="region"
        aria-label="Slop Scorecards"
      >
        {children}
      </div>

      {carouselControls}

      {swipeHint && cardCount > 1 ? (
        <p className="slop-scorecard-carousel-hint mt-2 text-center text-[0.6rem] font-semibold text-[var(--slop-cream-dim)]">
          <span className="sm:hidden">Swipe the deck · </span>
          Tap the card or Details to flip
        </p>
      ) : null}
    </div>
  );
}
