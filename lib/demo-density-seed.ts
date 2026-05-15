import {
  ConsensusLabel,
  PhotoType,
  PrismaClient
} from "@prisma/client";

import { buildGameDayKey } from "./game-day";
import type { ReviewConsensusLabel } from "./sample-data";

const DEMO_SEASON = "2026";

export const DEMO_USERS = [
  {
    id: "user-demo-section-scout",
    displayName: "SectionScout",
    handle: "@sectionscoutdemo"
  },
  {
    id: "user-demo-ballpark-bites",
    displayName: "BallparkBites",
    handle: "@ballparkbitesdemo"
  },
  {
    id: "user-demo-upper-deck-eats",
    displayName: "UpperDeckEats",
    handle: "@upperdeckeatsdemo"
  },
  {
    id: "user-demo-foul-line-foodie",
    displayName: "FoulLineFoodie",
    handle: "@foullinefoodiedemo"
  },
  {
    id: "user-demo-concourse-cart",
    displayName: "ConcourseCart",
    handle: "@concoursecartdemo"
  },
  {
    id: "user-demo-bases-loaded-bites",
    displayName: "BasesLoadedBites",
    handle: "@basesloadedbitesdemo"
  },
  {
    id: "user-demo-pitch-clock-snacks",
    displayName: "PitchClockSnacks",
    handle: "@pitchclocksnacksdemo"
  },
  {
    id: "user-demo-rally-napkins",
    displayName: "RallyNapkins",
    handle: "@rallynapkinsdemo"
  },
  {
    id: "user-demo-vendor-hopper",
    displayName: "VendorHopper",
    handle: "@vendorhopperdemo"
  },
  {
    id: "user-demo-hot-corner-eats",
    displayName: "HotCornerEats",
    handle: "@hotcornereatsdemo"
  }
] as const;

export type DemoReviewBlueprint = {
  venueSlug: string;
  foodSlug: string;
  /** Globally unique suffix (used in review id + stable gameDayKey) */
  idSuffix: string;
  userIdx: number;
  slopScore: number;
  napkinRating: 1 | 2 | 3 | 4 | 5;
  labels: ReviewConsensusLabel[];
  verifiedGameDay: boolean;
  /** Uses buildGameDayKey(venue, seedNow); pairs with verifiedGameDay */
  liveFresh: boolean;
  note?: string;
  photoEmoji?: string;
  helpfulLikers?: number[];
  /** Days before seedNow for createdAt (ignored when liveFresh) */
  ageDays: number;
};

export function slugifyDemoEmailLocalPart(id: string) {
  return id.replace(/^user-demo-/, "").replace(/-/g, "");
}

function toDbLabels(labels: ReviewConsensusLabel[]): ConsensusLabel[] {
  const m: Record<ReviewConsensusLabel, ConsensusLabel> = {
    "Run It Back": ConsensusLabel.RUN_IT_BACK,
    "Worth the Walk": ConsensusLabel.WORTH_THE_WALK,
    "Stadium Tax": ConsensusLabel.STADIUM_TAX,
    Steal: ConsensusLabel.STEAL,
    "Bench It": ConsensusLabel.BENCH_IT
  };
  return labels.map((l) => m[l]);
}

function br(
  venueSlug: string,
  foodSlug: string,
  idSuffix: string,
  userIdx: number,
  slopScore: number,
  napkinRating: 1 | 2 | 3 | 4 | 5,
  labels: ReviewConsensusLabel[],
  opts: {
    verifiedGameDay?: boolean;
    liveFresh?: boolean;
    ageDays?: number;
    note?: string;
    photoEmoji?: string;
    helpfulLikers?: number[];
  } = {}
): DemoReviewBlueprint {
  return {
    venueSlug,
    foodSlug,
    idSuffix,
    userIdx,
    slopScore,
    napkinRating,
    labels,
    verifiedGameDay: opts.verifiedGameDay ?? false,
    liveFresh: opts.liveFresh ?? false,
    note: opts.note,
    photoEmoji: opts.photoEmoji,
    helpfulLikers: opts.helpfulLikers,
    ageDays: opts.ageDays ?? 10
  };
}

type PackSpec = {
  u: number;
  score: number;
  nap: 1 | 2 | 3 | 4 | 5;
  labels: ReviewConsensusLabel[];
  note: string;
  /** Live Fresh row for today */
  fresh?: boolean;
  /** Older verified game-day signal */
  vfPast?: boolean;
  ageDays?: number;
  photoEmoji?: string;
  helpfulLikers?: number[];
};

function pack(
  venueSlug: string,
  foodSlug: string,
  prefix: string,
  specs: PackSpec[]
): DemoReviewBlueprint[] {
  return specs.map((s, i) =>
    br(venueSlug, foodSlug, `${prefix}-${String(i + 1).padStart(2, "0")}`, s.u, s.score, s.nap, s.labels, {
      verifiedGameDay: Boolean(s.fresh || s.vfPast),
      liveFresh: Boolean(s.fresh),
      ageDays: s.fresh ? 0 : (s.ageDays ?? 14),
      note: s.note,
      photoEmoji: s.photoEmoji,
      helpfulLikers: s.helpfulLikers
    })
  );
}

function demoTargetField(): DemoReviewBlueprint[] {
  const venue = "target-field";
  return [
    ...pack(venue, "la-madre-street-elote", "tf-elote", [
      {
        u: 0,
        score: 8.9,
        nap: 3,
        labels: ["Run It Back", "Worth the Walk"],
        fresh: true,
        note: "Best bite near right field so far.",
        photoEmoji: "🌽"
      },
      {
        u: 1,
        score: 8.3,
        nap: 3,
        labels: ["Worth the Walk", "Stadium Tax"],
        fresh: true,
        note: "Worth the wait if the line is short.",
        photoEmoji: "🌽"
      },
      { u: 4, score: 8.1, nap: 3, labels: ["Worth the Walk"], ageDays: 30, note: "Consistent cup; line spins fast.", photoEmoji: "🌽" },
      { u: 5, score: 7.6, nap: 3, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 45, note: "Good tang, small portion." }
    ]),
    ...pack(venue, "mac-yes-buffalo-chicken-mac", "tf-mac", [
      {
        u: 2,
        score: 8.8,
        nap: 4,
        labels: ["Run It Back", "Steal"],
        fresh: true,
        note: "Creamy heat without going sweet—surprised.",
        photoEmoji: "🧀",
        helpfulLikers: [3, 4, 5, 6]
      },
      {
        u: 3,
        score: 8.2,
        nap: 4,
        labels: ["Worth the Walk", "Stadium Tax"],
        fresh: true,
        note: "Shareable bowl; napkins required.",
        photoEmoji: "🧀"
      },
      { u: 6, score: 8.5, nap: 4, labels: ["Run It Back"], vfPast: true, ageDays: 6, note: "Brisket smoke comes through.", photoEmoji: "🧀" },
      { u: 7, score: 7.9, nap: 4, labels: ["Worth the Walk"], ageDays: 18, note: "Heavier than it looks—in a good way." },
      { u: 8, score: 7.4, nap: 3, labels: ["Stadium Tax"], ageDays: 24, note: "Great flavor, but tough at this price." }
    ]),
    ...pack(venue, "frozen-lemonade", "tf-lemon", [
      {
        u: 4,
        score: 9.1,
        nap: 2,
        labels: ["Steal", "Run It Back"],
        fresh: true,
        note: "Cold enough to survive a doubleheader.",
        photoEmoji: "🍋"
      },
      {
        u: 5,
        score: 8.7,
        nap: 2,
        labels: ["Steal", "Worth the Walk"],
        fresh: true,
        note: "Family concourse MVP on hot days.",
        photoEmoji: "🍋"
      },
      { u: 9, score: 8.4, nap: 2, labels: ["Steal"], ageDays: 9, note: "Simple and still the right call." },
      { u: 0, score: 8.0, nap: 2, labels: ["Worth the Walk"], ageDays: 20, note: "Not too sweet—refreshing." },
      { u: 1, score: 7.7, nap: 2, labels: ["Stadium Tax"], ageDays: 33, note: "Line moves; cup size is stadium-fair." }
    ]),
    ...pack(venue, "loaded-cheese-curds", "tf-curd", [
      {
        u: 6,
        score: 9.4,
        nap: 3,
        labels: ["Run It Back", "Steal"],
        vfPast: true,
        ageDays: 3,
        note: "Leader on the board for a reason—hot and loud.",
        photoEmoji: "🧀",
        helpfulLikers: [0, 1, 2, 7, 8]
      },
      { u: 7, score: 9.1, nap: 3, labels: ["Run It Back", "Worth the Walk"], ageDays: 5, note: "Cheese pull for days.", photoEmoji: "🧀" },
      { u: 8, score: 8.9, nap: 3, labels: ["Run It Back"], ageDays: 7, note: "Salty, shareable, stays crisp.", photoEmoji: "🧀" },
      { u: 2, score: 8.8, nap: 3, labels: ["Steal"], ageDays: 11, note: "Still the best bang for the basket." },
      { u: 3, score: 8.6, nap: 4, labels: ["Worth the Walk"], ageDays: 15, note: "Grab extra napkins.", photoEmoji: "🧀" },
      { u: 9, score: 8.4, nap: 3, labels: ["Stadium Tax"], ageDays: 19, note: "Great bite—price stings a little." }
    ]),
    ...pack(venue, "red-cow-double-barrel-burger", "tf-burger", [
      { u: 0, score: 8.5, nap: 4, labels: ["Run It Back", "Worth the Walk"], ageDays: 4, note: "Juicy stack; bun holds up.", photoEmoji: "🍔", helpfulLikers: [1, 4] },
      { u: 1, score: 8.3, nap: 4, labels: ["Worth the Walk"], ageDays: 5, note: "Two-handed problem—in the best way.", photoEmoji: "🍔" },
      { u: 2, score: 8.2, nap: 4, labels: ["Run It Back"], ageDays: 6, note: "Hits smoky notes near upper deck.", photoEmoji: "🍔", helpfulLikers: [3, 5, 6, 7] },
      { u: 3, score: 8.0, nap: 4, labels: ["Stadium Tax"], ageDays: 8, note: "Flavor beats the sticker shock.", photoEmoji: "🍔" },
      { u: 4, score: 7.9, nap: 4, labels: ["Worth the Walk", "Stadium Tax"], ageDays: 10, note: "Worth grabbing before the rush." },
      { u: 5, score: 7.8, nap: 4, labels: ["Worth the Walk"], ageDays: 12, note: "Consistent cook on busy nights." },
      { u: 6, score: 7.6, nap: 4, labels: ["Stadium Tax"], ageDays: 14, note: "Good, not quite a steal." },
      { u: 7, score: 7.5, nap: 4, labels: ["Worth the Walk"], ageDays: 16, note: "Lines long after the 5th." }
    ]),
    ...pack(venue, "union-hmong-sweet-sour-pork", "tf-hmong-pork", [
      { u: 8, score: 9.0, nap: 3, labels: ["Run It Back", "Steal"], ageDays: 8, note: "Sleeper pick—acid and crunch pop.", photoEmoji: "🍚", helpfulLikers: [9] },
      { u: 9, score: 8.7, nap: 3, labels: ["Run It Back"], ageDays: 9, note: "Best balance of sweet and sour tonight." },
      { u: 0, score: 8.6, nap: 3, labels: ["Worth the Walk"], ageDays: 10, note: "Small menu, big flavor." }
    ]),
    ...pack(venue, "pizza-luce-slice", "tf-pizza", [
      { u: 1, score: 4.8, nap: 3, labels: ["Bench It", "Stadium Tax"], ageDays: 6, note: "Soggy middle by the 7th.", photoEmoji: "🍕" },
      { u: 2, score: 5.2, nap: 3, labels: ["Bench It"], ageDays: 7, note: "Ok in a pinch—don’t sprint for it.", photoEmoji: "🍕" },
      { u: 3, score: 5.5, nap: 3, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 9, note: "Crust saved it; toppings were shy." },
      { u: 4, score: 5.9, nap: 3, labels: ["Worth the Walk"], ageDays: 11, note: "GF option is thoughtful; wait was long." },
      { u: 5, score: 6.1, nap: 3, labels: ["Stadium Tax"], ageDays: 13, note: "Fair slice—nothing flashy." }
    ])
  ];
}

function demoWrigleyField(): DemoReviewBlueprint[] {
  const venue = "wrigley-field";
  return [
    ...pack(venue, "wrigley-double-diamond-fries", "wf-fries", [
      { u: 0, score: 9.2, nap: 4, labels: ["Run It Back", "Steal"], ageDays: 4, note: "Loaded fries that earn the hype.", photoEmoji: "🍟", helpfulLikers: [1, 2, 3] },
      { u: 1, score: 9.0, nap: 4, labels: ["Run It Back"], ageDays: 5, note: "Short rib bite holds heat.", photoEmoji: "🍟" },
      { u: 2, score: 8.8, nap: 4, labels: ["Steal"], ageDays: 7, note: "Share plate unless you’re greedy.", photoEmoji: "🍟" },
      { u: 3, score: 8.6, nap: 4, labels: ["Worth the Walk"], ageDays: 9, note: "Rich—plan water.", helpfulLikers: [4] },
      { u: 4, score: 8.4, nap: 4, labels: ["Worth the Walk", "Stadium Tax"], ageDays: 11, note: "Stadium tax but worth once a homestand." },
      { u: 5, score: 8.2, nap: 4, labels: ["Stadium Tax"], ageDays: 13, note: "Flavor wins; line swings big." }
    ]),
    ...pack(venue, "wrigley-small-cheval-double", "wf-cheval", [
      { u: 6, score: 8.1, nap: 4, labels: ["Run It Back"], ageDays: 3, note: "Most-reviewed feel—still smashes.", photoEmoji: "🍔", helpfulLikers: [7, 8] },
      { u: 7, score: 8.0, nap: 4, labels: ["Worth the Walk"], ageDays: 4, note: "Smash crispy edges.", photoEmoji: "🍔" },
      { u: 8, score: 7.9, nap: 4, labels: ["Worth the Walk"], ageDays: 5, note: "Bleachers trek paid off.", photoEmoji: "🍔" },
      { u: 9, score: 7.8, nap: 4, labels: ["Stadium Tax"], ageDays: 6, note: "Great burger—fair deal vibes.", helpfulLikers: [0, 1] },
      { u: 0, score: 7.7, nap: 4, labels: ["Worth the Walk"], ageDays: 7, note: "Pickles snap; bun holds." },
      { u: 1, score: 7.6, nap: 4, labels: ["Stadium Tax"], ageDays: 8, note: "Line stacks after 7th inning stretch." },
      { u: 2, score: 7.5, nap: 4, labels: ["Worth the Walk"], ageDays: 9, note: "Double is a commitment—do it hungry." },
      { u: 3, score: 7.4, nap: 4, labels: ["Stadium Tax"], ageDays: 10, note: "Reliable when the deck is packed." }
    ]),
    ...pack(venue, "wrigley-tostada-stack-item", "wf-tostada", [
      { u: 4, score: 8.9, nap: 3, labels: ["Run It Back", "Steal"], ageDays: 10, note: "Sleeper: egg yolk seals it.", photoEmoji: "🌮", helpfulLikers: [5] },
      { u: 5, score: 8.5, nap: 3, labels: ["Run It Back"], ageDays: 11, note: "Crunch holds through the walk back." },
      { u: 6, score: 8.3, nap: 3, labels: ["Worth the Walk"], ageDays: 12, note: "Spice level is stadium-friendly." }
    ]),
    ...pack(venue, "wrigley-bao-wow-dog-item", "wf-bao", [
      { u: 7, score: 7.9, nap: 3, labels: ["Worth the Walk", "Stadium Tax"], ageDays: 6, note: "Fun mashup—slaw has zip.", photoEmoji: "🌭" },
      { u: 8, score: 7.6, nap: 3, labels: ["Worth the Walk"], ageDays: 8, note: "Bao holds; dog snaps." },
      { u: 9, score: 7.4, nap: 3, labels: ["Stadium Tax"], ageDays: 10, note: "Good—not quite a steal." },
      { u: 0, score: 7.2, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Worth trying once a trip." }
    ]),
    ...pack(venue, "wrigley-hri-tavern-slice", "wf-pizza", [
      { u: 1, score: 8.0, nap: 3, labels: ["Steal", "Worth the Walk"], ageDays: 5, note: "Thin slice carries crunch.", photoEmoji: "🍕" },
      { u: 2, score: 7.8, nap: 3, labels: ["Steal"], ageDays: 7, note: "Quick snack between innings." },
      { u: 3, score: 7.5, nap: 3, labels: ["Worth the Walk"], ageDays: 9, note: "Cheese pull beats expectations." },
      { u: 4, score: 7.3, nap: 3, labels: ["Stadium Tax"], ageDays: 11, note: "Fair slice on a busy Friday." },
      { u: 5, score: 7.1, nap: 3, labels: ["Stadium Tax"], ageDays: 13, note: "Gets floppy if you stall." }
    ]),
    ...pack(venue, "wrigley-chicken-churros", "wf-churros", [
      { u: 6, score: 5.4, nap: 3, labels: ["Bench It", "Stadium Tax"], ageDays: 6, note: "Chicken cooled off fast.", photoEmoji: "🍗" },
      { u: 7, score: 5.8, nap: 3, labels: ["Bench It"], ageDays: 8, note: "Churros saved the tray.", photoEmoji: "🍗" },
      { u: 8, score: 6.1, nap: 3, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 10, note: "Bleachers breeze didn’t help crispness." },
      { u: 9, score: 6.4, nap: 3, labels: ["Worth the Walk"], ageDays: 12, note: "Ok shareable—don’t prioritize." },
      { u: 0, score: 6.6, nap: 3, labels: ["Stadium Tax"], ageDays: 14, note: "Fun idea; execution uneven." }
    ])
  ];
}

function demoFenwayPark(): DemoReviewBlueprint[] {
  const venue = "fenway-park";
  return [
    ...pack(venue, "fenway-lobstah-poutine-item", "fp-poutine", [
      { u: 0, score: 9.3, nap: 3, labels: ["Run It Back", "Steal"], ageDays: 3, note: "Lobster heat meets fries—crowd pleaser.", photoEmoji: "🦞", helpfulLikers: [1, 2] },
      { u: 1, score: 9.0, nap: 3, labels: ["Run It Back"], ageDays: 4, note: "Chowder tie-in works.", photoEmoji: "🦞" },
      { u: 2, score: 8.8, nap: 3, labels: ["Steal"], ageDays: 6, note: "Share unless you’re starving.", photoEmoji: "🦞" },
      { u: 3, score: 8.6, nap: 3, labels: ["Worth the Walk"], ageDays: 8, note: "Rich—sip something cold.", helpfulLikers: [4] },
      { u: 4, score: 8.4, nap: 3, labels: ["Worth the Walk", "Stadium Tax"], ageDays: 10, note: "Line moves before anthem.", photoEmoji: "🦞" },
      { u: 5, score: 8.2, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Still reorder territory." }
    ]),
    ...pack(venue, "fenway-kayem-frank", "fp-frank", [
      { u: 6, score: 8.0, nap: 3, labels: ["Worth the Walk"], ageDays: 2, note: "Classic lane—fast grab.", photoEmoji: "🌭", helpfulLikers: [7, 8, 9, 0] },
      { u: 7, score: 7.9, nap: 3, labels: ["Worth the Walk"], ageDays: 3, note: "Snap still good mid-game.", photoEmoji: "🌭" },
      { u: 8, score: 7.8, nap: 3, labels: ["Stadium Tax"], ageDays: 4, note: "Simple comfort.", photoEmoji: "🌭" },
      { u: 9, score: 7.7, nap: 3, labels: ["Worth the Walk"], ageDays: 5, note: "Condiment bar saves bland bites." },
      { u: 0, score: 7.6, nap: 3, labels: ["Stadium Tax"], ageDays: 6, note: "Gets you back to seats fast." },
      { u: 1, score: 7.5, nap: 3, labels: ["Worth the Walk"], ageDays: 7, note: "Reliable when lines spike elsewhere." },
      { u: 2, score: 7.4, nap: 3, labels: ["Stadium Tax"], ageDays: 8, note: "Fair—not flashy.", helpfulLikers: [3] },
      { u: 3, score: 7.3, nap: 3, labels: ["Stadium Tax"], ageDays: 9, note: "Benchmark dog for the park." }
    ]),
    ...pack(venue, "fenway-lukes-lobster-roll", "fp-lobster-roll", [
      { u: 4, score: 8.9, nap: 2, labels: ["Run It Back", "Steal"], ageDays: 11, note: "Sleeper quality—cold-water flavor.", photoEmoji: "🦞", helpfulLikers: [5] },
      { u: 5, score: 8.6, nap: 2, labels: ["Run It Back"], ageDays: 12, note: "Butter toast carries crunch.", photoEmoji: "🦞" },
      { u: 6, score: 8.4, nap: 2, labels: ["Worth the Walk"], ageDays: 13, note: "Small splurge that delivers." }
    ]),
    ...pack(venue, "fenway-green-monster-fries-item", "fp-gm-fries", [
      { u: 7, score: 8.1, nap: 4, labels: ["Worth the Walk"], ageDays: 5, note: "Loaded fries stay crispy awhile.", photoEmoji: "🍟" },
      { u: 8, score: 7.9, nap: 4, labels: ["Stadium Tax"], ageDays: 7, note: "Salt-forward—grab water.", photoEmoji: "🍟" },
      { u: 9, score: 7.7, nap: 4, labels: ["Worth the Walk"], ageDays: 9, note: "Big concourse energy.", helpfulLikers: [0] },
      { u: 0, score: 7.5, nap: 4, labels: ["Stadium Tax"], ageDays: 11, note: "Fair plate for sharing." }
    ]),
    ...pack(venue, "fenway-north-end-cannoli-item", "fp-cannoli", [
      { u: 1, score: 8.5, nap: 2, labels: ["Steal", "Run It Back"], ageDays: 4, note: "Crisp shell, creamy middle.", photoEmoji: "🍫" },
      { u: 2, score: 8.2, nap: 2, labels: ["Steal"], ageDays: 6, note: "Sweet finish without gluey filling.", photoEmoji: "🍫" },
      { u: 3, score: 8.0, nap: 2, labels: ["Worth the Walk"], ageDays: 8, note: "Nice pacing between innings." },
      { u: 4, score: 7.8, nap: 2, labels: ["Worth the Walk"], ageDays: 10, note: "Portable dessert win." },
      { u: 5, score: 7.6, nap: 2, labels: ["Stadium Tax"], ageDays: 12, note: "Good—not earth-shattering." }
    ]),
    ...pack(venue, "fenway-spicy-cabot-grilled-cheese-item", "fp-grilled-cheese", [
      { u: 6, score: 5.5, nap: 3, labels: ["Bench It", "Stadium Tax"], ageDays: 5, note: "Greasy squeeze—needs napkins.", photoEmoji: "🧀" },
      { u: 7, score: 5.9, nap: 3, labels: ["Bench It"], ageDays: 7, note: "Flavor ok—bread went soft.", photoEmoji: "🧀" },
      { u: 8, score: 6.2, nap: 3, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 9, note: "Heat helped but uneven melt." },
      { u: 9, score: 6.5, nap: 3, labels: ["Worth the Walk"], ageDays: 11, note: "Would retry if line is short." },
      { u: 0, score: 6.8, nap: 3, labels: ["Stadium Tax"], ageDays: 13, note: "Bench-it vibes unless you’re starving." }
    ])
  ];
}

function demoDodgerStadium(): DemoReviewBlueprint[] {
  const venue = "dodger-stadium";
  return [
    ...pack(venue, "dodgers-dodger-dog", "la-dog", [
      { u: 0, score: 9.1, nap: 3, labels: ["Run It Back", "Steal"], ageDays: 3, note: "Foot-long classic—still snaps.", photoEmoji: "🌭", helpfulLikers: [1, 2] },
      { u: 1, score: 8.9, nap: 3, labels: ["Run It Back"], ageDays: 4, note: "Mustard stripe hits.", photoEmoji: "🌭" },
      { u: 2, score: 8.7, nap: 3, labels: ["Steal"], ageDays: 6, note: "Lines worth budgeting time.", photoEmoji: "🌭" },
      { u: 3, score: 8.5, nap: 3, labels: ["Worth the Walk"], ageDays: 8, note: "Reliable seventh-inning grab.", helpfulLikers: [4] },
      { u: 4, score: 8.3, nap: 3, labels: ["Worth the Walk"], ageDays: 10, note: "Shareable if you slice it.", photoEmoji: "🌭" },
      { u: 5, score: 8.1, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Park icon—bias included." }
    ]),
    ...pack(venue, "dodgers-kh-garlic-fry-helmet", "la-garlic-fries", [
      { u: 6, score: 8.4, nap: 4, labels: ["Run It Back"], ageDays: 2, note: "Most-reviewed helmet—garlic hangs.", photoEmoji: "🍟", helpfulLikers: [7, 8, 9, 0] },
      { u: 7, score: 8.2, nap: 4, labels: ["Worth the Walk"], ageDays: 3, note: "Cheesy aroma travels.", photoEmoji: "🍟" },
      { u: 8, score: 8.1, nap: 4, labels: ["Worth the Walk"], ageDays: 4, note: "Crisp edges survive walk.", photoEmoji: "🍟" },
      { u: 9, score: 8.0, nap: 4, labels: ["Stadium Tax"], ageDays: 5, note: "Heavy—plan seats nearby.", helpfulLikers: [1] },
      { u: 0, score: 7.9, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "Share unless you’re greedy.", photoEmoji: "🍟" },
      { u: 1, score: 7.8, nap: 4, labels: ["Stadium Tax"], ageDays: 7, note: "Fair garlic punch.", photoEmoji: "🍟" },
      { u: 2, score: 7.7, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Hits better hot.", helpfulLikers: [3] },
      { u: 3, score: 7.6, nap: 4, labels: ["Stadium Tax"], ageDays: 9, note: "Sometimes salty swings.", photoEmoji: "🍟" }
    ]),
    ...pack(venue, "dodgers-loco-moco-bowl", "la-loco", [
      { u: 4, score: 8.8, nap: 3, labels: ["Run It Back", "Steal"], ageDays: 10, note: "Sleeper bowl—comfort bomb.", photoEmoji: "🍚", helpfulLikers: [5] },
      { u: 5, score: 8.5, nap: 3, labels: ["Run It Back"], ageDays: 11, note: "Gravy ties it together.", photoEmoji: "🍚" },
      { u: 6, score: 8.3, nap: 3, labels: ["Worth the Walk"], ageDays: 12, note: "Heavier plate—grab napkins." }
    ]),
    ...pack(venue, "dodgers-chow-mein-burrito", "la-burrito", [
      { u: 7, score: 8.0, nap: 3, labels: ["Worth the Walk", "Stadium Tax"], ageDays: 6, note: "Fusion crunch hits.", photoEmoji: "🌯" },
      { u: 8, score: 7.8, nap: 3, labels: ["Worth the Walk"], ageDays: 8, note: "Messy fork food disguised as handheld.", photoEmoji: "🌯" },
      { u: 9, score: 7.6, nap: 3, labels: ["Stadium Tax"], ageDays: 10, note: "Fun reserve-level snack.", helpfulLikers: [0] },
      { u: 0, score: 7.4, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Fair deal—not a steal." }
    ]),
    ...pack(venue, "dodgers-pineapple-dole-whip", "la-dole", [
      { u: 1, score: 8.9, nap: 2, labels: ["Steal", "Run It Back"], ageDays: 4, note: "Cold swirl saves hot innings.", photoEmoji: "🍍" },
      { u: 2, score: 8.6, nap: 2, labels: ["Steal"], ageDays: 6, note: "Sweet without chalky finish.", photoEmoji: "🍍" },
      { u: 3, score: 8.4, nap: 2, labels: ["Worth the Walk"], ageDays: 8, note: "Top deck breeze pairing.", helpfulLikers: [4] },
      { u: 4, score: 8.2, nap: 2, labels: ["Worth the Walk"], ageDays: 10, note: "Quick dessert lane.", photoEmoji: "🍍" },
      { u: 5, score: 8.0, nap: 2, labels: ["Stadium Tax"], ageDays: 12, note: "Line spikes—worth timing." }
    ]),
    ...pack(venue, "dodgers-cheeto-lote", "la-lote", [
      { u: 6, score: 5.8, nap: 3, labels: ["Bench It", "Stadium Tax"], ageDays: 5, note: "Novelty overload—messy.", photoEmoji: "🌽" },
      { u: 7, score: 6.1, nap: 3, labels: ["Bench It"], ageDays: 7, note: "Cheetos sog fast.", photoEmoji: "🌽" },
      { u: 8, score: 6.4, nap: 3, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 9, note: "Fun photo food.", helpfulLikers: [9] },
      { u: 9, score: 6.7, nap: 3, labels: ["Worth the Walk"], ageDays: 11, note: "Would skip unless curious." },
      { u: 0, score: 7.0, nap: 3, labels: ["Stadium Tax"], ageDays: 13, note: "Sticky hands chapter." }
    ])
  ];
}

function demoPetcoPark(): DemoReviewBlueprint[] {
  const venue = "petco-park";
  return [
    ...pack(venue, "petco-cardiff-crack-trip-tip", "sd-trip-tip", [
      { u: 0, score: 9.2, nap: 3, labels: ["Run It Back", "Steal"], ageDays: 3, note: "Smoke ring tender—park standout.", photoEmoji: "🥩", helpfulLikers: [1, 2] },
      { u: 1, score: 9.0, nap: 3, labels: ["Run It Back"], ageDays: 4, note: "Slice stays juicy.", photoEmoji: "🥩" },
      { u: 2, score: 8.8, nap: 3, labels: ["Steal"], ageDays: 6, note: "Worth detour from baseline seats.", photoEmoji: "🥩" },
      { u: 3, score: 8.6, nap: 3, labels: ["Worth the Walk"], ageDays: 8, note: "Sauce on point.", helpfulLikers: [4] },
      { u: 4, score: 8.4, nap: 3, labels: ["Worth the Walk"], ageDays: 10, note: "Share plate unless you're starving.", photoEmoji: "🥩" },
      { u: 5, score: 8.2, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Premium cut—pricing shows." }
    ]),
    ...pack(venue, "petco-hodads-bacon-cheeseburger", "sd-hodads", [
      { u: 6, score: 8.3, nap: 4, labels: ["Run It Back"], ageDays: 2, note: "Most-reviewed smash—still crunchy.", photoEmoji: "🍔", helpfulLikers: [7, 8, 9] },
      { u: 7, score: 8.2, nap: 4, labels: ["Worth the Walk"], ageDays: 3, note: "Bacon renders right.", photoEmoji: "🍔" },
      { u: 8, score: 8.1, nap: 4, labels: ["Worth the Walk"], ageDays: 4, note: "Juice drip watch.", photoEmoji: "🍔" },
      { u: 9, score: 8.0, nap: 4, labels: ["Stadium Tax"], ageDays: 5, note: "Fair burger tax.", helpfulLikers: [0] },
      { u: 0, score: 7.9, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "Pickles snap.", photoEmoji: "🍔" },
      { u: 1, score: 7.8, nap: 4, labels: ["Stadium Tax"], ageDays: 7, note: "Lines spike weekends.", photoEmoji: "🍔" },
      { u: 2, score: 7.7, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Reliable Hodad’s bite.", helpfulLikers: [3] },
      { u: 3, score: 7.6, nap: 4, labels: ["Stadium Tax"], ageDays: 9, note: "Gets messy—extra napkins.", photoEmoji: "🍔" }
    ]),
    ...pack(venue, "petco-deckmans-shrimp-ceviche", "sd-ceviche", [
      { u: 4, score: 8.9, nap: 2, labels: ["Run It Back", "Steal"], ageDays: 10, note: "Sleeper bright acid—feels coastal.", photoEmoji: "🦐", helpfulLikers: [5] },
      { u: 5, score: 8.6, nap: 2, labels: ["Run It Back"], ageDays: 11, note: "Chilled cup stays crisp.", photoEmoji: "🦐" },
      { u: 6, score: 8.4, nap: 2, labels: ["Worth the Walk"], ageDays: 12, note: "Garden-level breeze bonus." }
    ]),
    ...pack(venue, "petco-curry-rice", "sd-curry", [
      { u: 7, score: 8.1, nap: 3, labels: ["Worth the Walk"], ageDays: 6, note: "Comfort curry near Mercado.", photoEmoji: "🍛" },
      { u: 8, score: 7.9, nap: 3, labels: ["Stadium Tax"], ageDays: 8, note: "Mild stadium spice.", photoEmoji: "🍛" },
      { u: 9, score: 7.7, nap: 3, labels: ["Worth the Walk"], ageDays: 10, note: "Good filler between innings.", helpfulLikers: [0] },
      { u: 0, score: 7.5, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Rice fluffy—portion fair." }
    ]),
    ...pack(venue, "petco-mini-donut-glazed", "sd-donut", [
      { u: 1, score: 8.5, nap: 2, labels: ["Steal", "Run It Back"], ageDays: 4, note: "Warm glaze hooks you.", photoEmoji: "🍩" },
      { u: 2, score: 8.3, nap: 2, labels: ["Steal"], ageDays: 6, note: "Kid-speed dessert lane.", photoEmoji: "🍩" },
      { u: 3, score: 8.1, nap: 2, labels: ["Worth the Walk"], ageDays: 8, note: "Share bag unless greedy.", helpfulLikers: [4] },
      { u: 4, score: 7.9, nap: 2, labels: ["Worth the Walk"], ageDays: 10, note: "Sweet—but stops short of sticky.", photoEmoji: "🍩" },
      { u: 5, score: 7.7, nap: 2, labels: ["Stadium Tax"], ageDays: 12, note: "Fair stadium donut tax." }
    ]),
    ...pack(venue, "petco-gaglione-cheesesteak", "sd-cheesesteak", [
      { u: 6, score: 6.2, nap: 3, labels: ["Bench It", "Stadium Tax"], ageDays: 5, note: "Bread went chewy fast.", photoEmoji: "🥪" },
      { u: 7, score: 6.5, nap: 3, labels: ["Bench It"], ageDays: 7, note: "Meat ok—needs more melt.", photoEmoji: "🥪" },
      { u: 8, score: 6.8, nap: 3, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 9, note: "Garlic fries nearby redeem trip.", helpfulLikers: [9] },
      { u: 9, score: 7.1, nap: 3, labels: ["Worth the Walk"], ageDays: 11, note: "Would reorder only if short line." },
      { u: 0, score: 7.3, nap: 3, labels: ["Stadium Tax"], ageDays: 13, note: "Bench-it unless craving steak." }
    ])
  ];
}

function demoCitizensBankPark(): DemoReviewBlueprint[] {
  const venue = "citizens-bank-park";
  return [
    ...pack(venue, "phillies-crabfries", "cbp-crabfries", [
      { u: 0, score: 9.0, nap: 4, labels: ["Run It Back", "Steal"], ageDays: 3, note: "Crab spice nails stadium fries.", photoEmoji: "🍟", helpfulLikers: [1, 2] },
      { u: 1, score: 8.8, nap: 4, labels: ["Run It Back"], ageDays: 4, note: "Cheese drizzle stays warm.", photoEmoji: "🍟" },
      { u: 2, score: 8.6, nap: 4, labels: ["Steal"], ageDays: 6, note: "Ashburn Alley traffic worth it.", photoEmoji: "🍟" },
      { u: 3, score: 8.4, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Share tray.", helpfulLikers: [4] },
      { u: 4, score: 8.2, nap: 4, labels: ["Worth the Walk"], ageDays: 10, note: "Napkins mandatory.", photoEmoji: "🍟" },
      { u: 5, score: 8.0, nap: 4, labels: ["Stadium Tax"], ageDays: 12, note: "Fair crunch fade." }
    ]),
    ...pack(venue, "phillies-manco-boardwalk-slice", "cbp-pizza", [
      { u: 6, score: 8.2, nap: 3, labels: ["Worth the Walk"], ageDays: 2, note: "Most-reviewed slice—thin crunch.", photoEmoji: "🍕", helpfulLikers: [7, 8, 9] },
      { u: 7, score: 8.1, nap: 3, labels: ["Worth the Walk"], ageDays: 3, note: "Boardwalk nostalgia.", photoEmoji: "🍕" },
      { u: 8, score: 8.0, nap: 3, labels: ["Stadium Tax"], ageDays: 4, note: "Cheese pulls clean.", photoEmoji: "🍕" },
      { u: 9, score: 7.9, nap: 3, labels: ["Worth the Walk"], ageDays: 5, note: "Fold-and-go friendly.", helpfulLikers: [0] },
      { u: 0, score: 7.8, nap: 3, labels: ["Stadium Tax"], ageDays: 6, note: "Sometimes floppy—timing matters.", photoEmoji: "🍕" },
      { u: 1, score: 7.7, nap: 3, labels: ["Worth the Walk"], ageDays: 7, note: "Fair stadium slice.", photoEmoji: "🍕" },
      { u: 2, score: 7.6, nap: 3, labels: ["Stadium Tax"], ageDays: 8, note: "Quick snack lane.", helpfulLikers: [3] },
      { u: 3, score: 7.5, nap: 3, labels: ["Stadium Tax"], ageDays: 9, note: "Benchmark pizza stop.", photoEmoji: "🍕" }
    ]),
    ...pack(venue, "phillies-bulls-bbq-sampler", "cbp-bbq", [
      { u: 4, score: 8.8, nap: 4, labels: ["Run It Back", "Steal"], ageDays: 10, note: "Sleeper smoke tray.", photoEmoji: "🍖", helpfulLikers: [5] },
      { u: 5, score: 8.5, nap: 4, labels: ["Run It Back"], ageDays: 11, note: "Sampler beats guessing one meat.", photoEmoji: "🍖" },
      { u: 6, score: 8.3, nap: 4, labels: ["Worth the Walk"], ageDays: 12, note: "Sauce sticks—grab wipes." }
    ]),
    ...pack(venue, "phillies-federal-chicken-sandwich", "cbp-chicken", [
      { u: 7, score: 8.1, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "Crunch holds through walks.", photoEmoji: "🍗" },
      { u: 8, score: 7.9, nap: 4, labels: ["Stadium Tax"], ageDays: 8, note: "Juicy thigh bite.", photoEmoji: "🍗" },
      { u: 9, score: 7.7, nap: 4, labels: ["Worth the Walk"], ageDays: 10, note: "Pickle balances mayo.", helpfulLikers: [0] },
      { u: 0, score: 7.5, nap: 4, labels: ["Stadium Tax"], ageDays: 12, note: "Fair chicken sandwich tax." }
    ]),
    ...pack(venue, "phillies-tony-lukes-cheesesteak", "cbp-tony", [
      { u: 1, score: 8.6, nap: 3, labels: ["Steal", "Run It Back"], ageDays: 5, note: "Sharp prov pops.", photoEmoji: "🥪" },
      { u: 2, score: 8.4, nap: 3, labels: ["Steal"], ageDays: 7, note: "Roll chew is right.", photoEmoji: "🥪" },
      { u: 3, score: 8.2, nap: 3, labels: ["Worth the Walk"], ageDays: 9, note: "Line discipline pays off.", helpfulLikers: [4] },
      { u: 4, score: 8.0, nap: 3, labels: ["Worth the Walk"], ageDays: 11, note: "Fair steak portions.", photoEmoji: "🥪" },
      { u: 5, score: 7.8, nap: 3, labels: ["Stadium Tax"], ageDays: 13, note: "Premium-ish pricing." }
    ]),
    ...pack(venue, "phillies-hatfield-footlong-dog", "cbp-footlong", [
      { u: 6, score: 5.9, nap: 3, labels: ["Bench It", "Stadium Tax"], ageDays: 5, note: "Bun dried out inning three.", photoEmoji: "🌭" },
      { u: 7, score: 6.2, nap: 3, labels: ["Bench It"], ageDays: 7, note: "Dog snap ok—condiments carried it.", photoEmoji: "🌭" },
      { u: 8, score: 6.5, nap: 3, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 9, note: "Quick grab only.", helpfulLikers: [9] },
      { u: 9, score: 6.8, nap: 3, labels: ["Worth the Walk"], ageDays: 11, note: "Fair filler—not a highlight." },
      { u: 0, score: 7.0, nap: 3, labels: ["Stadium Tax"], ageDays: 13, note: "Bench-it unless starving." }
    ])
  ];
}

function demoYankeeStadium(): DemoReviewBlueprint[] {
  const venue = "yankee-stadium";
  return [
    ...pack(venue, "yanks-mvp-burger", "nyy-mvp", [
      { u: 0, score: 9.2, nap: 4, labels: ["Run It Back", "Steal"], ageDays: 3, note: "Two-stack richness—share if sane.", photoEmoji: "🍔", helpfulLikers: [1, 2] },
      { u: 1, score: 9.0, nap: 4, labels: ["Run It Back"], ageDays: 4, note: "Onion rings add crunch rhythm.", photoEmoji: "🍔" },
      { u: 2, score: 8.8, nap: 4, labels: ["Steal"], ageDays: 6, note: "Wagyu-ish depth for a yard.", photoEmoji: "🍔" },
      { u: 3, score: 8.6, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Napkins are not optional.", helpfulLikers: [4] },
      { u: 4, score: 8.4, nap: 4, labels: ["Worth the Walk"], ageDays: 10, note: "Line worth timing pre-4th.", photoEmoji: "🍔" },
      { u: 5, score: 8.2, nap: 4, labels: ["Stadium Tax"], ageDays: 12, note: "Sticker matches the hype—mostly." }
    ]),
    ...pack(venue, "yanks-lobels-pastrami-fries", "nyy-pastrami-fries", [
      { u: 6, score: 8.5, nap: 4, labels: ["Run It Back"], ageDays: 2, note: "Most-reviewed snack board.", photoEmoji: "🍟", helpfulLikers: [7, 8, 9, 0] },
      { u: 7, score: 8.4, nap: 4, labels: ["Worth the Walk"], ageDays: 3, note: "Pastrami edges crisp up.", photoEmoji: "🍟" },
      { u: 8, score: 8.3, nap: 4, labels: ["Worth the Walk"], ageDays: 4, note: "Fries stay hot awhile.", photoEmoji: "🍟" },
      { u: 9, score: 8.2, nap: 4, labels: ["Stadium Tax"], ageDays: 5, note: "Salty swings—grab water.", helpfulLikers: [1] },
      { u: 0, score: 8.1, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "Share unless you’re brave.", photoEmoji: "🍟" },
      { u: 1, score: 8.0, nap: 4, labels: ["Stadium Tax"], ageDays: 7, note: "Fair salt-to-meat ratio.", photoEmoji: "🍟" },
      { u: 2, score: 7.9, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Lines stack late.", helpfulLikers: [3] },
      { u: 3, score: 7.8, nap: 4, labels: ["Stadium Tax"], ageDays: 9, note: "Good-not-great if fries cool.", photoEmoji: "🍟" }
    ]),
    ...pack(venue, "yanks-angry-lobster-roll", "nyy-lobster", [
      { u: 4, score: 8.9, nap: 2, labels: ["Run It Back", "Steal"], ageDays: 10, note: "Sleeper sweet roll—split it.", photoEmoji: "🦞", helpfulLikers: [5] },
      { u: 5, score: 8.6, nap: 2, labels: ["Run It Back"], ageDays: 11, note: "Hawaiian bun softens the ride.", photoEmoji: "🦞" },
      { u: 6, score: 8.4, nap: 2, labels: ["Worth the Walk"], ageDays: 12, note: "Coastal bite in the Bronx—works." }
    ]),
    ...pack(venue, "yanks-sticky-que-chicken-sandwich", "nyy-chicken", [
      { u: 7, score: 8.2, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "Glaze sticks—extra napkins.", photoEmoji: "🍗" },
      { u: 8, score: 8.0, nap: 4, labels: ["Stadium Tax"], ageDays: 8, note: "Heat builds—pleasant burn.", photoEmoji: "🍗" },
      { u: 9, score: 7.8, nap: 4, labels: ["Worth the Walk"], ageDays: 10, note: "Pickle cuts sweet.", helpfulLikers: [0] },
      { u: 0, score: 7.6, nap: 4, labels: ["Stadium Tax"], ageDays: 12, note: "Fair chicken sando." }
    ]),
    ...pack(venue, "yanks-magnolia-banana-pudding", "nyy-pudding", [
      { u: 1, score: 8.7, nap: 2, labels: ["Steal", "Run It Back"], ageDays: 4, note: "Creamy layers—easy win.", photoEmoji: "🍌" },
      { u: 2, score: 8.5, nap: 2, labels: ["Steal"], ageDays: 6, note: "Vanilla wafers still snap.", photoEmoji: "🍌" },
      { u: 3, score: 8.3, nap: 2, labels: ["Worth the Walk"], ageDays: 8, note: "Portable dessert pace.", helpfulLikers: [4] },
      { u: 4, score: 8.1, nap: 2, labels: ["Worth the Walk"], ageDays: 10, note: "Sweet but not cloying.", photoEmoji: "🍌" },
      { u: 5, score: 7.9, nap: 2, labels: ["Stadium Tax"], ageDays: 12, note: "Cup melts fast—eat early." }
    ]),
    ...pack(venue, "yanks-99-burger", "nyy-99", [
      { u: 6, score: 6.4, nap: 4, labels: ["Bench It", "Stadium Tax"], ageDays: 5, note: "Gimmick bun—middling bite.", photoEmoji: "🍔" },
      { u: 7, score: 6.7, nap: 4, labels: ["Bench It"], ageDays: 7, note: "Marketing beats flavor.", photoEmoji: "🍔" },
      { u: 8, score: 7.0, nap: 4, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 9, note: "Photo food unless tweaked.", helpfulLikers: [9] },
      { u: 9, score: 7.3, nap: 4, labels: ["Worth the Walk"], ageDays: 11, note: "Fair—not roster staple." },
      { u: 0, score: 7.5, nap: 4, labels: ["Stadium Tax"], ageDays: 13, note: "Skip if lines insane." }
    ])
  ];
}

function demoCitiField(): DemoReviewBlueprint[] {
  const venue = "citi-field";
  return [
    ...pack(venue, "citi-the-caprese", "nym-caprese", [
      { u: 0, score: 9.1, nap: 4, labels: ["Run It Back", "Steal"], ageDays: 3, note: "Ciabatta crunch carries basil aioli.", photoEmoji: "🍔", helpfulLikers: [1, 2] },
      { u: 1, score: 8.9, nap: 4, labels: ["Run It Back"], ageDays: 4, note: "Tomatoes taste sunny.", photoEmoji: "🍔" },
      { u: 2, score: 8.7, nap: 4, labels: ["Steal"], ageDays: 6, note: "Patty smash stays juicy.", photoEmoji: "🍔" },
      { u: 3, score: 8.5, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Garlic butter reads fancy.", helpfulLikers: [4] },
      { u: 4, score: 8.3, nap: 4, labels: ["Worth the Walk"], ageDays: 10, note: "Premium lane worth timing.", photoEmoji: "🍔" },
      { u: 5, score: 8.1, nap: 4, labels: ["Stadium Tax"], ageDays: 12, note: "Fair stadium splurge." }
    ]),
    ...pack(venue, "citi-shackburger", "nym-shack", [
      { u: 6, score: 8.4, nap: 4, labels: ["Run It Back"], ageDays: 2, note: "Most-reviewed shack smash.", photoEmoji: "🍔", helpfulLikers: [7, 8, 9] },
      { u: 7, score: 8.3, nap: 4, labels: ["Worth the Walk"], ageDays: 3, note: "Martin’s roll squish.", photoEmoji: "🍔" },
      { u: 8, score: 8.2, nap: 4, labels: ["Worth the Walk"], ageDays: 4, note: "Cheese lace crispy.", photoEmoji: "🍔" },
      { u: 9, score: 8.1, nap: 4, labels: ["Stadium Tax"], ageDays: 5, note: "Line discipline matters.", helpfulLikers: [0] },
      { u: 0, score: 8.0, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "Classic shack bite.", photoEmoji: "🍔" },
      { u: 1, score: 7.9, nap: 4, labels: ["Stadium Tax"], ageDays: 7, note: "Sometimes soggy bun timing.", photoEmoji: "🍔" },
      { u: 2, score: 7.8, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Still reorder territory.", helpfulLikers: [3] },
      { u: 3, score: 7.7, nap: 4, labels: ["Stadium Tax"], ageDays: 9, note: "Fair Shake Shack tax.", photoEmoji: "🍔" }
    ]),
    ...pack(venue, "citi-filet-mignon-steak-sandwich", "nym-filet", [
      { u: 4, score: 8.9, nap: 3, labels: ["Run It Back", "Steal"], ageDays: 10, note: "Sleeper tender steak sando.", photoEmoji: "🥪", helpfulLikers: [5] },
      { u: 5, score: 8.6, nap: 3, labels: ["Run It Back"], ageDays: 11, note: "Cuts clean—premium chew.", photoEmoji: "🥪" },
      { u: 6, score: 8.4, nap: 3, labels: ["Worth the Walk"], ageDays: 12, note: "Share unless budget-blind." }
    ]),
    ...pack(venue, "citi-loaded-cornbread", "nym-cornbread", [
      { u: 7, score: 8.2, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "BBQ toppings soak right.", photoEmoji: "🍞" },
      { u: 8, score: 8.0, nap: 4, labels: ["Stadium Tax"], ageDays: 8, note: "Cheese pull messy-good.", photoEmoji: "🍞" },
      { u: 9, score: 7.8, nap: 4, labels: ["Worth the Walk"], ageDays: 10, note: "Heavy fork food.", helpfulLikers: [0] },
      { u: 0, score: 7.6, nap: 4, labels: ["Stadium Tax"], ageDays: 12, note: "Fair plate—not diet friendly." }
    ]),
    ...pack(venue, "citi-dole-whip-item", "nym-dole", [
      { u: 1, score: 8.8, nap: 2, labels: ["Steal", "Run It Back"], ageDays: 4, note: "Cold swirl MVP.", photoEmoji: "🍍" },
      { u: 2, score: 8.6, nap: 2, labels: ["Steal"], ageDays: 6, note: "Pineapple punch stays clean.", photoEmoji: "🍍" },
      { u: 3, score: 8.4, nap: 2, labels: ["Worth the Walk"], ageDays: 8, note: "Quick dessert lane.", helpfulLikers: [4] },
      { u: 4, score: 8.2, nap: 2, labels: ["Worth the Walk"], ageDays: 10, note: "Kid-speed friendly.", photoEmoji: "🍍" },
      { u: 5, score: 8.0, nap: 2, labels: ["Stadium Tax"], ageDays: 12, note: "Line spikes—worth timing." }
    ]),
    ...pack(venue, "citi-vegan-hot-dog", "nym-vegan-dog", [
      { u: 6, score: 6.0, nap: 3, labels: ["Bench It", "Stadium Tax"], ageDays: 5, note: "Texture closer to sausage than beef.", photoEmoji: "🌭" },
      { u: 7, score: 6.3, nap: 3, labels: ["Bench It"], ageDays: 7, note: "Toppings carried the bite.", photoEmoji: "🌭" },
      { u: 8, score: 6.6, nap: 3, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 9, note: "Ok alternative—not crave-worthy.", helpfulLikers: [9] },
      { u: 9, score: 6.9, nap: 3, labels: ["Worth the Walk"], ageDays: 11, note: "Fair plant-forward snack." },
      { u: 0, score: 7.2, nap: 3, labels: ["Stadium Tax"], ageDays: 13, note: "Bench-it unless dietary need." }
    ])
  ];
}

function demoKauffmanStadium(): DemoReviewBlueprint[] {
  const venue = "kauffman-stadium";
  return [
    ...pack(venue, "kauff-beef-short-rib-corn-dog", "kc-corndog", [
      { u: 0, score: 9.0, nap: 3, labels: ["Run It Back", "Steal"], ageDays: 3, note: "Beer cheese dip seals it.", photoEmoji: "🌭", helpfulLikers: [1, 2] },
      { u: 1, score: 8.8, nap: 3, labels: ["Run It Back"], ageDays: 4, note: "Short rib interior surprises.", photoEmoji: "🌭" },
      { u: 2, score: 8.6, nap: 3, labels: ["Steal"], ageDays: 6, note: "Crisp shell survives walk.", photoEmoji: "🌭" },
      { u: 3, score: 8.4, nap: 3, labels: ["Worth the Walk"], ageDays: 8, note: "Share unless brave.", helpfulLikers: [4] },
      { u: 4, score: 8.2, nap: 3, labels: ["Worth the Walk"], ageDays: 10, note: "Messy—in the fun way.", photoEmoji: "🌭" },
      { u: 5, score: 8.0, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Premium corn dog energy." }
    ]),
    ...pack(venue, "kauff-chickie-crabfries", "kc-crabfries", [
      { u: 6, score: 8.5, nap: 4, labels: ["Run It Back"], ageDays: 2, note: "Most-reviewed salty fries.", photoEmoji: "🍟", helpfulLikers: [7, 8, 9] },
      { u: 7, score: 8.4, nap: 4, labels: ["Worth the Walk"], ageDays: 3, note: "Crab spice coats evenly.", photoEmoji: "🍟" },
      { u: 8, score: 8.3, nap: 4, labels: ["Worth the Walk"], ageDays: 4, note: "Cheese cup clutch.", photoEmoji: "🍟" },
      { u: 9, score: 8.2, nap: 4, labels: ["Stadium Tax"], ageDays: 5, note: "Lines spike weekends.", helpfulLikers: [0] },
      { u: 0, score: 8.1, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "Share tray mandatory.", photoEmoji: "🍟" },
      { u: 1, score: 8.0, nap: 4, labels: ["Stadium Tax"], ageDays: 7, note: "Salt swings big.", photoEmoji: "🍟" },
      { u: 2, score: 7.9, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Still crisp mid-game.", helpfulLikers: [3] },
      { u: 3, score: 7.8, nap: 4, labels: ["Stadium Tax"], ageDays: 9, note: "Fair fry tax.", photoEmoji: "🍟" }
    ]),
    ...pack(venue, "kauff-korean-pork-cutlet-sandwich", "kc-katsu", [
      { u: 4, score: 8.8, nap: 3, labels: ["Run It Back", "Steal"], ageDays: 10, note: "Sleeper crunch—slaw snaps.", photoEmoji: "🥪", helpfulLikers: [5] },
      { u: 5, score: 8.5, nap: 3, labels: ["Run It Back"], ageDays: 11, note: "Aioli ties heat.", photoEmoji: "🥪" },
      { u: 6, score: 8.3, nap: 3, labels: ["Worth the Walk"], ageDays: 12, note: "Two-hand sandwich territory." }
    ]),
    ...pack(venue, "kauff-kcq-brisket-mac", "kc-mac", [
      { u: 7, score: 8.2, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "Brisket bark mixes well.", photoEmoji: "🧀" },
      { u: 8, score: 8.0, nap: 4, labels: ["Stadium Tax"], ageDays: 8, note: "Mac creamy—not gluey.", photoEmoji: "🧀" },
      { u: 9, score: 7.8, nap: 4, labels: ["Worth the Walk"], ageDays: 10, note: "Heavy inning fuel.", helpfulLikers: [0] },
      { u: 0, score: 7.6, nap: 4, labels: ["Stadium Tax"], ageDays: 12, note: "Fair BBQ-mac combo." }
    ]),
    ...pack(venue, "kauff-value-hot-dog", "kc-value-dog", [
      { u: 1, score: 8.6, nap: 3, labels: ["Steal", "Run It Back"], ageDays: 4, note: "Value lane snack MVP.", photoEmoji: "🌭" },
      { u: 2, score: 8.4, nap: 3, labels: ["Steal"], ageDays: 6, note: "Quick bite near gates.", photoEmoji: "🌭" },
      { u: 3, score: 8.2, nap: 3, labels: ["Worth the Walk"], ageDays: 8, note: "Kids-speed friendly.", helpfulLikers: [4] },
      { u: 4, score: 8.0, nap: 3, labels: ["Worth the Walk"], ageDays: 10, note: "Fair snap for price.", photoEmoji: "🌭" },
      { u: 5, score: 7.8, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Gets you back to seats fast." }
    ]),
    ...pack(venue, "kauff-value-nachos", "kc-value-nachos", [
      { u: 6, score: 5.8, nap: 4, labels: ["Bench It", "Stadium Tax"], ageDays: 5, note: "Cheese cooled fast.", photoEmoji: "🧀" },
      { u: 7, score: 6.1, nap: 4, labels: ["Bench It"], ageDays: 7, note: "Chips sturdy—cheese uneven.", photoEmoji: "🧀" },
      { u: 8, score: 6.4, nap: 4, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 9, note: "Ok filler—not a destination.", helpfulLikers: [9] },
      { u: 9, score: 6.7, nap: 4, labels: ["Worth the Walk"], ageDays: 11, note: "Fair value tier honesty." },
      { u: 0, score: 7.0, nap: 4, labels: ["Stadium Tax"], ageDays: 13, note: "Bench-it unless starving cheap." }
    ])
  ];
}

function demoRogersCentre(): DemoReviewBlueprint[] {
  const venue = "rogers-centre";
  return [
    ...pack(venue, "rc-montreal-smoked-meat-poutine", "tor-poutine", [
      { u: 0, score: 9.1, nap: 4, labels: ["Run It Back", "Steal"], ageDays: 3, note: "Smoke + curds + gravy—triple play.", photoEmoji: "🍟", helpfulLikers: [1, 2] },
      { u: 1, score: 8.9, nap: 4, labels: ["Run It Back"], ageDays: 4, note: "Curds squeak—gravy hot.", photoEmoji: "🍟" },
      { u: 2, score: 8.7, nap: 4, labels: ["Steal"], ageDays: 6, note: "Fork food worth sitting.", photoEmoji: "🍟" },
      { u: 3, score: 8.5, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Heavy—share.", helpfulLikers: [4] },
      { u: 4, score: 8.3, nap: 4, labels: ["Worth the Walk"], ageDays: 10, note: "Smoke aroma travels.", photoEmoji: "🍟" },
      { u: 5, score: 8.1, nap: 4, labels: ["Stadium Tax"], ageDays: 12, note: "Fair stadium poutine tax." }
    ]),
    ...pack(venue, "rc-big-slugger-burger", "tor-slugger", [
      { u: 6, score: 8.4, nap: 4, labels: ["Run It Back"], ageDays: 2, note: "Most-reviewed oversized bite.", photoEmoji: "🍔", helpfulLikers: [7, 8, 9] },
      { u: 7, score: 8.3, nap: 4, labels: ["Worth the Walk"], ageDays: 3, note: "Messy smash energy.", photoEmoji: "🍔" },
      { u: 8, score: 8.2, nap: 4, labels: ["Worth the Walk"], ageDays: 4, note: "Pickles cut richness.", photoEmoji: "🍔" },
      { u: 9, score: 8.1, nap: 4, labels: ["Stadium Tax"], ageDays: 5, note: "Lines spike gates opening.", helpfulLikers: [0] },
      { u: 0, score: 8.0, nap: 4, labels: ["Worth the Walk"], ageDays: 6, note: "Two-hand commitment.", photoEmoji: "🍔" },
      { u: 1, score: 7.9, nap: 4, labels: ["Stadium Tax"], ageDays: 7, note: "Sometimes overcooked busy nights.", photoEmoji: "🍔" },
      { u: 2, score: 7.8, nap: 4, labels: ["Worth the Walk"], ageDays: 8, note: "Fair burger hall staple.", helpfulLikers: [3] },
      { u: 3, score: 7.7, nap: 4, labels: ["Stadium Tax"], ageDays: 9, note: "Benchmark stadium smash.", photoEmoji: "🍔" }
    ]),
    ...pack(venue, "rc-stop-poke-bowl", "tor-poke", [
      { u: 4, score: 8.8, nap: 2, labels: ["Run It Back", "Steal"], ageDays: 10, note: "Sleeper cold bowl—bright citrus.", photoEmoji: "🍚", helpfulLikers: [5] },
      { u: 5, score: 8.5, nap: 2, labels: ["Run It Back"], ageDays: 11, note: "Fish cuts clean.", photoEmoji: "🍚" },
      { u: 6, score: 8.3, nap: 2, labels: ["Worth the Walk"], ageDays: 12, note: "Refreshing pivot from fries." }
    ]),
    ...pack(venue, "rc-crispy-calamari-item", "tor-calamari", [
      { u: 7, score: 8.2, nap: 3, labels: ["Worth the Walk"], ageDays: 6, note: "Crispy tentacles—dip tangy.", photoEmoji: "🦑" },
      { u: 8, score: 8.0, nap: 3, labels: ["Stadium Tax"], ageDays: 8, note: "Light fry layer.", photoEmoji: "🦑" },
      { u: 9, score: 7.8, nap: 3, labels: ["Worth the Walk"], ageDays: 10, note: "Share basket.", helpfulLikers: [0] },
      { u: 0, score: 7.6, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Fair seafood snack." }
    ]),
    ...pack(venue, "rc-loonie-dogs", "tor-loonie", [
      { u: 1, score: 8.7, nap: 3, labels: ["Steal", "Run It Back"], ageDays: 4, note: "Promo-night steal when offered.", photoEmoji: "🌭" },
      { u: 2, score: 8.5, nap: 3, labels: ["Steal"], ageDays: 6, note: "Fast grab—snap ok.", photoEmoji: "🌭" },
      { u: 3, score: 8.3, nap: 3, labels: ["Worth the Walk"], ageDays: 8, note: "Kids-speed lane.", helpfulLikers: [4] },
      { u: 4, score: 8.1, nap: 3, labels: ["Worth the Walk"], ageDays: 10, note: "Fair ballpark dog baseline.", photoEmoji: "🌭" },
      { u: 5, score: 7.9, nap: 3, labels: ["Stadium Tax"], ageDays: 12, note: "Tax shows when promo ends." }
    ]),
    ...pack(venue, "rc-al-pastor-dog", "tor-pastor-dog", [
      { u: 6, score: 6.3, nap: 3, labels: ["Bench It", "Stadium Tax"], ageDays: 5, note: "Toppings slid—messy bite.", photoEmoji: "🌭" },
      { u: 7, score: 6.6, nap: 3, labels: ["Bench It"], ageDays: 7, note: "Pastor flavor muted.", photoEmoji: "🌭" },
      { u: 8, score: 6.9, nap: 3, labels: ["Stadium Tax", "Worth the Walk"], ageDays: 9, note: "Fun idea—execution uneven.", helpfulLikers: [9] },
      { u: 9, score: 7.2, nap: 3, labels: ["Worth the Walk"], ageDays: 11, note: "Fair novelty—not roster staple." },
      { u: 0, score: 7.4, nap: 3, labels: ["Stadium Tax"], ageDays: 13, note: "Bench-it unless curious." }
    ])
  ];
}

/** Curated MLB demo rows across priority ballparks. */
export function allDemoDensityBlueprints(): DemoReviewBlueprint[] {
  return [
    ...demoTargetField(),
    ...demoWrigleyField(),
    ...demoFenwayPark(),
    ...demoDodgerStadium(),
    ...demoPetcoPark(),
    ...demoCitizensBankPark(),
    ...demoYankeeStadium(),
    ...demoCitiField(),
    ...demoKauffmanStadium(),
    ...demoRogersCentre()
  ];
}

function computeDemoGameDayKey(row: DemoReviewBlueprint, seedNow: Date): string {
  if (row.liveFresh && row.verifiedGameDay) {
    return buildGameDayKey(row.venueSlug, seedNow);
  }
  return `${DEMO_SEASON}-${row.venueSlug}-demo-${row.idSuffix}`;
}

export type DemoDensitySeedResult = {
  demoReviewsUpserted: number;
  demoPhotosUpserted: number;
  demoHelpfulUpserted: number;
  demoReviewsSkippedMissingItem: number;
};

/** Idempotent demo density — deterministic IDs prefixed with demo-density-. */
export async function applyDemoDensitySeed(
  prisma: PrismaClient,
  seedNow: Date
): Promise<DemoDensitySeedResult> {
  let demoReviewsUpserted = 0;
  let demoPhotosUpserted = 0;
  let demoHelpfulUpserted = 0;
  let demoReviewsSkippedMissingItem = 0;

  for (const u of DEMO_USERS) {
    const emailLocal = slugifyDemoEmailLocalPart(u.id);
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        displayName: u.displayName,
        handle: u.handle
      },
      create: {
        id: u.id,
        email: `${emailLocal}@demo.stadium-slop.invalid`,
        displayName: u.displayName,
        handle: u.handle
      }
    });
  }

  const rows = allDemoDensityBlueprints();

  for (const row of rows) {
    const venue = await prisma.venue.findUnique({
      where: { slug: row.venueSlug }
    });
    const foodItem =
      venue &&
      (await prisma.foodItem.findUnique({
        where: {
          venueId_slug: {
            venueId: venue.id,
            slug: row.foodSlug
          }
        }
      }));

    if (!venue || !foodItem) {
      demoReviewsSkippedMissingItem += 1;
      console.warn(
        `[demo-density] skip missing ${row.venueSlug} / ${row.foodSlug} (${row.idSuffix})`
      );
      continue;
    }

    const user = DEMO_USERS[row.userIdx];
    if (!user) {
      throw new Error(`Invalid demo userIdx ${row.userIdx}`);
    }

    const reviewId = `demo-density-review-${row.venueSlug}-${row.idSuffix}`;
    const photoId = `demo-density-photo-${row.venueSlug}-${row.idSuffix}`;
    const gameDayKey = computeDemoGameDayKey(row, seedNow);
    const createdAt = row.liveFresh
      ? seedNow
      : new Date(seedNow.getTime() - row.ageDays * 86_400_000);

    await prisma.review.upsert({
      where: { id: reviewId },
      update: {
        userId: user.id,
        foodItemId: foodItem.id,
        venueId: venue.id,
        gameDayKey,
        slopScore: row.slopScore,
        napkinRating: row.napkinRating,
        labels: toDbLabels(row.labels),
        verifiedGameDay: row.verifiedGameDay,
        seasonLabel: DEMO_SEASON,
        note: row.note,
        createdAt
      },
      create: {
        id: reviewId,
        userId: user.id,
        foodItemId: foodItem.id,
        venueId: venue.id,
        gameDayKey,
        slopScore: row.slopScore,
        napkinRating: row.napkinRating,
        labels: toDbLabels(row.labels),
        verifiedGameDay: row.verifiedGameDay,
        seasonLabel: DEMO_SEASON,
        note: row.note,
        createdAt
      }
    });
    demoReviewsUpserted += 1;

    if (row.photoEmoji) {
      await prisma.foodPhoto.upsert({
        where: { id: photoId },
        update: {
          foodItemId: foodItem.id,
          venueId: venue.id,
          reviewId,
          uploaderUserId: user.id,
          photoType: PhotoType.FOOD,
          placeholder: row.photoEmoji,
          alt: `Demo bench photo (${row.photoEmoji})`,
          caption: row.note ?? "Demo stadium snack snapshot",
          verifiedOnSite: row.verifiedGameDay,
          url: null,
          createdAt
        },
        create: {
          id: photoId,
          foodItemId: foodItem.id,
          venueId: venue.id,
          reviewId,
          uploaderUserId: user.id,
          photoType: PhotoType.FOOD,
          placeholder: row.photoEmoji,
          alt: `Demo bench photo (${row.photoEmoji})`,
          caption: row.note ?? "Demo stadium snack snapshot",
          verifiedOnSite: row.verifiedGameDay,
          url: null,
          createdAt
        }
      });
      demoPhotosUpserted += 1;
    }

    const likers = row.helpfulLikers ?? [];
    for (const likerIdx of likers) {
      const liker = DEMO_USERS[likerIdx];
      if (!liker || liker.id === user.id) {
        continue;
      }
      await prisma.helpfulLike.upsert({
        where: {
          userId_reviewId: {
            userId: liker.id,
            reviewId
          }
        },
        update: {},
        create: {
          userId: liker.id,
          reviewId
        }
      });
      demoHelpfulUpserted += 1;
    }
  }

  return {
    demoReviewsUpserted,
    demoPhotosUpserted,
    demoHelpfulUpserted,
    demoReviewsSkippedMissingItem
  };
}
