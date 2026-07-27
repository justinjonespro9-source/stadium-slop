/**
 * Curated 2026 Big 12 regular-season home football fixtures.
 *
 * Sources: ESPN team schedules (season/2026) cross-checked with Big 12 /
 * school athletics schedules. Kickoff times from ESPN are Eastern Time
 * unless marked TBD. Prepared extract: /tmp/big12-2026-homes.json.
 *
 * Exclusions (neutral / non-campus):
 * - TCU vs North Carolina (Aug 29) at Aviva Stadium, Dublin
 * - Kansas vs Arizona State (Sep 19) at Wembley Stadium, London
 * - Cincinnati vs Miami (OH) (Sep 19) at TQL Stadium
 * - Baylor Aflac Kickoff / WVU Duke’s Mayo Classic (away roles; not campus homes)
 * - Big 12 Championship at AT&T Stadium (not a school home game)
 */

export type Big12HomeFixture = {
  /** Local calendar date YYYY-MM-DD (ESPN America/New_York game day). */
  date: string;
  homeTeamName: string;
  homeTeamSlug: string;
  awayTeamName: string;
  venueSlug: string;
  /**
   * ESPN Eastern kickoff as "h:mm AM/PM", or null when TBD.
   * Never invent a time — use null + kickoffTbd.
   */
  kickoffEt: string | null;
  kickoffTbd: boolean;
  notes?: string;
};

const ARIZONA: Big12HomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Arizona Wildcats", homeTeamSlug: "arizona-wildcats", awayTeamName: "Northern Arizona Lumberjacks", venueSlug: "casino-del-sol-stadium", kickoffEt: "9:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Arizona Wildcats", homeTeamSlug: "arizona-wildcats", awayTeamName: "Northern Illinois Huskies", venueSlug: "casino-del-sol-stadium", kickoffEt: "10:30 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Arizona Wildcats", homeTeamSlug: "arizona-wildcats", awayTeamName: "Cincinnati Bearcats", venueSlug: "casino-del-sol-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Arizona Wildcats", homeTeamSlug: "arizona-wildcats", awayTeamName: "Iowa State Cyclones", venueSlug: "casino-del-sol-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-06", homeTeamName: "Arizona Wildcats", homeTeamSlug: "arizona-wildcats", awayTeamName: "TCU Horned Frogs", venueSlug: "casino-del-sol-stadium", kickoffEt: "10:15 PM", kickoffTbd: false },
  { date: "2026-11-14", homeTeamName: "Arizona Wildcats", homeTeamSlug: "arizona-wildcats", awayTeamName: "Utah Utes", venueSlug: "casino-del-sol-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Arizona Wildcats", homeTeamSlug: "arizona-wildcats", awayTeamName: "Arizona State Sun Devils", venueSlug: "casino-del-sol-stadium", kickoffEt: null, kickoffTbd: true },
];

const ARIZONA_STATE: Big12HomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Arizona State Sun Devils", homeTeamSlug: "arizona-state-sun-devils", awayTeamName: "Morgan State Bears", venueSlug: "mountain-america-stadium", kickoffEt: "9:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Arizona State Sun Devils", homeTeamSlug: "arizona-state-sun-devils", awayTeamName: "Baylor Bears", venueSlug: "mountain-america-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Arizona State Sun Devils", homeTeamSlug: "arizona-state-sun-devils", awayTeamName: "Hawai'i Rainbow Warriors", venueSlug: "mountain-america-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Arizona State Sun Devils", homeTeamSlug: "arizona-state-sun-devils", awayTeamName: "Kansas State Wildcats", venueSlug: "mountain-america-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Arizona State Sun Devils", homeTeamSlug: "arizona-state-sun-devils", awayTeamName: "Colorado Buffaloes", venueSlug: "mountain-america-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Arizona State Sun Devils", homeTeamSlug: "arizona-state-sun-devils", awayTeamName: "Oklahoma State Cowboys", venueSlug: "mountain-america-stadium", kickoffEt: null, kickoffTbd: true },
];

const BAYLOR: Big12HomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "Baylor Bears", homeTeamSlug: "baylor-bears", awayTeamName: "Prairie View A&M Panthers", venueSlug: "mclane-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Baylor Bears", homeTeamSlug: "baylor-bears", awayTeamName: "Louisiana Tech Bulldogs", venueSlug: "mclane-stadium", kickoffEt: "4:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Baylor Bears", homeTeamSlug: "baylor-bears", awayTeamName: "Colorado Buffaloes", venueSlug: "mclane-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Baylor Bears", homeTeamSlug: "baylor-bears", awayTeamName: "TCU Horned Frogs", venueSlug: "mclane-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Baylor Bears", homeTeamSlug: "baylor-bears", awayTeamName: "Iowa State Cyclones", venueSlug: "mclane-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Baylor Bears", homeTeamSlug: "baylor-bears", awayTeamName: "Texas Tech Red Raiders", venueSlug: "mclane-stadium", kickoffEt: null, kickoffTbd: true },
];

const BYU: Big12HomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "BYU Cougars", homeTeamSlug: "byu-cougars", awayTeamName: "Utah Tech Trailblazers", venueSlug: "lavell-edwards-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "BYU Cougars", homeTeamSlug: "byu-cougars", awayTeamName: "Arizona Wildcats", venueSlug: "lavell-edwards-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-10-09", homeTeamName: "BYU Cougars", homeTeamSlug: "byu-cougars", awayTeamName: "Iowa State Cyclones", venueSlug: "lavell-edwards-stadium", kickoffEt: "10:15 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "BYU Cougars", homeTeamSlug: "byu-cougars", awayTeamName: "Notre Dame Fighting Irish", venueSlug: "lavell-edwards-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "BYU Cougars", homeTeamSlug: "byu-cougars", awayTeamName: "Arizona State Sun Devils", venueSlug: "lavell-edwards-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "BYU Cougars", homeTeamSlug: "byu-cougars", awayTeamName: "Baylor Bears", venueSlug: "lavell-edwards-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "BYU Cougars", homeTeamSlug: "byu-cougars", awayTeamName: "Cincinnati Bearcats", venueSlug: "lavell-edwards-stadium", kickoffEt: null, kickoffTbd: true },
];

const CINCINNATI: Big12HomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Cincinnati Bearcats", homeTeamSlug: "cincinnati-bearcats", awayTeamName: "Boston College Eagles", venueSlug: "nippert-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Cincinnati Bearcats", homeTeamSlug: "cincinnati-bearcats", awayTeamName: "Western Carolina Catamounts", venueSlug: "nippert-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Cincinnati Bearcats", homeTeamSlug: "cincinnati-bearcats", awayTeamName: "Kansas State Wildcats", venueSlug: "nippert-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Cincinnati Bearcats", homeTeamSlug: "cincinnati-bearcats", awayTeamName: "Texas Tech Red Raiders", venueSlug: "nippert-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Cincinnati Bearcats", homeTeamSlug: "cincinnati-bearcats", awayTeamName: "Utah Utes", venueSlug: "nippert-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Cincinnati Bearcats", homeTeamSlug: "cincinnati-bearcats", awayTeamName: "Colorado Buffaloes", venueSlug: "nippert-stadium", kickoffEt: null, kickoffTbd: true },
];

const COLORADO: Big12HomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "Colorado Buffaloes", homeTeamSlug: "colorado-buffaloes", awayTeamName: "Weber State Wildcats", venueSlug: "folsom-field", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Colorado Buffaloes", homeTeamSlug: "colorado-buffaloes", awayTeamName: "Texas Tech Red Raiders", venueSlug: "folsom-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Colorado Buffaloes", homeTeamSlug: "colorado-buffaloes", awayTeamName: "Utah Utes", venueSlug: "folsom-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Colorado Buffaloes", homeTeamSlug: "colorado-buffaloes", awayTeamName: "Kansas State Wildcats", venueSlug: "folsom-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-13", homeTeamName: "Colorado Buffaloes", homeTeamSlug: "colorado-buffaloes", awayTeamName: "Houston Cougars", venueSlug: "folsom-field", kickoffEt: "10:15 PM", kickoffTbd: false },
  { date: "2026-11-28", homeTeamName: "Colorado Buffaloes", homeTeamSlug: "colorado-buffaloes", awayTeamName: "UCF Knights", venueSlug: "folsom-field", kickoffEt: null, kickoffTbd: true },
];

const HOUSTON: Big12HomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Houston Cougars", homeTeamSlug: "houston-cougars", awayTeamName: "Oregon State Beavers", venueSlug: "tdecu-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Houston Cougars", homeTeamSlug: "houston-cougars", awayTeamName: "Southern Jaguars", venueSlug: "tdecu-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Houston Cougars", homeTeamSlug: "houston-cougars", awayTeamName: "UCF Knights", venueSlug: "tdecu-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Houston Cougars", homeTeamSlug: "houston-cougars", awayTeamName: "Oklahoma State Cowboys", venueSlug: "tdecu-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Houston Cougars", homeTeamSlug: "houston-cougars", awayTeamName: "Cincinnati Bearcats", venueSlug: "tdecu-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Houston Cougars", homeTeamSlug: "houston-cougars", awayTeamName: "Baylor Bears", venueSlug: "tdecu-stadium", kickoffEt: null, kickoffTbd: true },
];

const IOWA_STATE: Big12HomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Iowa State Cyclones", homeTeamSlug: "iowa-state-cyclones", awayTeamName: "Southeast Missouri State Redhawks", venueSlug: "jack-trice-stadium", kickoffEt: "1:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Iowa State Cyclones", homeTeamSlug: "iowa-state-cyclones", awayTeamName: "Bowling Green Falcons", venueSlug: "jack-trice-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Iowa State Cyclones", homeTeamSlug: "iowa-state-cyclones", awayTeamName: "Utah Utes", venueSlug: "jack-trice-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-03", homeTeamName: "Iowa State Cyclones", homeTeamSlug: "iowa-state-cyclones", awayTeamName: "West Virginia Mountaineers", venueSlug: "jack-trice-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Iowa State Cyclones", homeTeamSlug: "iowa-state-cyclones", awayTeamName: "Oklahoma State Cowboys", venueSlug: "jack-trice-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Iowa State Cyclones", homeTeamSlug: "iowa-state-cyclones", awayTeamName: "Cincinnati Bearcats", venueSlug: "jack-trice-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Iowa State Cyclones", homeTeamSlug: "iowa-state-cyclones", awayTeamName: "Kansas State Wildcats", venueSlug: "jack-trice-stadium", kickoffEt: null, kickoffTbd: true },
];

const KANSAS: Big12HomeFixture[] = [
  { date: "2026-09-04", homeTeamName: "Kansas Jayhawks", homeTeamSlug: "kansas-jayhawks", awayTeamName: "LIU Sharks", venueSlug: "david-booth-kansas-memorial-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-11", homeTeamName: "Kansas Jayhawks", homeTeamSlug: "kansas-jayhawks", awayTeamName: "Missouri Tigers", venueSlug: "david-booth-kansas-memorial-stadium", kickoffEt: "8:00 PM", kickoffTbd: false, notes: "Border Showdown — campus home at David Booth Kansas Memorial Stadium" },
  { date: "2026-10-03", homeTeamName: "Kansas Jayhawks", homeTeamSlug: "kansas-jayhawks", awayTeamName: "Middle Tennessee Blue Raiders", venueSlug: "david-booth-kansas-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Kansas Jayhawks", homeTeamSlug: "kansas-jayhawks", awayTeamName: "Baylor Bears", venueSlug: "david-booth-kansas-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Kansas Jayhawks", homeTeamSlug: "kansas-jayhawks", awayTeamName: "UCF Knights", venueSlug: "david-booth-kansas-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Kansas Jayhawks", homeTeamSlug: "kansas-jayhawks", awayTeamName: "BYU Cougars", venueSlug: "david-booth-kansas-memorial-stadium", kickoffEt: null, kickoffTbd: true },
];

const KANSAS_STATE: Big12HomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Kansas State Wildcats", homeTeamSlug: "kansas-state-wildcats", awayTeamName: "Nicholls Colonels", venueSlug: "bill-snyder-family-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Kansas State Wildcats", homeTeamSlug: "kansas-state-wildcats", awayTeamName: "Washington State Cougars", venueSlug: "bill-snyder-family-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Kansas State Wildcats", homeTeamSlug: "kansas-state-wildcats", awayTeamName: "Tulane Green Wave", venueSlug: "bill-snyder-family-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "Kansas State Wildcats", homeTeamSlug: "kansas-state-wildcats", awayTeamName: "Houston Cougars", venueSlug: "bill-snyder-family-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Kansas State Wildcats", homeTeamSlug: "kansas-state-wildcats", awayTeamName: "Kansas Jayhawks", venueSlug: "bill-snyder-family-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Kansas State Wildcats", homeTeamSlug: "kansas-state-wildcats", awayTeamName: "Oklahoma State Cowboys", venueSlug: "bill-snyder-family-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Kansas State Wildcats", homeTeamSlug: "kansas-state-wildcats", awayTeamName: "Arizona Wildcats", venueSlug: "bill-snyder-family-stadium", kickoffEt: null, kickoffTbd: true },
];

const OKLAHOMA_STATE: Big12HomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "Oklahoma State Cowboys", homeTeamSlug: "oklahoma-state-cowboys", awayTeamName: "Oregon Ducks", venueSlug: "boone-pickens-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Oklahoma State Cowboys", homeTeamSlug: "oklahoma-state-cowboys", awayTeamName: "Murray State Racers", venueSlug: "boone-pickens-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "Oklahoma State Cowboys", homeTeamSlug: "oklahoma-state-cowboys", awayTeamName: "UCF Knights", venueSlug: "boone-pickens-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Oklahoma State Cowboys", homeTeamSlug: "oklahoma-state-cowboys", awayTeamName: "Colorado Buffaloes", venueSlug: "boone-pickens-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Oklahoma State Cowboys", homeTeamSlug: "oklahoma-state-cowboys", awayTeamName: "Texas Tech Red Raiders", venueSlug: "boone-pickens-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Oklahoma State Cowboys", homeTeamSlug: "oklahoma-state-cowboys", awayTeamName: "Kansas Jayhawks", venueSlug: "boone-pickens-stadium", kickoffEt: null, kickoffTbd: true },
];

const TCU: Big12HomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "TCU Horned Frogs", homeTeamSlug: "tcu-horned-frogs", awayTeamName: "Grambling Tigers", venueSlug: "amon-g-carter-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "TCU Horned Frogs", homeTeamSlug: "tcu-horned-frogs", awayTeamName: "Arkansas State Red Wolves", venueSlug: "amon-g-carter-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "TCU Horned Frogs", homeTeamSlug: "tcu-horned-frogs", awayTeamName: "BYU Cougars", venueSlug: "amon-g-carter-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "TCU Horned Frogs", homeTeamSlug: "tcu-horned-frogs", awayTeamName: "West Virginia Mountaineers", venueSlug: "amon-g-carter-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "TCU Horned Frogs", homeTeamSlug: "tcu-horned-frogs", awayTeamName: "Kansas Jayhawks", venueSlug: "amon-g-carter-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "TCU Horned Frogs", homeTeamSlug: "tcu-horned-frogs", awayTeamName: "Kansas State Wildcats", venueSlug: "amon-g-carter-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "TCU Horned Frogs", homeTeamSlug: "tcu-horned-frogs", awayTeamName: "Utah Utes", venueSlug: "amon-g-carter-stadium", kickoffEt: null, kickoffTbd: true },
];

const TEXAS_TECH: Big12HomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Texas Tech Red Raiders", homeTeamSlug: "texas-tech-red-raiders", awayTeamName: "Abilene Christian Wildcats", venueSlug: "galaxy-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-18", homeTeamName: "Texas Tech Red Raiders", homeTeamSlug: "texas-tech-red-raiders", awayTeamName: "Houston Cougars", venueSlug: "galaxy-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Texas Tech Red Raiders", homeTeamSlug: "texas-tech-red-raiders", awayTeamName: "Sam Houston Bearkats", venueSlug: "galaxy-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Texas Tech Red Raiders", homeTeamSlug: "texas-tech-red-raiders", awayTeamName: "Arizona State Sun Devils", venueSlug: "galaxy-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Texas Tech Red Raiders", homeTeamSlug: "texas-tech-red-raiders", awayTeamName: "Arizona Wildcats", venueSlug: "galaxy-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Texas Tech Red Raiders", homeTeamSlug: "texas-tech-red-raiders", awayTeamName: "West Virginia Mountaineers", venueSlug: "galaxy-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-26", homeTeamName: "Texas Tech Red Raiders", homeTeamSlug: "texas-tech-red-raiders", awayTeamName: "TCU Horned Frogs", venueSlug: "galaxy-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
];

const UCF: Big12HomeFixture[] = [
  { date: "2026-09-03", homeTeamName: "UCF Knights", homeTeamSlug: "ucf-knights", awayTeamName: "Bethune-Cookman Wildcats", venueSlug: "acrisure-bounce-house", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "UCF Knights", homeTeamSlug: "ucf-knights", awayTeamName: "Georgia State Panthers", venueSlug: "acrisure-bounce-house", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "UCF Knights", homeTeamSlug: "ucf-knights", awayTeamName: "TCU Horned Frogs", venueSlug: "acrisure-bounce-house", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "UCF Knights", homeTeamSlug: "ucf-knights", awayTeamName: "BYU Cougars", venueSlug: "acrisure-bounce-house", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-30", homeTeamName: "UCF Knights", homeTeamSlug: "ucf-knights", awayTeamName: "Baylor Bears", venueSlug: "acrisure-bounce-house", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-11-14", homeTeamName: "UCF Knights", homeTeamSlug: "ucf-knights", awayTeamName: "Arizona State Sun Devils", venueSlug: "acrisure-bounce-house", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-20", homeTeamName: "UCF Knights", homeTeamSlug: "ucf-knights", awayTeamName: "Iowa State Cyclones", venueSlug: "acrisure-bounce-house", kickoffEt: "6:00 PM", kickoffTbd: false },
];

const UTAH: Big12HomeFixture[] = [
  { date: "2026-09-03", homeTeamName: "Utah Utes", homeTeamSlug: "utah-utes", awayTeamName: "Idaho Vandals", venueSlug: "rice-eccles-stadium", kickoffEt: "9:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Utah Utes", homeTeamSlug: "utah-utes", awayTeamName: "Arkansas Razorbacks", venueSlug: "rice-eccles-stadium", kickoffEt: "10:15 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Utah Utes", homeTeamSlug: "utah-utes", awayTeamName: "Utah State Aggies", venueSlug: "rice-eccles-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "Utah Utes", homeTeamSlug: "utah-utes", awayTeamName: "Kansas Jayhawks", venueSlug: "rice-eccles-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Utah Utes", homeTeamSlug: "utah-utes", awayTeamName: "Houston Cougars", venueSlug: "rice-eccles-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Utah Utes", homeTeamSlug: "utah-utes", awayTeamName: "BYU Cougars", venueSlug: "rice-eccles-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-27", homeTeamName: "Utah Utes", homeTeamSlug: "utah-utes", awayTeamName: "West Virginia Mountaineers", venueSlug: "rice-eccles-stadium", kickoffEt: "9:00 PM", kickoffTbd: false },
];

const WEST_VIRGINIA: Big12HomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "West Virginia Mountaineers", homeTeamSlug: "west-virginia-mountaineers", awayTeamName: "Coastal Carolina Chanticleers", venueSlug: "milan-puskar-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "West Virginia Mountaineers", homeTeamSlug: "west-virginia-mountaineers", awayTeamName: "UT Martin Skyhawks", venueSlug: "milan-puskar-stadium", kickoffEt: "1:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "West Virginia Mountaineers", homeTeamSlug: "west-virginia-mountaineers", awayTeamName: "Oklahoma State Cowboys", venueSlug: "milan-puskar-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "West Virginia Mountaineers", homeTeamSlug: "west-virginia-mountaineers", awayTeamName: "Arizona Wildcats", venueSlug: "milan-puskar-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "West Virginia Mountaineers", homeTeamSlug: "west-virginia-mountaineers", awayTeamName: "Cincinnati Bearcats", venueSlug: "milan-puskar-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "West Virginia Mountaineers", homeTeamSlug: "west-virginia-mountaineers", awayTeamName: "Kansas Jayhawks", venueSlug: "milan-puskar-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "West Virginia Mountaineers", homeTeamSlug: "west-virginia-mountaineers", awayTeamName: "Houston Cougars", venueSlug: "milan-puskar-stadium", kickoffEt: null, kickoffTbd: true },
];

export const NCAA_BIG_12_2026_HOME_FIXTURES: Big12HomeFixture[] = [
  ...ARIZONA,
  ...ARIZONA_STATE,
  ...BAYLOR,
  ...BYU,
  ...CINCINNATI,
  ...COLORADO,
  ...HOUSTON,
  ...IOWA_STATE,
  ...KANSAS,
  ...KANSAS_STATE,
  ...OKLAHOMA_STATE,
  ...TCU,
  ...TEXAS_TECH,
  ...UCF,
  ...UTAH,
  ...WEST_VIRGINIA,
];

/** Neutral / non-campus games intentionally omitted from campus stadium seeds. */
export const NCAA_BIG_12_2026_EXCLUDED_NEUTRALS = [
  {
    date: "2026-08-29",
    homeTeamName: "TCU Horned Frogs",
    awayTeamName: "North Carolina Tar Heels",
    location: "Aviva Stadium, Dublin, Ireland",
    reason: "Aer Lingus College Football Classic — not Amon G. Carter Stadium"
  },
  {
    date: "2026-09-19",
    homeTeamName: "Kansas Jayhawks",
    awayTeamName: "Arizona State Sun Devils",
    location: "Wembley Stadium, London, England",
    reason: "International game — not David Booth Kansas Memorial Stadium"
  },
  {
    date: "2026-09-19",
    homeTeamName: "Cincinnati Bearcats",
    awayTeamName: "Miami (OH) RedHawks",
    location: "TQL Stadium, Cincinnati, Ohio",
    reason: "Non-campus MLS stadium — not Nippert Stadium"
  },
  {
    date: "2026-09-05",
    homeTeamName: "Auburn Tigers",
    awayTeamName: "Baylor Bears",
    location: "Mercedes-Benz Stadium, Atlanta, Ga.",
    reason: "Aflac Kickoff — Baylor away; not McLane Stadium"
  },
  {
    date: "2026-09-19",
    homeTeamName: "Virginia Cavaliers",
    awayTeamName: "West Virginia Mountaineers",
    location: "Bank of America Stadium, Charlotte, N.C.",
    reason: "Duke’s Mayo Classic — WVU away; not Milan Puskar Stadium"
  }
] as const;

