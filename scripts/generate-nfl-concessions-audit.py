#!/usr/bin/env python3
"""Generate the 2026 NFL concessions audit dataset from production inventory + research notes.

Read-only against data/nfl/2026-concessions-inventory.json. Does not write production.
"""

from __future__ import annotations

import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY_PATH = ROOT / "data/nfl/2026-concessions-inventory.json"
OUT_PATH = ROOT / "data/nfl/2026-concessions-audit.json"


def norm(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = text.replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def tokens(value: str) -> set[str]:
    stop = {"the", "a", "an", "and", "of", "at", "in", "for", "with"}
    return {t for t in norm(value).split() if t and t not in stop}


def best_match(query: str, candidates: list[dict], field: str = "name") -> dict | None:
    qn = norm(query)
    qt = tokens(query)
    if not qn:
        return None
    ranked = []
    for cand in candidates:
        cn = norm(cand.get(field) or "")
        if not cn:
            continue
        ct = tokens(cand.get(field) or "")
        score = 0.0
        if qn == cn:
            score = 1.0
        elif qn in cn or cn in qn:
            score = 0.86
        elif qt and ct:
            overlap = len(qt & ct) / max(len(qt | ct), 1)
            if overlap >= 0.5:
                score = 0.5 + overlap / 2
        if score >= 0.5:
            ranked.append((score, cand))
    if not ranked:
        return None
    ranked.sort(key=lambda row: row[0], reverse=True)
    return {"score": ranked[0][0], **ranked[0][1]}


def classify(forced: str | None, match: dict | None) -> str:
    if forced:
        return forced
    if not match:
        return "NEW_ITEM"
    if match["score"] >= 0.92:
        return "EXISTING_MATCH"
    if match["score"] >= 0.72:
        return "EXISTING_NEEDS_UPDATE"
    return "POSSIBLE_DUPLICATE"


def finding(
    *,
    venue_slug: str,
    classification: str,
    item_name: str | None = None,
    vendor: str | None = None,
    description: str | None = None,
    category: str | None = None,
    location: str | None = None,
    price: str | None = None,
    new_for_2026: bool | None = None,
    source_url: str,
    source_title: str,
    source_type: str,
    source_date: str | None = None,
    confidence: str,
    notes: str,
    matched: dict | None = None,
    ss_name: str | None = None,
    ss_vendor: str | None = None,
) -> dict:
    return {
        "venueSlug": venue_slug,
        "classification": classification,
        "discoveredItemName": item_name,
        "discoveredVendor": vendor,
        "discoveredDescription": description,
        "discoveredCategory": category,
        "discoveredLocation": location,
        "discoveredPrice": price,
        "labeledNewFor2026": new_for_2026,
        "sourceUrl": source_url,
        "sourceTitle": source_title,
        "sourceType": source_type,
        "sourceDate": source_date,
        "confidence": confidence,
        "notes": notes,
        "stadiumSlopItemName": ss_name or (matched or {}).get("name"),
        "stadiumSlopVendor": ss_vendor or (matched or {}).get("vendor"),
        "stadiumSlopSlug": (matched or {}).get("slug"),
        "matchScore": round((matched or {}).get("score", 0), 3) if matched else None,
    }


def main() -> None:
    inventory = json.loads(INVENTORY_PATH.read_text())
    venues_by_slug = {v["slug"]: v for v in inventory["venues"]}

    schema_notes = {
        "venue": "Venue owns vendors and food items. Unique slug. Status ACTIVE/HIDDEN/ARCHIVED/SUSPENDED.",
        "vendor": "Vendor is the stand/concept. Unique (venueId, slug). Required section and location strings exist but are often copied from CSV section text.",
        "foodItem": {
            "required": [
                "venueId",
                "vendorId",
                "name",
                "slug unique per venue",
                "itemType",
                "category",
                "location",
                "description",
                "status",
            ],
            "itemType": ["FOOD", "NON_ALCOHOLIC_DRINK", "ALCOHOLIC_DRINK"],
            "category": ["SAVORY", "SWEET", "BEVERAGE", "ALCOHOLIC_BEVERAGE", "SNACK", "OTHER"],
            "activation": "Hide rather than delete: EntityStatus ACTIVE/HIDDEN/ARCHIVED/SUSPENDED. availabilityStatus is separate.",
            "seasonFlags": "isNewThisSeason and seasonIntroduced exist. Current NFL import set isNewThisSeason=true on nearly every item; this is an import flag, not independent 2026-new confirmation.",
            "location": "FoodItem.location is a string. FoodItem.sections is a string array. Vendor.section and Vendor.location also exist.",
            "provenance": "No dedicated source table. Provenance is tags such as import-source, Import, import-season:2026, NFL. lastConfirmed is usually null.",
            "dedupe": "No alias table. Dedupe is unique (venueId, slug) plus name matching. Same product can exist as vendor-name-as-item and as a real SKU.",
            "price": "basePrice optional. Most NFL import rows have null prices.",
        },
    }

    # Research findings: discovered offerings to reconcile.
    # forced classification used when matching should not decide (discontinued / quality).
    research: list[dict] = []

    def add(venue: str, item: str | None, vendor: str | None, **kwargs):
        v = venues_by_slug[venue]
        items = v["items"]["activeNames"]
        vendors = v["vendors"]["names"]
        forced = kwargs.pop("forced", None)
        match = None
        if item:
            match = best_match(item, items)
        if not match and vendor:
            match = best_match(vendor, items)
            if match:
                kwargs.setdefault("notes_extra", "Matched against Stadium Slop item/vendor name, not a confirmed identical SKU.")
        if not match and vendor:
            vm = best_match(vendor, vendors)
            if vm:
                match = {"score": vm["score"], "name": None, "vendor": vm["name"], "slug": vm.get("slug")}
        extra = kwargs.pop("notes_extra", None)
        notes = kwargs.get("notes", "")
        if extra:
            notes = f"{notes} {extra}".strip()
        kwargs["notes"] = notes
        classification = classify(forced, match)
        research.append(
            finding(
                venue_slug=venue,
                classification=classification,
                item_name=item,
                vendor=vendor,
                matched=match,
                **kwargs,
            )
        )

    # --- Nissan (empty) official directory ---
    nissan_src = {
        "source_url": "https://nissanstadium.com/concessions/",
        "source_title": "Concessions | Nissan Stadium",
        "source_type": "official_stadium",
        "source_date": None,
        "confidence": "HIGH",
        "new_for_2026": None,
    }
    nissan_stands = [
        ("2nd Street Kitchen", "Bacon burgers, cheeseburgers, chicken, tenders, chili nachos, fries, popcorn", "303, 344"),
        ("8th & Roast Coffee", "Coffee, hot chocolate, iced coffee", "146-P, 213-P, 235-P"),
        ("Action Station Table", "Cocktails, desserts, gameday specials, premium entrees", "213-P, 235-P"),
        ("Ben & Jerry’s", "Ice cream / desserts", "123-P, 142-P, 312-P, 335-P"),
        ("Burger of the Game feat. Local Nashville Restaurant", "Rotating local burgers", "106-P"),
        ("Classic Hits", "Burgers, tenders, hot dogs, nachos, popcorn, Christie Cookie", "105, 113, 119, 128, 136, 142, 304, 313, 320, 334, 343"),
        ("Cumberland River Grill", "Burgers / cheeseburgers", "209, 238"),
        ("Daddy’s Dogs", "Hot dogs", "122-P, 123, 144, 313-P, 334-P"),
        ("Dippin’ Dots, Funnel Cakes and Lemonade", "Dippin' Dots, funnel cakes, lemonade", "116-P, 118-P, 128-P, 131-P, 314-P, 317-P, 321-P, 331-P, 333-P"),
        ("Fireball Fiesta", "Burrito bowls, nachos, Mexican", "204, 242"),
        ("Hall of Flame", "Chicken, wings", "219, 228"),
        ("Hattie B’s Hot Chicken", "Hot chicken, tenders, fried pickles, waffles, fries", "121, 339"),
        ("Jack Daniel’s BBQ", "BBQ", "125"),
        ("Little Caesars", "Pizza, peanuts", "117, 130, 214, 233, 316, 331"),
        ("Jack Daniel’s Bar", "Cocktails / liquor / canned beer", "126, 210, 237"),
        ("Kettle Corn", "Kettle corn, popcorn", "102-P, 108-P, 118-P, 123-P, 129-P, 313-P, 334-P"),
    ]
    for vendor, desc, loc in nissan_stands:
        add(
            "nissan-stadium",
            None,
            vendor,
            description=desc,
            location=loc,
            forced="NEW_ITEM",
            notes="Official Nissan Stadium concessions directory. Stadium Slop has 0 items and 0 vendors. Directory fetch truncated after Little Caesars; additional stands likely exist on the same page. Categories listed on the page are often generic (Coke, TitansPay) rather than full SKUs.",
            **nissan_src,
        )
    add(
        "nissan-stadium",
        "Hattie B’s Hot Chicken",
        "Hattie B’s Hot Chicken",
        description="Hot chicken, tenders, fried pickles, fries, waffles",
        location="121, 339",
        category="FOOD",
        forced="NEW_ITEM",
        notes="Highest-priority US gap. Official stand-level listing, not a full plated menu.",
        **nissan_src,
    )

    # --- Lambeau official 2026 PDF ---
    lambeau_src = {
        "source_url": "https://static.clubs.nfl.com/image/upload/packers/nueiiwlc6l06rddkeiyb.pdf",
        "source_title": "2026 F&B Menu by Item (Packers / Delaware North)",
        "source_type": "official_team_pdf",
        "source_date": "2026",
        "confidence": "HIGH",
        "new_for_2026": None,
    }
    lambeau_items = [
        ("Pretzel- Loaded", "Loaded Big Pretzel", "105-M, 120-I, 305, JTV", None),
        ("Sandwich- Summer Sausage Grilled Cheese", "Summer Sausage Grilled Cheese", "124-O", None),
        ("Brat Eggrolls", "Brat Egg Rolls", "JTV", None),
        ("Cheese Curds", "Fresh Cheese Curds", "100-M, 106-M, 121-O Atrium, 121-O Concourse, 300, 308, 119-U, 326, 427, JTV", None),
        ("Gelato- Assorted", "Sara’s Artisan Gelato", "106-M, 312, 427", None),
        ("Brat- Jumbo", None, "Many stands including JTV, 100-M, 105-M, 300, 326, 427", None),
        ("Burger- 920", None, "100-M, 116-O, 121-O, 300, 326, 427, JTV", None),
        ("Burger- Maple", None, "P111", None),
        ("Horse Collar", None, "106-O, 121-I, 326, 427", None),
        ("Pac N Cheese Original", None, "P101, 105-M, 312", None),
        ("Pac N Cheese Braised BBQ Pork", None, "P101, 312", None),
        ("Sandwich- French Onion Grilled Cheese", None, "124-O", None),
        ("Sandwich- Midwest Grilled Cheese", None, "124-O, 308", None),
        ("Sandwich- Meatloaf", None, "326", None),
        ("Chicken Tenders- Hot Honey", None, "100-M, 106-M, 116-O, 124-O, 300, 308, 119-U, 326, JTV", None),
        ("Fried Ravioli", None, "305", None),
        ("Hot Dog- Footlong", None, "100-M, 105-M, 106-M, 115-I, 118-I, 300, 308, JTV", None),
        ("Pizza- Pepperoni", None, "107-O, 117-O, 120-I, 123-I, 305, 312, 427", None),
        ("Taco- Walking", None, "P102, P324", None),
        ("Bloody Mary- WI", None, "122-I", "ALCOHOLIC_DRINK"),
    ]
    for name, alias, loc, cat in lambeau_items:
        add(
            "lambeau-field",
            name,
            None,
            location=loc,
            category=cat,
            notes="Official 2026 Packers F&B-by-item PDF. Stadium Slop currently stores 17 headline/partner rows, often with item name equal to vendor name. Index also at https://www.packers.com/lambeau-field/concession-links (by item, location, specialty, concepts). Operator: Delaware North.",
            **lambeau_src,
        )
    add(
        "lambeau-field",
        "Bratcho",
        "Bratcho",
        forced="POSSIBLY_DISCONTINUED",
        confidence="MEDIUM",
        notes="Active in Stadium Slop as a headline item. Not listed by that name on the official 2026 by-item PDF (which does list Jumbo Brat, Brat Eggrolls, Pac N Cheese Brat). Positive evidence is absence from the current official item index plus a nearby brat SKU family — still confirm with Delaware North before hiding.",
        source_url=lambeau_src["source_url"],
        source_title=lambeau_src["source_title"],
        source_type=lambeau_src["source_type"],
        source_date="2026",
        new_for_2026=False,
    )

    # --- U.S. Bank official directory + 2026 new items ---
    usb_src = {
        "source_url": "https://www.usbankstadium.com/guest-experience/concessions",
        "source_title": "Concessions | U.S. Bank Stadium (Aramark)",
        "source_type": "official_stadium",
        "source_date": None,
        "confidence": "HIGH",
        "new_for_2026": None,
    }
    for vendor, loc in [
        ("Parlour", "118"),
        ("Soul Bowl", "317"),
        ("Be Graceful - GF & Vegan Food Options", "121, 329"),
        ("Von Hanson’s Brats", "131, 317"),
        ("Pothole Pizza", "114, 134, 307, 349"),
        ("Rusty Taco", "105, 113, 122, 311, 317, 341"),
        ("1st and Fry", "129, 143, 310, 339"),
        ("Nashville Coop", "121"),
        ("Heritage Tea House & Wings", "344"),
        ("Original Hockey Mom Brownies", "111, 360"),
        ("North Star Grill", "103, 124, 132, 304, 313, 328, 345"),
        ("MN Brat Dog", "101"),
        ("Curds N Cakes", "114, 310"),
        ("Mac Truck Mac & Cheese", "111"),
        ("Love You Cookie", "346"),
        ("T-Rex Cookies", "129"),
        ("Schweigerts Hot Dogs", "131, 317"),
    ]:
        add("u-s-bank-stadium", None, vendor, location=loc, notes="Official Aramark stand directory with section numbers. Many stands are missing from Stadium Slop, which is mostly headline/partner CSV rows.", **usb_src)
    add(
        "u-s-bank-stadium",
        "The Raid Burger",
        None,
        description="Double bacon cheeseburger topped with buffalo cheese curds, an onion ring, and ranch on a brioche bun.",
        new_for_2026=True,
        confidence="HIGH",
        notes="Labeled new for 2026 in FoodService Director (Aramark). Not in Stadium Slop.",
        source_url="https://www.foodservicedirector.com/food-beverage-trends/what-s-new-on-nfl-stadium-menus-this-season-everything-from-birria-burritos-to-hot-dog-flights",
        source_title="What's new on NFL stadium menus this season",
        source_type="trade_press_operator_attributed",
        source_date="2026-09-09",
        category="FOOD",
    )
    add(
        "u-s-bank-stadium",
        "The Hippo Pocket",
        "The Hippo Pocket",
        forced="POSSIBLY_DISCONTINUED",
        confidence="MEDIUM",
        notes="Active headline CSV item at U.S. Bank and also Highmark. Official U.S. Bank concessions directory does not list Hippo Pocket. Not enough to archive, but it looks like a reused viral CSV row rather than a confirmed 2026 stadium SKU.",
        source_url=usb_src["source_url"],
        source_title=usb_src["source_title"],
        source_type=usb_src["source_type"],
        source_date=None,
        new_for_2026=False,
    )

    # --- MetLife Delaware North 2026 ---
    met_src = {
        "source_url": "https://media.delawarenorth.com/delaware-north-sportservice-unveils-new-food-beverage-and-retail-experiences-at-metlife-stadium-for-the-2026-season/",
        "source_title": "Delaware North Sportservice unveils new food, beverage and retail experiences at MetLife Stadium for the 2026 season",
        "source_type": "official_operator",
        "source_date": "2026-09-09",
        "confidence": "HIGH",
        "new_for_2026": True,
    }
    add("metlife-stadium", "Sunday Gravy / Pasta Fresca seasonal specials", "Nonna Fusco’s/Pasta Fresca", location="Sections 118 and 335 and both Mezzanine Clubs", description="Second Pasta Fresca location; seasonal Sunday Gravy in colder weather.", notes="Concept exists in Stadium Slop as Nonna's / Nonna Fusco’s Kitchen / Spicy Rigatoni Vodka. Needs location update for second stand and 2026 seasonal specials.", **met_src)
    add("metlife-stadium", "Tacos Roqueros refreshed menu", "Tacos Roqueros", location="MetLife West Hall, Section 313, both Mezzanine Clubs", notes="Stadium Slop vendor spelling is Taco’s Raqueros. Same concept; spelling + 2026 refresh.", **met_src)
    add("metlife-stadium", "Colombian-style hot dog / Jersey chili cheese hot dog", "Garden State Rippers", location="MetLife West Hall, Section 317, both Mezzanine Clubs", description="Thumann’s natural-casing rippers including Colombian-style and Jersey chili cheese.", notes="Thumann’s Hot Dogs exists. Garden State Rippers expansion and named variants are not fully modeled.", **met_src)
    add("metlife-stadium", "Fat Rooster spicy chicken sandwich / house-made tenders", "Fat Rooster", location="MetLife West Hall, Sections 101 and 317, both Mezzanine Clubs", notes="Vendor exists. 2026 locations should be attached to items.", **met_src)
    add("metlife-stadium", "Carved-to-Order Filet Mignon Sandwich", "Against the Grain", location="Section 108 and both Mezzanine Clubs", description="Freshly carved filet mignon in general concessions for the first time.", notes="A Cut Above by Against the Grain / The Final Ribeye Sandwich may be related but this is described as a new 2026 carved filet program.", **met_src)

    # --- SoFi official 2026 ---
    sofi_src = {
        "source_url": "https://www.sofistadium.com/news/detail/sofi-stadium-and-legends-global-debut-new-food-beverage-and-merchandise-offerings-for-the-2026-nfl-season",
        "source_title": "SoFi Stadium And Legends Global Debut New Food, Beverage And Merchandise Offerings For The 2026 NFL Season",
        "source_type": "official_stadium",
        "source_date": "2026-09-10",
        "confidence": "HIGH",
        "new_for_2026": True,
    }
    for name, vendor, desc, loc in [
        ("Butter Chicken Frites", "Frites", "Loaded fries, globally inspired", None),
        ("Short Rib Frites", "Frites", "Loaded fries", None),
        ("Pastrami Frites", "Frites", "Loaded fries", None),
        ("Baked Ziti", None, "Concession stand refresh", None),
        ("Buffalo Chicken Wrap", None, "Concession stand refresh", None),
        ("Jalapeno Cheddar Sausage", None, "Concession stand refresh", None),
        ("Chicken Club Sandwich", None, "Concession stand refresh", None),
        ("Pickle Fries", None, "Concession stand refresh", None),
        ("Fiesta Chopped Salad", None, "Concession stand refresh", None),
        ("SPAM Dog", None, "Concession stand refresh", None),
        ("Brookie", "Touchdown Treats", "Dessert expansion", "new locations near 400 and 500-level"),
        ("Chocolate Cake", "Touchdown Treats", "Dessert expansion", "400 and 500-level"),
        ("Gelato", "Touchdown Treats", "Dessert expansion", "400 and 500-level"),
        ("Whoopie of the Game", "Touchdown Treats", "Dessert expansion", "400 and 500-level"),
        ("Dippin’ Dots", "Dippin’ Dots portables", "Four new portables", None),
    ]:
        add("sofi-stadium", name, vendor, description=desc, location=loc, notes="Official SoFi/Legends 2026 announcement. Dining guide remains https://dining.hollywoodparkca.com and is richer than this headline list. Stadium Slop already has 116 items from a prior dining-guide parse; these are the labeled 2026 additions.", **sofi_src)
    add("sofi-stadium", None, "BBQ second location", location="near the north side entries", notes="Existing BBQ concept adding a second location for 2026.", **sofi_src)

    # --- Highmark inaugural official menu ---
    hm_src = {
        "source_url": "https://www.buffalobills.com/news/highmark-stadium-food-and-beverage-offerings-for-2026-season",
        "source_title": "Highmark Stadium Food and Beverage Offerings For 2026 Season",
        "source_type": "official_team",
        "source_date": "2026-08-12",
        "confidence": "HIGH",
        "new_for_2026": True,
    }
    highmark_new = [
        ("Beef on Weck", None, "Wegmans kimmelweck roll, top round, au jus, horseradish, dill pickle spear", None),
        ("Rizzo’s Chicken Parm Sandwich", "Matty Matheson / Rizzo's", "Portuguese roll, chicken cutlet, pomodoro, mozzarella, parmesan, roasted peppers, garlic parmesan dressing", None),
        ("Bills Mafia Stinger", None, "Shaved steak, buffalo chicken finger, caramelized onions, cheese whiz, Treasure Cave Blue Cheese", None),
        ("Highmark Wings", None, "Treasure Cave Blue Cheese, celery", None),
        ("John Young’s Mumbo Wings", None, "Treasure Cave Blue Cheese, celery", None),
        ("Labatt Beer Horn", None, "Reusable bison-horn drinking vessel exclusive to Highmark", None),
        ("Tart Cherry Smash", None, "Captain Morgan Spiced Rum, mint, lime, tart cherry, bowling ball souvenir cup", None),
        ("Chiavetta’s BBQ Chicken Platter", "Chiavetta’s", "BBQ chicken leg quarter, potato salad, cornbread", "Bud Light Marketplace"),
        ("Texas Trinity", "Southern Junction", "Prime brisket, ancho-cardamom pork spare rib, house-made kielbasa", "Pepsi Marketplace"),
        ("Babcia’s Pierogis", "Babcia’s Pierogi", "Farmers cheese, caramelized onions, sour cream", None),
        ("Five Spiced Chicken Banh Mi", "Pham’s Kitchen", None, None),
        ("Soft Serve Custard", "Anderson’s Frozen Custard", "Vanilla, chocolate, swirl", None),
        ("Sponge Candy", "Park Edge Sweet Shoppe", None, None),
        ("Loaded Footlong Hotdog", None, "Sahlen's footlong with mustard, hot relish, diced onion, pickle spear", None),
        ("Orchard Park Party Mix", None, "Frito Lay Munchies Mix, fries, crispy onions, fried cheese curds, blue cheese", None),
        ("Poutine", None, "Fries, cheese curds, brown gravy", None),
    ]
    for name, vendor, desc, loc in highmark_new:
        add("highmark-stadium", name, vendor, description=desc, location=loc, notes="Official inaugural Highmark/Legends 2026 menu. Stadium Slop still stores 16 prior headline CSV rows (item name often equals vendor). New stadium F&B program is not represented.", **hm_src)
    for stale in ["The Hippo Pocket", 'The "Battle Boat"', "Perry’s Ice Cream", "La Nova Wings", "The Chickpea Blitz", "Spitako Chicken"]:
        add(
            "highmark-stadium",
            stale,
            stale,
            forced="POSSIBLY_DISCONTINUED",
            confidence="MEDIUM",
            notes="Active in Stadium Slop from the 2026 headline CSV. Not present on the official inaugural Highmark/Legends menu published Aug 12, 2026. New stadium program is the positive evidence — confirm with Legends before hiding. Queen City Weck may duplicate Beef on Weck.",
            source_url=hm_src["source_url"],
            source_title=hm_src["source_title"],
            source_type=hm_src["source_type"],
            source_date=hm_src["source_date"],
            new_for_2026=False,
        )
    add(
        "highmark-stadium",
        "The Queen City Weck",
        "The Queen City Weck",
        forced="POSSIBLE_DUPLICATE",
        confidence="MEDIUM",
        notes="Likely the same product family as official Beef on Weck. Keep one canonical item after operator confirmation.",
        source_url=hm_src["source_url"],
        source_title=hm_src["source_title"],
        source_type=hm_src["source_type"],
        source_date=hm_src["source_date"],
        new_for_2026=False,
    )

    # --- EverBank Delaware North ---
    eb_src = {
        "source_url": "https://media.delawarenorth.com/jacksonville-jaguars-and-delaware-north-sportservice-unveil-new-food-and-beverage-offerings-at-everbank-stadium-for-the-2026-season/",
        "source_title": "Jaguars and Delaware North Sportservice unveil new food and beverage offerings at EverBank Stadium for 2026",
        "source_type": "official_operator",
        "source_date": "2026-09-09",
        "confidence": "HIGH",
        "new_for_2026": True,
    }
    add("everbank-stadium", "River City Heatwave", "904 Prime Burger", description="Crispy tater tots topped with hand-breaded shrimp, popcorn chicken, datil pepper sauce, blue cheese, mini peppers, chives, lemon and celery-carrot salad.", location="stands 105 and 132", notes="Not in Stadium Slop. Touchdown Tots is a different tots item.", **eb_src)
    add("everbank-stadium", "Red Zone Burger", "904 Prime Burger", description="Double burger with melted cheese, bacon, crispy fried onions and barbecue sauce.", location="stands 105 and 132", notes="Name exists in Stadium Slop as its own vendor/item; official 2026 source places it at 904 Prime Burger stands 105 and 132.", **eb_src)
    add("everbank-stadium", "Poquet Quesadillas", "Yucatan Cantina", description="Flour tortillas with seasoned chicken, melted cheese and roasted peppers.", location="stand 125", notes="Coastal Taqueria exists; Yucatan Cantina / Poquet Quesadillas does not.", **eb_src)
    add("everbank-stadium", "Little Caesars pizza / Italian Cheese Bread", "Little Caesars", location="stand 141 and Upper Clubs 207, 234", description="Cheese, pepperoni, 3 Meat Treat, Italian Cheese Bread. New 2026 sponsor.", **eb_src)
    add("everbank-stadium", "Fan First Favorites $4.99 classics", "Stadium Classics", location="104, 115, 131, 142 and Gallagher Clubs 207, 234", price="$4.99", description="Hot dogs, nachos, popcorn, candy, pretzels; select 12-oz beers $4.99.", notes="Value menu not modeled. Official Jaguars concessions page: https://www.jaguars.com/stadium/concessions", **eb_src)

    # --- Lucas Oil Colts/Sodexo ---
    lo_src = {
        "source_url": "https://www.colts.com/news/lucas-oil-stadium-concessions-indianapolis-colts-new-food-beverage-2026-gameday-nfl-season-souvenir-loaded-fries-nachos-beer-premium-cooler-cocktails-tater-tots-dirty-sodas-chicken-teriyaki-footlong-corn-dog-ice-cream-yogurt-cheesesteak-coffee",
        "source_title": "Indianapolis Colts and Sodexo Live! unveil new food and beverage offerings for 2026 season",
        "source_type": "official_team",
        "source_date": "2026-08-11",
        "confidence": "HIGH",
        "new_for_2026": True,
    }
    for name, vendor, desc, loc, price in [
        ("Loaded Tater Tots", None, "Football-shaped tots with Buffalo chicken, Philly cheesesteak, or vegan street-style toppings", "105, 347, 543", None),
        ("Dirty Sodas", None, "Customizable sodas with flavored syrups and sweet cream", "529", None),
        ("Chicken Teriyaki or Beef & Broccoli", None, "Served with fried rice", "109", None),
        ("Loaded Footlong Corn Dog", None, "Footlong corn dog topped with chili and cheese", "105, 347, 543", None),
        ("Stadium Box Loaded Fries", None, "Loaded fries in commemorative Lucas Oil Stadium container", "105, 347, 543", None),
        ("The Crown Highball", "Touchdown Taverns", "Crown Royal, lemon, honey, club soda in cooler cup", "All GA Touchdown Taverns and Clubs", None),
        ("Mambo's Cheesesteak", "Mambo's Cheesesteak", "New minority business enterprise; Philly cheesesteaks and loaded fries", "139", None),
        ("Sub Zero Nitrogen Ice Cream", "Sub Zero Nitrogen Ice Cream", "Made-to-order nitrogen ice cream", "Loge Clubs", None),
        ("Orange Leaf", "Orange Leaf", "Frozen yogurt", "323", None),
        ("Creative Coffee", "Creative Coffee", "Handcrafted coffee", "Blue Room and East & West Loge Anvil Bar", None),
    ]:
        add("lucas-oil-stadium", name, vendor, description=desc, location=loc, price=price, notes="Official Colts/Sodexo 2026 culinary showcase. Stadium Slop has 19 headline rows including Pizza Box Nachos, Mambo’s Cheesesteak, and Gameday Matchup Cocktails as a single item.", **lo_src)

    # --- Allegiant Silver & Black ---
    al_src = {
        "source_url": "https://www.oakviewgroup.com/wp-content/uploads/2026/08/Silver-and-Black-Reveal-Food-Draft-FINAL.pdf",
        "source_title": "Silver & Black Hospitality 2026 food reveal (Allegiant Stadium)",
        "source_type": "official_operator_pdf",
        "source_date": "2026-08-25",
        "confidence": "HIGH",
        "new_for_2026": True,
    }
    for name, vendor, desc in [
        ("Fry Bread Pot Roast Taco", None, "Fried dough tortilla, pot roast, lettuce, tomato, queso fresco, salsa verde, chipotle crema"),
        ("Street Dog Torta", None, "Sabrett hot dog, pork belly, refried beans, avocado aioli"),
        ("Focaccia and Lox Sandwich", None, "Tomato herb focaccia, dill cream cheese, lox, onion, capers, cucumber, tomato"),
        ("Chile Relleno Burger", None, "Burger topped with avocado and crema"),
        ("The Cuban hot dog", None, "Hot dog variant"),
        ("Elote Dog", None, "Hot dog variant"),
        ("Really Big Chicken & Waffles", None, "Pickles, hot honey, chives"),
        ("Taco Bell", "Taco Bell", "New 2026 vendor"),
        ("Bandero Tequila", "Bandero Tequila", "New 2026 vendor / spicy margarita"),
        ("BLVD BBQ", "BLVD BBQ", "New 2026 vendor"),
        ("Hibachi Done Wright", "Hibachi Done Wright", "New 2026 vendor"),
    ]:
        add("allegiant-stadium", name, vendor, description=desc, notes="Official Silver & Black 2026 reveal. Stadium Slop is 23 headline items (Pizza Rock, Fukuburger, etc.) and does not include these 2026 additions.", **al_src)

    # --- Targeted 2026 new items from operator-attributed trade + team pages ---
    fsd = {
        "source_url": "https://www.foodservicedirector.com/food-beverage-trends/what-s-new-on-nfl-stadium-menus-this-season-everything-from-birria-burritos-to-hot-dog-flights",
        "source_title": "What's new on NFL stadium menus this season (FoodService Director)",
        "source_type": "trade_press_operator_attributed",
        "source_date": "2026-09-09",
        "confidence": "MEDIUM",
        "new_for_2026": True,
        "notes": "Operator-attributed 2026 roundup. Treat as a new-item lead, not a complete venue menu. Cross-check with stadium/operator pages before import.",
    }
    targeted = [
        ("empower-field-at-mile-high", "Beast in a Blanket", None, "Two-foot grilled hot dog with BBQ brisket burnt ends, goat cheese and sharp cheddar, puff pastry, crispy onions, jalapeño, avocado crema, Mile High secret sauce. Aramark Executive Sous Chef Sean Clark.", None, None),
        ("nrg-stadium", "Chef Sonia’s Southern Mac Bowl", None, "Crispy fried chicken bites, roasted corn, hatch chile mac and cheese, Cajun brown gravy.", None, None),
        ("nrg-stadium", "Battle Red Berry Bird", None, "Fried chicken breast in strawberry buffalo sauce, coleslaw, pickles, Cajun cheese curds on challah, tater kegs and chipotle aioli.", None, None),
        ("northwest-stadium", "DC BBQ Pocket", "Levy", "Hand-rolled pocket with chopped DC half-smoked brisket, baked beans, smoked Gouda, BBQ sauce.", None, None),
        ("northwest-stadium", "Crab Stuffed Pretzel", "Levy", "Crab-shaped pretzel stuffed with lemon tarragon crab dip, garlic butter, Parmesan.", None, None),
        ("lincoln-financial-field", "Tush Push Tater", "Aramark", "Deep-fried russet potato, fried chicken cutlet, pimento mac and cheese, bacon hot honey jam, 215 Sauce, scallions.", None, None),
        ("lincoln-financial-field", "Broad Street Beast", "Aramark", "18-inch chalupa shell, braised wagyu beef shank, fried jalapeño poppers, tomatillo avocado salsa, Oaxaca queso, crispy shallots, cilantro.", None, None),
        ("lumen-field", "Jerk Salmon Nachos (JSN Menu)", "Levy / Jaxon Smith-Njigba", "Local smoked salmon, juniper-jerk spice, collectible JSN glove container. Window Sept 9–Oct 25, 2026.", None, None),
        ("lumen-field", "Breads and JSN Spreads", "Levy / Jaxon Smith-Njigba", "Warm breads with jalapeño jam, smoked salmon spread, nectarine butter. Window Nov 2–8, 2026.", None, None),
        ("lumen-field", "Jicama Steak Noodles", "Levy / Jaxon Smith-Njigba", "Seared steak and pickled jicama over ramen in bone broth. Window Dec 7–25, 2026.", None, None),
        ("geha-field-at-arrowhead-stadium", "The Mucho Melt", "KC Dilla", "Layered housemade sourdough tortillas, yellow and blue corn tortillas, guajillo-spiced beef, yuzu-pickled red onion, beans, sweet potato fries, cotija and cheddar, sour cream, guacamole, pico, tortilla strips, jalapeño; pineapple skewers. Aramark Chef Erin Wishon.", "Section 135 (KC Dilla; local reporting)", "$21.59 (local reporting, confirm)"),
        ("bank-of-america-stadium", "The Big ‘Dilla", "Levy", "Two-foot smoked Adobo chicken quesadilla, cheddar and Jack, pico, cilantro, chipotle crema.", None, None),
        ("soldier-field", "Bear-ia Burrito", "Levy", "Shredded beef birria, Chihuahua cheese, cilantro and onion, house consommé.", None, None),
        ("soldier-field", "Smoked Prime Rib Sandwich", "Levy", "House-smoked thinly-shaved prime rib, house giardiniera, shaved onion, giardiniera aioli, artisan roll.", None, None),
        ("huntington-bank-field", "Hot Dog Flight", "Aramark", "Three mini dogs: Buffalo Blitz, Italian Stallion, Brisket Dog.", None, None),
        ("paycor-stadium", "Pork Rind Nachos", "Aramark", "Grippo's Hot Pork Rinds, smoked Carolina-style pork shoulder, cheddar, barbecue, chipotle ranch, pickled red onions, jalapeños.", None, None),
        ("acrisure-stadium", "Forth and Flav Nacho", "Aramark", "Nachos with smoked cheese sauce, mojo pulled pork, roasted corn and bean salsa, pickled jalapeños, blackened red onions, avocado-lime crema.", None, None),
    ]
    for slug, name, vendor, desc, loc, price in targeted:
        add(slug, name, vendor, description=desc, location=loc, price=price, **fsd)

    add(
        "paycor-stadium",
        "Oktoberfest pretzel-crusted pork loin / schnitzel sandwich",
        "Aramark",
        description="All-new Oktoberfest menu plus Korean-style nachos, lobster tail, Thai pork belly.",
        new_for_2026=True,
        confidence="MEDIUM",
        notes="WKRC/Local 12 coverage of Paycor 2026 menu with Chef Chris Revercomb. Not a complete stand directory.",
        source_url="https://local12.com/news/local/new-dishes-announced-at-paycor-ahead-of-bengals-season-seafood-korean-chris-revercomb-cincinnati",
        source_title="New dishes announced at Paycor ahead of Bengals season",
        source_type="local_media",
        source_date="2026-09-09",
    )

    # --- Remaining US homes that were inventory-only on first pass ---
    saints_src = {
        "source_url": "https://www.neworleanssaints.com/news/saints-gameday-concessions-value-menu-upgrades-caesars-superdome-2026-nfl-season",
        "source_title": "Saints and Legends Global enhance food and beverage experience at Caesars Superdome for 2026 season",
        "source_type": "official_team",
        "source_date": "2026-08-14",
        "confidence": "HIGH",
        "new_for_2026": True,
    }
    for name, desc, price in [
        ("$6 Anniversary Menu", "Select draft beer, hot dogs, popcorn, pretzels, nachos, Dasani water", "$6.00"),
        ("Bayou Smash Burgers", "Rotating specialty item", None),
        ("Pork and Alligator Burger", "Rotating specialty item", None),
        ("Dome Nachos", "Choice of pork carnitas, chicken tinga, or house-made seafood queso", None),
        ("Lucky Dog", "Returning favorite", None),
        ("Jewel of the South signature cocktails", "Two cocktails created with Jewel of the South", None),
        ("King Creole", "Local concessionaire partner", None),
        ("Mrs. Wheats", "Local concessionaire partner", None),
        ("Sweet Soulfood", "Local concessionaire partner", None),
        ("Haydel's Bakery", "Expanded local product partner", None),
    ]:
        add("caesars-superdome", name, None if "Menu" in name or "Burger" in name or "Nachos" in name or "Dog" in name or "cocktail" in name else name, description=desc, price=price, notes="Official Saints/Legends 2026 announcement. Stadium Slop has 23 headline CSV rows and does not model the $6 anniversary menu or rotating 2026 specialties.", **saints_src)

    mt_src = {
        "source_url": "https://www.mandtbankstadium.com/visit/food-beverage",
        "source_title": "Food & Beverage | M&T Bank Stadium",
        "source_type": "official_stadium",
        "source_date": None,
        "confidence": "HIGH",
        "new_for_2026": None,
    }
    for vendor, loc, desc in [
        ("Jimmy's Famous Seafood", "123, 201, 231", "Crab cakes, crabby egg rolls, seafood-inspired specialty hot dogs"),
        ("Shake Shack", None, "Smashburgers, flat-top hot dogs, custard shakes"),
        ("Chesapeake Market", "111, 138, 504, 528", "Crab-inspired specialties, pit beef, regional classics"),
        ("Tell Tale Tots", "130, 150", "Loaded tater tots"),
        ("Ground & Pound", "134, 206, 225, 248, 501", "Smashburgers and hand-breaded chicken tenders"),
        ("Old Line Provisions", None, "Cheesesteaks, specialty hot dogs, Maryland-inspired classics"),
        ("Russell St. Links", None, "Specialty hot dogs and sausages"),
        ("Bmore Nacho Co.", "142, 536", "Specialty nachos and frozen cocktail"),
        ("Poe's Pit", None, "Pulled pork sandwiches, burnt end mac and cheese"),
        ("Ravenous Chicken", "119, 146, 229, 514, 541", "Hand-breaded tenders and specialty sandwiches"),
        ("Glizzy Glides", "103, 150", "Flock Friendly hot dogs portable"),
        ("Chesapeake Churro Co.", "119, 224, 250, 529", "Churros, kettle corn, Baltimore snowball"),
    ]:
        add("m-t-bank-stadium", None, vendor, location=loc, description=desc, notes="Official M&T Bank Stadium food directory. Stadium Slop has 20 headline CSV rows with item name equal to vendor. This directory is a stand map, not a full SKU menu.", **mt_src)

    add(
        "gillette-stadium",
        "New England Clam Chowder",
        "Legal Sea Foods",
        description="Award-winning New England Clam Chowder at select 100- and 300-level stands beginning 2026 NFL season.",
        location="select concession stands on the 100 and 300 levels",
        new_for_2026=True,
        confidence="HIGH",
        notes="Official Patriots/Legal Sea Foods partnership for 2026. Gillette already has a richer parsed menu (43 items) but this vendor/items are new for 2026.",
        source_url="https://www.patriots.com/news/legal-sea-foods-named-official-seafood-restaurant-and-clam-chowder-of-the-new-england-patriots-and-gillette-stadium",
        source_title="Legal Sea Foods Named Official Seafood Restaurant and Clam Chowder of the New England Patriots and Gillette Stadium",
        source_type="official_team",
        source_date="2026-08-11",
    )
    add(
        "gillette-stadium",
        "Lobster roll",
        "Legal Sea Foods",
        description="Iconic lobster rolls during Patriots home games.",
        location="select concession stands on the 100 and 300 levels",
        new_for_2026=True,
        confidence="HIGH",
        notes="Same official 2026 partnership. Full Legal Sea Foods coastal menu details beyond chowder and lobster rolls were not published.",
        source_url="https://www.patriots.com/news/legal-sea-foods-named-official-seafood-restaurant-and-clam-chowder-of-the-new-england-patriots-and-gillette-stadium",
        source_title="Legal Sea Foods Named Official Seafood Restaurant and Clam Chowder of the New England Patriots and Gillette Stadium",
        source_type="official_team",
        source_date="2026-08-11",
    )

    add(
        "ford-field",
        "Xav’s Jammin Caribbean Fusion jerk chicken wings / loaded fries",
        "Xav’s Jammin Caribbean Fusion",
        description="Jerk chicken wings and loaded fries topped with shrimp, jerk chicken, or black beans. New local partner.",
        new_for_2026=True,
        confidence="MEDIUM",
        notes="Levy 2026 program covered by Detroit Newsroom / Detroit Free Press. Also Food Passport and F-150 Tailgate Combo $12.99. Not a complete stand directory.",
        source_url="https://detroitnewsroom.com/2026/09/04/ford-field-2026-detroit-lions-unveil-new-food-drink-experience-with-local-flavors-and-fan-rewards/",
        source_title="Ford Field 2026: Detroit Lions Unveil New Food & Drink Experience",
        source_type="local_media",
        source_date="2026-09-04",
    )
    add(
        "ford-field",
        "F-150 Tailgate Combo",
        None,
        description="Italian sausage or bratwurst with chips in a Ford F-150 box.",
        price="$12.99",
        new_for_2026=True,
        confidence="MEDIUM",
        notes="Value combo returning/featured for 2026 per local coverage of Levy program.",
        source_url="https://detroitnewsroom.com/2026/09/04/ford-field-2026-detroit-lions-unveil-new-food-drink-experience-with-local-flavors-and-fan-rewards/",
        source_title="Ford Field 2026: Detroit Lions Unveil New Food & Drink Experience",
        source_type="local_media",
        source_date="2026-09-04",
    )

    add(
        "raymond-james-stadium",
        None,
        "Checkers & Rally’s upper-level stands",
        location="near Sections 304 and 342",
        description="Two new upper-level Checkers stands; brand total footprint reported as four locations.",
        new_for_2026=True,
        confidence="HIGH",
        notes="Vendor announcement Aug 31, 2026. Stadium Slop is 21 headline CSV rows.",
        source_url="https://www.franchising.com/news/20260831_checkers__rallys_expands_presence_at_raymond_james_stadium_with_two_new_con.html",
        source_title="Checkers & Rally’s Expands Presence at Raymond James Stadium with Two New Concession Stands",
        source_type="official_vendor",
        source_date="2026-08-31",
    )
    add(
        "raymond-james-stadium",
        "Tampa Two combo",
        "Pepsi",
        description="New concession stand combo featuring a signature food item as part of 2026 Pepsi partnership. Exact food SKU not published in the partnership article.",
        new_for_2026=True,
        confidence="MEDIUM",
        notes="Official Buccaneers Pepsi partnership beginning 2026. Combo contents unknown — do not invent the food item.",
        source_url="https://www.buccaneers.com/longform/after-50-years-buccaneers-choose-pepsi-as-official-soft-drink-partner",
        source_title="Tampa Bay Buccaneers Introduce New Partner Pepsi",
        source_type="official_team",
        source_date=None,
    )

    add(
        "hard-rock-stadium",
        None,
        "Official Hard Rock concession directory (Benihana, Fuku, Shake-adjacent concepts, Little Caesars, Magic City Dogs, etc.)",
        forced="EXISTING_NEEDS_UPDATE",
        confidence="HIGH",
        notes="Official stadium concessions page lists dozens of concepts with 100/200/300-level PDF maps (dated Sep 2024 on CDN). Stadium Slop has 47 items / 37 vendors from mixed parsers + CSV. Next pass should reconcile the live directory against SS vendor by vendor rather than importing the 2024 PDFs blindly. Maps: https://www.hardrockstadium.com/concessions/",
        source_url="https://www.hardrockstadium.com/concessions/",
        source_title="Concessions - Hard Rock Stadium",
        source_type="official_stadium",
        source_date=None,
        new_for_2026=None,
    )

    add(
        "att-stadium",
        "Elote Burger / Rowdy Dog / Frito Pie Burger / Dessert Nachos",
        "Legends",
        forced="EXISTING_NEEDS_UPDATE",
        confidence="LOW",
        notes="Star-Telegram coverage is labeled 2025-2026 season, not a 2026-27 refresh. Do not treat as newly confirmed 2026 items. Stadium Slop already has 60 items. Flag for a 2026 Legends/Cowboys source before changing records.",
        source_url="https://www.star-telegram.com/sports/nfl/dallas-cowboys/article312039931.html",
        source_title="Dallas Cowboys unveil new food options for 2025-2026 season",
        source_type="local_media_prior_season",
        source_date=None,
        new_for_2026=False,
    )
    add(
        "mercedes-benz-stadium",
        "Freddie Burger / Stadium Rack-O-Ribs / Sports Illustrated Lounge",
        "Levy",
        forced="EXISTING_NEEDS_UPDATE",
        confidence="LOW",
        notes="AJC coverage is August 2025 football prep, not a confirmed 2026-only announcement. Stadium Slop already has 62 items. Re-confirm on official Falcons/MBS 2026 pages before treating as new.",
        source_url="https://www.ajc.com/food-and-dining/2025/08/mercedes-benz-stadium-rolls-out-new-dining-options-ahead-of-football-season/",
        source_title="Mercedes-Benz Stadium rolls out new dining options ahead of football season",
        source_type="local_media_prior_season",
        source_date="2025-08",
        new_for_2026=False,
    )
    add(
        "levi-s-stadium",
        "Touchdown Terrace concepts",
        "Levy",
        forced="EXISTING_NEEDS_UPDATE",
        confidence="LOW",
        notes="49ers/Levy Touchdown Terrace announcement found, but publication year is not clearly 2026. Stadium Slop already has 85 items. Next pass: official 2026 49ers dining page before adding.",
        source_url="https://www.49ers.com/news/levi-s-stadium-and-levy-expand-dining-options-introduce-touchdown-terrace",
        source_title="Levi’s Stadium and Levy Expand Dining Options, Introduce Touchdown Terrace",
        source_type="official_team_undated_or_prior",
        source_date=None,
        new_for_2026=None,
    )
    add(
        "state-farm-stadium",
        None,
        None,
        forced="EXISTING_NEEDS_UPDATE",
        confidence="LOW",
        notes="Stadium Slop has 23 items and 23 vendors with 23/23 name=vendor (pure headline CSV). No 2026 official Cardinals/Aramark directory was captured in this pass. Do not scrape the same CSV again.",
        source_url="https://www.azcardinals.com/",
        source_title="State Farm Stadium — official 2026 directory not captured this pass",
        source_type="gap",
        source_date=None,
        new_for_2026=None,
    )

    # International / Azteca
    add(
        "melbourne-cricket-ground",
        "American-themed NFL overlay plus MCG regular catering",
        None,
        description="Austadiums: American-themed food and drinks alongside MCG regular catering. Alcohol service ends after third quarter. No item-level public menu found.",
        forced="NEW_ITEM",
        confidence="MEDIUM",
        notes="Empty Stadium Slop menu. Delaware North operates MCG generally, but NFL gameday SKUs were not published item-by-item.",
        source_url="https://www.austadiums.com/news/1831/nfl-melbourne-game-everything-you-need-to-know",
        source_title="NFL Melbourne Game: Everything you need to know",
        source_type="credible_local_media",
        source_date=None,
        new_for_2026=None,
    )
    add(
        "tottenham-hotspur-stadium",
        "Tap Inn pies and sausage rolls / Touchline Grill burgers, waffle fries, shawarma, Korean chicken",
        None,
        location="Marketplace blocks 101/124; Touchline Grill at selected blocks",
        forced="NEW_ITEM",
        confidence="MEDIUM",
        notes="Official Spurs stadium F&B page describes the club-matchday program (58+ outlets, Beavertown). NFL International Series may use a modified overlay. Do not import club-matchday SKUs as NFL-confirmed without event-specific confirmation.",
        source_url="https://www.tottenhamhotspur.com/the-stadium/attending-matches/food-and-drink",
        source_title="Food & Drink | Tottenham Hotspur Stadium",
        source_type="official_stadium",
        source_date=None,
        new_for_2026=None,
    )
    add(
        "wembley-stadium",
        "Draught Bars pies / Chicken & Chips / Burger & Chips / Wicks Manor Sausages / Camden Town Brewery / M&S Food (Level 2)",
        None,
        forced="NEW_ITEM",
        confidence="MEDIUM",
        notes="Official Wembley facilities page is the club/concert baseline, not an NFL-specific 2026 menu. Delaware North also lists Wembley in its portfolio.",
        source_url="https://www.wembleystadium.com/plan-your-visit/stadium-guide/stadium-facilities",
        source_title="Stadium Guide - Wembley Stadium",
        source_type="official_stadium",
        source_date=None,
        new_for_2026=None,
    )
    for slug, note in [
        ("maracana-stadium", "No NFL-specific public 2026 concessions menu found this pass."),
        ("stade-de-france", "No NFL-specific public 2026 concessions menu found this pass."),
        ("santiago-bernabeu", "No NFL-specific public 2026 concessions menu found this pass."),
        ("fc-bayern-munich-stadium", "No NFL-specific public 2026 concessions menu found this pass."),
    ]:
        add(
            slug,
            None,
            None,
            forced="NEW_ITEM",
            confidence="LOW",
            notes=note + " Stadium Slop has 0 items. Next pass should use venue operator + NFL International Series event guides, not US headline CSVs.",
            source_url="https://www.nfl.com/international",
            source_title="NFL International (no item-level menu located)",
            source_type="gap",
            source_date=None,
            new_for_2026=None,
        )
    add(
        "estadio-azteca",
        None,
        "General Concessions",
        forced="EXISTING_NEEDS_UPDATE",
        confidence="MEDIUM",
        notes="24 active World Cup starter items (Tacos, Tortas, Elote, etc.) with 2 generic vendors and empty/weak location data. These are not NFL-gameday confirmed 2026 SKUs. ESPN maps the Mexico NFL game to this venue (Estadio Banorte / Azteca). Do not treat as a complete NFL menu.",
        source_url="https://www.usbankstadium.com/guest-experience/concessions",
        source_title="Internal inventory (Azteca World Cup starters)",
        source_type="internal_inventory",
        source_date=None,
        new_for_2026=False,
    )

    # Build venue audits
    findings_by_venue: dict[str, list[dict]] = {}
    for row in research:
        findings_by_venue.setdefault(row["venueSlug"], []).append(row)

    venue_audits = []
    for v in inventory["venues"]:
        items = v["items"]
        names = items.get("activeNames") or []
        name_eq = sum(1 for i in names if norm(i.get("name")) == norm(i.get("vendor")))
        empty_loc = items.get("emptyLocation", 0)
        empty_sec = items.get("emptySections", 0)
        findings = findings_by_venue.get(v["slug"], [])
        counts = {
            "EXISTING_MATCH": 0,
            "EXISTING_NEEDS_UPDATE": 0,
            "NEW_ITEM": 0,
            "POSSIBLE_DUPLICATE": 0,
            "POSSIBLY_DISCONTINUED": 0,
        }
        for f in findings:
            counts[f["classification"]] = counts.get(f["classification"], 0) + 1

        if items["active"] == 0:
            coverage = "EMPTY"
        elif items["active"] < 30 and name_eq >= max(items["active"] - 5, 0) * 0.5:
            coverage = "HEADLINE_CSV_THIN"
        elif items["active"] < 50:
            coverage = "PARTIAL"
        else:
            coverage = "RICHER_BUT_INCOMPLETE"

        deep_slugs = {
            "sofi-stadium",
            "metlife-stadium",
            "lambeau-field",
            "u-s-bank-stadium",
            "highmark-stadium",
            "everbank-stadium",
            "lucas-oil-stadium",
            "allegiant-stadium",
            "nissan-stadium",
            "caesars-superdome",
            "m-t-bank-stadium",
            "gillette-stadium",
        }
        if v["slug"] in findings_by_venue and any(
            f["sourceType"].startswith("official") for f in findings
        ):
            research_depth = "DEEP" if coverage in {"EMPTY", "HEADLINE_CSV_THIN"} or v["slug"] in deep_slugs else "TARGETED"
        elif v["slug"] in findings_by_venue:
            research_depth = "TARGETED"
        elif v.get("isInternationalOnly"):
            research_depth = "GAP"
        else:
            research_depth = "INVENTORY_ONLY"

        issues = []
        if items["active"] == 0:
            issues.append("Zero food items and zero vendors in production.")
        if name_eq and items["active"]:
            issues.append(f"{name_eq}/{items['active']} active items use the vendor name as the item name (headline/partner CSV pattern).")
        if items.get("noPrice") == items["active"] and items["active"]:
            issues.append("No public prices stored.")
        if items.get("newThisSeason") == items["active"] and items["active"]:
            issues.append("Every active item is flagged isNewThisSeason; this is the 2026 import flag, not verified new-for-2026 labeling.")
        if empty_sec:
            issues.append(f"{empty_sec} items have empty sections[].")
        if empty_loc:
            issues.append(f"{empty_loc} items have empty location.")
        if v["slug"] == "estadio-azteca":
            issues.append("Menu is World Cup starter data, not an NFL-specific 2026 audit.")

        venue_audits.append(
            {
                "venueId": v["venueId"],
                "slug": v["slug"],
                "name": v["name"],
                "city": v["city"],
                "state": v["state"],
                "country": v["country"],
                "teams": v["teams"],
                "gameCount": v["gameCount"],
                "internationalGames": v.get("internationalGames", 0),
                "isInternationalOnly": v.get("isInternationalOnly", False),
                "activeItems": items["active"],
                "inactiveItems": items["inactive"],
                "activeVendors": v["vendors"]["active"],
                "nameEqualsVendorCount": name_eq,
                "itemsWithoutPrice": items.get("noPrice", 0),
                "itemsFlaggedNewThisSeason": items.get("newThisSeason", 0),
                "itemsEmptySections": empty_sec,
                "coverage": coverage,
                "researchDepth": research_depth,
                "qualityIssues": issues,
                "findingCounts": counts,
                "currentItemNames": [i["name"] for i in names],
                "currentVendorNames": [n["name"] for n in v["vendors"]["names"]],
            }
        )

    # Priority queue
    def priority(audit: dict) -> tuple:
        if audit["slug"] == "nissan-stadium":
            return (0, -audit["gameCount"])
        if audit["coverage"] == "EMPTY":
            return (1, -audit["gameCount"])
        if audit["coverage"] == "HEADLINE_CSV_THIN" and audit["findingCounts"]["NEW_ITEM"] >= 8:
            return (2, -audit["findingCounts"]["NEW_ITEM"])
        if audit["findingCounts"]["NEW_ITEM"] >= 3:
            return (3, -audit["findingCounts"]["NEW_ITEM"])
        if audit["coverage"] == "HEADLINE_CSV_THIN":
            return (4, -audit["gameCount"])
        return (5, -audit["activeItems"])

    ordered = sorted(venue_audits, key=priority)
    priority_queue = []
    labels = {
        0: "P0 — empty US home stadium with official directory",
        1: "P0 — empty international/neutral venue",
        2: "P1 — thin CSV menu with official 2026 catalog proving large gaps",
        3: "P2 — 2026-new items confirmed missing at partial/richer venues",
        4: "P3 — remaining thin CSV venues needing official directories",
        5: "P4 — richer menus still missing 2026 refresh / prices / sections",
    }
    for audit in ordered:
        p = priority(audit)[0]
        priority_queue.append(
            {
                "priority": labels[p],
                "slug": audit["slug"],
                "name": audit["name"],
                "games": audit["gameCount"],
                "activeItems": audit["activeItems"],
                "newItemsFound": audit["findingCounts"]["NEW_ITEM"],
                "researchDepth": audit["researchDepth"],
            }
        )

    counts_all = {
        "EXISTING_MATCH": 0,
        "EXISTING_NEEDS_UPDATE": 0,
        "NEW_ITEM": 0,
        "POSSIBLE_DUPLICATE": 0,
        "POSSIBLY_DISCONTINUED": 0,
    }
    for row in research:
        counts_all[row["classification"]] += 1

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "productionWrites": False,
        "inventorySource": str(INVENTORY_PATH.relative_to(ROOT)),
        "inventoryGeneratedAt": inventory.get("generatedAt"),
        "scope": {
            "season": 2026,
            "league": "NFL",
            "games": inventory["totals"]["games"],
            "venues": inventory.get("venueCount", len(inventory["venues"])),
            "canonicalVenueSlugs": [v["slug"] for v in inventory["venues"]],
            "emptyMenuVenues": [v["slug"] for v in inventory["venues"] if v["items"]["active"] == 0],
        },
        "schema": schema_notes,
        "methodology": {
            "principle": "Do not scrape only the prior NFL headline CSV. Multi-source, official-first. Failure to find an item is not discontinuation.",
            "discontinuedRule": "POSSIBLY_DISCONTINUED only with positive 2026 evidence (official inaugural menu omission, replaced concept, or explicit discontinuation). Not used for 'not found'.",
            "confidence": {
                "HIGH": "Official stadium/team/operator/vendor source clearly identifies the item",
                "MEDIUM": "Credible local media or operator-attributed trade press",
                "LOW": "Indirect or incomplete evidence",
            },
            "limitations": [
                "This is a first-pass reconciliation, not a complete SKU census of every stand at 38 venues.",
                "Nissan official directory fetch truncated after Little Caesars; additional stands likely remain on that page.",
                "Lambeau PDF is a full official index; only representative SKUs were reconciled, not every beer/soda row.",
                "International venues often publish club-matchday F&B, not NFL-overlay menus.",
                "Prior Stadium Slop NFL data is dominated by data/league-import/nfl-venues-import.cleaned.csv headline/partner rows.",
                "No production writes were made.",
            ],
        },
        "productionTotals": inventory["totals"],
        "reconciliationTotals": {
            **counts_all,
            "findings": len(research),
            "venuesWithFindings": len(findings_by_venue),
            "venuesInventoryOnly": sum(1 for a in venue_audits if a["researchDepth"] == "INVENTORY_ONLY"),
        },
        "priorityQueue": priority_queue,
        "venueAudits": venue_audits,
        "findings": research,
    }
    OUT_PATH.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Wrote {OUT_PATH}")
    print("reconciliationTotals", payload["reconciliationTotals"])
    print("venues", len(venue_audits), "findings", len(research))


if __name__ == "__main__":
    main()
