import { normalizeMenuItemName } from "@/lib/venue-menu-import/normalize";
import type { FairRawMenuItem } from "./types";

export type IowaFoodFinderQualityResult = {
  items: FairRawMenuItem[];
  skippedItems: { name: string; reason: string }[];
  ambiguousItems: { name: string; reason: string }[];
  stats: {
    reviewWorthyKept: number;
    iconicSimpleKept: number;
    genericFillerSkipped: number;
    ambiguousFlagged: number;
    iconicExamples: string[];
    genericExamples: string[];
    ambiguousExamples: string[];
  };
};

const ICONIC_VENDOR_RE =
  /applishus|arnold'?s|barksdale|bacon box|blue ribbon bar|boss hog|campbell'?s corn|chuckie|coney corner|dairy zone|jada'?s funnel|leimon|mcconnell|mcgrath|pickle dawg|pronto|southpork|twin fork|wiseguys|whatcha smokin|po-?boys|saigon|hoq\b|iowa pork|beef quarters|cattlemen|smokey'?s grill|the depot|over the top|grill bill|taco king|goldenkdog|cluckin/i;

const ICONIC_ITEM_RE =
  /corn dog|cheese curd|pork chop on a stick|pork belly on a stick|turkey leg|funnel cake|mini donut|on a stick|butter cow|scotcheroo|footlong corn dog|bratwurst|deep[- ]?fried pickle|fried pickle|loaded tater|eggroll|high roller|hot cheeto|pickle pizza|bacon pecan|corn brat|sweet granny|hawaiian hog|voodoo fries|meatloaf|gnocchi|beignet|fiesta wonton|grilled cheese|mac n.? cheese pizza|korean corn|butter tornado|saigon|pork tent|grinder|pizza bread|elephant ear|lemonade stand|state fair cookie|pork picnic/i;

const NON_FOOD_VENDOR_RE =
  /\b(?:origami|organix therapy|shine solutions|travelin'? tom|kona ice)\b/i;

const ALWAYS_SKIP_RE = [
  /^add /i,
  /^extra /i,
  /^side of /i,
  /^without /i,
  /^substitute /i,
  /^upgrade /i,
  /^toppings?-/i,
  /^sauce$/i,
  /^ranch$/i,
  /^ketchup$/i,
  /^mustard$/i,
  /^relish$/i,
  /^cheese$/i,
  /^pepperoni$/i,
  /^sausage$/i,
  /^bacon \(\d/i,
  /^aluminum cup$/i,
  /^hat$/i,
  /^tank top$/i,
  /^trucker hat$/i,
  /^koozie$/i,
  /^ornament$/i,
  /^demonstration/i,
  /^bath bomb/i,
  /^diffuser/i,
  /^essential oil/i,
  /^cleanser$/i,
  /^body device/i,
  /^candle/i,
  /^chakra/i,
  /^anti-aging/i,
  /^snack sticks-/i,
  /^low sodium/i,
  /^baked goods \(/i,
  /^farmers breakfast with/i,
  /^breakfast platter -/i,
  /^1\/2 order /i,
  /^1\/3 pound /i,
  /^discount /i,
  /^combo large/i,
  /^combo medium/i,
  /^combo small/i,
  /^refill /i,
  /^soda-?refill/i,
  /^tea-?refill/i
];

const GENERIC_PLAIN_RE = [
  /^french fries/i,
  /^fries$/i,
  /^fries w\//i,
  /^nachos/i,
  /^popcorn$/i,
  /^kettle corn$/i,
  /^pretzels?$/i,
  /^bavarian pretzels?$/i,
  /^hot dogs?$/i,
  /^hamburger$/i,
  /^cheeseburger$/i,
  /^cheese burger$/i,
  /^bacon cheese burger$/i,
  /^bacon cheeseburger$/i,
  /^double bacon cheese/i,
  /^chicken strips$/i,
  /^chicken planks?$/i,
  /^chicken plank basket$/i,
  /^blt$/i,
  /^cinnamon roll$/i,
  /^biscuits and gravy/i,
  /^breakfast sandwich/i,
  /^breakfast burrito$/i,
  /^dinner salad$/i,
  /^crispy chicken salad$/i,
  /^grilled chicken salad$/i,
  /^grilled chicken sandwich$/i,
  /^chicken philly sandwich$/i,
  /^beef dinner$/i,
  /^beef noodle dinner$/i,
  /^baked potato$/i,
  /^baked beans/i,
  /^coleslaw$/i,
  /^onion rings$/i,
  /^brats?$/i,
  /^polish sausage$/i,
  /^orange juice$/i,
  /^apple juice$/i,
  /^chocolate milk$/i,
  /^candy$/i,
  /^cookie$/i,
  /^donuts?$/i,
  /^ice cream, novelties$/i,
  /^cone waffle$/i,
  /^single scoop$/i,
  /^double scoop$/i,
  /^bud light$/i,
  /^bud zero$/i,
  /^busch light/i,
  /^coors lite/i,
  /^miller lite/i,
  /^michelob/i,
  /^cabernet/i,
  /^champagne-/i,
  /^bloody mary$/i,
  /^long island tea/i,
  /^margarita$/i,
  /^white claw /i,
  /^twisted tea/i,
  /^truly spiked/i,
  /^arnold palmer$/i,
  /^americano coffee$/i,
  /^cappuccino coffee$/i,
  /^cold brew coffee$/i,
  /^iced coffee$/i,
  /^brewed /i,
  /^sweet tea$/i,
  /^large sweet tea$/i,
  /^sm sweet tea$/i,
  /^lg sweet tea$/i,
  /^tea$/i,
  /^large bucket of fries$/i,
  /^small bucket of fries$/i,
  /^walking taco$/i,
  /^pizza, slice$/i,
  /^cheese pizza slice$/i,
  /^whole pizza$/i,
  /^taco salad$/i,
  /^smoothie/i,
  /^gatorade$/i,
  /^red bull$/i,
  /^monster /i
];

const FLAVOR_OR_SIZE_RE =
  /^(vanilla|chocolate|strawberry|raspberry|caramel|blue raspberry|cherry|cotton candy|black raspberry|piña colada|dairy-free)/i;

const SPECIALTY_DRINK_RE =
  /butter cow|watermelon creamsicle|pink pony|scotcheroo shake|bloody mary with meat|loaded bloody mary|lavender lemontini|magical mimosa|hive2o|bucked off|pickleback|spiked|hard honey|creamsicle|lemonada|refresher|float|malt\b|rootbeer float|berry tilt|blue bird latte/i;

const GENERIC_BAR_LINE_RE =
  /^(bloody mary$|busch|bud |coors|miller|wine|beer|draft|domestic|premium domestic|premum domestic|spiked|seltzer|margarita|mimosa|long island|white claw|twisted tea|truly |mike hard|modelo|leinenkugel|angry orchard|spirits\/wine|yard stick|\(\d+oz\))/i;

const GENERIC_BAR_SUBSTRING_RE =
  /\b(domestic draw|premium draft|premium can|beer cheese,|popcorn:|white claw \(|mike hard lemonade|twisted tea|truly margarita|schmear )/i;

const PLAIN_BURGER_OR_SANDWICH_RE =
  /^(good ol'? smash burger|back to basics burger|brunchy burger|hog wild burger|cheese burger mark|cheese burger-promo|double cheese burger|mark and gary burger|burger de burgo|crispy breaded chicken sandwich|chicken & waffle breakfast sandwich|breakfast burrito with egg|bbq pork sandwich|brat with kraut|roast beef sandwich|sirloin steak sandwich|southern pulled pork sandwich|shredded bbq pork sandwich|pork burger$|pork loin sandwich$)/i;

const GENERIC_SIDE_OR_OPTION_RE =
  /^(burger - onion rings|pickle spears$|double bacon parmesan dip$|cockadoodle doo wings \d|promoting pork)/i;

const JRS_SOUTHPORK_KEEP_RE =
  /high roller|lobster roll|nashville|bacon pickle mac|footlong lobster|two foot lobster/i;

const CATTLEMENS_KEEP_RE =
  /brisket burnt end|taco haystack|hot beef sundae|prime rib|rib-eye|maytag blue cheese/i;

const REVIEW_WORTHY_RE =
  /\b(on a stick|deep[- ]?fried|stuffed|loaded|brisket|tenderloin|funnel|curds?|brats?|corn dogs?|wrap|bowl|mac |pizza|tacos?|ramen|lobster|pork|smoked|bbq|bacon|pickle|grilled|sandwich|burgers?|wings?|ribs?|shakes?|sundaes?|floats?|lemonade|creamsicle|pies?|donuts?|cookies?|waffles?|elote|gyro|burritos?|meatloaf|gnocchi|beignets?|hot cheetos?|korean|vietnamese|eggrolls?|fritters?|blossom|grinders?|elephant ears?|hot dish|walking taco|tater tot|pickle dawg|footlong|butter cow|scotcheroo|high roller|voodoo|saigon|hawaiian|maple bacon|nashville|flamin|fiesta wonton|cinnamon rolls?|pecan rolls?)\b/i;

const APPLISHUS_KEEP_RE =
  /egg\s?roll|fritter|blossom|pie on a stick|caramel apple|fried|donut|dumpling/i;

const MAX_NAME_LEN = 95;

const MAX_ICONIC_EXAMPLES = 10;
const MAX_GENERIC_EXAMPLES = 12;
const MAX_AMBIGUOUS_EXAMPLES = 8;

function cleanFinderItemName(raw: string): string {
  let name = raw.replace(/\s+/g, " ").trim();
  if (name.length > MAX_NAME_LEN) {
    const dashIdx = name.indexOf(" - ");
    if (dashIdx > 10 && dashIdx < MAX_NAME_LEN) {
      name = name.slice(0, dashIdx).trim();
    } else {
      const repeat = name.slice(Math.floor(name.length / 2));
      if (name.startsWith(repeat.slice(0, 40))) {
        name = name.slice(0, Math.floor(name.length / 2)).trim();
      }
    }
  }
  return name.replace(/\s+/g, " ").trim();
}

function isAlwaysSkipLine(name: string): string | null {
  if (name.length < 3) return "Too short to be a menu item";
  if (ALWAYS_SKIP_RE.some((re) => re.test(name))) {
    return "Option, add-on, merch, or non-menu line";
  }
  if (/^\(\d+oz\)/i.test(name) && /juice|coffee|red bull|champagne/i.test(name)) {
    return "Generic size-prefixed beverage";
  }
  return null;
}

function isFlavorOrSizeLine(name: string): boolean {
  if (FLAVOR_OR_SIZE_RE.test(name) && /scoop|ice cream|sorbet/i.test(name)) {
    return true;
  }
  if (/^(black raspberry|chocolate|vanilla|cotton candy) ice cream (single|double) scoop$/i.test(name)) {
    return true;
  }
  if (/^cone waffle$/i.test(name)) return true;
  return false;
}

function isIconicSimple(name: string, vendor: string): boolean {
  if (ICONIC_ITEM_RE.test(name)) return true;
  if (/applishus/i.test(vendor)) {
    return APPLISHUS_KEEP_RE.test(name);
  }
  if (/barksdale/i.test(vendor) && /cookie|chip/i.test(name)) return true;
  if (/jada'?s funnel/i.test(vendor) && /funnel|lemonade/i.test(name)) return true;
  if (!ICONIC_VENDOR_RE.test(vendor)) return false;
  if (
    /\b(corn dog|corn brats?|funnel cake|tenderloin|cheese curds?|pickle|on a stick|footlong)\b/i.test(
      name
    )
  ) {
    return true;
  }
  return false;
}

function isVendorScopedGeneric(name: string, vendor: string): string | null {
  if (/^promoting pork/i.test(name) || /educational exhibit/i.test(name)) {
    return "Non-menu exhibitor line";
  }
  if (PLAIN_BURGER_OR_SANDWICH_RE.test(name)) {
    return "Plain burger or sandwich (non-iconic)";
  }
  if (GENERIC_SIDE_OR_OPTION_RE.test(name)) {
    return "Side, add-on, or wing count line";
  }
  if (/^pork loin$/i.test(name) && !/iowa pork/i.test(vendor)) {
    return "Generic pork loin (not on-a-stick specialty)";
  }
  if (/^tenderloin$/i.test(name) && /campbell|boss hog/i.test(vendor)) {
    return "Generic tenderloin at corn-dog stand";
  }
  if (/^rack your ribs/i.test(name)) {
    return "Rib size variant line (consolidate manually if needed)";
  }
  if (/southpork/i.test(vendor) && !JRS_SOUTHPORK_KEEP_RE.test(name)) {
    if (/blt$|breakfast burrito|breaded chicken sandwich|schmear /i.test(name)) {
      return "Generic JR's SouthPork line (non-lobster/high-roller specialty)";
    }
  }
  if (/cattlemen'?s beef quarters/i.test(vendor) && !CATTLEMENS_KEEP_RE.test(name)) {
    if (/cheese burger|walking taco|smoked beef brisket$/i.test(name)) {
      return "Generic Cattlemen's line";
    }
  }
  if (/stockmann/i.test(vendor) && /^(brat with kraut|pork loin$|mac n cheese party tray)/i.test(name)) {
    return "Generic Stockmann's fair filler";
  }
  if (/blue ribbon bar/i.test(vendor)) {
    if (/^brisket sandwich$/i.test(name) || /^jumbo pulled pork sandwich$/i.test(name)) {
      return "Generic Blue Ribbon sandwich";
    }
  }
  return null;
}

function isReviewWorthy(name: string, vendor: string): boolean {
  if (isIconicSimple(name, vendor)) return true;
  if (GENERIC_BAR_LINE_RE.test(name) || GENERIC_BAR_SUBSTRING_RE.test(name)) {
    return false;
  }
  if (name.length >= 14 && REVIEW_WORTHY_RE.test(name)) return true;
  if (SPECIALTY_DRINK_RE.test(name)) return true;
  return false;
}

function isGenericPlain(name: string, vendor: string): boolean {
  if (isIconicSimple(name, vendor)) return false;
  if (SPECIALTY_DRINK_RE.test(name)) return false;
  if (GENERIC_PLAIN_RE.some((re) => re.test(name))) return true;
  if (/^footlong corn dog$/i.test(name) && /campbell|corn dog/i.test(vendor)) return false;
  if (/^corn dog$/i.test(name) && /campbell|corn dog/i.test(vendor)) return false;
  if (/^funnel cake$/i.test(name) && /funnel|mcconnell|mcgrath|jada/i.test(vendor)) return false;
  if (/^tenderloin$/i.test(name) && /chuckie|tenderloin|xtreme/i.test(vendor)) return false;
  return false;
}

function ambiguousReason(name: string, vendor: string): string | null {
  if (name.length > MAX_NAME_LEN) {
    return "Finder line looks like duplicated description text — shorten manually";
  }
  if (/^acai bowl-/i.test(name)) {
    return "Acai bowl variant line — confirm single menu title";
  }
  if (/^corn dog$/i.test(name) && !/campbell|corn dog/i.test(vendor)) {
    return "Generic corn dog at non-iconic stand — confirm or skip";
  }
  return null;
}

export function filterIowaFoodFinderQuality(
  rawItems: FairRawMenuItem[]
): IowaFoodFinderQualityResult {
  const items: FairRawMenuItem[] = [];
  const skippedItems: { name: string; reason: string }[] = [];
  const ambiguousItems: { name: string; reason: string }[] = [];
  const seenVendorItem = new Set<string>();

  const stats = {
    reviewWorthyKept: 0,
    iconicSimpleKept: 0,
    genericFillerSkipped: 0,
    ambiguousFlagged: 0,
    iconicExamples: [] as string[],
    genericExamples: [] as string[],
    ambiguousExamples: [] as string[]
  };

  const pushSkipped = (name: string, reason: string) => {
    skippedItems.push({ name, reason });
    stats.genericFillerSkipped++;
    if (stats.genericExamples.length < MAX_GENERIC_EXAMPLES) {
      stats.genericExamples.push(`${name} — ${reason}`);
    }
  };

  for (const raw of rawItems) {
    const vendor = raw.vendor.trim();
    let name = cleanFinderItemName(raw.name);

    if (NON_FOOD_VENDOR_RE.test(vendor)) {
      pushSkipped(`${vendor}: ${name}`, "Non-food vendor (product finder)");
      continue;
    }

    if (!name || !vendor) continue;

    const forceSkip = isAlwaysSkipLine(name);
    if (forceSkip) {
      pushSkipped(name, forceSkip);
      continue;
    }

    if (isFlavorOrSizeLine(name)) {
      pushSkipped(name, "Flavor or scoop size line — not a single menu item");
      continue;
    }

    const amb = ambiguousReason(name, vendor);
    if (amb) {
      ambiguousItems.push({ name, reason: amb });
      stats.ambiguousFlagged++;
      if (stats.ambiguousExamples.length < MAX_AMBIGUOUS_EXAMPLES) {
        stats.ambiguousExamples.push(`${vendor}: ${name}`);
      }
      continue;
    }

    const vendorItemKey = `${normalizeMenuItemName(vendor)}::${normalizeMenuItemName(name)}`;
    if (seenVendorItem.has(vendorItemKey)) {
      pushSkipped(name, "Duplicate item for same vendor");
      continue;
    }

    if (isGenericPlain(name, vendor)) {
      pushSkipped(name, "Generic fair filler (non-iconic)");
      continue;
    }

    const vendorScoped = isVendorScopedGeneric(name, vendor);
    if (vendorScoped) {
      pushSkipped(name, vendorScoped);
      continue;
    }

    if (GENERIC_BAR_LINE_RE.test(name) || GENERIC_BAR_SUBSTRING_RE.test(name)) {
      pushSkipped(name, "Bar tap list or generic alcohol line");
      continue;
    }

    if (/^bloody mary$/i.test(name.trim()) && !SPECIALTY_DRINK_RE.test(name)) {
      pushSkipped(name, "Plain bloody mary (non-specialty)");
      continue;
    }

    if (!isReviewWorthy(name, vendor)) {
      pushSkipped(name, "Not review-worthy (generic or low-signal finder line)");
      continue;
    }

    seenVendorItem.add(vendorItemKey);

    const item: FairRawMenuItem = { ...raw, name, vendor };

    if (isIconicSimple(name, vendor)) {
      stats.iconicSimpleKept++;
      if (stats.iconicExamples.length < MAX_ICONIC_EXAMPLES) {
        stats.iconicExamples.push(`${vendor} — ${name}`);
      }
    } else {
      stats.reviewWorthyKept++;
    }

    items.push(item);
  }

  return { items, skippedItems, ambiguousItems, stats };
}

export function formatIowaQualityWarnings(
  stats: IowaFoodFinderQualityResult["stats"]
): string[] {
  return [
    `Quality pass: ${stats.reviewWorthyKept} review-worthy items kept.`,
    `Quality pass: ${stats.iconicSimpleKept} iconic/vendor-defining classics kept intentionally.`,
    `Quality pass: ${stats.genericFillerSkipped} generic filler lines skipped.`,
    `Quality pass: ${stats.ambiguousFlagged} ambiguous lines flagged for human review (not imported).`,
    stats.iconicExamples.length
      ? `Iconic kept (sample): ${stats.iconicExamples.join("; ")}`
      : "Iconic kept (sample): none",
    stats.genericExamples.length
      ? `Generic skipped (sample): ${stats.genericExamples.slice(0, 6).join("; ")}`
      : "Generic skipped (sample): none",
    stats.ambiguousExamples.length
      ? `Ambiguous (sample): ${stats.ambiguousExamples.join("; ")}`
      : "Ambiguous (sample): none"
  ];
}
