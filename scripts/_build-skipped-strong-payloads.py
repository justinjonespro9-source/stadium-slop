#!/usr/bin/env python3
"""Build Allegiant and Raymond James 2026 concession payloads from live official directories."""

from __future__ import annotations

import json
from pathlib import Path

OUT = Path("data/nfl/2026-concessions")

ALLEGIANT = "https://visit.allegiantstadium.com/plan-your-visit/food-beverage-menu-guide"
ALLEGIANT_AZ = "https://www.allegiantstadium.com/plan-your-visit/a-z-guide"
ALLEGIANT_PDF = (
    "https://www.oakviewgroup.com/wp-content/uploads/2026/08/Silver-and-Black-Reveal-Food-Draft-FINAL.pdf"
)
RJ_FB = "https://www.buccaneers.com/stadium/gameday/food-beverage"
RJ_SPEC = "https://www.buccaneers.com/specialty-food-items-raymond-james-stadium"


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


def excluded(kind: str, name: str, reason: str) -> dict:
    return {"kind": kind, "name": name, "reason": reason}


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


def allegiant() -> dict:
    slice_house = ["118", "140", "206", "230", "308"]
    guy = ["243"]
    boomtown = ["312"]
    rollin = ["340"]
    bandero = ["126", "141", "309", "324"]
    vitos = ["125", "316", "335"]
    tu = ["242", "316", "334"]
    return {
        "venueSlug": "allegiant-stadium",
        "venueName": "Allegiant Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": ALLEGIANT,
            "title": "Food & Beverage Menu Guide | Allegiant Stadium",
            "type": "official_stadium",
            "retrievedAt": "2026-09-11",
        },
        "notes": (
            "Re-reconcile using the live official menu guide plus A-Z House Deals stand numbers. "
            "Silver & Black 2026 WOW items still have no stand/section mapping and remain SKIP. "
            "A-Z exact stand numbers are preferred over the menu guide's adjacent-section search tags. "
            "No deactivations."
        ),
        "vendors": [
            vendor("Guy Fieri's", guy, ALLEGIANT_AZ, "guy-fieri-s"),
            vendor(
                "Pizza Rock by Tony Gemignani",
                slice_house,
                ALLEGIANT_AZ,
                "pizza-rock-by-tony-gemignani",
            ),
            vendor("Rollin' Smoke BBQ", rollin, ALLEGIANT_AZ, "rollin-smoke-bbq"),
            vendor("Boomtown Burgers", boomtown, ALLEGIANT_AZ),
            vendor("Bandero Tequila Bar", bandero, ALLEGIANT_AZ),
            vendor("Hibachi Done Wright", ["330"], ALLEGIANT_AZ),
            vendor("Pinkbox Doughnuts", ["128"], ALLEGIANT_AZ),
            vendor("Vito's Tacos", vitos, ALLEGIANT_AZ),
            vendor("Tu Michoacana", tu, ALLEGIANT_AZ),
            vendor("Taqueria Ktrina", ["331"], ALLEGIANT_AZ),
            vendor("Picanha Steak", ["307"], ALLEGIANT_AZ),
            vendor("Freed's Bakery", ["106"], ALLEGIANT_AZ),
            vendor("Pacha Mamas", ["120"], ALLEGIANT_AZ),
            vendor("Our Haus Sausage", ["223"], ALLEGIANT_AZ),
        ],
        "items": [
            item(
                "Tailgater Trash Can Nachos",
                "Guy Fieri's",
                "Official Guy Fieri's Tailgate Kitchen House Deals stand at section 243.",
                guy,
                ALLEGIANT_AZ,
                existing_item="guy-fieri-s-tailgater-trash-can-nachos",
                existing_vendor="guy-fieri-s",
            ),
            item(
                "Pizza Rock by Tony Gemignani",
                "Pizza Rock by Tony Gemignani",
                "Official Slice House / Pizza Rock stands at sections 118, 140, 206, 230, and 308.",
                slice_house,
                ALLEGIANT_AZ,
                allow=True,
                existing_item="pizza-rock-by-tony-gemignani-pizza-rock-by-tony-gemignani",
                existing_vendor="pizza-rock-by-tony-gemignani",
            ),
            item(
                "Chopped Brisket Sandwich",
                "Rollin' Smoke BBQ",
                "Official Rollin Smoke stand at section 340.",
                rollin,
                ALLEGIANT_AZ,
                existing_item="chopped-brisket-sandwich",
                existing_vendor="rollin-smoke-bbq",
            ),
            item(
                "Outlaw Fries",
                "Rollin' Smoke BBQ",
                "Official Rollin Smoke stand at section 340. Production 312 is now Boomtown Burgers.",
                rollin,
                ALLEGIANT_AZ,
                existing_item="outlaw-fries",
                existing_vendor="rollin-smoke-bbq",
            ),
            item(
                "Boomtown Burgers",
                "Boomtown Burgers",
                "Official Boomtown Burgers House Deals stand at section 312.",
                boomtown,
                ALLEGIANT_AZ,
                allow=True,
            ),
            item(
                "Spicy Margarita",
                "Bandero Tequila Bar",
                "Official 2026 Bandero Tequila spicy margarita at A-Z Bandero Bar stands.",
                bandero,
                ALLEGIANT_PDF,
                item_type="ALCOHOLIC_DRINK",
                category="ALCOHOLIC_BEVERAGE",
                labeled_new=True,
                notes="PDF lists Bandero Tequila as new in 2026 and names the Spicy Margarita.",
            ),
            item(
                "Hibachi Done Wright",
                "Hibachi Done Wright",
                "Official 2026 Hibachi Done Wright stand at section 330.",
                ["330"],
                ALLEGIANT_PDF,
                allow=True,
                labeled_new=True,
                notes="PDF lists Hibachi Done Wright as new in 2026. A-Z locates the stand at 330.",
            ),
            item(
                "Raider Donut",
                "Pinkbox Doughnuts",
                "Official Pinkbox Doughnuts stand at section 128, listed for Raider donuts.",
                ["128"],
                ALLEGIANT_AZ,
                category="SWEET",
            ),
            item(
                "Vito's Tacos",
                "Vito's Tacos",
                "Official Vito's Tacos stands at sections 125, 316, and 335.",
                vitos,
                ALLEGIANT_AZ,
                allow=True,
            ),
            item(
                "Paletas",
                "Tu Michoacana",
                "Official Tu Michoacana paletas at sections 242, 316, and 334.",
                tu,
                ALLEGIANT_AZ,
                category="SWEET",
            ),
            item(
                "Taqueria Ktrina",
                "Taqueria Ktrina",
                "Official Taqueria Ktrina stand at section 331.",
                ["331"],
                ALLEGIANT_AZ,
                allow=True,
            ),
            item(
                "Picanha Steak",
                "Picanha Steak",
                "Official Picanha Steak stand at section 307.",
                ["307"],
                ALLEGIANT_AZ,
                allow=True,
            ),
            item(
                "Freed's Bakery",
                "Freed's Bakery",
                "Official Freed's Bakery stand at section 106, listed for churros, cannolis, and desserts.",
                ["106"],
                ALLEGIANT_AZ,
                category="SWEET",
                allow=True,
            ),
            item(
                "Pacha Mamas",
                "Pacha Mamas",
                "Official Pacha Mamas stand at section 120.",
                ["120"],
                ALLEGIANT_AZ,
                allow=True,
            ),
            item(
                "Our Haus Sausage",
                "Our Haus Sausage",
                "Official Our Haus Sausage stand at section 223.",
                ["223"],
                ALLEGIANT_AZ,
                allow=True,
            ),
        ],
        "excluded": [
            excluded(
                "unmapped_wow",
                "Fry Bread Pot Roast Taco",
                "Official 2026 WOW item still has no stand/section. Sporting Tribune reports opponent-week limits.",
            ),
            excluded(
                "unmapped_wow",
                "Street Dog Torta",
                "Official 2026 WOW item still has no stand/section.",
            ),
            excluded(
                "unmapped_wow",
                "Focaccia and Lox Sandwich",
                "Official 2026 WOW item still has no stand/section.",
            ),
            excluded(
                "unmapped_wow",
                "Chile Relleno Burger",
                "Official 2026 WOW item still has no stand/section. Do not guess onto Boomtown.",
            ),
            excluded(
                "unmapped_wow",
                "Really Big Chicken & Waffles / specialty dogs / New Menu Items / desserts",
                "PDF names plated SKUs without locations. Specialty dogs are opponent-week limited.",
            ),
            excluded(
                "location_uncertain",
                "Blvd Bar B Q & Wings",
                "PDF says new in 2026, but live guide only has a 121-130 search cluster and A-Z has no stand number.",
            ),
            excluded(
                "location_uncertain",
                "Fuku / Antidote / BBQ Mexicana / Border Grill / Mr. Fries Man / Ninth Island Bowlz / The Carvery",
                "Named on the live guide, but only adjacent-section search tags or club ranges, not A-Z stand numbers.",
            ),
            excluded(
                "generic_filler",
                "Taco Bell Cantina / Gridiron / Smash Burgers / Walking Taco / House Deals / fountain soda",
                "Generic chain tacos, hot dogs, pretzels, or category headings.",
            ),
            excluded(
                "generic_filler",
                "Lady Luck Margarita / Strawberry Mint Mule / Endzone Mojito / Raiders Rose",
                "Named specialty cocktails with no sourced stand.",
            ),
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Pizza Rock",
                "pizza-rock-margherita-slice",
                "pizza-rock",
                "A-Z Slice House at 118/140/206/230/308 matches Pizza Rock by Tony Gemignani. Keep the second Pizza Rock slug at 118; do not merge.",
                ALLEGIANT_AZ,
            ),
            dup(
                "Fukuburger",
                "fukuburger-the-black-hole-burger",
                "fukuburger",
                "PDF names Fuku Chicken from David Chang on the 100-level cluster. Production Fukuburger at 121 is a different local burger record. Do not merge or relocate without a stand number.",
                ALLEGIANT,
            ),
            dup(
                "Piña",
                "pina-pina",
                "pina",
                "Production already has duplicate Piña vendors (pina and pi-a) at 104. Not in this live directory fetch. Keep both; do not hide.",
                ALLEGIANT,
            ),
        ],
    }


def raymond_james() -> dict:
    mojo = ["115"]
    sweet = ["129", "207", "232"]
    colony = ["109", "134", "311", "336"]
    fried = ["317", "329"]
    aussie = ["118", "204", "241"]
    shawarma = ["140", "210", "234"]
    burnt = ["114", "139", "213", "238", "307", "339"]
    return {
        "venueSlug": "raymond-james-stadium",
        "venueName": "Raymond James Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": RJ_FB,
            "title": "Food & Drink Offerings at Raymond James Stadium",
            "type": "official_team",
            "retrievedAt": "2026-09-11",
        },
        "notes": (
            "Live official Buccaneers food-beverage page plus the official specialty-items page. "
            "Aussie Grill stays at 118/204/241 from the specialty page; F&B 143 is Bucs Burger. "
            "No labeledNewFor2026 — neither official page says these must-tries are new for 2026. "
            "No deactivations."
        ),
        "vendors": [
            vendor(
                "Tampa Mojo Chicken & Yellow Rice Bowl",
                mojo,
                RJ_FB,
                "tampa-mojo-chicken-yellow-rice-bowl",
            ),
            vendor("The \"Sweet Stack\"", sweet, RJ_FB, "the-sweet-stack"),
            vendor("Colony Grill", colony, RJ_FB, "colony-grill"),
            vendor("Tampa Fried Chicken Co.", fried, RJ_FB, "tampa-fried-chicken-co"),
            vendor("Aussie Grill", aussie, RJ_SPEC, "aussie-grill"),
            vendor("Chicken Shawarma", shawarma, RJ_FB),
            vendor("Beef Birria Tacos", ["137"], RJ_SPEC),
            vendor("Bucs Burger", ["143"], RJ_SPEC),
            vendor("Burnt End Mac & Cheese", burnt, RJ_SPEC),
            vendor("Burnt End Sandwich", burnt, RJ_SPEC),
            vendor("Meatball Sub", ["208", "233"], RJ_SPEC),
            vendor("Montreal Smoked Beef Sandwich", ["207", "232"], RJ_SPEC),
            vendor("Bucs Sundae", ["207", "232"], RJ_SPEC),
        ],
        "items": [
            item(
                "Tampa Mojo Chicken & Yellow Rice Bowl",
                "Tampa Mojo Chicken & Yellow Rice Bowl",
                "Official must-try Tampa Mojo Chicken and Yellow Rice Bowl at section 115.",
                mojo,
                RJ_FB,
                allow=True,
                existing_item="tampa-mojo-chicken-yellow-rice-bowl-tampa-mojo-chicken-yellow-rice-bowl",
                existing_vendor="tampa-mojo-chicken-yellow-rice-bowl",
            ),
            item(
                "The \"Sweet Stack\"",
                "The \"Sweet Stack\"",
                "Official must-try Sweet Stack at sections 129, 207, and 232.",
                sweet,
                RJ_FB,
                category="SWEET",
                allow=True,
                existing_item="the-sweet-stack-the-sweet-stack",
                existing_vendor="the-sweet-stack",
            ),
            item(
                "Colony Grill",
                "Colony Grill",
                "Official Colony Grill at sections 109, 134, 311, and 336.",
                colony,
                RJ_FB,
                allow=True,
                existing_item="colony-grill-colony-grill",
                existing_vendor="colony-grill",
            ),
            item(
                "Colony Grill Hot Oil Pizza Slice",
                "Colony Grill",
                "Official Colony Grill thin-crust hot oil pizza at sections 109, 134, 311, and 336.",
                colony,
                RJ_FB,
                existing_item="colony-grill-hot-oil-pizza-slice",
                existing_vendor="colony-grill",
            ),
            item(
                "Tampa Fried Chicken Co.",
                "Tampa Fried Chicken Co.",
                "Official Tampa Fried Chicken Co. at sections 317 and 329.",
                fried,
                RJ_FB,
                allow=True,
                existing_item="tampa-fried-chicken-co-tampa-fried-chicken-co",
                existing_vendor="tampa-fried-chicken-co",
            ),
            item(
                "Tampa Fried Chicken Sandwich",
                "Tampa Fried Chicken Co.",
                "Official Tampa Fried Chicken Co. sandwich at sections 317 and 329.",
                fried,
                RJ_FB,
                existing_item="tampa-fried-chicken-sandwich",
                existing_vendor="tampa-fried-chicken-co",
            ),
            item(
                "Aussie Grill Original Chicken Sandwich",
                "Aussie Grill",
                "Official Aussie Grill Original Chicken Sandwich at sections 118, 204, and 241.",
                aussie,
                RJ_SPEC,
                existing_vendor="aussie-grill",
            ),
            item(
                "Chicken Shawarma",
                "Chicken Shawarma",
                "Official must-try Chicken Shawarma at sections 140, 210, and 234.",
                shawarma,
                RJ_FB,
                allow=True,
            ),
            item(
                "Beef Birria Tacos",
                "Beef Birria Tacos",
                "Slow roasted barbacoa, cotija, cilantro, and pickled red onion in a crisp tortilla at section 137.",
                ["137"],
                RJ_SPEC,
                allow=True,
            ),
            item(
                "Bucs Burger",
                "Bucs Burger",
                "Cheeseburger topped with brisket, served with tater tots at section 143.",
                ["143"],
                RJ_SPEC,
                allow=True,
            ),
            item(
                "Burnt End Mac & Cheese",
                "Burnt End Mac & Cheese",
                "Burnt ends, mac and cheese, fried onions, BBQ drizzle, and Cheeto dust.",
                burnt,
                RJ_SPEC,
                allow=True,
            ),
            item(
                "Burnt End Sandwich",
                "Burnt End Sandwich",
                "BBQ burnt ends and fried onions on a potato roll.",
                burnt,
                RJ_SPEC,
                allow=True,
            ),
            item(
                "Meatball Sub",
                "Meatball Sub",
                "Hoagie roll, meatballs, marinara, and mozzarella at sections 208 and 233.",
                ["208", "233"],
                RJ_SPEC,
                allow=True,
            ),
            item(
                "Montreal Smoked Beef Sandwich",
                "Montreal Smoked Beef Sandwich",
                "Slow roasted pastrami on marble rye with kettle chips at sections 207 and 232.",
                ["207", "232"],
                RJ_SPEC,
                allow=True,
            ),
            item(
                "Bucs Sundae",
                "Bucs Sundae",
                "Soft serve vanilla, strawberry sauce, whipped cream, sprinkles, mini cupcake, and donut hole.",
                ["207", "232"],
                RJ_SPEC,
                category="SWEET",
                allow=True,
            ),
        ],
        "excluded": [
            excluded(
                "generic_filler",
                "$10 Kids Meals / $20 Family Meal / Chip & Soda Combo / Pretzel & Cheese Bundle",
                "Value combos of hot dogs, chips, pretzels, and fountain soda.",
            ),
            excluded(
                "generic_combo",
                "$22 Tampa 2",
                "Tampa Cuban plus 24 oz Pepsi at 132. Combo soda is generic; Cuban sandwich mapping is uncertain vs existing Cuban Dog / Pressed Cuban.",
            ),
            excluded(
                "no_sku",
                "Tampa Bay Chef Series",
                "Named club/section locations only; no plated SKUs.",
            ),
            excluded(
                "no_sku",
                "Checkers & Rally's",
                "2026 stand expansion has no distinctive sourced SKU.",
            ),
            excluded(
                "generic_filler",
                "Walking Taco / Grilled Bratwurst",
                "Generic snack/sausage listings on the specialty page.",
            ),
            excluded(
                "uncertain_sku",
                "BBQ Bacon Dog / BBQ Bacon Footlong Dog",
                "Official name is BBQ Bacon Dog but the published description is buffalo chicken dip. Skip rather than guess.",
            ),
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Healthy Bowl",
                "healthy-bowl-healthy-bowl",
                "healthy-bowl",
                "Chicken Shawarma is listed at 140, 210, and 234. Production Healthy Bowl is at 140 (quinoa/kale bowls). Keep both; do not merge.",
                RJ_FB,
            ),
            dup(
                "The Pressed Cuban",
                "ybor-press-the-pressed-cuban",
                "ybor-press",
                "Meatball Sub is listed at 208 and 233, the same sections as Ybor Press. Tampa 2 Cuban combo is at 132. Do not merge.",
                RJ_SPEC,
            ),
            dup(
                "The Tampa Cuban Dog",
                "the-tampa-cuban-dog-the-tampa-cuban-dog",
                "the-tampa-cuban-dog",
                "Tampa 2 combo names a Tampa Cuban at 132, overlapping Cuban Dog sections 107/132. Not imported as a new sandwich.",
                RJ_FB,
            ),
            dup(
                "Hot Pastrami Marble Rye",
                "desoto-deli-hot-pastrami-marble-rye",
                "desoto-deli",
                "Montreal Smoked Beef Sandwich is pastrami on marble rye at 207/232. Desoto Deli pastrami is at 107/132. Keep both.",
                RJ_SPEC,
            ),
            dup(
                "Aussie Grill",
                "aussie-grill-aussie-grill",
                "aussie-grill",
                "F&B lists Aussie Grill at 118 and 143. Specialty page puts Original Chicken Sandwich at 118/204/241 and Bucs Burger at 143. Kept production Aussie sections; created Bucs Burger at 143.",
                RJ_FB,
            ),
        ],
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    write_payload(allegiant())
    write_payload(raymond_james())


if __name__ == "__main__":
    main()
