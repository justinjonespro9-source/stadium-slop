#!/usr/bin/env python3
"""Build STRONG-source 2026 NFL concession payloads (excluding completed venues)."""

from __future__ import annotations

import json
from pathlib import Path

OUT = Path("data/nfl/2026-concessions")


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


def mt() -> dict:
    src = "https://www.mandtbankstadium.com/visit/food-beverage"
    return {
        "venueSlug": "m-t-bank-stadium",
        "venueName": "M&T Bank Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Food & Beverage | M&T Bank Stadium",
            "type": "official_stadium",
            "retrievedAt": "2026-09-11",
        },
        "notes": "Official M&T Bank Stadium stand directory. Production is headline CSV. Update Jimmy's Famous Seafood in place. Directory is a stand map, not a full plated SKU list. No prices published.",
        "vendors": [
            vendor("Jimmy's Famous Seafood", ["123", "201", "231"], src, "jimmy-s-famous-seafood"),
            vendor("Shake Shack", ["Shake Shack"], src),
            vendor("Bmore Nacho Co.", ["142", "536"], src),
            vendor("Tell Tale Tots", ["130", "150"], src),
            vendor("Ground & Pound", ["134", "206", "225", "248", "501"], src),
            vendor("Ravenous Chicken", ["119", "146", "229", "514", "541"], src),
            vendor("Poe's Pit", ["Poe's Pit"], src),
            vendor("Chesapeake Churro Co.", ["119", "224", "250", "529"], src),
            vendor("Chesapeake Market", ["111", "138", "504", "528"], src),
            vendor("Crush Collective", ["102", "123", "204", "234"], src),
            vendor("Club Cheesesteaks", ["202", "219"], src),
            vendor("Mid Atlantic Melt", ["Mid Atlantic Melt"], src),
            vendor("Glizzy Glides", ["103", "150"], src),
        ],
        "items": [
            item(
                "Crab Cakes",
                "Jimmy's Famous Seafood",
                "Official Jimmy's Famous Seafood crab cakes, a Baltimore stadium tradition, at sections 123, 201, and 231.",
                ["123", "201", "231"],
                src,
                notes="UPDATE of canonical Jimmy's Famous Seafood vendor-as-item. Official directory lists crab cakes, crabby egg rolls, and seafood-inspired specialty hot dogs. Preserve slug.",
                existing_item="jimmy-s-famous-seafood-jimmy-s-famous-seafood",
                existing_vendor="jimmy-s-famous-seafood",
            ),
            item(
                "Crabby Egg Rolls",
                "Jimmy's Famous Seafood",
                "Official Jimmy's Famous Seafood crabby egg rolls at sections 123, 201, and 231.",
                ["123", "201", "231"],
                src,
                category="SNACK",
            ),
            item(
                "ShackBurger",
                "Shake Shack",
                "Shake Shack road-side smashburger. Official M&T directory lists smashburgers, flat-top hot dogs, and custard shakes. Stand section is not numbered on the directory.",
                ["Shake Shack"],
                src,
            ),
            item(
                "Specialty Nachos",
                "Bmore Nacho Co.",
                "Official Bmore Nacho Co. specialty nachos at sections 142 and 536.",
                ["142", "536"],
                src,
                category="SNACK",
            ),
            item(
                "Loaded Tater Tots",
                "Tell Tale Tots",
                "Official Tell Tale Tots loaded tater tots with creative toppings at sections 130 and 150.",
                ["130", "150"],
                src,
                category="SNACK",
            ),
            item(
                "Smashburger",
                "Ground & Pound",
                "Official Ground & Pound smashburgers at sections 134, 206, 225, 248, and 501.",
                ["134", "206", "225", "248", "501"],
                src,
            ),
            item(
                "Hand-Breaded Chicken Tenders",
                "Ravenous Chicken",
                "Official Ravenous Chicken hand-breaded tenders and specialty sandwiches at sections 119, 146, 229, 514, and 541.",
                ["119", "146", "229", "514", "541"],
                src,
            ),
            item(
                "Pulled Pork Sandwich",
                "Poe's Pit",
                "Official Poe's Pit pulled pork sandwich. Directory does not print a section number for this BBQ stand.",
                ["Poe's Pit"],
                src,
            ),
            item(
                "Burnt End Mac and Cheese",
                "Poe's Pit",
                "Official Poe's Pit burnt end mac and cheese.",
                ["Poe's Pit"],
                src,
            ),
            item(
                "Churros",
                "Chesapeake Churro Co.",
                "Official Chesapeake Churro Co. traditional and specialty churros at sections 119, 224, 250, and 529.",
                ["119", "224", "250", "529"],
                src,
                category="SWEET",
            ),
            item(
                "Baltimore Snowball",
                "Chesapeake Churro Co.",
                "Official Chesapeake Churro Co. classic Baltimore snowball at sections 119, 224, 250, and 529.",
                ["119", "224", "250", "529"],
                src,
                item_type="NON_ALCOHOLIC_DRINK",
                category="SWEET",
            ),
            item(
                "Pit Beef",
                "Chesapeake Market",
                "Official Chesapeake Market Maryland pit beef and crab-inspired specialties at sections 111, 138, 504, and 528.",
                ["111", "138", "504", "528"],
                src,
            ),
            item(
                "Orange Crush",
                "Crush Collective",
                "Official Crush Collective signature Orange Crush cocktails at sections 102, 123, 204, and 234.",
                ["102", "123", "204", "234"],
                src,
                item_type="ALCOHOLIC_DRINK",
                category="ALCOHOLIC_BEVERAGE",
            ),
            item(
                "Cheesesteak",
                "Club Cheesesteaks",
                "Official Club Level beef and chicken cheesesteaks prepared to order at sections 202 and 219.",
                ["202", "219"],
                src,
            ),
            item(
                "Cheesesteak",
                "Mid Atlantic Melt",
                "Official Mid Atlantic Melt made-to-order cheesesteaks with thinly sliced steak and melted cheese. Directory does not print a section number.",
                ["Mid Atlantic Melt"],
                src,
            ),
            item(
                "Flock Friendly Hot Dog",
                "Glizzy Glides",
                "Official Glizzy Glides Flock Friendly hot dogs portable at sections 103 and 150.",
                ["103", "150"],
                src,
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "Bud Light Party Zone / domestic beer / fountain soda", "reason": "Generic beverage stands."},
            {"kind": "generic_filler", "name": "Pizza / Kickoff Classics value staples / 410 Fly By snacks", "reason": "Generic pizza, value hot dogs, packaged snacks."},
        ],
        "staleReview": [
            stale(
                "Ekiben",
                "ekiben-ekiben",
                "ekiben",
                "CSV North Plaza row. Official 2026 directory does not list Ekiben. Left active.",
                src,
            ),
            stale(
                "Grotto Pizza",
                "grotto-pizza-grotto-pizza",
                "grotto-pizza",
                "CSV pizza concept. Official directory lists a generic Pizza stand, not Grotto Pizza. Left active.",
                src,
            ),
            stale(
                "Hoffman’s Meats",
                "hoffman-s-meats-hoffman-s-meats",
                "hoffman-s-meats",
                "Not on the live official stand directory. Left active.",
                src,
            ),
            stale(
                "The 1996 Crab Stack",
                "the-1996-crab-stack-the-1996-crab-stack",
                "the-1996-crab-stack",
                "Headline CSV novelty not named on the official stand directory. Left active.",
                src,
            ),
        ],
        "possibleDuplicates": [
            dup(
                "Chaps Pit Beef",
                "chaps-pit-beef-chaps-pit-beef",
                "chaps-pit-beef",
                "CSV Chaps Pit Beef at 113 & 342 may overlap official Chesapeake Market pit beef at 111, 138, 504, 528. Do not merge automatically.",
                src,
            ),
            dup(
                "The Baltimore Chop",
                "the-baltimore-chop-the-baltimore-chop",
                "the-baltimore-chop",
                "CSV smash/chop concept at 134 may overlap Ground & Pound smashburgers at 134. Do not merge automatically.",
                src,
            ),
        ],
    }


def lucas() -> dict:
    src = "https://www.colts.com/news/lucas-oil-stadium-concessions-indianapolis-colts-new-food-beverage-2026-gameday-nfl-season-souvenir-loaded-fries-nachos-beer-premium-cooler-cocktails-tater-tots-dirty-sodas-chicken-teriyaki-footlong-corn-dog-ice-cream-yogurt-cheesesteak-coffee"
    return {
        "venueSlug": "lucas-oil-stadium",
        "venueName": "Lucas Oil Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Colts and Sodexo Live! unveil new food and beverage offerings for 2026 season",
            "type": "official_team",
            "retrievedAt": "2026-09-11",
        },
        "notes": "Official Colts/Sodexo 2026 culinary showcase. Update Mambo's Cheesesteak and Gameday Matchup Cocktails in place. Suite-only items with sourced club/suite locations included when distinctive. No estimated prices except the $4.99 Fan First program which is generic and excluded.",
        "vendors": [
            vendor("Mambo's Cheesesteak", ["139"], src, "mambo-s-cheesesteak"),
            vendor("Touchdown Taverns", ["Touchdown Taverns"], src, "caesars-sportsbook-lounge"),
            vendor("Stadium Box", ["105", "347", "543"], src),
            vendor("Dirty Sodas", ["529"], src),
            vendor("Asian Favorites", ["109"], src),
            vendor("HotBox Pizza", ["Pizza Stands"], src),
            vendor("East & West Loge Grill", ["East & West Loge Grill"], src),
            vendor("Sub Zero Nitrogen Ice Cream", ["Loge Clubs"], src),
            vendor("Orange Leaf", ["323"], src),
            vendor("Creative Coffee", ["Blue Room"], src),
        ],
        "items": [
            item(
                "Mambo's Cheesesteak",
                "Mambo's Cheesesteak",
                "Official 2026 minority-business partner at section 139: Philly cheesesteaks, loaded fries, and Latin-inspired sandwiches with Peruvian flavors.",
                ["139"],
                src,
                notes="UPDATE canonical Mambo's Cheesesteak in place. Preserve slug. labeledNewFor2026 because the Colts article lists it among four new MBEs for 2026.",
                allow=True,
                existing_item="mambo-s-cheesesteak-mambo-s-cheesesteak",
                existing_vendor="mambo-s-cheesesteak",
                labeled_new=True,
            ),
            item(
                "Gameday Matchup Cocktails",
                "Touchdown Taverns",
                "Official 2026 rotating matchup cocktails served in commemorative cooler cups at all GA Touchdown Taverns and Clubs, beginning with Midnight Flock on Sept 13.",
                ["Touchdown Taverns", "Clubs"],
                src,
                item_type="ALCOHOLIC_DRINK",
                category="ALCOHOLIC_BEVERAGE",
                notes="UPDATE existing Gameday Matchup Cocktails. Vendor renamed from Caesars Sportsbook Lounge to official Touchdown Taverns. Preserve slug.",
                existing_item="caesars-sportsbook-lounge-gameday-matchup-cocktails",
                existing_vendor="caesars-sportsbook-lounge",
                labeled_new=True,
            ),
            item(
                "The Crown Highball",
                "Touchdown Taverns",
                "Official 2026 premium cooler cocktail: Crown Royal whisky, lemon juice, honey, and club soda.",
                ["Touchdown Taverns", "Clubs"],
                src,
                item_type="ALCOHOLIC_DRINK",
                category="ALCOHOLIC_BEVERAGE",
                labeled_new=True,
            ),
            item(
                "Loaded Tater Tots",
                "Stadium Box",
                "Official 2026 football-shaped tater tots with Buffalo chicken, Philly cheesesteak, or vegan street-style toppings at sections 105, 347, and 543.",
                ["105", "347", "543"],
                src,
                category="SNACK",
                labeled_new=True,
            ),
            item(
                "Stadium Box Loaded Fries",
                "Stadium Box",
                "Official 2026 loaded fries in a commemorative Lucas Oil Stadium container at sections 105, 347, and 543.",
                ["105", "347", "543"],
                src,
                category="SNACK",
                labeled_new=True,
            ),
            item(
                "Loaded Footlong Corn Dog",
                "Stadium Box",
                "Official 2026 footlong corn dog topped with chili and cheese at sections 105, 347, and 543.",
                ["105", "347", "543"],
                src,
                labeled_new=True,
            ),
            item(
                "Dirty Sodas",
                "Dirty Sodas",
                "Official 2026 customizable sodas with flavored syrups and sweet cream at section 529.",
                ["529"],
                src,
                item_type="NON_ALCOHOLIC_DRINK",
                category="BEVERAGE",
                allow=True,
                labeled_new=True,
            ),
            item(
                "Chicken Teriyaki",
                "Asian Favorites",
                "Official 2026 chicken teriyaki served with fried rice at section 109.",
                ["109"],
                src,
                labeled_new=True,
            ),
            item(
                "Beef and Broccoli",
                "Asian Favorites",
                "Official 2026 beef and broccoli served with fried rice at section 109.",
                ["109"],
                src,
                labeled_new=True,
            ),
            item(
                "Meatball Sub",
                "HotBox Pizza",
                "Official 2026 HotBox Pizza meatball sub: beef and pork meatballs, marinara, mozzarella on a hoagie. Club pizza stands.",
                ["Pizza Stands"],
                src,
                labeled_new=True,
            ),
            item(
                "Chef Tony's Chorizo Tacos",
                "East & West Loge Grill",
                "Official 2026 club tacos: soft tortilla, chorizo, salsa verde, onions, and cilantro.",
                ["East & West Loge Grill"],
                src,
                labeled_new=True,
            ),
            item(
                "Pork Loin Sandwich",
                "East & West Loge Grill",
                "Official 2026 smoked pork loin on brioche with pickles and BBQ sauce at East & West Loge Grill.",
                ["East & West Loge Grill"],
                src,
                labeled_new=True,
            ),
            item(
                "Sub Zero Nitrogen Ice Cream",
                "Sub Zero Nitrogen Ice Cream",
                "Official 2026 made-to-order nitrogen ice cream in the Loge Clubs. New minority-business partner.",
                ["Loge Clubs"],
                src,
                category="SWEET",
                allow=True,
                labeled_new=True,
            ),
            item(
                "Orange Leaf Frozen Yogurt",
                "Orange Leaf",
                "Official 2026 Orange Leaf mix-and-match frozen yogurt at section 323. New minority-business partner.",
                ["323"],
                src,
                category="SWEET",
                labeled_new=True,
            ),
            item(
                "Handcrafted Coffee",
                "Creative Coffee",
                "Official 2026 Creative Coffee handcrafted coffee at the Blue Room and East & West Loge Anvil Bar. New minority-business partner.",
                ["Blue Room", "East & West Loge Anvil Bar"],
                src,
                item_type="NON_ALCOHOLIC_DRINK",
                category="BEVERAGE",
                labeled_new=True,
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "Draft beer cup / Dasani / generic pizza", "reason": "Generic beverage vessel and filler."},
            {"kind": "suite_census", "name": "Most suite buffet SKUs", "reason": "Suite catering list is long; imported only distinctive named sandwiches already covered in clubs when sourced."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Pizza Box Nachos",
                "pizza-box-nachos-pizza-box-nachos",
                "pizza-box-nachos",
                "May be the same product family as official 2026 Stadium Box Nachos in East & West Heartland Market clubs. Do not merge automatically.",
                src,
            ),
            dup(
                "Vegan Street Style Loaded Fries",
                "vegan-street-style-loaded-fries-vegan-street-style-loaded-fries",
                "vegan-street-style-loaded-fries",
                "Shares sections 105 and 543 with official Loaded Tater Tots vegan street-style topping. Do not merge automatically.",
                src,
            ),
            dup(
                'The "Dirty" Circle City Soda',
                "touchdown-taverns-the-dirty-circle-city-soda",
                "touchdown-taverns",
                "CSV dirty soda at 132 vs official 2026 Dirty Sodas stand at 529. Different sections; possible related concept. Do not merge.",
                src,
            ),
        ],
    }


def caesars() -> dict:
    src = "https://www.neworleanssaints.com/news/saints-gameday-concessions-value-menu-upgrades-caesars-superdome-2026-nfl-season"
    return {
        "venueSlug": "caesars-superdome",
        "venueName": "Caesars Superdome",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Saints and Legends Global enhance food and beverage experience at Caesars Superdome for 2026 season",
            "type": "official_team",
            "retrievedAt": "2026-09-11",
        },
        "notes": "Official Saints/Legends 2026 announcement. Existing Louisiana items are returning favorites and left as MATCH by omission. Lucky Dog is a documented return. Rotating 2026 specialties are labeled new. $6 anniversary staples excluded. No stand numbers for most 2026 specialties; use sourced concept tokens only.",
        "vendors": [
            vendor("Lucky Dog", ["Lucky Dog"], src),
            vendor("Bayou Smash", ["Bayou Smash"], src),
            vendor("Dome Nachos", ["Dome Nachos"], src),
            vendor("Jewel of the South", ["Jewel of the South"], src),
        ],
        "items": [
            item(
                "Lucky Dog",
                "Lucky Dog",
                "Official 2026 Saints/Legends announcement confirms the highly anticipated return of Lucky Dog. Exact section is not printed.",
                ["Lucky Dog"],
                src,
                notes="Returning favorite, not labeled as a 2026 launch.",
                allow=True,
            ),
            item(
                "Bayou Smash Burgers",
                "Bayou Smash",
                "Official 2026 rotating specialty: Bayou Smash Burgers. Stand number is not printed.",
                ["Bayou Smash"],
                src,
                labeled_new=True,
            ),
            item(
                "Pork and Alligator Burger",
                "Bayou Smash",
                "Official 2026 rotating specialty pork and alligator burger. Stand number is not printed.",
                ["Bayou Smash"],
                src,
                labeled_new=True,
            ),
            item(
                "Dome Nachos",
                "Dome Nachos",
                "Official 2026 rotating specialty nachos with pork carnitas, chicken tinga, or house-made seafood queso.",
                ["Dome Nachos"],
                src,
                category="SNACK",
                allow=True,
                labeled_new=True,
            ),
            item(
                "Jewel of the South Cocktail",
                "Jewel of the South",
                "Official 2026 signature cocktail program created with Jewel of the South. Individual recipes were not published.",
                ["Jewel of the South"],
                src,
                item_type="ALCOHOLIC_DRINK",
                category="ALCOHOLIC_BEVERAGE",
                labeled_new=True,
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "$6 Anniversary Menu", "reason": "Hot dogs, popcorn, pretzels, nachos, Dasani, select draft beer."},
            {"kind": "partner_without_sku", "name": "King Creole / Mrs. Wheats / Sweet Soulfood / Haydel's", "reason": "Named partners without a published SKU."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Seafood Nachos",
                "504-eats-seafood-nachos",
                "504-eats",
                "Existing Seafood Nachos may overlap 2026 Dome Nachos seafood queso. Do not merge.",
                src,
            ),
        ],
    }


def everbank() -> dict:
    src = "https://media.delawarenorth.com/jacksonville-jaguars-and-delaware-north-sportservice-unveil-new-food-and-beverage-offerings-at-everbank-stadium-for-2026-season/"
    return {
        "venueSlug": "everbank-stadium",
        "venueName": "EverBank Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Jaguars and Delaware North Sportservice unveil new food and beverage offerings at EverBank Stadium for 2026 season",
            "type": "official_operator",
            "retrievedAt": "2026-09-11",
        },
        "notes": "Official Delaware North 2026 release. Preserve reviewed Bono's BBQ and DUUUVAL Dawgs. Update 904 Burger / Red Zone Burger in place. Fan First Favorites $4.99 staples excluded.",
        "vendors": [
            vendor("904 Prime Burger", ["105", "132"], src, "904-burger"),
            vendor("Yucatan Cantina", ["125"], src),
            vendor("Little Caesars", ["141", "207", "234"], src),
            vendor("Mac n Cheese Bar", ["Lower Clubs"], src),
        ],
        "items": [
            item(
                "The Red Zone Burger",
                "904 Prime Burger",
                "Official 2026 highlight: double burger with melted cheese, bacon, crispy fried onions, and barbecue sauce at stands 105 and 132.",
                ["105", "132"],
                src,
                notes="UPDATE canonical Red Zone Burger. Vendor 904 Burger → 904 Prime Burger. Preserve slug.",
                existing_item="904-burger-the-red-zone-burger",
                existing_vendor="904-burger",
                labeled_new=True,
            ),
            item(
                "River City Heatwave",
                "904 Prime Burger",
                "Official 2026 debut: tater tots with hand-breaded shrimp, popcorn chicken, datil pepper sauce, blue cheese, mini peppers, chives, lemon, and celery-carrot salad at stands 105 and 132.",
                ["105", "132"],
                src,
                category="SNACK",
                labeled_new=True,
            ),
            item(
                "Poquet Quesadillas",
                "Yucatan Cantina",
                "Official 2026 debut at stand 125: chicken, melted cheese, and roasted peppers in grilled flour tortillas.",
                ["125"],
                src,
                labeled_new=True,
            ),
            item(
                "Italian Cheese Bread",
                "Little Caesars",
                "Official 2026 Little Caesars Italian Cheese Bread at stand 141 and Upper Clubs 207 and 234.",
                ["141", "207", "234"],
                src,
                category="SNACK",
                labeled_new=True,
            ),
            item(
                "3 Meat Treat Pizza",
                "Little Caesars",
                "Official 2026 Little Caesars 3 Meat Treat pizza at stand 141 and Upper Clubs 207 and 234.",
                ["141", "207", "234"],
                src,
                labeled_new=True,
            ),
            item(
                "Mac n Cheese Bar",
                "Mac n Cheese Bar",
                "Official 2026 Lower Clubs build-your-own mac and cheese bar.",
                ["Lower Clubs"],
                src,
                allow=True,
                labeled_new=True,
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "Fan First Favorites $4.99", "reason": "Hot dogs, nachos, popcorn, candy, pretzels, beer."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Coastal Taqueria",
                "coastal-taqueria-coastal-taqueria",
                "coastal-taqueria",
                "CSV Coastal Taqueria is at section 125, the official 2026 Yucatan Cantina stand. Possible replacement. Reviewed Bono's BBQ and DUUUVAL Dawgs were not touched.",
                src,
            ),
        ],
    }


def metlife() -> dict:
    src = "https://media.delawarenorth.com/delaware-north-sportservice-unveils-new-food-beverage-and-retail-experiences-at-metlife-stadium-for-the-2026-season/"
    return {
        "venueSlug": "metlife-stadium",
        "venueName": "MetLife Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Delaware North Sportservice unveils new food, beverage and retail experiences at MetLife Stadium for the 2026 season",
            "type": "official_operator",
            "retrievedAt": "2026-09-11",
        },
        "notes": "Official Delaware North 2026 release. Update Nonna Fusco's, Tacos Roqueros spelling, and Fat Rooster locations in place.",
        "vendors": [
            vendor("Nonna Fusco's Kitchen", ["118", "335", "Mezzanine Clubs"], src, "nonna-fusco-s-kitchen"),
            vendor("Tacos Roqueros", ["MetLife West Hall", "313", "Mezzanine Clubs"], src, "taco-s-raqueros"),
            vendor("Fat Rooster", ["MetLife West Hall", "101", "317", "Mezzanine Clubs"], src, "fat-rooster"),
            vendor("Garden State Rippers", ["MetLife West Hall", "317", "Mezzanine Clubs"], src),
            vendor("Filet Mignon Carvery", ["108", "Mezzanine Clubs"], src),
        ],
        "items": [
            item(
                "Pasta with Nonna's Sauce",
                "Nonna Fusco's Kitchen",
                "Official 2026 Pasta Fresca expansion at sections 118 and 335 and both Mezzanine Clubs.",
                ["118", "335", "Mezzanine Clubs"],
                src,
                notes="UPDATE canonical pasta. Preserve slug pasta-with-nonnas-sauce.",
                existing_item="pasta-with-nonnas-sauce",
                existing_vendor="nonna-fusco-s-kitchen",
            ),
            item(
                "Sunday Gravy",
                "Nonna Fusco's Kitchen",
                "Official 2026 seasonal Sunday Gravy during colder-weather games at sections 118 and 335 and both Mezzanine Clubs.",
                ["118", "335", "Mezzanine Clubs"],
                src,
                labeled_new=True,
            ),
            item(
                "Tacos",
                "Tacos Roqueros",
                "Official 2026 Tacos Roqueros refreshed menu at MetLife West Hall, section 313, and both Mezzanine Clubs.",
                ["MetLife West Hall", "313", "Mezzanine Clubs"],
                src,
                notes="UPDATE vendor spelling Taco's Raqueros → Tacos Roqueros. Preserve tacos slug.",
                existing_item="tacos",
                existing_vendor="taco-s-raqueros",
            ),
            item(
                "Spicy Chicken Sandwich",
                "Fat Rooster",
                "Official 2026 Fat Rooster spicy chicken sandwich at MetLife West Hall, sections 101 and 317, and both Mezzanine Clubs.",
                ["MetLife West Hall", "101", "317", "Mezzanine Clubs"],
                src,
                existing_item="spicy-chicken-sandwich",
                existing_vendor="fat-rooster",
            ),
            item(
                "Colombian-Style Ripper",
                "Garden State Rippers",
                "Official 2026 Thumann's natural-casing Colombian-style ripper at MetLife West Hall, section 317, and both Mezzanine Clubs.",
                ["MetLife West Hall", "317", "Mezzanine Clubs"],
                src,
                labeled_new=True,
            ),
            item(
                "Jersey Chili Cheese Ripper",
                "Garden State Rippers",
                "Official 2026 Jersey chili cheese ripper with house-made chili at MetLife West Hall, section 317, and both Mezzanine Clubs.",
                ["MetLife West Hall", "317", "Mezzanine Clubs"],
                src,
                labeled_new=True,
            ),
            item(
                "Carved-to-Order Filet Mignon Sandwich",
                "Filet Mignon Carvery",
                "Official 2026 debut of freshly carved filet mignon in general concessions at section 108 and both Mezzanine Clubs.",
                ["108", "Mezzanine Clubs"],
                src,
                labeled_new=True,
            ),
        ],
        "excluded": [
            {"kind": "retail", "name": "Laser-engraved football zone", "reason": "Retail, not food."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Spicy Chicken Sandwiches",
                "spicy-chicken-sandwiches",
                "fat-rooster",
                "Second Fat Rooster spicy sandwich row. Canonical UPDATE used spicy-chicken-sandwich.",
                src,
            ),
            dup(
                'The "Final" Ribeye Sandwich',
                "the-final-ribeye-sandwich-the-final-ribeye-sandwich",
                "the-final-ribeye-sandwich",
                "Existing ribeye at 117 vs 2026 carved filet at 108. Do not merge.",
                src,
            ),
        ],
    }


def gillette() -> dict:
    src = "https://www.patriots.com/news/legal-sea-foods-named-official-seafood-restaurant-and-clam-chowder-of-the-new-england-patriots-and-gillette-stadium"
    return {
        "venueSlug": "gillette-stadium",
        "venueName": "Gillette Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Legal Sea Foods Named Official Seafood Restaurant and Clam Chowder of the New England Patriots and Gillette Stadium",
            "type": "official_team",
            "retrievedAt": "2026-09-11",
        },
        "notes": "Official Patriots/Legal Sea Foods 2026 partnership. Clam Chowder Poutine is a different product. 100 and 300 are the sourced levels; exact stand numbers were not published.",
        "vendors": [vendor("Legal Sea Foods", ["100", "300"], src)],
        "items": [
            item(
                "New England Clam Chowder",
                "Legal Sea Foods",
                "Official 2026 Legal Sea Foods New England Clam Chowder at select 100- and 300-level stands.",
                ["100", "300"],
                src,
                labeled_new=True,
            ),
            item(
                "Lobster Roll",
                "Legal Sea Foods",
                "Official 2026 Legal Sea Foods lobster rolls at select 100- and 300-level stands.",
                ["100", "300"],
                src,
                labeled_new=True,
            ),
        ],
        "excluded": [],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Clam Chowder Poutine",
                "clam-chowder-poutine-clam-chowder-poutine",
                "clam-chowder-poutine",
                "Existing poutine is not the Legal Sea Foods cup of chowder. Keep both.",
                src,
            ),
        ],
    }


def sofi() -> dict:
    src = "https://www.sofistadium.com/news/detail/sofi-stadium-and-legends-global-debut-new-food-beverage-and-merchandise-offerings-for-the-2026-nfl-season"
    return {
        "venueSlug": "sofi-stadium",
        "venueName": "SoFi Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "SoFi Stadium And Legends Global Debut New Food, Beverage And Merchandise Offerings For The 2026 NFL Season",
            "type": "official_stadium",
            "retrievedAt": "2026-09-11",
        },
        "notes": "Official SoFi/Legends 2026 announcement. Existing dining-guide menu left intact except Brookie vendor UPDATE and BBQ location expansion. Frites and unnamed concession SKUs excluded: no printed stand/section.",
        "vendors": [
            vendor("Touchdown Treats", ["400", "500"], src, "touchdown-treats"),
        ],
        "items": [
            item(
                "Brookie",
                "Touchdown Treats",
                "Official 2026 Touchdown Treats Brookie at new 400- and 500-level locations.",
                ["400", "500"],
                src,
                category="SWEET",
                notes="UPDATE existing Brookie to Touchdown Treats. Preserve slug brookie.",
                existing_item="brookie",
                labeled_new=True,
            ),
            item(
                "Whoopie of the Game",
                "Touchdown Treats",
                "Official 2026 Touchdown Treats Whoopie of the Game at 400- and 500-level locations.",
                ["400", "500"],
                src,
                category="SWEET",
                labeled_new=True,
            ),
            item(
                "Chocolate Cake",
                "Touchdown Treats",
                "Official 2026 Touchdown Treats chocolate cake at 400- and 500-level locations.",
                ["400", "500"],
                src,
                category="SWEET",
                labeled_new=True,
            ),
            item(
                "Gelato",
                "Touchdown Treats",
                "Official 2026 Touchdown Treats gelato at 400- and 500-level locations.",
                ["400", "500"],
                src,
                category="SWEET",
                labeled_new=True,
            ),
        ],
        "excluded": [
            {"kind": "missing_section", "name": "Frites Butter Chicken / Short Rib / Pastrami", "reason": "No printed stand or section."},
            {"kind": "missing_section", "name": "Baked Ziti / Buffalo Chicken Wrap / SPAM Dog / Pickle Fries / Chicken Club / Jalapeno Cheddar Sausage / Fiesta Chopped Salad", "reason": "Concession refresh SKUs with no stand names."},
            {"kind": "generic_novelty", "name": "Dippin' Dots", "reason": "Ice cream novelty filler."},
        ],
        "staleReview": [],
        "possibleDuplicates": [],
    }


def hardrock() -> dict:
    src = "https://www.hardrockstadium.com/concessions/"
    return {
        "venueSlug": "hard-rock-stadium",
        "venueName": "Hard Rock Stadium",
        "season": 2026,
        "league": "NFL",
        "source": {
            "url": src,
            "title": "Concessions - Hard Rock Stadium",
            "type": "official_stadium",
            "retrievedAt": "2026-09-11",
        },
        "notes": "Live official Hard Rock directory. Production already has a richer parsed menu. This pass updates official locations and adds distinctive missing stands.",
        "vendors": [
            vendor("Sol Cubano", ["120", "242", "350"], src, "sol-cubano"),
            vendor("Tacotomia", ["231", "341"], src, "talkin-tacos"),
            vendor("Chef Creole", ["329"], src),
            vendor("305 Sliders", ["111"], src),
            vendor("Asia Bites", ["244"], src),
            vendor("Kebab Joint", ["129", "135"], src),
            vendor("Walking Tacos", ["311", "338"], src),
        ],
        "items": [
            item(
                "Croquetas",
                "Sol Cubano",
                "Official Sol Cubano croquetas at sections 120, 242, and 350.",
                ["120", "242", "350"],
                src,
                category="SNACK",
                existing_item="croquetas",
                existing_vendor="sol-cubano",
            ),
            item(
                "Cuban Empanadas",
                "Sol Cubano",
                "Official Sol Cubano Cuban empanadas at sections 120, 242, and 350.",
                ["120", "242", "350"],
                src,
                existing_item="cuban-empanadas",
                existing_vendor="sol-cubano",
            ),
            item(
                "Street Tacos",
                "Tacotomia",
                "Official Tacotomia tacos at sections 231 and 341. Production stored Talkin Tacos.",
                ["231", "341"],
                src,
                existing_item="street-tacos",
                existing_vendor="talkin-tacos",
            ),
            item(
                "Haitian Plate",
                "Chef Creole",
                "Official Chef Creole Haitian stand at section 329. Directory does not print individual SKUs.",
                ["329"],
                src,
            ),
            item(
                "305 Sliders",
                "305 Sliders",
                "Official 305 Sliders stand at section 111.",
                ["111"],
                src,
                allow=True,
            ),
            item(
                "Asia Bites",
                "Asia Bites",
                "Official Asia Bites stand at section 244.",
                ["244"],
                src,
                allow=True,
            ),
            item(
                "Chicken Shawarma",
                "Kebab Joint",
                "Official Kebab Joint at sections 129 and 135. Updates the existing empty-location shawarma row.",
                ["129", "135"],
                src,
                existing_item="chicken-shawarma",
            ),
            item(
                "Walking Taco",
                "Walking Tacos",
                "Official Walking Tacos stands at sections 311 and 338.",
                ["311", "338"],
                src,
                category="SNACK",
            ),
        ],
        "excluded": [
            {"kind": "generic_filler", "name": "CANTALOUPE / Fan Favorites / Wynwood Walkthrough", "reason": "Generic popcorn, nachos, pretzels, hot dogs."},
        ],
        "staleReview": [],
        "possibleDuplicates": [
            dup(
                "Coyo Taco",
                "coyo-taco-coyo-taco",
                "coyo-taco",
                "Coyo Taco is not on the live official directory. Tacotomia occupies 231/341.",
                src,
            ),
        ],
    }


if __name__ == "__main__":
    for builder in (mt, lucas, caesars, everbank, metlife, gillette, sofi, hardrock):
        write_payload(builder())
