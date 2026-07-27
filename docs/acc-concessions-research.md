# ACC football concessions research (Phase 5)

Prefer 2024–2026 official athletics / stadium food pages / concessionaire / primary local reporting.
Import rule: **verified-current food only**. Accuracy over count.
No existing deep ACC football menus assumed for overwrite (Hard Rock may already have NFL-tenant rows — do not treat as college-verified without shared confirmation).

Research date: 2026-07-27 (pre–Fall 2026 season).

Confidence labels: Verified current | Likely current | Historical only | Temporary | Premium only | Outside stadium | Unverified

---

## Naming notes (verify current display)

| Program | Official / current display | Formerly / notes | Slug | Verified |
| --- | --- | --- | --- | --- |
| Boston College | **Alumni Stadium** | — | `alumni-stadium` | Current |
| California | **California Memorial Stadium** | — | `california-memorial-stadium` | Current |
| Clemson | **Frank Howard Field at Memorial Stadium** | Death Valley (nickname) | `memorial-stadium-clemson` | Current athletics |
| Duke | **Brooks Field at Wallace Wade Stadium** | Wallace Wade Stadium | `wallace-wade-stadium` | Current A-Z |
| Florida State | **Bobby Bowden Field at Doak S. Campbell Stadium** | Doak Campbell Stadium | `doak-campbell-stadium` | Current; renovations 2024–25 |
| Georgia Tech | **Bobby Dodd Stadium at Hyundai Field** | Bobby Dodd Stadium / Historic Grant Field | `bobby-dodd-stadium-at-hyundai-field` | Hyundai naming rights |
| Louisville | **L&N Federal Credit Union Stadium** | Papa John's Cardinal Stadium | `l-n-federal-credit-union-stadium` | Current naming rights |
| Miami | **Hard Rock Stadium** | — | `hard-rock-stadium` | SHARED NFL Dolphins |
| North Carolina | **Kenan Memorial Stadium** | Kenan Stadium (short) | `kenan-memorial-stadium` | Current |
| NC State | **Carter-Finley Stadium** | — | `carter-finley-stadium` | Current |
| Pitt | **Acrisure Stadium** | Heinz Field | `acrisure-stadium` | SHARED NFL Steelers |
| SMU | **Gerald J. Ford Stadium** | — | `gerald-j-ford-stadium` | Current |
| Stanford | **Stanford Stadium** | — | `stanford-stadium` | Current |
| Syracuse | **JMA Wireless Dome** | Carrier Dome | `jma-wireless-dome` | Rename post-2021 |
| Virginia | **Scott Stadium** | Carl Smith Center complex | `scott-stadium` | Current |
| Virginia Tech | **Lane Stadium** | — | `lane-stadium` | Current |
| Wake Forest | **Allegacy Federal Credit Union Stadium** | BB&T Field | `allegacy-federal-credit-union-stadium` | Current naming rights |

---

## Import recommendation summary

| Slug | Status | Verified items | Rationale |
| --- | --- | ---: | --- |
| `alumni-stadium` | **import** | 7 | BC Dining official page names lobster rolls, BBQ, Meatball Obsession + classics |
| `california-memorial-stadium` | **pending** | 0 | 2024 EHS vendor roster only — no dish SKUs |
| `memorial-stadium-clemson` | **import** | 6 | 2025 Nuk Hopkins X Smitty's BBQ named menu (Gate 9); Aramark staples unpublished |
| `wallace-wade-stadium` | **pending** | 0 | Undated concessions PDF; 2025 A-Z has partner only |
| `doak-campbell-stadium` | **import** | 13 | Live FSU athletics concessions page with named GF/veg + stand items |
| `bobby-dodd-stadium-at-hyundai-field` | **import** | 14 | GT Athletics 2024 What's New named Chicken Salad Chick / Cajun nachos / Water Ice |
| `l-n-federal-credit-union-stadium` | **import** | 19 | Official 2025 L&N concessions directory PDF |
| `hard-rock-stadium` | **import** | 5 | UM student paper Nov 2025 Canes-game sampling only — NOT full NFL map |
| `kenan-memorial-stadium` | **import** | 22 | UNC Athletics 2024 Know Before You Go + 2025 What's New named dishes |
| `carter-finley-stadium` | **import** | 4 | NC State Athletics 2025 enhancements (Alpaca, Wolf & Hen, Chick-fil-A) |
| `acrisure-stadium` | **pending** | 0 | Shared Steelers venue; Pitt defers to stadium NFL F&B maps |
| `gerald-j-ford-stadium` | **import** | 4 | SMU Athletics 2024 ACC gameday release named Antone's / kettle corn / etc. |
| `stanford-stadium` | **import** | 3 | Stanford Athletics 2025 Levy refresh named Chick-fil-A / Rita's / Wetzel's |
| `jma-wireless-dome` | **import** | 15 | Syracuse Campus Dining live stand menus + 2024 athletics meal deal |
| `scott-stadium` | **import** | 19 | Virginia Athletics football gameday concessions stand menus |
| `lane-stadium` | **import** | 5 | Virginia Tech Athletics 2024 Fan-Friendly + Lane Legs + BBQ pork |
| `allegacy-federal-credit-union-stadium` | **pending** | 0 | 2023 detailed list not reconfirmed 2024–26 |

Machine JSON: `/tmp/acc-concessions-verified.json`

---

## 1. alumni-stadium (Boston College)

**Import recommendation:** **IMPORT** (7 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Hot Dog | Traditional stadium hot dog | BC Dining | — | https://www.bc.edu/content/bc-web/offices/aux-services/sites/dining/locations/Concessions.html | 2025+ | Verified current | No |  |
| Soft Pretzel | Stadium soft pretzel | BC Dining | — | https://www.bc.edu/content/bc-web/offices/aux-services/sites/dining/locations/Concessions.html | 2025+ | Verified current | No |  |
| Popcorn | Stadium popcorn | BC Dining | — | https://www.bc.edu/content/bc-web/offices/aux-services/sites/dining/locations/Concessions.html | 2025+ | Verified current | No |  |
| Ice Cream | Stadium ice cream | BC Dining | — | https://www.bc.edu/content/bc-web/offices/aux-services/sites/dining/locations/Concessions.html | 2025+ | Verified current | No |  |
| Lobster Roll | New England lobster roll | BC Dining / New England Classics | — | https://www.bc.edu/content/bc-web/offices/aux-services/sites/dining/locations/Concessions.html | 2025+ | Verified current | No |  |
| BBQ | BBQ offerings (brisket/pulled pork style stands) | BC Dining BBQ | — | https://www.bc.edu/content/bc-web/offices/aux-services/sites/dining/locations/Concessions.html | 2025+ | Verified current | No |  |
| Meatball Obsession | Meatballs (cup-style Meatball Obsession concept) | Meatball Obsession | — | https://www.bc.edu/content/bc-web/offices/aux-services/sites/dining/locations/Concessions.html | 2025+ | Verified current | No |  |

**Import:** Hot Dog; Soft Pretzel; Popcorn; Ice Cream; Lobster Roll; BBQ; Meatball Obsession.

**Omitted:**
- Beer and wine brand lists — Alcohol — omit
- TSR stand-level SKUs (Philly, pizza, clam chowder) — Secondary aggregator; not reconfirmed on official BC Dining page
- Food trucks outside stadium — Outside / pre-kickoff only per BC athletics A-Z

**Sources:**
- https://www.bc.edu/content/bc-web/offices/aux-services/sites/dining/locations/Concessions.html
- https://bceagles.com/sports/2025/8/27/football-gameday-information

---

## 2. california-memorial-stadium (California)

**Display / scope notes:** Levy operates; vendor roster verified Nov 2024 but accuracy-over-count → empty pending

**Import recommendation:** **PENDING** (0 verified-current items for import).

No verified-current dish SKUs meeting import bar.

**Import:** none (pending empty launch / Menu coming soon).

**Omitted:**
- Starbird Chicken / Blue Line Pizza / Oski Place BBQ / Evergood Sausages / Da Poke Man — Nov 2024 EHS vendor inspections confirm concepts; no published dish SKUs
- 2022 Levy partner launch dishes — Historical — not reconfirmed with 2025–26 SKUs
- Oski's Village / Memorial Glade food trucks — Outside stadium fan fest

**Sources:**
- https://ehs.berkeley.edu/publications/california-memorial-stadium-concessions
- https://calbears.com/sports/2023/9/6/2019-cal-football-gameday-a-to-z-guide.aspx

---

## 3. memorial-stadium-clemson (Clemson)

**Display / scope notes:** Display: Frank Howard Field at Memorial Stadium; nickname Death Valley

**Import recommendation:** **IMPORT** (6 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Brisket Sandwich | Brisket sandwich from Nuk Hopkins X Smitty's BBQ truck | Nuk Hopkins X Smitty's BBQ | Gate 9 inside stadium | https://www.theclemsoninsider.com/2025/08/28/hopkins-opens-bbq-food-truck-at-death-valley/ | 2025-08-28 | Verified current | No |  |
| Pulled Pork Sandwich | Pulled pork sandwich | Nuk Hopkins X Smitty's BBQ | Gate 9 | https://www.theclemsoninsider.com/2025/08/28/hopkins-opens-bbq-food-truck-at-death-valley/ | 2025-08-28 | Verified current | No |  |
| Pulled Chicken Sandwich | Pulled chicken sandwich | Nuk Hopkins X Smitty's BBQ | Gate 9 | https://www.theclemsoninsider.com/2025/08/28/hopkins-opens-bbq-food-truck-at-death-valley/ | 2025-08-28 | Verified current | No |  |
| Wings | BBQ / soul-food wings | Nuk Hopkins X Smitty's BBQ | Gate 9 | https://www.theclemsoninsider.com/2025/08/28/hopkins-opens-bbq-food-truck-at-death-valley/ | 2025-08-28 | Verified current | No |  |
| Soul Rolls | Soul rolls (featured menu item) | Nuk Hopkins X Smitty's BBQ | Gate 9 | https://www.theclemsoninsider.com/2025/08/28/hopkins-opens-bbq-food-truck-at-death-valley/ | 2025-08-28 | Verified current | No |  |
| Bang Bang Fries | Bang Bang Fries | Nuk Hopkins X Smitty's BBQ | Gate 9 | https://www.theclemsoninsider.com/2025/08/28/hopkins-opens-bbq-food-truck-at-death-valley/ | 2025-08-28 | Verified current | No |  |

**Import:** Brisket Sandwich; Pulled Pork Sandwich; Pulled Chicken Sandwich; Wings; Soul Rolls; Bang Bang Fries.

**Omitted:**
- Generic Aramark staples (hot dogs, burgers, mac bowls) — Fan forum / older Stadium Journey; no 2025 athletics dish SKU list
- Clemson Bird Dog — Guide/cult favorite — not athletics-verified 2025
- Alcohol brand lists (new 2025 sales) — Alcohol — omit
- $3 bottled water — Beverage packaging only

**Sources:**
- https://www.theclemsoninsider.com/2025/08/28/hopkins-opens-bbq-food-truck-at-death-valley/
- https://clemsontigers.com/clemson-football-gameday
- https://clemsontigers.com/clemson-athletics-announces-enhancements-to-football-gameday-experience/

---

## 4. wallace-wade-stadium (Duke)

**Display / scope notes:** Official display includes Brooks Field at Wallace Wade Stadium

**Import recommendation:** **PENDING** (0 verified-current items for import).

No verified-current dish SKUs meeting import bar.

**Import:** none (pending empty launch / Menu coming soon).

**Omitted:**
- Blue Devil Concessions PDF dishes (Bojangles, Papa John's, Hog Heaven BBQ, Greek Eats, etc.) — Undated PDF; 2025 A-Z confirms Proof of the Pudding partner but no fresh dish SKUs
- Devils Deck inclusive F&B — Premium-only
- Alcohol (beer/seltzer/canned cocktails) — Alcohol — omit

**Sources:**
- https://goduke.com/sports/2022/7/25/brooks-field-at-wallace-wade-stadium
- https://static.goduke.com/custompages/web-docs/a-z_guides/football/football_concessions.pdf

---

## 5. doak-campbell-stadium (Florida State)

**Display / scope notes:** Official display: Bobby Bowden Field at Doak S. Campbell Stadium; major renovations through 2025 — re-verify map after reopen

**Import recommendation:** **IMPORT** (13 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Stadium Nachos | Stadium nachos at Unconquered Snacks | Unconquered Snacks | — | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Jumbo Pretzel | Jumbo soft pretzel | Unconquered Snacks / Pretzel stands | — | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Popcorn | Stadium popcorn | Unconquered Snacks / SunStop / Burger stands | — | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Loaded Tots | Loaded tots | Fried Food | Main 128 / Upper 136 | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Chili Cheese Tots | Chili (no meat) cheese tots | Fried Food | — | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Fried Pickle Spears | Fried pickle spears | Fried Food | — | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Apple Pie Bites | Apple pie bites | Fried Food | — | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Dippin' Dots | Dippin' Dots novelty ice cream | Dippin' Dots | — | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Pasta Salad | Pasta salad | Chicken Salad Chick | Main 116 & 124 | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Broccoli Salad | Broccoli salad | Chicken Salad Chick | — | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Crudité Cup | Crudité cup | SunStop Fresh Eats | Main 134 / Upper 137 | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Mac N Cheese | Mac and cheese | BBQ stand | Main/Upper 118 | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |
| Kowalski Sausage | Kowalski sausage | Kowalski Sausage | Upper 131 | https://seminoles.com/sports/2023/6/27/football-concessions | live-athletics-page | Verified current | No |  |

**Import:** Stadium Nachos; Jumbo Pretzel; Popcorn; Loaded Tots; Chili Cheese Tots; Fried Pickle Spears; Apple Pie Bites; Dippin' Dots; Pasta Salad; Broccoli Salad; Crudité Cup; Mac N Cheese; Kowalski Sausage.

**Omitted:**
- eathealthy365 2026 fancy names (War Chant Brat, Spear-it-ed Tacos, etc.) — Secondary blog — inferred/unverified SKUs
- Ticketmaster Chick-fil-A / Brisas / Shake's claims — Not on live FSU athletics concessions page
- Bud Light Party Zone / Touchdown Taphouse alcohol — Alcohol — omit
- Generic Burgers/Chicken/Tex-Mex category stands without dish names — Category labels only — no dish SKUs

**Sources:**
- https://seminoles.com/sports/2023/6/27/football-concessions

---

## 6. bobby-dodd-stadium-at-hyundai-field (Georgia Tech)

**Display / scope notes:** Naming rights: Bobby Dodd Stadium at Hyundai Field

**Import recommendation:** **IMPORT** (14 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| The Stadium Chick | Scoop or sandwich of chicken salad with broccoli salad or chips and buttercream cookie | Chicken Salad Chick | West Festival Sec 110 | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Classic Carol Chicken Salad | All-white shredded chicken salad | Chicken Salad Chick | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Fancy Nancy Chicken Salad | Chicken salad with Fuji apples, grapes, pecans | Chicken Salad Chick | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Buffalo Barclay Chicken Salad | Buffalo-style chicken salad | Chicken Salad Chick | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Sassy Scotty Chicken Salad | Ranch, bacon, cheddar chicken salad | Chicken Salad Chick | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Cajun Pot Roast Nachos | Cajun pot roast nachos | Cajun Nachos / SOCA area | West Festival Sec 108 | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Blackened Chicken Nachos | Blackened chicken nachos | Cajun Nachos | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Crawfish Etouffee Nachos | Crawfish etouffee nachos | Cajun Nachos | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Vegetarian Red Beans and Rice Nachos | Vegetarian red beans and rice nachos | Cajun Nachos | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Burrito with Chips and Salsa | Burrito with chips and salsa | Cajun Nachos | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Bread Pudding a la Mode | Bread pudding a la mode | Cajun Nachos | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Cajun Boiled Peanuts | Cajun boiled peanuts | Cajun Nachos | — | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Philly Water Ice | Italian water ice (watermelon, mango, strawberry lemonade, blueberry, cherry) | Philly Water Ice | All concourses | https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/ | 2024-08-29 | Verified current | No |  |
| Chick-fil-A Chicken Sandwich | Chain chicken sandwich | Chick-fil-A | Secs 104, 113, 123 | https://ramblinwreck.com/football-concessions/ | 2024-map | Likely current | No |  |

**Import:** The Stadium Chick; Classic Carol Chicken Salad; Fancy Nancy Chicken Salad; Buffalo Barclay Chicken Salad; Sassy Scotty Chicken Salad; Cajun Pot Roast Nachos; Blackened Chicken Nachos; Crawfish Etouffee Nachos; Vegetarian Red Beans and Rice Nachos; Burrito with Chips and Salsa; Bread Pudding a la Mode; Cajun Boiled Peanuts; Philly Water Ice; Chick-fil-A Chicken Sandwich.

**Omitted:**
- Papa John's / Sonny's BBQ / Williamson Bros BBQ / Tech Classics / Tech Grill — 2024 map vendors without published dish SKUs
- SOCA Caribbean Kitchen — Vendor only on map
- Goal Line Club F&B — Premium-only
- New Realm / Wild Leap alcohol brands — Alcohol — omit
- Gate 9 food trucks — Rotating / no fixed SKUs
- The Varsity across North Avenue — Outside stadium

**Sources:**
- https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/
- https://ramblinwreck.com/football-concessions/
- https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-in-2025/

---

## 7. l-n-federal-credit-union-stadium (Louisville)

**Display / scope notes:** Formerly Papa John's Cardinal Stadium; current L&N Federal Credit Union Stadium

**Import recommendation:** **IMPORT** (19 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Barry's Cheesesteak | Philly-style cheesesteak | Barry's Cheesesteak | Sec 303 | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Floyd & Central BBQ Loaded Nachos | Loaded nachos from Floyd & Central BBQ | Floyd & Central BBQ | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Game Day Grind Burger | Game Day Grind burger | Game Day Grind Burger | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Bird Dogs | Bird Dogs specialty item | Bird Dogs | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Stick N Dip Corn Dogs | Corn dogs | Stick N Dip Corn Dogs | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Fistful of Tacos | Tacos | Fistful of Tacos | Secs 112 & 125 | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Touchdown Turkey Legs | Turkey legs | Touchdown Turkey Legs | Sec 113 | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Ben's Soft Pretzel | Ben's pretzels | Ben's Pretzels | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Papa Murphy's Pizza | Pizza from Papa Murphy's stands | Papa Murphy's | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Scragglepop Kettle Corn | Kettle corn | Scragglepop | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Over the Pop | Specialty popcorn | Over the Pop | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Ehrler's Ice Cream | Ehrler's ice cream | Ehrler's | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Jimmy John's Sandwich | Jimmy John's sandwiches | Jimmy John's | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Hot Dog | Hot dog (Gridiron Grill / Fanfare Classics staples) | Gridiron Grill / Fanfare Classics | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Nachos | Nachos | Gridiron Grill / Fanfare Classics | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Chicken Tenders | Chicken tenders | Gridiron Grill | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Bratwurst | Brats | Gridiron Grill | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| French Fries | Fries | Gridiron Grill | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |
| Soft Pretzel | Soft pretzel | Gridiron Grill / Fanfare Classics | — | https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf | 2025-08 | Verified current | No |  |

**Import:** Barry's Cheesesteak; Floyd & Central BBQ Loaded Nachos; Game Day Grind Burger; Bird Dogs; Stick N Dip Corn Dogs; Fistful of Tacos; Touchdown Turkey Legs; Ben's Soft Pretzel; Papa Murphy's Pizza; Scragglepop Kettle Corn; Over the Pop; Ehrler's Ice Cream; Jimmy John's Sandwich; Hot Dog; Nachos; Chicken Tenders; Bratwurst; French Fries; Soft Pretzel.

**Omitted:**
- Cardinale / Ten20 / Railbirds / Angel's Envy alcohol — Alcohol brand catalog — omit
- Cheezy Does It (2023 announcement) — Not clearly labeled on 2025 directory extract
- Stacked / Clucked / Nacho Nation / Red Nest Grill — 2025 map labels without dish SKUs
- Moutoux roasted nuts — Snack brand; optional omit as non-featured

**Sources:**
- https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf
- https://gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf

---

## 8. hard-rock-stadium (Miami)

**Display / scope notes:** SHARED with NFL Dolphins — import only college-confirmed (UM student paper at Canes game Nov 2025). Prefer athletics notes; stadium maps alone are insufficient.

**Import recommendation:** **IMPORT** (5 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cuban Sandwich | Cuban sandwich from self-service storefront (sampled at Hurricanes game) | Hard Rock concessions / Cuban concept | — | https://themiamihurricane.com/2025/11/19/hard-rock-stadium-food-whats-worth-it-and-whats-not/ | 2025-11-19 | Verified current | No |  |
| Fries | Fries paired with Cuban sandwich grab-and-go | Hard Rock concessions | — | https://themiamihurricane.com/2025/11/19/hard-rock-stadium-food-whats-worth-it-and-whats-not/ | 2025-11-19 | Verified current | No |  |
| Chicken Shawarma | Chicken shawarma wrap built to order | Hard Rock concessions / Middle Eastern | — | https://themiamihurricane.com/2025/11/19/hard-rock-stadium-food-whats-worth-it-and-whats-not/ | 2025-11-19 | Verified current | No |  |
| Lobster Roll | Lobster roll (available; pricey) | Hard Rock concessions | — | https://themiamihurricane.com/2025/11/19/hard-rock-stadium-food-whats-worth-it-and-whats-not/ | 2025-11-19 | Verified current | No |  |
| Mac and Cheese | Side mac and cheese | Hard Rock concessions | — | https://themiamihurricane.com/2025/11/19/hard-rock-stadium-food-whats-worth-it-and-whats-not/ | 2025-11-19 | Verified current | No |  |

**Import:** Cuban Sandwich; Fries; Chicken Shawarma; Lobster Roll; Mac and Cheese.

**Omitted:**
- Full Hard Rock Stadium concessions map / Dolphins NFL vendor catalog — Shared NFL venue — do not import Dolphins-only/NFL map dump without college confirmation
- Existing StadiumSlop Hard Rock NFL-oriented rows not re-verified for UM football — Tenant-scope caution
- Alcohol brand lists — Alcohol — omit

**Sources:**
- https://themiamihurricane.com/2025/11/19/hard-rock-stadium-food-whats-worth-it-and-whats-not/
- https://www.hardrockstadium.com/concessions/
- https://miamihurricanes.com/

---

## 9. kenan-memorial-stadium (North Carolina)

**Import recommendation:** **IMPORT** (22 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bojangles Chicken Supremes | Bojangles Chicken Supremes & fries | Bojangles | West EndZone 116, Gate 2, Gate 6 | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Salvio's Burger (Ramses Style) | Salvio's burger Ramses style (GF option noted) | Salvio's | West Endzone | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Domino's Pizza | Domino's pizza | Domino's | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Chick-fil-A Chicken Sandwich | Chick-fil-A sandwich | Chick-fil-A | Portable Sec 109 | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Hot Dog | Carolina Classics hot dog | Carolina Classics | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Soft Pretzel | Carolina Classics pretzel | Carolina Classics | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Popcorn | Carolina Classics popcorn | Carolina Classics | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Smoked & Pulled Pork Sandwich | Best Blue BBQ smoked & pulled pork sandwich | Best Blue BBQ | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Pulled Pork Nachos | Pulled pork nachos | Best Blue BBQ | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Cole Slaw | Cole slaw | Best Blue BBQ | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Street Nachos | Modelo Cantina street nachos | Modelo Cantina | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Pork Carnitas Nachos | Pork carnitas nachos | Modelo Cantina | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Tinga Chicken Nachos | Tinga chicken nachos | Modelo Cantina | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Footlong Carolina Dog | Footlong Carolina Dog | Top Dogs | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Footlong Halftime Dog | Footlong Halftime Dog | Top Dogs | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Carolina Crunch | Stadium Scoops Carolina Crunch | Stadium Scoops | — | https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024 | 2024-09-04 | Verified current | No |  |
| Merritt's BLT | Famous Merritt's Grill BLT | Merritt's Grill | Gate 2 Kenan Pines | https://goheels.com/news/2025/8/22/football-whats-new-in-kenan-stadium-in-2025 | 2025-08-22 | Verified current | No |  |
| Merritt's Banana Pudding | Banana pudding | Merritt's Grill | — | https://goheels.com/news/2025/8/22/football-whats-new-in-kenan-stadium-in-2025 | 2025-08-22 | Verified current | No |  |
| Gleezy Double Smoke Brisket Hot Dog | Gleezy double smoked brisket hot dog | Kenan concessions | — | https://goheels.com/news/2025/8/22/football-whats-new-in-kenan-stadium-in-2025 | 2025-08-22 | Verified current | No |  |
| Philly Steak Nachos | Philly steak nachos | Kenan concessions | — | https://goheels.com/news/2025/8/22/football-whats-new-in-kenan-stadium-in-2025 | 2025-08-22 | Verified current | No |  |
| Donut Ice Cream Sandwich | Donut ice cream sandwich | Kenan concessions | — | https://goheels.com/news/2025/8/22/football-whats-new-in-kenan-stadium-in-2025 | 2025-08-22 | Verified current | No |  |
| Serendipity Ice Cream | Serendipity ice cream (10+ locations) | Serendipity Ice Cream | — | https://goheels.com/news/2025/8/22/football-whats-new-in-kenan-stadium-in-2025 | 2025-08-22 | Verified current | No |  |

**Import:** Bojangles Chicken Supremes; Salvio's Burger (Ramses Style); Domino's Pizza; Chick-fil-A Chicken Sandwich; Hot Dog; Soft Pretzel; Popcorn; Smoked & Pulled Pork Sandwich; Pulled Pork Nachos; Cole Slaw; Street Nachos; Pork Carnitas Nachos; Tinga Chicken Nachos; Footlong Carolina Dog; Footlong Halftime Dog; Carolina Crunch; Merritt's BLT; Merritt's Banana Pudding; Gleezy Double Smoke Brisket Hot Dog; Philly Steak Nachos; Donut Ice Cream Sandwich; Serendipity Ice Cream.

**Omitted:**
- IP3 Cheesesteaks — 2024 list; local reporting notes inspection issues — do not import until reconfirmed
- Crumbl / Alpaca (2024) — Vendor/cookie concept without clear dish SKU for Alpaca; Crumbl is cookies — optional non-featured
- Dirty Sodas / Frost Buddies — Beverage / branded drink accessory
- Modelo / craft beer / Tar Heel Cocktails — Alcohol — omit
- Kenan Skybox inclusive F&B — Premium-only

**Sources:**
- https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024
- https://goheels.com/news/2025/8/22/football-whats-new-in-kenan-stadium-in-2025
- https://www.unc.edu/posts/2025/08/27/are-you-ready-for-tar-heel-football/

---

## 10. carter-finley-stadium (NC State)

**Import recommendation:** **IMPORT** (4 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Peruvian Rotisserie Chicken | Peruvian rotisserie chicken and Latin dishes | Alpaca | Concourse adjacent to Raleighwood | https://gopack.com/news/2025/8/21/football-new-set-of-enhancements-coming-ahead-of-2025-football-season | 2025-08-21 | Verified current | No |  |
| Chicken Tenders | Chicken tenders | Wolf & Hen | Raleighwood | https://gopack.com/news/2025/8/21/football-new-set-of-enhancements-coming-ahead-of-2025-football-season | 2025-08-21 | Verified current | No |  |
| Fries | Fries | Wolf & Hen | Raleighwood | https://gopack.com/news/2025/8/21/football-new-set-of-enhancements-coming-ahead-of-2025-football-season | 2025-08-21 | Verified current | No |  |
| Chick-fil-A Chicken Sandwich | Chick-fil-A return to concourse | Chick-fil-A | — | https://gopack.com/news/2025/8/21/football-new-set-of-enhancements-coming-ahead-of-2025-football-season | 2025-08-21 | Verified current | No |  |

**Import:** Peruvian Rotisserie Chicken; Chicken Tenders; Fries; Chick-fil-A Chicken Sandwich.

**Omitted:**
- Raleighwood food trucks — Rotating trucks — no fixed SKUs
- Hot honey fried chicken / Sizzle & Melt (local guide) — Secondary guide — not athletics SKU list
- Beer/wine at Raleighwood bar — Alcohol — omit

**Sources:**
- https://gopack.com/news/2025/8/21/football-new-set-of-enhancements-coming-ahead-of-2025-football-season
- https://news.ncsu.edu/2025/08/whats-new-at-carter-finley-stadium-for-2025/

---

## 11. acrisure-stadium (Pitt)

**Display / scope notes:** SHARED with NFL Steelers (formerly Heinz Field). Pitt athletics defers to stadium F&B without college-specific SKUs → pending.

**Import recommendation:** **PENDING** (0 verified-current items for import).

No verified-current dish SKUs meeting import bar.

**Import:** none (pending empty launch / Menu coming soon).

**Omitted:**
- Primanti Bros / Potato Patch / Franco's / Pierogi House / full 100-level map — Acrisure/Steelers food pages — NFL-tenant menu without Pitt athletics college-confirmed dish list
- Steelers Official Mobile App ordering — NFL app scope
- Alcohol brand lists — Alcohol — omit

**Sources:**
- https://pittsburghpanthers.com/sports/2022/11/11/dev-know-before-you-go
- https://acrisurestadium.com/stadium/food-and-beverage/
- https://acrisurestadium.com/stadium/food-and-beverage/100-level/

---

## 12. gerald-j-ford-stadium (SMU)

**Import recommendation:** **IMPORT** (4 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Antone's Famous Po' Boy | Antone's Famous Po' Boy sandwiches in walk-through market | Antone's Famous Po' Boys | — | https://smumustangs.com/news/2024/8/2/football-new-league-new-gameday.aspx | 2024-08-02 | Verified current | No |  |
| Gourmet Kettle Corn | SMU-themed gourmet kettle corn | Concourse | — | https://smumustangs.com/news/2024/8/2/football-new-league-new-gameday.aspx | 2024-08-02 | Verified current | No |  |
| Cotton Candy | Cotton candy throughout concourse | Concourse | — | https://smumustangs.com/news/2024/8/2/football-new-league-new-gameday.aspx | 2024-08-02 | Verified current | No |  |
| Palmers Fried Chicken | Fried chicken (East Plaza pavilion) | Palmers Fried Chicken | East Plaza | https://smumustangs.com/news/2024/8/2/football-new-league-new-gameday.aspx | 2024-08-02 | Likely current | No |  |

**Import:** Antone's Famous Po' Boy; Gourmet Kettle Corn; Cotton Candy; Palmers Fried Chicken.

**Omitted:**
- Ferris Wheelers BBQ / Rudy's BBQ — Vendors confirmed; dish SKUs not published by athletics
- Frios Gourmet Pops / TeaCo Boba / Bavarian Nuts / Kona Ice — Vendor/treat brands without specific featured dish import priority
- Mi Cocina MiCoRita — Alcohol — omit
- Armstrong Fieldhouse food trucks — Outside / fan zone
- Stadium Journey Rudy's brisket sandwich pricing — Secondary bowl/guide reporting — not athletics SKU

**Sources:**
- https://smumustangs.com/news/2024/8/2/football-new-league-new-gameday.aspx
- https://smumustangs.com/sports/2018/8/29/stadium-policies-gerald-j-ford-stadium

---

## 13. stanford-stadium (Stanford)

**Display / scope notes:** Levy became hospitality partner Fall 2025 — prefer 2025 athletics note over 2024 self-op map

**Import recommendation:** **IMPORT** (3 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chick-fil-A Chicken Sandwich | Chick-fil-A at Sec. 235 | Chick-fil-A | Sec 235 | https://gostanford.com/news/2025/09/10/things-to-know-stanford-stadium-2025 | 2025-09-09 | Verified current | No |  |
| Wetzel's Soft Pretzel | Wetzel's Pretzels returning favorite | Wetzel's Pretzels | — | https://gostanford.com/news/2025/09/10/things-to-know-stanford-stadium-2025 | 2025-09-09 | Verified current | No |  |
| Rita's Italian Ice | Rita's Italian Ice returning favorite | Rita's Italian Ice | — | https://gostanford.com/news/2025/09/10/things-to-know-stanford-stadium-2025 | 2025-09-09 | Verified current | No |  |

**Import:** Chick-fil-A Chicken Sandwich; Wetzel's Soft Pretzel; Rita's Italian Ice.

**Omitted:**
- Silva Sausage Co. — Vendor confirmed Sec 103 & 232; dish SKU not published
- Blue Line Pizza — Vendor confirmed; pizza SKU not published
- Kikka Sushi — Vendor confirmed; roll SKUs not published
- 2024 R&DE stadium map dishes (pre-Levy) — Historical — Levy took over Fall 2025
- Fan Fest vendors — Outside stadium
- Beer / Suntory RTD cocktails — Alcohol — omit
- Archway / Buck Club premium F&B — Premium / hospitality

**Sources:**
- https://gostanford.com/news/2025/09/10/things-to-know-stanford-stadium-2025
- https://www.levyrestaurants.com/press-room/2025-10-02-levy-joins-stanford-athletics-as-new-hospitality-partner

---

## 14. jma-wireless-dome (Syracuse)

**Display / scope notes:** Formerly Carrier Dome; renamed JMA Wireless Dome

**Import recommendation:** **IMPORT** (15 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chicken Tenders with Fries | Chicken tenders with fries | Cuse Chicken | Secs 106, 121 | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Fried Chicken Sandwich with Fries | Breaded chicken filet with chipotle ranch, with fries | Cuse Chicken | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Cheese Fries | Cheese fries | Cuse Chicken / Loudhouse Grille | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Cheeseburger with Fries | Beef patty on brioche with American cheese, LTO, fries | Loudhouse Grille | Secs 110, 125 | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Barbecue Beef Brisket Sandwich | Smoky BBQ brisket on brioche with jalapeños | Loudhouse Grille | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Hofmann Hot Dog | Hofmann hot dog | Loudhouse / Tomato Wheel / Otto's / 50 Yard Line | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Grilled Chicken Sandwich | Grilled chicken on brioche with LTO, honey mustard | Otto's Fast Break | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Bavarian Pretzel | Bavarian pretzel | Otto's / Tomato Wheel / 50 Yard Line | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| J&J SuperPretzel | J&J SuperPretzel return | Dome concessions | — | https://cuse.com/news/2024/8/29/football-dome-enhancements-await-orange-fans-on-saturday | 2024-08-29 | Verified current | No |  |
| Cheese Pizza Slice | Cheese pizza slice | Tomato Wheel and Dome Dog / 50 Yard Line | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Pepperoni Pizza Slice | Pepperoni pizza slice | Tomato Wheel and Dome Dog / 50 Yard Line | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Sausage Sub with Peppers and Onions | Sausage sub | Tomato Wheel and Dome Dog / 50 Yard Line | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Nacho Grande | Tostitos with cheese and salsa (jalapeños optional) | Tomato Wheel / Nacho Stop / 50 Yard Line | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Popcorn | Popcorn (boxed or fresh-popped) | Multiple stands | — | https://campusdining.syr.edu/retail-dining/dome-concessions/ | 2025+ | Verified current | No |  |
| Family Four Meal Deal | Four hot dogs, four sodas/waters, two popcorn boxes | Tomato Wheel and Dome Dog / upper 50-yard stands | — | https://cuse.com/news/2024/8/29/football-dome-enhancements-await-orange-fans-on-saturday | 2024-08-29 | Verified current | No |  |

**Import:** Chicken Tenders with Fries; Fried Chicken Sandwich with Fries; Cheese Fries; Cheeseburger with Fries; Barbecue Beef Brisket Sandwich; Hofmann Hot Dog; Grilled Chicken Sandwich; Bavarian Pretzel; J&J SuperPretzel; Cheese Pizza Slice; Pepperoni Pizza Slice; Sausage Sub with Peppers and Onions; Nacho Grande; Popcorn; Family Four Meal Deal.

**Omitted:**
- Evan Williams / craft beer / Surfside catalogs — Alcohol — omit
- Dunkin' coffee — Beverage
- Orange Express rotating salads/wraps without named SKUs — Category only on dining page
- Perry's Ice Cream / Salt City Popcorn (guides) — Secondary / not fully SKU'd on campus dining page

**Sources:**
- https://campusdining.syr.edu/retail-dining/dome-concessions/
- https://cuse.com/news/2024/8/29/football-dome-enhancements-await-orange-fans-on-saturday

---

## 15. scott-stadium (Virginia)

**Import recommendation:** **IMPORT** (19 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Hot Dog | Hot dog | UVA Classics / Hoos Homestand | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Nachos | Nachos | UVA Classics / Hoos Homestand | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Soft Pretzel | Soft pretzel | UVA Classics / Hoos Homestand / BBQ Alley | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Popcorn | Popcorn | UVA Classics / Hoos Homestand / BBQ Alley / Papa Johns | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| BBQ Sandwich | BBQ sandwich | BBQ Alley | Secs 311, 321, 514 | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Andouille Sausage | Andouille sausage | BBQ Alley | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Brisket Sandwich | Brisket sandwich | BBQ Alley | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Cheese Pizza | Cheese pizza | Papa Johns | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Pepperoni Pizza | Pepperoni pizza | Papa Johns | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Hamburger | Hamburger | Hamburger House | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Cheeseburger | Cheeseburger | Hamburger House | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Veggie Burger | Veggie burger | Hamburger House | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Chicken Finger Basket | Chicken finger basket | Hamburger House | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Fries | Fries | Hamburger House | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Smoked Chicken Tacos | Smoked chicken tacos | Eat Drink Taco | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Beef Barbacoa Tacos | Beef barbacoa tacos | Eat Drink Taco | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Smoked Chicken Nacho | Smoked chicken nacho | Eat Drink Nacho | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Beef Barbacoa Nacho | Beef barbacoa nacho | Eat Drink Nacho | — | https://virginiasports.com/football-gameday | 2025-26 page | Verified current | No |  |
| Chick-fil-A Chicken Sandwich | Chick-fil-A food truck on East side | Chick-fil-A | East side food truck | https://virginiasports.com/news/2025/08/28/football-gameday-enhancements-announced-for-2025-season | 2025-08-28 | Verified current | No |  |

**Import:** Hot Dog; Nachos; Soft Pretzel; Popcorn; BBQ Sandwich; Andouille Sausage; Brisket Sandwich; Cheese Pizza; Pepperoni Pizza; Hamburger; Cheeseburger; Veggie Burger; Chicken Finger Basket; Fries; Smoked Chicken Tacos; Beef Barbacoa Tacos; Smoked Chicken Nacho; Beef Barbacoa Nacho; Chick-fil-A Chicken Sandwich.

**Omitted:**
- Rotating gourmet hamburger/BBQ/hot dog specials (2024) — Per-game rotating — not fixed SKUs
- Other rotating food trucks — Rotating
- Wine bar / alcohol pop-ups — Alcohol — omit
- Loge & Cabana enhanced F&B — Premium-only
- Wahoo Water Celsius/bubly — Beverage

**Sources:**
- https://virginiasports.com/football-gameday
- https://virginiasports.com/news/2025/08/28/football-gameday-enhancements-announced-for-2025-season

---

## 16. lane-stadium (Virginia Tech)

**Import recommendation:** **IMPORT** (5 verified-current items for import).

| Item | Description | Vendor/stand | Section | Source URL | Source date | Confidence | Alcohol? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Hot Dog | Fan-friendly hot dog (every stand) | Fan-Friendly / Aramark | — | https://hokiesports.com/news/2024/08/16/fan-experience-elements-released-for-2024-virginia-tech-football-season | 2024-08-16 | Verified current | No |  |
| Nachos | Fan-friendly nachos | Fan-Friendly stands | — | https://hokiesports.com/news/2024/08/16/fan-experience-elements-released-for-2024-virginia-tech-football-season | 2024-08-16 | Verified current | No |  |
| Popcorn | Fan-friendly popcorn | Fan-Friendly stands | — | https://hokiesports.com/news/2024/08/16/fan-experience-elements-released-for-2024-virginia-tech-football-season | 2024-08-16 | Verified current | No |  |
| Lane Legs | Signature turkey legs (Lane Legs) | Lane Legs | SE corner; portables Sec 130 & 110 | https://hokiesports.com/news/2024/08/16/fan-experience-elements-released-for-2024-virginia-tech-football-season | 2024-08-16 | Verified current | No |  |
| BBQ Pork with Chips | BBQ pork with chips | South concourse stands | — | https://hokiesports.com/news/2024/08/16/fan-experience-elements-released-for-2024-virginia-tech-football-season | 2024-08-16 | Verified current | No |  |

**Import:** Hot Dog; Nachos; Popcorn; Lane Legs; BBQ Pork with Chips.

**Omitted:**
- Beer & seltzer brand list (Fightin' Hokies Hefeweizen, etc.) — Alcohol — omit
- Benny Marzano pizza / Smithfield / Big Dipper (Stadium Journey) — Older secondary guide — not 2024 athletics SKUs
- BBQ jackfruit / Impossible Burger (third-party guides) — Not athletics-verified 2024
- Hokie Village food trucks — Outside stadium

**Sources:**
- https://hokiesports.com/news/2024/08/16/fan-experience-elements-released-for-2024-virginia-tech-football-season
- https://hokiesports.com/lane-stadium-fan-guide-a-z

---

## 17. allegacy-federal-credit-union-stadium (Wake Forest)

**Display / scope notes:** Formerly BB&T Field; current Allegacy Federal Credit Union Stadium. Proof of the Pudding partner since 2023.

**Import recommendation:** **PENDING** (0 verified-current items for import).

No verified-current dish SKUs meeting import bar.

**Import:** none (pending empty launch / Menu coming soon).

**Omitted:**
- 2023 Gameday Grub full stand list (Arnie's Corner, Flatland, Domino's, food trucks) — Detailed 2023 athletics list not reconfirmed with 2024–26 dish SKUs (2024 notes only 'new selection')
- DEACTOWN / Deacon Hill food trucks — Rotating / outside primary bowl
- Alcohol gardens / RTD cocktails — Alcohol — omit

**Sources:**
- https://godeacs.com/news/2023/8/27/football-gameday-grub-innovative-delicious-food-options-await-fans-at-allegacy-stadium
- https://godeacs.com/news/2024/8/27/football-know-before-you-go-north-carolina-a-t
- https://www.proofpudding.com/catering-concessions-wake-forest-athletics/

---

## Shared-venue caution (Hard Rock & Acrisure)

| Venue | NFL tenant | College tenant | Research rule applied |
| --- | --- | --- | --- |
| Hard Rock Stadium | Miami Dolphins | Miami Hurricanes | Import only items confirmed at UM football (student paper 2025-11-19). Stadium concession PDF maps alone = insufficient. |
| Acrisure Stadium | Pittsburgh Steelers | Pitt Panthers | Pending — athletics points to stadium F&B without college-specific SKUs; Steelers maps omitted. |

## Import priority queue (suggested)

1. **scott-stadium** / **kenan-memorial-stadium** / **jma-wireless-dome** / **l-n-federal-credit-union-stadium** — densest athletics-sourced SKUs
2. **bobby-dodd-stadium-at-hyundai-field** / **doak-campbell-stadium** — strong athletics pages
3. **memorial-stadium-clemson** / **lane-stadium** / **carter-finley-stadium** / **alumni-stadium** / **gerald-j-ford-stadium** / **stanford-stadium** — thinner but verified
4. **hard-rock-stadium** — college-confirmed subset only; reconcile carefully vs any existing NFL rows
5. **pending empty:** california-memorial-stadium, wallace-wade-stadium, acrisure-stadium, allegacy-federal-credit-union-stadium

