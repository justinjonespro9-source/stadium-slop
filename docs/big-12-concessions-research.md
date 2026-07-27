# Big 12 football concessions research (Phase 5)

Prefer 2024–2026 official athletics / concessionaire / primary local reporting.
Import rule: **verified-current food only**. Accuracy over count.
No existing deep Big 12 football menus in Stadium Slop (all 16 football venues are new).
Allen Fieldhouse is Kansas basketball only — not used.

Research date: 2026-07-27 (pre–Fall 2026 season).

Confidence labels: Verified current | Likely current | Historical only | Temporary | Premium only | Outside stadium | Unverified

---

## Naming notes (verify current display)

| Program | Official / current display | Formerly | Slug | Verified |
| --- | --- | --- | --- | --- |
| Arizona | **Casino Del Sol Stadium** | Arizona Stadium | `casino-del-sol-stadium` | UA Athletics naming rights 2025-11-17 |
| Arizona State | Mountain America Stadium | Sun Devil Stadium | `mountain-america-stadium` | Current ASU athletics |
| Texas Tech | **Galaxy Stadium** | Jones AT&T Stadium | `galaxy-stadium` | Learfield / Galaxy 2026-07-17 (effective 2026 season) |
| UCF | **Acrisure Bounce House** | FBC Mortgage Stadium | `acrisure-bounce-house` | UCF Athletics / rename effective 2025-07-01 |

---

## Import recommendation summary

| Slug | Status | Rationale |
| --- | --- | --- |
| `mclane-stadium` | **import** | 2025 stand list (likely) preserved + Fall 2026 Fan First verified SKUs |
| `bill-snyder-family-stadium` | **import** | Live K-State Athletics football concessions page with stand-level food SKUs |
| `folsom-field` | **import** | CU Athletics Buffs United 2025 named food items |
| `david-booth-kansas-memorial-stadium` | **import** | KU Athletics partners + KC Star quoting KU hospitality GM on named SKUs |
| `acrisure-bounce-house` | **import** | UCF Athletics Guide in ’25 named concourse dishes (non-premium, non-rotating) |
| `nippert-stadium` | **import** | UC Athletics 2025 + Sodexo concessions page with named concepts/items |
| `mountain-america-stadium` | **import** | ASU page vendors + Phoenix New Times / ASU News named 2025 dishes |
| `amon-g-carter-stadium` | **import** | TCU Athletics–sourced Half Acre Korean Corn Dog (2025); thin otherwise |
| `milan-puskar-stadium` | **pending** | Likely-only 2024 Fan First / Sodexo blurbs — no verified-current dish import |
| `jack-trice-stadium` | **pending** | We Will Pizza likely only (2024); not verified-current |
| `casino-del-sol-stadium` | **import** | UA Athletics 2025 Bear Down Deals named staples only |
| `tdecu-stadium` | **pending** | 2025 UH release is vendor names, not dish SKUs; inferred rows HIDDEN |
| `lavell-edwards-stadium` | **pending** | Interactive map / CougarTail filter; no published football SKU list |
| `boone-pickens-stadium` | **pending** | Detailed vendor maps stop at 2023–24; no 2025–26 item list |
| `galaxy-stadium` | **pending** | Fresh rename; football stand directory lacks dish SKUs (concert menus ≠ football) |
| `rice-eccles-stadium` | **pending** | 2025 coverage is ops/mobile-order only; PDF maps lack dishes |

Machine JSON: `/tmp/big12-concessions-verified.json`

---

## 1. casino-del-sol-stadium (Arizona)

**Display name:** Casino Del Sol Stadium (formerly Arizona Stadium; naming rights announced 2025-11-17).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Hot dog | Value-menu hot dog | Bear Down Deals (19 stands) | Stadium-wide | https://arizonawildcats.com/news/2025/8/13/arizona-football-top-2025-gameday-improvements.aspx | 2025-08-13 | Verified current | No | $4 Bear Down Deals |
| Nachos | Value-menu nachos | Bear Down Deals | Stadium-wide | same | 2025-08-13 | Verified current | No | $4 |
| Popcorn | Value-menu popcorn | Bear Down Deals | Stadium-wide | same | 2025-08-13 | Verified current | No | $4 |
| Elote Bites | Breaded/fried elote | Aramark | East mid / west top (2024) | https://arizonawildcats.com/news/2024/8/26/general-top-five-enhancements-to-the-fan-experience-at-arizona-stadium-in-2024 | 2024-08-26 | Historical only | No | 2024 launch; not re-listed in 2025 athletics food note |
| Big 12 Dog | Foot-long with onion rings | Aramark | East mid / west top (2024) | same | 2024-08-26 | Historical only | No | 2024 launch |
| Bear Down Burger | Burger with bacon & onion rings | Aramark | East mid / west top (2024) | same | 2024-08-26 | Historical only | No | 2024 launch |
| Wild SirNoran Dog | Sonoran-style dog | Sir Veza’s | — | https://thenomnomnews.com/2024/09/02/heres-what-you-can-eat-at-ua-football-games-this-fall/ | 2024-09-02 | Historical only | No | Local press; 2024 unveiling |
| Sweet Ride Nachos | Churro / wonton dessert nachos | Sir Veza’s | — | same | 2024-09-02 | Historical only | No | |
| Sonoran dogs (vendor) | El Perrito Sonoran Dogs truck | Food Truck Alley | Under west stands | https://arizonawildcats.com/news/2025/8/13/arizona-football-top-2025-gameday-improvements.aspx | 2025-08-13 | Likely current | No | Vendor confirmed 2025; dish SKU not published |
| Chick-fil-A | Chain chicken | Chick-fil-A / Food Truck Alley | West | same | 2025-08-13 | Likely current | No | Vendor only — no SKU in athletics release |
| Sir Veza’s Tacos & Tots | Local truck | Food Truck Alley | West | same | 2025-08-13 | Likely current | No | Vendor only |
| Solid Grindz Hawaiian BBQ | Local truck | Food Truck Alley | West | same | 2025-08-13 | Likely current | No | Vendor only |
| Coors Light Draft Beer Patio | Beer patio | Food Truck Alley | West | same | 2025-08-13 | Likely current | **Yes** | Alcohol — omit import |

**Import:** hot dog, nachos, popcorn only.  
**Omitted:** 2024 Aramark signatures (not reconfirmed 2025); Food Truck Alley vendors without dish SKUs; alcohol; fountain soda/water (beverage).

---

## 2. mountain-america-stadium (Arizona State)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pulled pork sandwich | BBQ pulled pork on Hawaiian roll w/ chips & slaw | Fork’em BBQ | Coca-Cola Sun Deck / N endzone | https://www.phoenixnewtimes.com/food-drink/asu-offers-new-stadium-food-options-for-the-2025-football-season-22757217/ | 2025 | Verified current | No | Reporter sampling; stand also on ASU athletics page |
| Hot Honey Chicken tenders | Chicken strips with hot honey, fries | Sun Devil Burgers & Tenders | Concourse | same | 2025 | Verified current | No | |
| Chick-fil-A chicken sandwich | Chain staple | Chick-fil-A | Coca-Cola Sun Deck | https://thesundevils.com/facilities-venues/mountain-america-stadium | 2025 | Verified current | No | Vendor on official 2025 page |
| Someburros | Local Mexican concept | Someburros | Sun Deck; behind sec 33 | same | 2025 | Likely current | No | Vendor confirmed; dish SKU not published → omit import |
| Devil Dogs | Footlong Sonoran-style hot dogs | Stadium concessions | — | https://news.asu.edu/20240822-sun-devil-community-new-enhanced-fan-experience-awaiting-sun-devil-football-fans | 2024-08-22 | Historical only | No | 2024 ASU News; not reconfirmed in 2025 athletics copy |
| Inferno Fries | Fries with cheese curds | Stadium concessions | — | same | 2024-08-22 | Historical only | No | 2024 |
| Cold Beers and Cheeseburgers | Specialty stand | Coca-Cola Sun Deck | — | ASU stadium page | 2025 | Likely current | Mixed | Vendor; no dish SKU |
| Huss Brewing / Devils’ Halo | Craft beer | Huss Hideout | Upper east | ASU stadium page | 2025 | Verified current | **Yes** | Alcohol — omit |

**Import:** Fork’em BBQ pulled pork sandwich; Hot Honey Chicken tenders; Chick-fil-A chicken sandwich.  
**Omitted:** Someburros (no SKU); 2024 Devil Dogs / Inferno Fries; alcohol; generic classics listed without SKUs.

---

## 3. mclane-stadium (Baylor)

**Primary source for import:** Fan First pricing / Fall 2026 signatures (announced 2026-02-18).  
**Secondary:** Full 2025 stand list (2025-08-28) — treated as likely current while Sodexo remains F&B partner; **preserved active** alongside 2026 Fan First SKUs (do not shrink catalog to the 10-item pack).

### Fall 2026 Fan First (import)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Popcorn | 254 Classics | Sodexo | Home games | https://baylorbears.com/news/2026/2/18/athletic-news-baylor-athletics-fan-first-concessions-pricing-is-here | 2026-02-18 | Verified current | No | $2 |
| Nachos | 254 Classics | Sodexo / Bear Zone | Home games | same | 2026-02-18 | Verified current | No | $5; merges onto existing Bear Zone Nachos row |
| Hot Dog | 254 Classics | Sodexo / Bear Zone | Home games | same | 2026-02-18 | Verified current | No | $4; merges onto existing Bear Zone Hot Dog row |
| Bavarian Pretzel | 254 Classics | Sodexo | Home games | same | 2026-02-18 | Verified current | No | $4; distinct from Bear Zone Soft Pretzel |
| Bear Claw | Oversized pastry, cinnamon, green-and-gold glaze | Sodexo signature | McLane | same | 2026-02-18 | Verified current | No | Headliner |
| Sic ’Em Sliders | Dr Pepper pulled pork or chicken + house chips | Sodexo signature | McLane | same | 2026-02-18 | Verified current | No | |
| Indy’s & Belle’s Touchdown Tacos | Al pastor chicken, pineapple salsa, Gold Rush queso, corn tortilla | Sodexo signature | McLane | same | 2026-02-18 | Verified current | No | |
| Sic ’Em Smashburger | Double smash, Gold Rush queso, jalapeños, crispy cheddar onions, tamarind BBQ | Sodexo signature | McLane | same | 2026-02-18 | Verified current | No | |
| The Baylor Line Dog | Nathan’s dog, Texas chow chow, queso, chicharrónes | Sodexo signature | McLane | same | 2026-02-18 | Verified current | No | |
| 1845 Baylor Bear Family Pack | 4 hot dogs, 4 sodas, 4 Pringles | Sodexo | McLane | same | 2026-02-18 | Verified current | No | Bundle; food-forward |

### 2025 stand offerings (preserved active — likely current)

| Item | Vendor/stand | Section | Source | Confidence | Notes |
| --- | --- | --- | --- | --- | --- |
| Conecuh Sausage / wraps | Bear Zone | Multiple | https://baylorbears.com/news/2025/8/28/fan-experience-2025-football-concessions-offerings-revealed | Likely current | May persist alongside 2026 |
| Brisket nachos | Sic ’Em Nachos | 104, 218 | same | Likely current | |
| Philly cheesesteak | Pardon My Cheesesteak | 108, 213 | same | Likely current | |
| Smash burgers / chili cheese coneys | Sonic Drive-In | 118 | same | Likely current | |
| Chop beef / pulled pork / jalapeño sausage | Rudy’s BBQ | 109B, 210 | same | Likely current | |
| Chicken sandwich / buffalo fries | Bush’s Chicken | 118 | same | Likely current | |
| Cheese / pepperoni pizza | Stadium Pie’s | 216B, 226B | same | Likely current | |
| Soft pretzels | Ben’s Pretzels | 115, 213 | same | Likely current | |
| Corn dogs / funnel cakes / chicken basket | Hull Concessions | Multiple | same | Likely current | |
| Frozen custard | Andy’s Frozen Custard | TBA | same | Likely current | |

Dry campus — no alcohol at McLane.

**Import:** 2026 Fan First food items **plus** all supportable 2025 stand SKUs (exclude fountain drink / souvenir cup as beverage packaging).  
**Omitted:** sodas; YETI merch.

---

## 4. lavell-edwards-stadium (BYU)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CougarTails® | Signature pastry | Various (map filter) | Football map | https://dining.byu.edu/concessions/new-mobile-ordering | 2022+ (still linked) | Likely current | No | Football map has “Just show me the CougarTails” filter; no static SKU PDF |
| Gluten-free stand | Dedicated GF stand | SE corner | Stadium | https://byucougars.com/news/2025/08/27/byu-football-gameday-information-for-the-2025-season | 2025-08-27 | Likely current | No | Location only — no dish list |
| Fan-friendly pricing stands | Four value stands | — | — | same | 2025-08-27 | Likely current | No | No SKUs |
| Marriott Center grill menu | Cougar Blue Burger, Brat-Tail, etc. | Basketball arena | — | dining.byu.edu basketball PDF | — | Outside stadium / arena-only | No | **Do not use** for football |

**Import:** none (no verified football dish SKUs).  
**Pending** empty launch. Alcohol not sold (BYU policy).

---

## 5. nippert-stadium (Cincinnati)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Donatos Pizza | Local pizza | Nippert Market | East/west | https://gobearcats.com/news/2025/08/7/bearcats-announce-2025-football-gameday-improvements | 2025-08-07 | Verified current | No | Vendor + Sodexo page |
| Skyline Chili | Cincinnati chili concept | Nippert Market + carts | Expanded 2025 | same | 2025-08-07 | Verified current | No | Import as Skyline Chili (partner signature) |
| Bibibop | Korean bowls | Nippert Market | — | same | 2025-08-07 | Verified current | No | Vendor; dish SKU not published — omit SKU invent |
| Milton’s Donuts | Local donuts | Nippert Market | — | same | 2025-08-07 | Verified current | No | Partner dessert |
| Classic steak sandwich | Rhine Room sandwich | Rhine Room (TUC lower) | Lower TUC | same | 2025-08-07 | Verified current | Mixed | Food item OK |
| Loaded nachos | Fully stacked nachos | The Loading Dock | Outside TUC loading dock | same | 2025-08-07 | Verified current | Mixed | Food OK; cocktails omitted |
| Hot dog | Value menu | 513 Stand | Concourse | same | 2025-08-07 | Verified current | No | $5 tier (press also cites) |
| Popcorn | Value menu | 513 Stand | Concourse | same | 2025-08-07 | Verified current | No | |
| Soft pretzel | Traditional fare | Sodexo concessions | Stadium | https://ucdining.sodexomyway.com/en-us/concessions/ | 2025 | Verified current | No | Listed on Sodexo page |
| CincyQ barbecue | BBQ | CincyQ Smokehouse | — | Sodexo page | 2025 | Likely current | No | Concept named; dish SKU thin |
| Philly Cheesesteaks | Stadium Philly | Sodexo | — | Sodexo page | 2025 | Verified current | No | |
| Burrito Bowls | Bowl concept | Sodexo | — | Sodexo page | 2025 | Verified current | No | |
| Fresh lemonade | Made-to-order | Black Market Saloon | — | UC 2025 release | 2025-08-07 | Likely current | Mixed | Spiked versions = alcohol omit |
| Rhinegeist beer | Local beer | Nippert Market | — | UC 2025 release | 2025-08-07 | Verified current | **Yes** | Omit |
| Beer Hall (Sheakley Lawn) | Beer destination | Sheakley Lawn | Outside bowl | UC 2025 release | 2025-08-07 | Outside / alcohol | **Yes** | Omit |

**Import:** Donatos Pizza; Skyline Chili; Milton’s Donuts; Rhine Room steak sandwich; Loading Dock loaded nachos; 513 hot dog; 513 popcorn; soft pretzel; Philly Cheesesteak; Burrito Bowl.  
**Omitted:** Bibibop (no dish SKU); alcohol brands; spiked lemonade; Sheakley Beer Hall.

---

## 6. folsom-field (Colorado)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Blackjack Pizza | Pizza (official sponsor) | Gate 8 stand; NW plateau | Gate 8 / Gate 19 area | https://cubuffs.com/news/2025/8/21/buffs-united | 2025-08-21 | Verified current | No | |
| Frippers gourmet hot dog | Gourmet hot dogs | Frippers | Gate 11 | same | 2025-08-21 | Verified current | No | |
| Chicken tamales | Chicken tamales | Gate 10 concession | Gate 10 | same | 2025-08-21 | Verified current | No | |
| Veggie tamales | Veggie tamales | Gate 10 concession | Gate 10 | same | 2025-08-21 | Verified current | No | |
| Chicken salad sandwich | New sandwich concept | SE Field House | SE Balch Fieldhouse | same | 2025-08-21 | Verified current | No | |
| Dill Pickle tots | Tater tot concept | Gate 7 | Gate 7 | same | 2025-08-21 | Verified current | No | |
| Buffalo chicken tots | Tater tot concept | Gate 7 | Gate 7 | same | 2025-08-21 | Verified current | No | |
| Flavor of Tabasco | Food truck | Plaza | Plaza | same | 2025-08-21 | Outside stadium | No | Omit |
| Folsom Food & Beverage Guide | Category filters (BBQ/Mexican/etc.) | Interactive | — | https://cubuffs.com/sports/2025/8/25/folsom-field-food-beverage | 2025-08-25 | Unverified | — | Categories only in fetch; no dish text |

**Import:** seven named 2025 athletics items (exclude plaza truck).  
**Omitted:** Flavor of Tabasco; beverages; alcohol brands.

---

## 7. tdecu-stadium (Houston)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ninfa’s (vendor) | Tex-Mex partner | Ninfa’s | Stadium | https://uhcougars.com/news/2025/8/22/football-new-food-offerings-inside-tdecu-stadium | 2025-08-22 | Likely current | No | Vendor only on athletics release |
| Layne’s Chicken Tenders | Chicken tenders brand | Layne’s | Stadium | same | 2025-08-22 | Likely current | No | Brand = product category; still thin SKU |
| Halal Guys | Halal street fare | Halal Guys | Stadium | same | 2025-08-22 | Likely current | No | Vendor only |
| Pizza Hut | Pizza | Pizza Hut | Stadium | same | 2025-08-22 | Likely current | No | Vendor only |
| Game Day Pretzels | Pretzel stand | Game Day Pretzels | — | same | 2025-08-22 | Likely current | No | Stand name only |
| Hot Rod Pops | Pops cart | Cart | — | same | 2025-08-22 | Likely current | No | |
| Trill Burgers | Returning burger vendor | Trill Burgers | — | https://www.chron.com/food/article/ninfas-houston-cougars-stadium-texas-21013717.php | 2025 | Likely current | No | Chron correction; no dish SKU |
| Thirst Down Bar / themed drinks | Bar / drinks | West endzone | West EZ | UH athletics | 2025-08-22 | Alcohol / beverage | **Yes** | Omit |

**Import:** none — athletics list is partner/stand names without dish SKUs.  
**Pending** empty launch. Do not invent Ninfa’s fajita / Halal platter SKUs.  
**Reconciliation:** five previously imported inferred dish rows remain in DB as **HIDDEN** (history preserved); public menu shows “Menu coming soon”.

---

## 8. jack-trice-stadium (Iowa State)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| We Will Pizza | NIL-collective pizza (Creasman Foods) | Stadium concessions | Inside Jack Trice | https://cyclones.com/news/2024/7/25/football-isu-and-we-will-collective-to-offer-we-will-pizza-inside-jack-trice-stadium | 2024-07-25 | Likely current | No | Official athletics; no 2025–26 removal found |
| Clone Cone | Red/yellow soft serve | Lower concourse | — | Third-party gameday guides | — | Unverified | No | Not on athletics release |
| Campbell’s pork tenderloin | Local tenderloin | — | — | Third-party guides / 2017 athletics | 2017+ | Historical only / Unverified | No | No 2024–26 athletics reconfirm |
| Fried Twinkies / cheese curds | Fair-style | — | — | Guides / 2017 | — | Historical only / Unverified | No | |
| Alcohol (beer/wine/RTD) | Stadium-wide starting 2026 | N/S gates & concourses | — | ISU AD announcement Jun 2026 | 2026-06 | Verified current | **Yes** | Policy only — omit brands |

**Import:** We Will Pizza only (Likely current — still official; mark confidence in JSON).  
**Conservative note:** If import pipeline requires *Verified current* only, treat as **pending**. Recommendation below uses Likely → **pending** for empty launch OR single-item import with Likely. **Final call: pending** (accuracy over count — 2024 item not reconfirmed for 2025–26).

**Revised:** `jack-trice-stadium` → **pending** (We Will Pizza documented as Likely, not Verified current).

---

## 9. david-booth-kansas-memorial-stadium (Kansas)

Renovated for 2025 reopen (no 2024 home football at The Booth). Do not use Allen Fieldhouse.

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 21-inch Philly sandwich | Oversized Philly | Stadium hospitality | Main / tasting | https://www.kansascity.com/sports/college/big-12/university-of-kansas/article311764499.html | 2025-08 | Verified current | No | Quoted KU hospitality GM Ryan Duncan |
| One-pound Bavarian pretzel | 1 lb pretzel | Stadium | — | same | 2025-08 | Verified current | No | |
| Johnny’s sauced chicken tenders | Tenders with Wilson’s sauce | Johnny’s Tavern / stadium | Concourse / Patio | same + https://kuathletics.com/news/2025/8/7/football-new-food-and-beverage-partners-for-david-booth-kansas-memorial-stadium-unveiled | 2025-08 | Verified current | No | |
| One-pound cheeseburger | On King’s Hawaiian bun | Stadium | — | KC Star | 2025-08 | Verified current | No | |
| Loaded chicken tinga nachos | 64-oz chicken tinga nachos | Stadium | — | KC Star | 2025-08 | Verified current | No | |
| Italian sub | Italian sub (sampled) | Stadium | — | KC Star | 2025-08 | Verified current | No | |
| Chick-fil-A chicken sandwich | Chain chicken | Chick-fil-A | Stadium | KU Athletics partners | 2025-08-07 | Verified current | No | Partner + standard CFA SKU |
| Princeton Popcorn | Local mushroom popcorn | Princeton Popcorn | Throughout | KU Athletics | 2025-08-07 | Verified current | No | |
| Serendipity Ice Cream | Premium ice cream / sorbet | Serendipity | Stadium | KU Athletics | 2025-08-07 | Verified current | No | |
| Tiki Taco | Tacos/burritos/bowls partner | Tiki Taco | Stadium | KU Athletics | 2025-08-07 | Likely current | No | Partner only — **no stadium dish SKU** → omit import |
| Bigg’s BBQ | Local BBQ partner | Bigg’s | Stadium | KU Athletics | 2025-08-07 | Likely current | No | Partner only — omit invented sandwich |
| Jack Stack BBQ | BBQ | Jayhawk Landing / premium | South EZ / premium | KU Athletics | 2025-08-07 | Premium only | No | Omit general import |
| Boulevard / Modelo / AB / Surfside / Jim Beam | Beverages | — | — | KU Athletics | 2025-08-07 | — | **Yes** | Omit |

**Import:** Philly sandwich; Bavarian pretzel; Johnny’s chicken tenders; Hawaiian-bun cheeseburger; chicken tinga nachos; Italian sub; Chick-fil-A chicken sandwich; Princeton Popcorn; Serendipity Ice Cream.  
**Omitted:** Tiki Taco / Bigg’s without SKUs; Jack Stack premium; alcohol.

---

## 10. bill-snyder-family-stadium (Kansas State)

Official athletics page: https://www.kstatesports.com/sports/2025/8/6/football-concessions (stand menus). Still the published football concessions page as of research date; treat as **Verified current** for published SKUs pending a 2026 food rewrite (alcohol expansion announced separately Jul 2026).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Southwest Wrap | Wrap | Stand 1 / 7 / 10 | 35 / 20 / 28 | kstatesports.com football-concessions | 2025-08-06 | Verified current | No | |
| Hot Dog | Hot dog | Stand 1 | 35 | same | 2025-08-06 | Verified current | No | |
| Snack Cup Egg & Cheese | Snack cup | Stand 1 / 10 | 35 / 28 | same | 2025-08-06 | Verified current | No | |
| Popcorn | Popcorn | Multiple | Multiple | same | 2025-08-06 | Verified current | No | |
| Potato Tornado | Fair-style | Everyday’s Saturday BBQ | Sec 3 | same | 2025-08-06 | Verified current | No | |
| BBQ Sandwich | BBQ | Everyday’s Saturday BBQ | Sec 3 | same | 2025-08-06 | Verified current | No | |
| BBQ Nachos | BBQ nachos | Everyday’s Saturday BBQ | Sec 3 | same | 2025-08-06 | Verified current | No | |
| BBQ Quesadillas | BBQ quesadillas | Everyday’s Saturday BBQ | Sec 3 | same | 2025-08-06 | Verified current | No | |
| Beef Walking Taco | Walking taco | Stand 3 | Sec 4 | same | 2025-08-06 | Verified current | No | |
| Chicken Walking Taco | Walking taco | Stand 3 | Sec 4 | same | 2025-08-06 | Verified current | No | |
| Cheeseburger & Fries | Burger basket | Stand 4 | Sec 7 | same | 2025-08-06 | Verified current | No | |
| Grilled Chicken Skewers | Skewers | Stand 4 | Sec 7 | same | 2025-08-06 | Verified current | No | |
| Cheeseburger | Burger | Stand 7 / 8 | 20 / 22 | same | 2025-08-06 | Verified current | No | |
| Meatball Sub | Sub | Stand 8 / 9 | 22 / 26 | same | 2025-08-06 | Verified current | No | |
| Pretzel | Soft pretzel | Stand 8 | 22 | same | 2025-08-06 | Verified current | No | |
| Chipotle Chicken and Raspberry Burrito | Signature burrito | EMAWCHOS | Sec 16 | same | 2025-08-06 | Verified current | No | |
| Jumbo Nachos | Nachos | EMAWCHOS | Sec 16 | same | 2025-08-06 | Verified current | No | |
| Hot Honey Chicken and Waffle Sandwich | Sandwich | Fair Favorites | Sec 15 | same | 2025-08-06 | Verified current | No | |
| Loaded Funnel Cake | Dessert | Fair Favorites | Sec 15 | same | 2025-08-06 | Verified current | No | |
| Chicken and Parmesan Sandwich | Sandwich | Gridiron Grill | Sec 14 | same | 2025-08-06 | Verified current | No | |
| French Fries | Fries | Gridiron Grill | Sec 14 | same | 2025-08-06 | Verified current | No | |
| Philly Cheese Wrap | Wrap | Wabash Wraps | Sec 13 | same | 2025-08-06 | Verified current | No | |
| Peanuts | Peanuts | Multiple | Multiple | same | 2025-08-06 | Verified current | No | Snack |
| Domestic / Premium Beer | Beer | Terraces | N/S Terrace | same | 2025-08-06 | Verified current | **Yes** | Omit; 2026 expands stadium-wide |

**Import:** all non-alcohol food rows above (dedupe logical SKUs in JSON).  
**Omitted:** beer; souvenir soda (beverage packaging).

---

## 11. boone-pickens-stadium (Oklahoma State)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chick-fil-A / Rib Crib / Freddy’s / Mazzio’s / Fry Bread Tacos / etc. | Vendor map | Multiple | Plaza / L1 / L2 | 2023 concessions diagram; 2024 map PDF | 2023–2024 | Historical only | Mixed | No 2025–26 athletics item/SKU release found |
| Generic stadium fare | Hot dogs, burgers, etc. | — | — | Tertiary “what to expect” blogs | — | Unverified | No | Do not import |

**Import:** none. **Pending.**

---

## 12. amon-g-carter-stadium (TCU)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Half Acre Korean Corn Dog | Hot dog + mozzarella, ube batter, panko, ube powder, sweet-spicy honey | TCU / Sodexo | Sec 109 | https://www.star-telegram.com/sports/college/big-12/texas-christian-university/article312052187.html (TCU Athletics) | 2025-09-10 | Verified current | No | Debuted Family Weekend 2025; Foodservice Director: season offering |
| Jackfruit barbecue sandwich | Vegan BBQ, slaw, pickles, GF bun | Sodexo | — | https://www.foodservicedirector.com/colleges-universities/sodexo-team-brings-a-spark-of-joy-to-texas-christian-university-game-day-dining | 2025 | Likely current | No | Trade press quoting Sodexo chef — not athletics URL |
| Brisket poutine | Brisket, cheese curds, fries | Sodexo | — | same | 2025 | Likely current | No | Trade press |
| Taste of Funkytown staples | Hot dog, nachos, pretzel, popcorn, chopped beef | Taste of Funkytown | Stadium-wide | Stadium Journey / TripBalls | — | Unverified | No | Not 2024–26 athletics SKU list |
| Happy Hour $3 food | Hot dog / nachos / popcorn / peanuts | Concessions | Pre-kick | Older gofrogs releases | 2022 | Historical only | Mixed | Pricing program; not a SKU list |
| Chicken Express / Bobby’s Fajitas / Buffalo Bros / Pardon My Cheesesteak / Ben’s / Riff Ram BBQ | Local vendors | Multiple | Stadium | Star-Telegram vendor list 2025 | 2025-09 | Likely current | No | Vendors without dish SKUs → omit invent |
| Coors Banquet Bar cart | Beer cart | Cart | — | Star-Telegram | 2025-09 | — | **Yes** | Omit |

**Import:** Half Acre Korean Corn Dog only (conservative).  
**Omitted:** trade-press-only jackfruit/poutine; vendor names without SKUs; alcohol; happy-hour pricing history.

---

## 13. galaxy-stadium (Texas Tech)

**Display name:** Galaxy Stadium (formerly Jones AT&T Stadium). Naming rights announced 2026-07-17 for 2026 season.

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Stand directory only | Slice of Raiderland, Hub City Eats, 1923 Fry House, Fan Fare, Lone Star Grill, End Zone BBQ, SEZ Big Chicken, etc. | 17 stands + portables | W/E/SEZ | https://texastech.com/sports/2022/8/12/jones-concession-menus | undated / legacy Jones branding | Unverified | — | Page lists stand names; football dish menus not in HTML |
| George Strait concert menus | Pizza, fry baskets, etc. | Concert stands | Stadium | https://texastech.com/sports/2025/9/30/concert | 2025-09 | Temporary / non-football | Mixed | **Not** football gameday — omit |

**Import:** none. **Pending** until Galaxy-era football SKUs publish.

---

## 14. acrisure-bounce-house (UCF)

**Display name:** Acrisure Bounce House (formerly FBC Mortgage Stadium; rename effective 2025-07-01). Levy partnership 2025.

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| The Black & Gold Dog | Stadium classic dog | O-Town Links & Stadium Classics | 102, 103, 121 + | https://ucfknights.com/news/2025/8/20/the-guide-in-25 | 2025-08-20 | Verified current | No | Named staple |
| Dog of the Game (rotating) | Opponent-themed dogs | Stadium Classics / O-Town Links / Club | Multiple | same | 2025-08-20 | Temporary | No | Per-game — omit import |
| Intense Nacho Cubano Walking Taco | Walking taco | Cuban Kitchen | Concourse | same | 2025-08-20 | Verified current | No | |
| Havana Cold Noodle Bowl | Cold noodle bowl | Cuban Kitchen | Concourse | same | 2025-08-20 | Verified current | No | |
| Loaded Knight Nachos | Loaded nachos | Señor Knights | Concourse | same | 2025-08-20 | Verified current | No | |
| Tres Mojo Tacos (Pork) | Pork taco | Señor Knights | Concourse | same | 2025-08-20 | Verified current | No | |
| Tres Mojo Tacos (Chicken) | Chicken taco | Señor Knights | Concourse | same | 2025-08-20 | Verified current | No | |
| Tres Mojo Tacos (Avocado) | Avocado taco | Señor Knights | Concourse | same | 2025-08-20 | Verified current | No | |
| Big 12 Eats rotating specials | Opponent-inspired dishes | Club / Cabana / Orlando Eats | 108 / Cabana / 129–228 | same | 2025-08-20 | Temporary / Premium mix | No | Omit |
| Smash Burger / Carved Sandwiches | Premium | Carl Black & Gold Cabana | Premium | same | 2025-08-20 | Premium only | No | Omit |
| Bounce House Box | Hot dog, water, chips, dessert | O-Town Links | Student | same | 2025-08-20 | Verified current | No | Student ID |
| Student $2 hot dog / popcorn | Value | O-Town Links | Student | same | 2025-08-20 | Verified current | No | Student exclusives — import hot dog/popcorn as available items |
| Four Rivers BBQ (older guides) | Local BBQ | — | — | TripBalls etc. | — | Unverified / Historical | No | Not in Guide in ’25 Levy list |

**Import:** Black & Gold Dog; Intense Nacho Cubano Walking Taco; Havana Cold Noodle Bowl; Loaded Knight Nachos; Tres Mojo Tacos (pork/chicken/avocado); Bounce House Box components as hot dog if needed — prefer named dishes only. Student popcorn.  
**Omitted:** rotating Dog of the Game / Big 12 Eats; premium cabana; alcohol.

---

## 15. rice-eccles-stadium (Utah)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Traditional / portable / East Eats trucks | Unspecified | Multiple | Concourse / East | https://www.stadium.utah.edu/stadium-guest-information/ | 2024–25 | Unverified | — | Locations only |
| Grab-and-go west store | Snacks | West grab-and-go | West | Deseret News 2025-09-03 | 2025-09 | Likely current | No | No SKUs |
| Mobile-order stands 15 / 32 | Mobile only | Stands 15, 32 | W/E | same | 2025-09 | Likely current | No | Ops only |
| 2024 concessions PDF map | Map | — | — | utahutes.com 2024 PDF | 2024 | Historical only | — | Locations, not dishes |

**Import:** none. **Pending.**

---

## 16. milan-puskar-stadium (West Virginia)

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pepperoni Roll | Fan First price $3.50 | Red Zone Grill, Play Action Pizza, Endzone Eats, Field Goal Fare | Stands 4, 11, 14, 18, 26 | https://wvusports.com/news/2024/8/16/football-fan-first-concession-pricing-and-season-ticket-holder-deals-of-the-game-return | 2024-08-16 | Likely current | No | 2024 Fan First; Sodexo still markets Julia’s |
| Julia’s Pepperoni Rolls | Signature pepperoni rolls | Stadium | — | https://wvuconcessions.sodexomyway.com/en-us/locations/milan-puskar-football-stadium | current Sodexo | Likely current | No | Official concessionaire page |
| WV Dog | Signature hot dog | Stadium | — | Sodexo page | current | Likely current | No | Named on Sodexo stadium page |
| Popcorn | Fan First $3 | Fan First stands | Same stands | WVU Athletics 2024 | 2024-08-16 | Likely current | No | |
| Fountain Drink | Fan First $3 | Fan First stands | — | WVU Athletics 2024 | 2024-08-16 | Likely current | No | Beverage — omit food import |

**Import:** none under strict Verified-current rule (2024 pricing release + undated Sodexo blurbs = Likely). **Pending.**  
If pipeline later accepts Likely: Julia’s Pepperoni Roll, WV Dog, popcorn.

---

## Final import vs pending

### Import (verified-current food in JSON)

1. **mclane-stadium** — Fall 2026 Fan First food SKUs  
2. **bill-snyder-family-stadium** — published stand food menus  
3. **folsom-field** — 2025 Buffs United named items  
4. **david-booth-kansas-memorial-stadium** — hospitality-named + partner CFA/Princeton/Serendipity  
5. **acrisure-bounce-house** — Guide in ’25 concourse named dishes  
6. **nippert-stadium** — 2025 UC / Sodexo named food  
7. **mountain-america-stadium** — 2025 named dishes + CFA  
8. **amon-g-carter-stadium** — Half Acre Korean Corn Dog  
9. **casino-del-sol-stadium** — Bear Down Deals hot dog / nachos / popcorn  

### Pending (empty menu launch)

10. **tdecu-stadium** — vendors without dish SKUs  
11. **lavell-edwards-stadium** — no football SKU list  
12. **jack-trice-stadium** — only Likely (We Will Pizza 2024)  
13. **boone-pickens-stadium** — maps aged out  
14. **galaxy-stadium** — rename; no football SKUs  
15. **rice-eccles-stadium** — ops only  
16. **milan-puskar-stadium** — Likely only (2024 Fan First / Sodexo blurbs)  

---

## Sources index (selected)

- https://arizonawildcats.com/news/2025/11/17/football-arizona-athletics-and-casino-del-sol-announce-transformative-60-million-plus-stadium-naming-rights-partnership.aspx  
- https://arizonawildcats.com/news/2025/8/13/arizona-football-top-2025-gameday-improvements.aspx  
- https://arizonawildcats.com/news/2024/8/26/general-top-five-enhancements-to-the-fan-experience-at-arizona-stadium-in-2024  
- https://thesundevils.com/facilities-venues/mountain-america-stadium  
- https://www.phoenixnewtimes.com/food-drink/asu-offers-new-stadium-food-options-for-the-2025-football-season-22757217/  
- https://baylorbears.com/news/2026/2/18/athletic-news-baylor-athletics-fan-first-concessions-pricing-is-here  
- https://baylorbears.com/news/2025/8/28/fan-experience-2025-football-concessions-offerings-revealed  
- https://byucougars.com/news/2025/08/27/byu-football-gameday-information-for-the-2025-season  
- https://gobearcats.com/news/2025/08/7/bearcats-announce-2025-football-gameday-improvements  
- https://ucdining.sodexomyway.com/en-us/concessions/  
- https://cubuffs.com/news/2025/8/21/buffs-united  
- https://uhcougars.com/news/2025/8/22/football-new-food-offerings-inside-tdecu-stadium  
- https://cyclones.com/news/2024/7/25/football-isu-and-we-will-collective-to-offer-we-will-pizza-inside-jack-trice-stadium  
- https://kuathletics.com/news/2025/8/7/football-new-food-and-beverage-partners-for-david-booth-kansas-memorial-stadium-unveiled  
- https://www.kansascity.com/sports/college/big-12/university-of-kansas/article311764499.html  
- https://www.kstatesports.com/sports/2025/8/6/football-concessions  
- https://www.star-telegram.com/sports/college/big-12/texas-christian-university/article312052187.html  
- https://www.learfield.com/2026/07/texas-tech-athletics-secures-landmark-naming-rights-agreement-with-galaxy/  
- https://texastech.com/sports/2022/8/12/jones-concession-menus  
- https://ucfknights.com/news/2025/8/20/the-guide-in-25  
- https://wvusports.com/news/2024/8/16/football-fan-first-concession-pricing-and-season-ticket-holder-deals-of-the-game-return  
- https://wvuconcessions.sodexomyway.com/en-us/locations/milan-puskar-football-stadium  
