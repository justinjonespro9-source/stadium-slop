#!/usr/bin/env python3
"""Build data/nfl/2026-concessions/us-bank-stadium.json from sourced 2026 records."""

from __future__ import annotations

import json
from pathlib import Path

DIR = "https://www.usbankstadium.com/guest-experience/concessions"
ARAMARK = (
    "https://investor.wedbush.com/wedbush/article/bizwire-2026-9-9-"
    "aramark-sports-entertainment-kicks-off-2026-nfl-season-across-eight-nfl-"
    "stadiums-with-new-menu-items-enhanced-premium-experiences-and-local-partnerships"
)
FSD = (
    "https://www.foodservicedirector.com/food-beverage-trends/"
    "what-s-new-on-nfl-stadium-menus-this-season-everything-from-birria-burritos-to-hot-dog-flights"
)
MSP = "https://mspmag.com/eat-and-drink/foodie/new-food-and-drinks-touchdown-at-us-bank-stadium/"


def loc(sections: list[str]) -> str:
    return ", ".join(sections)


def vendor(
    name: str,
    sections: list[str],
    source: str = DIR,
    existing: str | None = None,
) -> dict:
    row = {
        "name": name,
        "section": loc(sections),
        "location": loc(sections),
        "status": "ACTIVE",
        "sourceUrl": source,
        "confidence": "HIGH",
    }
    if existing:
        row["existingVendorSlug"] = existing
    return row


def item(
    name: str,
    vendor_name: str,
    description: str,
    sections: list[str],
    *,
    source: str = DIR,
    item_type: str = "FOOD",
    category: str = "SAVORY",
    notes: str | None = None,
    allow: bool = False,
    existing_item: str | None = None,
    existing_vendor: str | None = None,
    labeled_new: bool = False,
) -> dict:
    row = {
        "name": name,
        "vendorName": vendor_name,
        "description": description,
        "itemType": item_type,
        "category": category,
        "sections": sections,
        "location": loc(sections),
        "basePrice": None,
        "status": "ACTIVE",
        "sourceUrl": source,
        "confidence": "HIGH",
    }
    if notes:
        row["notes"] = notes
    if allow:
        row["allowItemNameEqualsVendor"] = True
    if existing_item:
        row["existingItemSlug"] = existing_item
    if existing_vendor:
        row["existingVendorSlug"] = existing_vendor
    if labeled_new:
        row["labeledNewFor2026"] = True
    return row


def stale(
    name: str,
    item_slug: str,
    vendor_slug: str,
    evidence: str,
    source: str = DIR,
    recommendation: str = "hide",
) -> dict:
    return {
        "classification": "STALE_REVIEW",
        "existingName": name,
        "existingItemSlug": item_slug,
        "existingVendorSlug": vendor_slug,
        "recommendation": recommendation,
        "evidence": evidence,
        "sourceUrl": source,
    }


def dup(
    name: str,
    item_slug: str,
    vendor_slug: str,
    evidence: str,
    source: str = DIR,
) -> dict:
    return {
        "classification": "POSSIBLE_DUPLICATE",
        "existingName": name,
        "existingItemSlug": item_slug,
        "existingVendorSlug": vendor_slug,
        "recommendation": "manual_review",
        "evidence": evidence,
        "sourceUrl": source,
    }


payload = {
    "venueSlug": "u-s-bank-stadium",
    "venueName": "U.S. Bank Stadium",
    "season": 2026,
    "league": "NFL",
    "source": {
        "url": DIR,
        "title": "Concessions | U.S. Bank Stadium (Aramark)",
        "type": "official_stadium",
        "retrievedAt": "2026-09-11",
    },
    "notes": (
        "U.S. Bank reconciliation against the live official Aramark concessions directory "
        "(Food Selections + Portable Stands + Concession Stands), the Aramark 2026 NFL kickoff "
        "release (Wedbush/Bizwire), FoodService Director's 2026 stadium-menu roundup, and "
        "Mpls.St.Paul Magazine's Sept 11, 2026 new-food preview. Production slug is "
        "u-s-bank-stadium. Existing Stadium Slop rows are mostly a 2026 headline CSV plus three "
        "native reviewed records (Parlour Burger, Smokehouse Brisket Stack, Upper Deck Cold Nachos). "
        "Canonical matches are updated in place. Hippo Pocket is confirmed on Centro's 2026 program "
        "by MSP Mag and is UPDATE, not STALE. Official directory prints no prices. Do not treat "
        "CSV isNewThisSeason as 2026-new evidence. Smokehouse and Upper Deck reviewed rows are left "
        "untouched. No deletes or hides."
    ),
    "vendors": [
        vendor("Parlour", ["118"], existing="parlour-burger"),
        vendor("Soul Bowl", ["317"], existing="soul-bowl"),
        vendor("Be Graceful", ["121", "329"], existing="be-graceful"),
        vendor(
            "Original Hockey Mom Brownies",
            ["111", "360"],
            existing="official-hockey-mom-brownies",
        ),
        vendor("Von Hanson's Brats", ["131", "317"], existing="von-hanson-s-meats"),
        vendor("Centro", ["105"], source=ARAMARK, existing="the-hippo-pocket"),
        vendor("North Star Grill", ["103", "124", "132", "304", "313", "328", "345"]),
        vendor("Kenny's Meatball Wagon", ["110"], source=MSP),
        vendor("La Borinqua", ["110"], source=MSP),
        vendor("Ben's Pretzels", ["129", "317"], source=MSP),
        vendor("Tap Society", ["124"], source=MSP),
        vendor("Wells Roadside", ["103"], source=MSP),
        vendor("Tender Lovin Chix", ["121"], source=MSP),
        vendor("Sweet Habits", ["119"], source=MSP),
        vendor("Curds N Cakes", ["114", "310"]),
        vendor("Pothole Pizza", ["114", "134", "307", "349"]),
        vendor("Rusty Taco", ["105", "113", "122", "311", "317", "341"]),
        vendor("Walking Taco", ["119", "134", "360"]),
        vendor("MN Brat", ["101", "348"]),
        vendor("Mac Truck Mac & Cheese", ["111"]),
        vendor("Heritage Tea House & Wings", ["344"]),
        vendor("O'Cheese", ["109"]),
        vendor("Steak & Cheese", ["107", "334"]),
        vendor("Schweigerts Hot Dogs", ["131", "317"]),
        vendor("Love You Cookie", ["346"]),
        vendor("T-Rex Cookies", ["129"]),
        vendor("Mini Donuts", ["111", "328"]),
        vendor("Maui Wowi", ["111"]),
        vendor("Minnesnowii", ["304"], source=MSP),
        vendor("Union", ["111"]),
    ],
    "items": [
        item(
            "Parlour Burger",
            "Parlour",
            "Parlour's stadium smashburger with American cheese and secret sauce, sold at the official Parlour stand. Official 2026 Aramark directory lists Parlour at section 118 only.",
            ["118"],
            notes="UPDATE of reviewed canonical Parlour Burger. Preserve slug parlour-burger-parlour-burger. Vendor renamed from Parlour Burger to official stand name Parlour. Drop unsourced CSV section 344.",
            existing_item="parlour-burger-parlour-burger",
            existing_vendor="parlour-burger",
        ),
        item(
            "Soul Bowl",
            "Soul Bowl",
            "Official Soul Bowl concession stand on the 2026 Aramark directory at section 317. Directory does not reprint individual bowl SKUs.",
            ["317"],
            notes="UPDATE location to official section 317. Drop unsourced CSV section 214. Keep vendor-as-item because the directory lists the named concept without SKUs.",
            allow=True,
            existing_item="soul-bowl-soul-bowl",
            existing_vendor="soul-bowl",
        ),
        item(
            "Be Graceful",
            "Be Graceful",
            "Official Be Graceful GF and vegan food-options stand at sections 121 and 329.",
            ["121", "329"],
            notes="UPDATE locations from CSV 121, 328 to official 121, 329. Keep named concept row; directory does not print individual vegan SKUs.",
            allow=True,
            existing_item="be-graceful-be-graceful",
            existing_vendor="be-graceful",
        ),
        item(
            "Original Hockey Mom Brownies",
            "Original Hockey Mom Brownies",
            "Official Original Hockey Mom Brownies stand. Food Selections list brownies and GF brownies at sections 111 and 360.",
            ["111", "360"],
            category="SWEET",
            notes="UPDATE official stand name (CSV said Official Hockey Mom Brownies) and replace vague Multiple Sections with 111, 360.",
            allow=True,
            existing_item="official-hockey-mom-brownies-official-hockey-mom-brownies",
            existing_vendor="official-hockey-mom-brownies",
        ),
        item(
            "Brat-in-a-Blanket",
            "Von Hanson's Brats",
            "Von Hanson's bratwurst wrapped in a seasoned pretzel crust, sold at the official Von Hanson's Brats stands.",
            ["131", "317"],
            notes="UPDATE canonical Von Hanson's Meats vendor-as-item to official stand name Von Hanson's Brats and the distinctive Brat-in-a-Blanket product. Locations 131, 317 replace unsourced CSV 103, 124, 237.",
            existing_item="von-hanson-s-meats-von-hanson-s-meats",
            existing_vendor="von-hanson-s-meats",
        ),
        item(
            "The Hippo Pocket",
            "Centro",
            "Centro's Hippo Pocket: a deep-fried tortilla pocket stuffed with seasoned beef, queso, lettuce, tomato, and lime crema, with a Philly cheesesteak version also offered. Mpls.St.Paul Magazine's Sept 11, 2026 preview confirms Hippo Pockets on Centro's current U.S. Bank program alongside loaded nachos and purple-and-gold soft-serve margaritas.",
            ["349"],
            source=MSP,
            notes="UPDATE, not STALE. Official Aramark directory does not list a Hippo Pocket stand, but current-season MSP Mag attributes Hippo Pockets to Centro. Preserve slug. Do not invent section 105 from the margarita listing; keep CSV section 349 until Centro prints a Hippo Pocket section.",
            existing_item="the-hippo-pocket-the-hippo-pocket",
            existing_vendor="the-hippo-pocket",
        ),
        item(
            "The Raid Burger",
            "North Star Grill",
            "Aramark 2026 debut: double bacon cheeseburger topped with buffalo cheese curds, an onion ring, and ranch on a brioche bun. Official Aramark kickoff release lists sections 101 and 328.",
            ["101", "328"],
            source=ARAMARK,
            notes="labeledNewFor2026 from Aramark/Wedbush and FoodService Director. North Star Grill is the official stand that includes 328; 101 is the Aramark item location (also MN Brat Dog). Do not attribute to Birch's without a 2026 official source.",
            labeled_new=True,
        ),
        item(
            "Kenny's Meatball Sub",
            "Kenny's Meatball Wagon",
            "Aramark 2026 debut: meatballs and marinara on a toasted bun at section 110. MSP Mag describes Kenny's Meatball Wagon / Sweet Taste of Italy combining meatballs with garlic bread at the same section.",
            ["110"],
            source=ARAMARK,
            notes="labeledNewFor2026. Official directory lists Blue Line Bar at 110; do not collapse Kenny's into that bar.",
            labeled_new=True,
        ),
        item(
            "Soft Serve Margarita",
            "Centro",
            "Aramark 2026 debut: purple-and-gold Vikings-colored soft-serve margarita for fans 21+ with valid ID, section 105. MSP Mag confirms Centro's viral soft-serve margaritas this season.",
            ["105"],
            source=ARAMARK,
            item_type="ALCOHOLIC_DRINK",
            category="ALCOHOLIC_BEVERAGE",
            notes="labeledNewFor2026. Attach to Centro (Hippo Pocket vendor renamed in place). Official directory does not print the Centro stand name.",
            existing_vendor="the-hippo-pocket",
            labeled_new=True,
        ),
        item(
            "Puerto Rican Rice Bowl",
            "La Borinqua",
            "New 2026 vendor La Borinqua at section 110: gluten-free Puerto Rican rice bowls with three protein options, from family recipes including roasted pork.",
            ["110"],
            source=MSP,
            notes="labeledNewFor2026 from MSP Mag. Same section as Kenny's and Blue Line Bar; keep as its own restaurant partner.",
            labeled_new=True,
        ),
        item(
            "Pincho Chicken Kabobs",
            "La Borinqua",
            "New 2026 La Borinqua pincho chicken kabobs at section 110.",
            ["110"],
            source=MSP,
            notes="labeledNewFor2026 from MSP Mag.",
            labeled_new=True,
        ),
        item(
            "Cinnamon Sugar Pretzel",
            "Ben's Pretzels",
            "New 2026 Ben's Pretzels gluten-free and vegan share-sized cinnamon sugar pretzel, prepared same-day, sections 129 and 317.",
            ["129", "317"],
            source=MSP,
            category="SNACK",
            notes="labeledNewFor2026. Specialty GF/vegan share pretzel, not generic pretzel filler.",
            labeled_new=True,
        ),
        item(
            "Lightly Salted Share Pretzel",
            "Ben's Pretzels",
            "New 2026 Ben's Pretzels gluten-free and vegan share-sized original lightly salted pretzel, prepared same-day, sections 129 and 317.",
            ["129", "317"],
            source=MSP,
            category="SNACK",
            notes="labeledNewFor2026. Specialty GF/vegan share pretzel, not generic pretzel filler.",
            labeled_new=True,
        ),
        item(
            "Bacon Cheeseburger",
            "Tap Society",
            "New 2026 Tap Society bacon cheeseburger at section 124.",
            ["124"],
            source=MSP,
            notes="labeledNewFor2026. Tap Society is not on the official stand list; North Star Grill is also at 124. Keep as the named 2026 partner.",
            labeled_new=True,
        ),
        item(
            "Ghost Smashburger",
            "Tap Society",
            "New 2026 Tap Society Ghost Smashburger at section 124.",
            ["124"],
            source=MSP,
            notes="labeledNewFor2026.",
            labeled_new=True,
        ),
        item(
            "Wells Burger",
            "Wells Roadside",
            "New 2026 Wells Roadside Wells Burger at section 103.",
            ["103"],
            source=MSP,
            notes="labeledNewFor2026. North Star Grill is also listed at 103; keep Wells Roadside as the named partner.",
            labeled_new=True,
        ),
        item(
            "TLC Smash or Pass Double Cheeseburger",
            "Tender Lovin Chix",
            "New 2026 Tender Lovin Chix TLC Smash or Pass Double Cheeseburger at section 121.",
            ["121"],
            source=MSP,
            notes="labeledNewFor2026. Official directory lists Nashville Coop at 121; flagged as possible duplicate of that stand identity.",
            labeled_new=True,
        ),
        item(
            "Mango Tango",
            "Sweet Habits",
            "New 2026 Sweet Habits dirty soda at section 119: Mango Tango with a hint of spice over sweet fruit.",
            ["119"],
            source=MSP,
            item_type="NON_ALCOHOLIC_DRINK",
            category="BEVERAGE",
            notes="labeledNewFor2026. Official Parlour occupies 118, where CSV Dirty Soda Shoppe flavors currently sit.",
            labeled_new=True,
        ),
        item(
            "Ranch Cheese Curds",
            "Curds N Cakes",
            "Returning Curds N Cakes tenth-season 2026 spin: ranch infused into the cheese-curd batter rather than served as a dip.",
            ["114", "310"],
            source=MSP,
            category="SNACK",
            notes="labeledNewFor2026 from MSP Mag (returning vendor, new ranch curd). Locations are the official Curds N Cakes stands.",
            labeled_new=True,
        ),
        item(
            "Hawaiian Shaved Ice",
            "Minnesnowii",
            "New 2026 Minnesnowii Hawaiian-style shaved ice at section 304, non-alcoholic.",
            ["304"],
            source=MSP,
            item_type="NON_ALCOHOLIC_DRINK",
            category="SWEET",
            notes="labeledNewFor2026 from MSP Mag.",
            labeled_new=True,
        ),
        item(
            "Spiked Hawaiian Shaved Ice",
            "Minnesnowii",
            "New 2026 Minnesnowii Hawaiian-style shaved ice with alcohol at section 304.",
            ["304"],
            source=MSP,
            item_type="ALCOHOLIC_DRINK",
            category="ALCOHOLIC_BEVERAGE",
            notes="labeledNewFor2026 from MSP Mag (with or without alcohol).",
            labeled_new=True,
        ),
        item(
            "Bratchos",
            "MN Brat",
            "Official Aramark Food Selections Bratchos at sections 101 and 348, matching MN Brat Dog (101) and MN Brat (348).",
            ["101", "348"],
            category="SNACK",
        ),
        item(
            "Cheese Curds",
            "Curds N Cakes",
            "Official Aramark Food Selections cheese curds. Curds N Cakes stands are 114 and 310; the SKU list also prints 129, 143, and 339.",
            ["114", "129", "143", "310", "339"],
            category="SNACK",
            notes="Full sourced SKU section list. Extra sections overlap 1st and Fry stands; do not clone a second FoodItem.",
        ),
        item(
            "Pothole Pizza",
            "Pothole Pizza",
            "Official Pothole Pizza stands. Food Selections list pizza at sections 114, 134, 307, and 349.",
            ["114", "134", "307", "349"],
            notes="Named local pizza concept. Directory does not print slice SKUs.",
            allow=True,
        ),
        item(
            "Rusty Tacos",
            "Rusty Taco",
            "Official Rusty Taco stands. Food Selections list tacos at sections 105, 113, 122, 311, 317, and 341.",
            ["105", "113", "122", "311", "317", "341"],
        ),
        item(
            "Walking Taco",
            "Walking Taco",
            "Official Walking Taco stands and Food Selections walking tacos at sections 119, 134, and 360.",
            ["119", "134", "360"],
            category="SNACK",
            allow=True,
        ),
        item(
            "Mac & Cheese",
            "Mac Truck Mac & Cheese",
            "Official Mac Truck Mac & Cheese portable at section 111. Food Selections also list mac and cheese at 121 and EndZone Grill; those are other stands and are not copied onto this vendor.",
            ["111"],
            notes="Do not attach 121 or ENDZONE GRILL to Mac Truck.",
        ),
        item(
            "Chicken Wings",
            "Heritage Tea House & Wings",
            "Official Heritage Tea House & Wings chicken wings at section 344.",
            ["344"],
        ),
        item(
            "Fried Broccoli",
            "Heritage Tea House & Wings",
            "Official Food Selections fried broccoli at section 344, matching Heritage Tea House & Wings.",
            ["344"],
            category="SNACK",
        ),
        item(
            "Grilled Cheese",
            "O'Cheese",
            "Official O'Cheese stand and Food Selections grilled cheese at section 109.",
            ["109"],
        ),
        item(
            "Cheesesteak",
            "Steak & Cheese",
            "Official Steak & Cheese stands at 107 and 334. Food Selections list cheesesteak at 108 and 334; item locations use the printed SKU sections.",
            ["108", "334"],
            notes="Vendor stands include 107; cheesesteak SKU prints 108, 334. Do not invent 107 onto the SKU.",
        ),
        item(
            "Hot Tots",
            "Union",
            "Official Food Selections Hot Tots at section 111, matching the Union concession stand.",
            ["111"],
            category="SNACK",
        ),
        item(
            "Schweigerts Hot Dog",
            "Schweigerts Hot Dogs",
            "Official Schweigerts Hot Dogs branded stands at sections 131 and 317.",
            ["131", "317"],
        ),
        item(
            "Love You Cookie",
            "Love You Cookie",
            "Official Love You Cookie portable at section 346.",
            ["346"],
            category="SWEET",
            allow=True,
        ),
        item(
            "T-Rex Cookies",
            "T-Rex Cookies",
            "Official T-Rex Cookies portable at section 129. Food Selections list cookies at 129.",
            ["129"],
            category="SWEET",
            allow=True,
        ),
        item(
            "Mini Donuts",
            "Mini Donuts",
            "Official Mini Donuts portables at sections 111 and 328.",
            ["111", "328"],
            category="SWEET",
            allow=True,
        ),
        item(
            "Black Raspberry Smoothie",
            "Maui Wowi",
            "Maui Wowi black raspberry smoothie. Official portable is at section 111; MSP Mag confirms black raspberry and strawberry flavors this season.",
            ["111"],
            source=MSP,
            item_type="NON_ALCOHOLIC_DRINK",
            category="BEVERAGE",
        ),
        item(
            "Strawberry Smoothie",
            "Maui Wowi",
            "Maui Wowi strawberry smoothie. Official portable is at section 111; MSP Mag confirms black raspberry and strawberry flavors this season.",
            ["111"],
            source=MSP,
            item_type="NON_ALCOHOLIC_DRINK",
            category="BEVERAGE",
        ),
    ],
    "excluded": [
        {
            "kind": "generic_filler",
            "name": "Fountain Soda / Bottled Water / Domestic Beer",
            "reason": "Stadium Slop convention excludes fountain soda, bottled water, and generic domestic beer.",
        },
        {
            "kind": "generic_filler",
            "name": "Chips / Popcorn / Peanuts / Pretzel / Candy / Cracker Jacks",
            "reason": "Generic snack SKUs on the Aramark Food Selections list.",
        },
        {
            "kind": "generic_filler",
            "name": "Bratwurst / Cheeseburger / Chicken Tenders / French Fries / Hot Dog / Nachos",
            "reason": "Generic grill SKUs without a distinctive build. Distinctive branded items are imported separately.",
        },
        {
            "kind": "heading",
            "name": "Vegan Options / Cocktails / Coffee",
            "reason": "Menu headings or generic beverage categories, not FoodItems.",
        },
        {
            "kind": "missing_section",
            "name": "SPAM Dog / Hawaiian Specialty SPAM Dog",
            "reason": "MSP Mag confirms 2026 SPAM dogs but does not print a section. Do not invent a location.",
        },
        {
            "kind": "missing_section",
            "name": "Centro Loaded Nachos",
            "reason": "MSP Mag confirms Centro loaded nachos this season but does not print a section. Do not copy 105 from the margarita SKU.",
        },
        {
            "kind": "generic_stand",
            "name": "1st and Fry / Popped Corn / The Kernel / Cheetos Popcorn",
            "reason": "Fry and popcorn stands without a distinctive non-generic SKU.",
        },
        {
            "kind": "place_not_food",
            "name": "Bru Thru / Blue Line Bar / Drink MKT / liquor portables",
            "reason": "Walk-out markets and bars, not distinctive food items.",
        },
    ],
    "staleReview": [
        stale(
            "AZC Hoagies",
            "andrew-zimmern-s-canteen-azc-hoagies",
            "andrew-zimmern-s-canteen",
            "Andrew Zimmern's Canteen is not on the live 2026 Aramark stand directory. Sections 114 and 342 are now Curds N Cakes / Pothole Pizza and Liquor Portable Crown. Absent from MSP Mag 2026 new-food coverage. Left active; do not auto-hide.",
        ),
        stale(
            "AZC Rotisserie",
            "andrew-zimmern-s-canteen-azc-rotisserie",
            "andrew-zimmern-s-canteen",
            "Same evidence as AZC Hoagies: Andrew Zimmern's Canteen is not on the 2026 official directory or 2026 new-vendor coverage. Left active.",
        ),
        stale(
            "Ike's Food & Cocktails",
            "ike-s-food-cocktails-ike-s-food-cocktails",
            "ike-s-food-cocktails",
            "Ike's is not on the live 2026 Aramark directory. CSV sections 119 and 329 are Drink MKT / Sweet Habits territory and Be Graceful. Left active.",
        ),
        stale(
            "Revival",
            "revival-revival",
            "revival",
            "Revival is not on the live 2026 Aramark directory. Official Union stand occupies section 111. Left active; do not auto-hide.",
        ),
        stale(
            "Switch Up",
            "switch-up-switch-up",
            "switch-up",
            "Switch Up is not on the live 2026 Aramark directory or 2026 new-vendor coverage. CSV section 126 is unpublished. Left active.",
        ),
        stale(
            "The Lao Brat",
            "the-lao-brat-the-lao-brat",
            "the-lao-brat",
            "The Lao Brat is not named on the 2026 official directory. CSV sections 124, 130, 304 overlap North Star Grill / Red Zone Grill generic bratwurst listings. Left active.",
        ),
        stale(
            "Walleye Finger Fish & Chips",
            "walleye-finger-fish-chips-walleye-finger-fish-chips",
            "walleye-finger-fish-chips",
            "Walleye is not on the 2026 Food Selections list. Section 101 is official MN Brat Dog / Headwaters. Left active; do not attach walleye to Headwaters without a printed SKU.",
        ),
        stale(
            "Pendleton Whisky Longhouse",
            "pendleton-whisky-longhouse-pendleton-whisky-longhouse",
            "pendleton-whisky-longhouse",
            "Pendleton Whisky Longhouse is a place/zone CSV row, not a food SKU, and is absent from the current official directory. Left active.",
        ),
        stale(
            "Wholesome Wonders",
            "wholesome-wonders-wholesome-wonders",
            "wholesome-wonders",
            "Wholesome Wonders is not on the 2026 official directory. Official GF/vegan stand is Be Graceful at 121, 329. Left active.",
        ),
        stale(
            "PoppedCorn",
            "poppedcorn-poppedcorn",
            "poppedcorn",
            "CSV PoppedCorn at unsourced section 104. Official Popped Corn is at 108, 315 and is generic popcorn, which Stadium Slop excludes. Left active.",
        ),
        stale(
            "The Walk-Thru Bru",
            "the-walk-thru-bru-the-walk-thru-bru",
            "the-walk-thru-bru",
            "Walk-out beer market, not a food item. Official Bru Thru is at 102; CSV used 101, 208, 333. Left active.",
        ),
        stale(
            "Waffle Cone Fusion",
            "soul-bowl-waffle-cone-fusion",
            "soul-bowl",
            "Official Soul Bowl listing is section 317 only and does not mention waffle cones. CSV section 214 is unpublished on the current directory. Left active.",
        ),
        stale(
            "Starry Night",
            "dirty-soda-shoppe-starry-night",
            "dirty-soda-shoppe",
            "CSV Dirty Soda Shoppe sits at section 118, which the 2026 directory assigns to Parlour. MSP Mag names Sweet Habits as the new dirty-soda vendor at 119. Left active.",
            MSP,
        ),
        stale(
            "Rootbeer Mayhem",
            "dirty-soda-shoppe-rootbeer-mayhem",
            "dirty-soda-shoppe",
            "Same Dirty Soda Shoppe / Parlour 118 conflict. 2026 dirty sodas are Sweet Habits at 119. Left active.",
            MSP,
        ),
        stale(
            "Toffee Surprise",
            "dirty-soda-shoppe-toffee-surprise",
            "dirty-soda-shoppe",
            "Same Dirty Soda Shoppe / Parlour 118 conflict. 2026 dirty sodas are Sweet Habits at 119. Left active.",
            MSP,
        ),
        stale(
            "Mac Time",
            "mac-time-mac-time",
            "mac-time",
            "Mac Time at CSV section 133 is not on the 2026 directory. Official mac stand is Mac Truck Mac & Cheese at 111. Left active; also flagged possible duplicate.",
        ),
    ],
    "possibleDuplicates": [
        dup(
            "Mac Time",
            "mac-time-mac-time",
            "mac-time",
            "May be the same mac-and-cheese concept as new official Mac Truck Mac & Cheese at 111. CSV Mac Time used unpublished section 133. Do not merge automatically.",
        ),
        dup(
            "Wholesome Wonders",
            "wholesome-wonders-wholesome-wonders",
            "wholesome-wonders",
            "GF/vegan concept may overlap official Be Graceful at 121, 329. Different CSV sections (119, 122). Do not merge automatically.",
        ),
        dup(
            "Minneapolis Cocktail Co.",
            "minneapolis-cocktail-co-minneapolis-cocktail-co",
            "minneapolis-cocktail-co",
            "CSV bar at section 336 matches official Cocktails on Tap Bar at 336. Place-as-item, not a sourced cocktail SKU. Do not merge automatically.",
        ),
        {
            "classification": "POSSIBLE_DUPLICATE",
            "existingName": "Nashville Coop (official stand at 121)",
            "recommendation": "manual_review",
            "evidence": "Official directory lists Nashville Coop at 121. MSP Mag names Tender Lovin Chix at 121 for the TLC Smash burger. Possible same stand, different identity. Created the MSP-named 2026 vendor only; did not also create Nashville Coop.",
            "sourceUrl": DIR,
        },
    ],
}

out = Path("data/nfl/2026-concessions/us-bank-stadium.json")
out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {out} vendors={len(payload['vendors'])} items={len(payload['items'])}")
