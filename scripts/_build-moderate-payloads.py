#!/usr/bin/env python3
"""Build IMPORT_READY payloads from the MODERATE-source 2026 research pass."""

from __future__ import annotations

import json
from pathlib import Path

OUT = Path("data/nfl/2026-concessions")

ARAMARK = "https://www.businesswire.com/news/home/20260909842365/en/"


def loc(sections: list[str]) -> str:
    return ", ".join(sections)


def vendor(name: str, sections: list[str], source: str, existing: str | None = None) -> dict:
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
    source: str,
    *,
    item_type: str = "FOOD",
    category: str = "SAVORY",
    notes: str | None = None,
    allow: bool = False,
    existing_item: str | None = None,
    existing_vendor: str | None = None,
    labeled_new: bool = False,
    price: float | None = None,
) -> dict:
    row = {
        "name": name,
        "vendorName": vendor_name,
        "description": description,
        "itemType": item_type,
        "category": category,
        "sections": sections,
        "location": loc(sections),
        "basePrice": price,
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


def stale(name: str, item_slug: str, vendor_slug: str, evidence: str, source: str) -> dict:
    return {
        "classification": "STALE_REVIEW",
        "existingName": name,
        "existingItemSlug": item_slug,
        "existingVendorSlug": vendor_slug,
        "recommendation": "hide",
        "evidence": evidence,
        "sourceUrl": source,
    }


def dup(name: str, item_slug: str, vendor_slug: str, evidence: str, source: str) -> dict:
    return {
        "classification": "POSSIBLE_DUPLICATE",
        "existingName": name,
        "existingItemSlug": item_slug,
        "existingVendorSlug": vendor_slug,
        "recommendation": "manual_review",
        "evidence": evidence,
        "sourceUrl": source,
    }


def write_payload(payload: dict) -> None:
    path = OUT / f"{payload['venueSlug']}.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path} vendors={len(payload['vendors'])} items={len(payload['items'])}")


def acrisure() -> dict:
    src = "https://www.steelers.com/news/what-s-new-at-acrisure-stadium-in-2026"
    flav = ["118", "505", "516", "518", "529", "534", "North Club", "PNC Champions Club"]
    return {
        "venueSlug": "acrisure-stadium",
        "venueName": "Acrisure Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "What's new at Acrisure Stadium in 2026",
            "type": "official_team",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Steelers 2026 announcement plus Aramark Sports + Entertainment 2026 release. Focused 2026 highlights with sourced sections. Dippin' Dots, kale salads, and generic tenders excluded. Pick 6 Sammies updated in place.",
        "vendors": [
            vendor("Fourth and Flav Nacho", flav, src),
            vendor("Pittsburgh Pierogies Stand", ["119"], src),
            vendor("Goal Line Stand", ["124"], src),
            vendor("Steelhouse", ["109", "128"], src),
            vendor("Steel City Markets", ["215", "239"], src, "steel-city-markets"),
            vendor("PNC Champions Club", ["PNC Champions Club"], src),
            vendor("Pick 6 Sammies", ["UPMC East Club", "West Club"], src, "pick-6-sammies"),
        ],
        "items": [
            item(
                "Fourth and Flav Nacho",
                "Fourth and Flav Nacho",
                "Official 2026 upscale nachos with smoked cheese sauce, mojo pulled pork, roasted corn and bean salsa, pickled jalapeños, blackened red onions, and avocado-lime crema.",
                flav,
                ARAMARK,
                allow=True,
                labeled_new=True,
            ),
            item(
                "Pierogies N'at",
                "Pittsburgh Pierogies Stand",
                "Official 2026 Pittsburgh pierogi stand blending comfort-food flavors with unexpected toppings at section 119.",
                ["119"],
                src,
                labeled_new=True,
            ),
            item(
                "Three Little Pigs",
                "Goal Line Stand",
                "Official 2026 pig-in-a-blanket: cheddar bratwurst, spicy Italian sausage, capicola, 1933 steak sauce, Mike's Hot Honey, and crushed Voodoo chips.",
                ["124"],
                ARAMARK,
                labeled_new=True,
            ),
            item(
                "The Immaculate Refreshment",
                "Steelhouse",
                "Official 2026 cocktail of vodka, orange juice, and Starry served in a Steelers logo mini-Gatorade cooler cup. 21+ with valid ID.",
                ["109", "128"],
                ARAMARK,
                item_type="ALCOHOLIC_DRINK",
                category="ALCOHOLIC_BEVERAGE",
                labeled_new=True,
            ),
            item(
                "Yinzer Wrap",
                "Steel City Markets",
                "Official 2026 Pittsburgh wrap: grilled kielbasa, mini pierogies, caramelized onions, cheddar, bacon bits, and chive crema.",
                ["215", "239"],
                ARAMARK,
                labeled_new=True,
                existing_vendor="steel-city-markets",
            ),
            item(
                "Black N' Gold Chicken and Waffle",
                "PNC Champions Club",
                "Official 2026 house-made black-and-gold waffles with fried chicken, coleslaw, bacon jam, sweet potato fries, and Mike's Hot Honey.",
                ["PNC Champions Club"],
                ARAMARK,
                labeled_new=True,
            ),
            item(
                "Pick 6 Sammies",
                "Pick 6 Sammies",
                "Official 2026 kiosk sandwiches now include Alla Famiglia hot sausage sandwiches, Steel City steak salads, house smash burgers, and chicken tenders with seasoned fries.",
                ["UPMC East Club", "West Club"],
                src,
                allow=True,
                existing_item="pick-6-sammies-pick-6-sammies",
                existing_vendor="pick-6-sammies",
                notes="UPDATE canonical Pick 6 Sammies in place. Preserve slug.",
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "Dippin' Dots", "reason": "Novelty ice cream, not a distinctive review target."},
            {"kind": "generic_filler", "name": "Kale & Berry Salads", "reason": "Generic club salad."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "The Pierogi Pileup",
                "bridges-n-at-the-pierogi-pileup",
                "bridges-n-at",
                "Existing Bridges N'at Pierogi Pileup at 107 & 231 may overlap 2026 Pierogies N'at at the Pittsburgh Pierogies Stand, section 119. Do not merge.",
                src,
            ),
            dup(
                "Pulled Pork Nachos",
                "pulled-pork-nachos-pulled-pork-nachos",
                "pulled-pork-nachos",
                "CSV pulled-pork nachos at 506, 516, 529 overlap Fourth and Flav Nacho sections 516 and 529. Different concept; do not merge.",
                src,
            ),
        ],
    }


def empower() -> dict:
    src = ARAMARK
    return {
        "venueSlug": "empower-field-at-mile-high",
        "venueName": "Empower Field at Mile High",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Aramark Sports + Entertainment Kicks Off 2026 NFL Season Across Eight NFL Stadiums",
            "type": "official_operator",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Aramark 2026 release with sourced sections. CBS listed additional local vendors; those without Aramark/team section confirmation were not imported. Mile High Favs $5 staples excluded.",
        "vendors": [
            vendor("Beast in a Blanket", ["128"], src),
            vendor("Chicken & Champagne Bucket", ["512"], src),
            vendor("Nine in the Box", ["United Globe Clubs"], src),
        ],
        "items": [
            item(
                "Beast in a Blanket",
                "Beast in a Blanket",
                "Official 2026 shareable: 2-foot grilled hot dog and brisket burnt ends wrapped in puff pastry with cheddar, goat cheese, secret sauce, avocado cream, crispy pickled onions, and jalapeño.",
                ["128"],
                src,
                allow=True,
                labeled_new=True,
                price=45,
            ),
            item(
                "Chicken & Champagne Bucket",
                "Chicken & Champagne Bucket",
                "Official 2026 12-piece fried chicken with two cans of champagne in a souvenir bucket. 21+ with valid ID.",
                ["512"],
                src,
                allow=True,
                labeled_new=True,
            ),
            item(
                "Nine in the Box",
                "Nine in the Box",
                "Official 2026 stack of nine wagyu sliders with sharp white cheddar, caramelized onions, steak tomato, and tangy burger sauce on brioche.",
                ["United Globe Clubs"],
                src,
                allow=True,
                labeled_new=True,
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "Mile High Favs $5 staples", "reason": "Hot dogs, nachos, pretzels, popcorn, candy, soda, water."},
            {"kind": "unsourced_section", "name": "Aloha Cones / Carrera's / Cupbop / Mister Oso SKUs", "reason": "Local-media sections not used; Aramark named the vendors but not those SKU stands in the HIGH release."},
        ],
        "staleReview": [],
        "possibleDuplicates": [],
    }


def ford() -> dict:
    src = "https://www.fordfield.com/restaurant-partner-menus"
    partners = "https://www.fordfield.com/restaurant-partners"
    return {
        "venueSlug": "ford-field",
        "venueName": "Ford Field",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Restaurant Partner Menus | Ford Field",
            "type": "official_stadium",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Ford Field partner directory and menus. Focused on 2026 local partners with named SKUs and sections. Value combos, kids meals, walking tacos, and generic pretzels excluded. Passport SKUs reported only by local media were not imported.",
        "vendors": [
            vendor("Xav's Jammin' Caribbean Fusion", ["135"], src),
            vendor("Paradise Street Eats & Biryani", ["235", "Fifth Third Gridiron Club"], src, "paradise-street-eats"),
            vendor("Slow's BBQ", ["210"], src, "slow-s-bbq"),
            vendor("Cooking with Que", ["134"], src, "cooking-with-que"),
        ],
        "items": [
            item(
                "Jerk Chicken Wings",
                "Xav's Jammin' Caribbean Fusion",
                "Official Ford Field partner menu: Caribbean jerk chicken wings at section 135.",
                ["135"],
                src,
                labeled_new=True,
            ),
            item(
                "Oxtail Empanadas",
                "Xav's Jammin' Caribbean Fusion",
                "Official Ford Field partner menu: oxtail empanadas at Xav's Jammin' Caribbean Fusion, section 135.",
                ["135"],
                src,
                labeled_new=True,
            ),
            item(
                "Paradise Loaded Fries",
                "Paradise Street Eats & Biryani",
                "Official partner menu: chaat masala fries with crispy butter chicken, cheese, red onion, cilantro, black sesame, and XXX sauce.",
                ["235", "Fifth Third Gridiron Club"],
                src,
                labeled_new=True,
                existing_vendor="paradise-street-eats",
            ),
            item(
                "Butter Chicken Tacos",
                "Paradise Street Eats & Biryani",
                "Official partner menu: two puffy chapati tacos with tandoori butter chicken, XXX slaw, diced vegetables, chutney, and lime.",
                ["235", "Fifth Third Gridiron Club"],
                src,
                labeled_new=True,
                existing_vendor="paradise-street-eats",
            ),
            item(
                "The Reason",
                "Slow's BBQ",
                "Official partner menu: Slow's smoked pork butt dressed in NC BBQ sauce, topped with coleslaw and dill pickles.",
                ["210"],
                src,
                existing_vendor="slow-s-bbq",
            ),
            item(
                "Oh Kale Yeah Burger",
                "Cooking with Que",
                "Official partner menu: Beyond or beef patty with sautéed kale, mushrooms, vegan cheese, mayo, pickles, and tomatoes on a pretzel bun.",
                ["134"],
                src,
                existing_vendor="cooking-with-que",
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "F-150 Tailgate Combo / Stadium Classics / Den Marketplace", "reason": "Value sausage, hot dogs, chips, soda, candy."},
            {"kind": "medium_only", "name": "Food passport potstickers / corned beef nachos / BBQ wings", "reason": "Named at the Lions tasting in local reporting, not on the official partner-menu page."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Paradise Street Eats",
                "paradise-street-eats-paradise-street-eats",
                "paradise-street-eats",
                "Canonical vendor-as-item remains. New SKUs added under the same vendor rather than replacing it.",
                src,
            ),
        ],
    }


def arrowhead() -> dict:
    src = ARAMARK
    return {
        "venueSlug": "geha-field-at-arrowhead-stadium",
        "venueName": "GEHA Field at Arrowhead Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Aramark Sports + Entertainment Kicks Off 2026 NFL Season Across Eight NFL Stadiums",
            "type": "official_operator",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Aramark 2026 release. Full Arrowhead menu remains app-only; this pass only imports the three sourced 2026 items with sections. Mucho Melt was not already in production.",
        "vendors": [
            vendor("KC Dilla", ["135"], src, "kc-dilla"),
            vendor("Burger Kitchen", ["102", "116"], src, "burger-kitchen"),
        ],
        "items": [
            item(
                "The Mucho Melt",
                "KC Dilla",
                "Official 2026 layered tortilla tower with guajillo-spiced beef, beans, sweet potato fries, Cotija and cheddar, guacamole, pico de gallo, and pineapple skewers.",
                ["135"],
                src,
                labeled_new=True,
                existing_vendor="kc-dilla",
                price=21.59,
            ),
            item(
                "Lava Burger",
                "Burger Kitchen",
                "Official 2026 cheese-stuffed burger with thick-cut bacon, roasted tomato, chives, and jalapeño popper spread on a sourdough boule.",
                ["102"],
                src,
                labeled_new=True,
                existing_vendor="burger-kitchen",
            ),
            item(
                "Pork Belly Bomb",
                "Burger Kitchen",
                "Official 2026 cream cheese and Boursin-filled bite coated in Parmesan and sour cream & onion chips, finished with candied bacon and red pepper jelly.",
                ["116"],
                src,
                labeled_new=True,
                existing_vendor="burger-kitchen",
            ),
        ],
        "excluded": [
            {"kind": "app_only", "name": "Full Arrowhead stand census", "reason": "Official A-Z guide points to the Chiefs app for complete menus."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Smokehouse Burger",
                "smokehouse-burger",
                "burger-kitchen",
                "Existing Burger Kitchen Smokehouse Burger at 102/116 is not the 2026 Lava Burger. Keep both.",
                src,
            ),
            dup(
                "Steak Quesadilla",
                "steak-quesadilla",
                "kc-dilla",
                "Existing KC Dilla quesadillas at 135/323 are not the Mucho Melt tower. Keep both.",
                src,
            ),
        ],
    }


def huntington() -> dict:
    src = "https://huntingtonbankfield.com/food-beverage/"
    return {
        "venueSlug": "huntington-bank-field",
        "venueName": "Huntington Bank Field",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Food & Beverage - Huntington Bank Field",
            "type": "official_stadium",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Huntington Bank Field vendor directory plus Aramark 2026 featured items. Generic C-Town Eats hot dogs, pretzels, and beer bars excluded.",
        "vendors": [
            vendor("Hungry Dawgs Grill", ["118"], src),
            vendor("Mabel's BBQ", ["115", "307", "332"], ARAMARK, "mabel-s-bbq"),
            vendor("Tenders Love and Chicken", ["128", "304", "329"], ARAMARK, "tenders-love-and-chicken"),
            vendor("Rocco Whalen’s Great Lakes Cheesesteaks", ["121", "139", "420", "509", "533"], src, "rocco-whalen-s-great-lakes-cheesesteaks"),
            vendor("Brat & Brew", ["140"], src),
        ],
        "items": [
            item(
                "Hot Dog Flight",
                "Hungry Dawgs Grill",
                "Official 2026 flight of three mini dogs: Buffalo Blitz (buffalo chicken dip, celery, blue cheese, Buffalo sauce), Italian Stallion (spaghetti, meatballs, marinara, Parmesan, basil), and Brisket Dog (smoked brisket, fried onions, pickles, bourbon BBQ, Gouda).",
                ["118"],
                ARAMARK,
                labeled_new=True,
            ),
            item(
                "Polish Boy",
                "Mabel's BBQ",
                "Official 2026 Cleveland classic: kielbasa, fries, poppy-seed coleslaw, Mabel's Sweet Cleveland BBQ Sauce, Tony Packo's pickles, and pickled red onions on brioche.",
                ["115", "307", "332"],
                ARAMARK,
                labeled_new=True,
                existing_vendor="mabel-s-bbq",
            ),
            item(
                "Golden Chicken Sandwich",
                "Tenders Love and Chicken",
                "Official 2026 crispy chicken tenders with Carolina Gold sauce, shredded cheddar, onion straws, and pickles on brioche.",
                ["128", "304", "329"],
                ARAMARK,
                labeled_new=True,
                existing_vendor="tenders-love-and-chicken",
            ),
            item(
                "The Tremonster",
                "Rocco Whalen’s Great Lakes Cheesesteaks",
                "Official stadium menu: sliced sirloin, fancy mushrooms, Whizzy béchamel, and green onion.",
                ["121", "139", "420", "509", "533"],
                src,
                existing_vendor="rocco-whalen-s-great-lakes-cheesesteaks",
            ),
            item(
                "Irish Pierogi Nachos",
                "Brat & Brew",
                "Official stadium menu: pierogies, corned beef, sauerkraut, Thousand Island, and sour cream at section 140.",
                ["140"],
                src,
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "C-Town Eats / Pilot Fast Favorites staples", "reason": "Hot dogs, pizza, pretzels, packaged snacks."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "The Spicy Slaw Dog",
                "dawg-house-the-spicy-slaw-dog",
                "dawg-house",
                "Existing Dawg House at 107 & 138 is not Hungry Dawgs Grill section 118. Keep both.",
                src,
            ),
            dup(
                "Hot Honey Chicken Sandwich",
                "tenders-love-and-chicken-hot-honey-chicken-sandwich",
                "tenders-love-and-chicken",
                "Existing Hot Honey Chicken Sandwich is not the 2026 Golden Chicken Sandwich. Keep both.",
                ARAMARK,
            ),
        ],
    }


def lincoln() -> dict:
    src = ARAMARK
    official = "https://www.lincolnfinancialfield.com/food-and-concessions/"
    return {
        "venueSlug": "lincoln-financial-field",
        "venueName": "Lincoln Financial Field",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Aramark Sports + Entertainment Kicks Off 2026 NFL Season Across Eight NFL Stadiums",
            "type": "official_operator",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Aramark 2026 items with sections, plus official Linc local-favorites page for the 9th Street Market Pastel. South Philly Special cheesesteak skipped because Inquirer and Philly Mag disagree on 138 vs 148. Generic pretzels, calzones, and gluten-free staples not re-imported.",
        "vendors": [
            vendor("Broad Street Beast", ["113"], src),
            vendor("Sideline Markets", ["C38", "C23"], official, "sideline-markets"),
            vendor("Smoked BBQ Chicken Nachos", ["120", "216"], src),
            vendor("9th Street Market", ["138"], official),
        ],
        "items": [
            item(
                "Broad Street Beast",
                "Broad Street Beast",
                "Official 2026 18-inch green chalupa shell with braised wagyu beef shank, fried jalapeño poppers, tomatillo avocado salsa, Oaxaca queso, crispy shallots, and cilantro.",
                ["113"],
                src,
                allow=True,
                labeled_new=True,
                price=55,
            ),
            item(
                "Tush Push Tater",
                "Sideline Markets",
                "Official 2026 deep-fried russet potato topped with fried chicken cutlet, pimento mac and cheese, bacon hot honey jam, 215 sauce, and scallions at East and West club markets.",
                ["C38", "C23"],
                src,
                labeled_new=True,
                existing_vendor="sideline-markets",
            ),
            item(
                "Smoked BBQ Chicken Nachos",
                "Smoked BBQ Chicken Nachos",
                "Official 2026 tortilla chips with smoked chicken in caramelized honey BBQ, roasted poblano queso, black beans, charred corn relish, mango pico, crema, and scallions.",
                ["120", "216"],
                src,
                allow=True,
                labeled_new=True,
            ),
            item(
                "9th Street Market Pastel",
                "9th Street Market",
                "Official this-season local item: pastel stuffed with mortadella, capicola, prosciutto cotto, and tomato relish, served with long hot aioli at section 138.",
                ["138"],
                official,
                labeled_new=True,
            ),
        ],
        "excluded": [
            {"kind": "source_conflict", "name": "South Philly Special Cheesesteak", "reason": "Philly Mag lists 126, 129, 138; Inquirer lists 126, 129, 148. Not imported."},
            {"kind": "incomplete_location", "name": "Kool-Aid Glazed Chicken Wings", "reason": "Philly Mag places them in FanDuel Lounge only; Aramark release did not list a section."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Maui BBQ Meat Pie",
                "g-day-gourmet-maui-bbq-meat-pie",
                "g-day-gourmet",
                "Existing G'Day Gourmet pie at 111 is not the 9th Street Market Pastel. Keep both.",
                official,
            ),
        ],
    }


def lumen() -> dict:
    src = "https://www.seahawks.com/news/seahawks-announce-new-food-beverage-items-at-lumen-field-for-the-2026-season"
    jsn = ["114", "132", "230", "311", "336"]
    return {
        "venueSlug": "lumen-field",
        "venueName": "Lumen Field",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Seahawks Announce New Food & Beverage Items at Lumen Field for the 2026 Season",
            "type": "official_team",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Seahawks/Levy 2026 announcement. JSN Menu items that launch later in 2026 are still sourced as 2026 offerings. 12s Combo hot dogs excluded. Existing Rookie/All-Pro/284 tender rows left in place.",
        "vendors": [
            vendor("JSN Menu", jsn, src),
            vendor("PNW Kitchen", ["113"], src, "pnw-kitchen"),
            vendor("Big Walt’s Kitchen", ["126", "214", "230", "321"], src, "big-walt-s-kitchen"),
            vendor("King's Hawaiian", ["120", "131", "305", "335"], src, "kings-hawaiian"),
            vendor("Legion", ["204", "240"], src, "legion"),
            vendor("Mister Softee", ["116", "141", "214", "230"], src, "mister-softee"),
        ],
        "items": [
            item(
                "Jerk Salmon Nachos",
                "JSN Menu",
                "Official 2026 JSN Menu: tortilla chips with pickled jalapeños, Fresno peppers, cheese sauce, and juniper-jerk smoked salmon in a collectible receiver-glove container. Served Sep 9–Oct 25.",
                jsn,
                src,
                labeled_new=True,
            ),
            item(
                "Breads & JSN Spreads",
                "JSN Menu",
                "Official 2026 JSN Menu: warm artisan breads with jalapeño jam, smoked salmon spread, and nectarine butter. Served Nov 2–Nov 8.",
                jsn,
                src,
                labeled_new=True,
            ),
            item(
                "Jicama Steak Noodles",
                "JSN Menu",
                "Official 2026 JSN Menu: seared steak and pickled jicama over ramen in house bone broth. Served Dec 7–Dec 25.",
                jsn,
                src,
                labeled_new=True,
            ),
            item(
                "Buffalo Chicken Yard Nachos",
                "PNW Kitchen",
                "Official 2026 shareable nachos with buffalo chicken, celery, and blue cheese crumble at PNW Kitchen, section 113.",
                ["113"],
                src,
                labeled_new=True,
                existing_vendor="pnw-kitchen",
            ),
            item(
                "Top 100 Combo",
                "Big Walt’s Kitchen",
                "Official 2026 shareable combo of all three tender flavors — The Rookie, The All-Pro, and The 284 — on fries at sections 126, 214, 230, and 321.",
                ["126", "214", "230", "321"],
                src,
                labeled_new=True,
                existing_vendor="big-walt-s-kitchen",
            ),
            item(
                "King's Plate",
                "King's Hawaiian",
                "Official 2026 loaded BBQ combo: pulled pork, andouille, grilled pineapple slaw, BBQ baked beans, and two King's Hawaiian rolls in a souvenir 12s Tray.",
                ["120", "131", "305", "335"],
                src,
                labeled_new=True,
                existing_vendor="kings-hawaiian",
            ),
            item(
                "Jerk Chicken Sliders",
                "Legion",
                "Official 2026 five jerk chicken sliders on King's Hawaiian pretzel buns with grilled pineapple slaw and spicy mayo.",
                ["204", "240"],
                src,
                labeled_new=True,
                existing_vendor="legion",
            ),
            item(
                "Legion of Blue Dirty Soda",
                "Mister Softee",
                "Official 2026 rotational dirty soda: Sprite with blue raspberry syrup and a sweet cream topper.",
                ["116", "141", "214", "230"],
                src,
                item_type="NON_ALCOHOLIC_DRINK",
                category="BEVERAGE",
                labeled_new=True,
                existing_vendor="mister-softee",
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "12s Combo", "reason": "Two hot dogs and pretzel bites for $12."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Yard Nachos",
                "yard-nachos",
                "pacific-northwest-kitchen",
                "Existing Yard Nachos / PNW Kitchen pork-belly bowl are not the 2026 Buffalo Chicken Yard Nachos. Keep both.",
                src,
            ),
            dup(
                "The Rookie",
                "the-rookie",
                "big-walt-s-kitchen",
                "Existing individual tender SKUs are not the 2026 Top 100 Combo platter. Keep both.",
                src,
            ),
            dup(
                'The "Dirty" Emerald Soda',
                "district-market-the-dirty-emerald-soda",
                "district-market",
                "Existing dirty soda at District Market is not the Legion of Blue rotation. Keep both.",
                src,
            ),
        ],
    }


def northwest() -> dict:
    src = "https://northweststadium.com/concessions"
    banner = "https://www.thebanner.com/culture/food-drink/new-food-commanders-northwest-stadium-ZFOD5WWGYFFIBJ53P2SHDP7E4Q/"
    return {
        "venueSlug": "northwest-stadium",
        "venueName": "Northwest Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Northwest Stadium Concessions Guide",
            "type": "official_stadium",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Northwest Stadium stand directory plus Commanders Flavors of the Season items located in quality local coverage of the official preview. Generic Fan Fare, Tostitos, Dippin' Dots, Walking Taco, and $5 Bud Light excluded. Hail Mary Cheesesteak skipped (no section).",
        "vendors": [
            vendor("DMV Crab Cage", ["137"], src),
            vendor("DC BBQ Pocket", ["120"], banner),
            vendor("Ben's Chili Bowl", ["123", "415", "441"], src),
            vendor("Branson Lounge", ["307"], src, "branson-lounge-gallery"),
        ],
        "items": [
            item(
                "Crab Stuffed Pretzel",
                "DMV Crab Cage",
                "2026 Flavors of the Season: crab-shaped pretzel with lemon-tarragon Chesapeake crab, mozzarella, provolone, garlic butter, and Parmesan at section 137.",
                ["137"],
                banner,
                labeled_new=True,
            ),
            item(
                "DC BBQ Pocket",
                "DC BBQ Pocket",
                "2026 Flavors of the Season: housemade dough stuffed with 17-hour smoked brisket, beans, half-smoke sausage, provolone, and mozzarella at section 120.",
                ["120"],
                banner,
                allow=True,
                labeled_new=True,
            ),
            item(
                "Ben's Chili Bowl Half-Smoke",
                "Ben's Chili Bowl",
                "Official stand directory plus 2026 preview: Ben's Chili Bowl returns with half-smokes, chili, and chili cheese fries at 123, 415, and 441.",
                ["123", "415", "441"],
                src,
            ),
            item(
                "Sushi Push Pop",
                "Branson Lounge",
                "2026 Flavors of the Season: Maryland blue crab, avocado, flying fish roe, and fiery corn puffs in a burgundy-and-gold tube at Branson Lounge, section 307.",
                ["307"],
                banner,
                category="SNACK",
                labeled_new=True,
                existing_vendor="branson-lounge-gallery",
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "Fan Fare / Tostitos / Dippin' Dots / Walking Taco", "reason": "Generic stadium staples."},
            {"kind": "incomplete_location", "name": "Hail Mary Cheesesteak", "reason": "Named in WJLA coverage without a section."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Branson Lounge & Gallery",
                "branson-lounge-gallery-branson-lounge-gallery",
                "branson-lounge-gallery",
                "Canonical lounge row remains. Sushi Push Pop added as a SKU rather than replacing it.",
                src,
            ),
        ],
    }


def nrg() -> dict:
    src = ARAMARK
    return {
        "venueSlug": "nrg-stadium",
        "venueName": "NRG Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Aramark Sports + Entertainment Kicks Off 2026 NFL Season Across Eight NFL Stadiums",
            "type": "official_operator",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Aramark 2026 Reliant/NRG items with sections. Click2Houston named additional bowls without stand numbers; those were not imported. Existing local-partner rows left in place. Headline CSV contamination from Lincoln Financial names is not treated as stale without positive NRG evidence.",
        "vendors": [
            vendor("Battle Red Berry Bird", ["101", "121", "520", "546"], src),
            vendor("Chef Sonia's Southern Mac Bowl", ["103", "123"], src),
            vendor("Korean Meatball Bao", ["118", "138", "510", "532"], src),
        ],
        "items": [
            item(
                "Battle Red Berry Bird",
                "Battle Red Berry Bird",
                "Official 2026 fried chicken breast tossed in strawberry buffalo sauce with coleslaw, pickles, and Cajun cheese curds on challah, served with tater kegs and chipotle aioli.",
                ["101", "121", "520", "546"],
                src,
                allow=True,
                labeled_new=True,
            ),
            item(
                "Chef Sonia's Southern Mac Bowl",
                "Chef Sonia's Southern Mac Bowl",
                "Official 2026 bowl of crispy fried chicken bites, roasted corn, hatch chile mac and cheese, and Cajun brown gravy, named for General Concessions Chef Sonia.",
                ["103", "123"],
                src,
                allow=True,
                labeled_new=True,
            ),
            item(
                "Korean Meatball Bao",
                "Korean Meatball Bao",
                "Official 2026 Korean braised beef meatball with sesame ginger slaw on a steamed bao bun.",
                ["118", "138", "510", "532"],
                src,
                allow=True,
                labeled_new=True,
            ),
        ],
        "excluded": [
            {"kind": "incomplete_location", "name": "Get Jacked Protein Power Burger Bowl / peri peri nachos", "reason": "Named in local TV coverage without published stand numbers."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Seafood Boudin Wings",
                "stuff-d-wings-seafood-boudin-wings",
                "stuff-d-wings",
                "Existing STUFF'd Wings at 510 is not the Korean Meatball Bao also listed at 510. Keep both.",
                src,
            ),
        ],
    }


def paycor() -> dict:
    src = ARAMARK
    official = "https://www.bengals.com/stadium/concessions/"
    return {
        "venueSlug": "paycor-stadium",
        "venueName": "Paycor Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Aramark Sports + Entertainment Kicks Off 2026 NFL Season Across Eight NFL Stadiums",
            "type": "official_operator",
            "retrievedAt": "2026-09-12",
        },
        "notes": "Official Aramark 2026 items with sections, cross-checked against the Bengals Jungle Hospitality stand list. Oktoberfest schnitzel from Local 12 had no section and was skipped. Generic smash burgers skipped (Aramark listed a suspicious section 263).",
        "vendors": [
            vendor("Who Dey Sausage", ["150"], src),
            vendor("Mazunte", ["134", "148", "308", "338"], src),
            vendor("United Dairy Farmers", ["209", "239"], src),
            vendor("Penn Station", ["120"], src),
        ],
        "items": [
            item(
                "Pork Rind Nachos",
                "Who Dey Sausage",
                "Official 2026 Grippo's Hot Pork Rinds with Carolina-style smoked pork shoulder, cheddar, barbecue sauce, chipotle ranch, pickled red onions, and jalapeños in a souvenir tray.",
                ["150"],
                src,
                labeled_new=True,
            ),
            item(
                "Who Dey Sausage",
                "Who Dey Sausage",
                "Official 2026 24-inch BBQ cheddar pork sausage with pickled red onions, jalapeño, and sweet BBQ sauce.",
                ["150"],
                src,
                allow=True,
                labeled_new=True,
            ),
            item(
                "Mazunte Tamales",
                "Mazunte",
                "Official 2026 Mazunte tamales: chicken with rajas and salsa verde, or cheese with poblanos and salsa verde, in corn husks.",
                ["134", "148", "308", "338"],
                src,
                labeled_new=True,
            ),
            item(
                "Homemade Killer SunDEY",
                "United Dairy Farmers",
                "Official 2026 Homemade Brand vanilla ice cream with killer brownie brookie, whipped cream, crushed Butterfinger, chocolate and caramel sauces, sprinkles, and a cherry in a souvenir tray.",
                ["209", "239"],
                src,
                category="SWEET",
                labeled_new=True,
            ),
            item(
                "Penn Station Cheesesteak",
                "Penn Station",
                "Official 2026 local partnership: Penn Station cheesesteaks at section 120.",
                ["120"],
                src,
                labeled_new=True,
            ),
        ],
        "excluded": [
            {"kind": "incomplete_location", "name": "Oktoberfest pretzel-crusted pork loin / schnitzel sandwich", "reason": "Local 12 coverage, no stand number."},
            {"kind": "generic_filler", "name": "Smash Burgers / Lee's Famous Recipe tenders", "reason": "Generic burgers/tenders; Aramark smash-burger list included unverified section 263."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Taco Tigre",
                "taco-tigre-taco-tigre",
                "taco-tigre",
                "Production Taco Tigre vs official Nacho Tigre / Mazunte walking tacos. Do not merge.",
                official,
            ),
            dup(
                "The Boone County Bourbon Bar",
                "the-boone-county-bourbon-bar-the-boone-county-bourbon-bar",
                "the-boone-county-bourbon-bar",
                "Existing bar at 150 is not assumed to be the Who Dey Sausage / pork rind stand. Keep both.",
                src,
            ),
        ],
    }


def main() -> None:
    for builder in (
        acrisure,
        empower,
        ford,
        arrowhead,
        huntington,
        lincoln,
        lumen,
        northwest,
        nrg,
        paycor,
    ):
        write_payload(builder())


if __name__ == "__main__":
    main()
