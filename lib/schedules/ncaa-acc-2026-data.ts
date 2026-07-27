/**
 * Curated 2026 ACC regular-season campus home football fixtures.
 *
 * Sources: ESPN scoreboard (season/2026) cross-checked with ACC / school
 * athletics schedules (CBS roundup + ACC Week 0 release). Kickoff times from
 * ESPN are Eastern Time unless marked TBD. Prepared extract:
 * /tmp/acc-2026-homes-final.json.
 *
 * Exclusions (neutral / non-campus):
 * - North Carolina vs TCU (Aug 29) at Aviva Stadium, Dublin
 * - NC State at Virginia (Aug 29) at Nilton Santos Stadium, Rio de Janeiro
 *   (Virginia Cavaliers designated home; ESPN mislabeled Scott Stadium;
 *   Virginia Tech is not a participant)
 * - Louisville vs Ole Miss (Sep 5/6) at Nissan Stadium, Nashville
 * - Virginia vs West Virginia (Sep 19) at Bank of America Stadium, Charlotte
 * - ACC Championship (Dec 5) at Bank of America Stadium (not a school home)
 *
 * Notre Dame is Independent in football and is not part of this ACC slate.
 */

export type AccHomeFixture = {
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

const BOSTON_COLLEGE: AccHomeFixture[] = [
  { date: "2026-09-11", homeTeamName: "Boston College Eagles", homeTeamSlug: "boston-college-eagles", awayTeamName: "Rutgers Scarlet Knights", venueSlug: "alumni-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Boston College Eagles", homeTeamSlug: "boston-college-eagles", awayTeamName: "Maine Black Bears", venueSlug: "alumni-stadium", kickoffEt: "2:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Boston College Eagles", homeTeamSlug: "boston-college-eagles", awayTeamName: "Virginia Tech Hokies", venueSlug: "alumni-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Boston College Eagles", homeTeamSlug: "boston-college-eagles", awayTeamName: "Pittsburgh Panthers", venueSlug: "alumni-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Boston College Eagles", homeTeamSlug: "boston-college-eagles", awayTeamName: "Florida State Seminoles", venueSlug: "alumni-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Boston College Eagles", homeTeamSlug: "boston-college-eagles", awayTeamName: "Syracuse Orange", venueSlug: "alumni-stadium", kickoffEt: null, kickoffTbd: true },
];

const CALIFORNIA: AccHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "California Golden Bears", homeTeamSlug: "california-golden-bears", awayTeamName: "UCLA Bruins", venueSlug: "california-memorial-stadium", kickoffEt: "10:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "California Golden Bears", homeTeamSlug: "california-golden-bears", awayTeamName: "Wagner Seahawks", venueSlug: "california-memorial-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-25", homeTeamName: "California Golden Bears", homeTeamSlug: "california-golden-bears", awayTeamName: "Clemson Tigers", venueSlug: "california-memorial-stadium", kickoffEt: "10:30 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "California Golden Bears", homeTeamSlug: "california-golden-bears", awayTeamName: "Virginia Tech Hokies", venueSlug: "california-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "California Golden Bears", homeTeamSlug: "california-golden-bears", awayTeamName: "Wake Forest Demon Deacons", venueSlug: "california-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "California Golden Bears", homeTeamSlug: "california-golden-bears", awayTeamName: "Stanford Cardinal", venueSlug: "california-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "California Golden Bears", homeTeamSlug: "california-golden-bears", awayTeamName: "Pittsburgh Panthers", venueSlug: "california-memorial-stadium", kickoffEt: null, kickoffTbd: true },
];

const CLEMSON: AccHomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "Clemson Tigers", homeTeamSlug: "clemson-tigers", awayTeamName: "Georgia Southern Eagles", venueSlug: "memorial-stadium-clemson", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Clemson Tigers", homeTeamSlug: "clemson-tigers", awayTeamName: "North Carolina Tar Heels", venueSlug: "memorial-stadium-clemson", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Clemson Tigers", homeTeamSlug: "clemson-tigers", awayTeamName: "Miami Hurricanes", venueSlug: "memorial-stadium-clemson", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Clemson Tigers", homeTeamSlug: "clemson-tigers", awayTeamName: "Charleston Southern Buccaneers", venueSlug: "memorial-stadium-clemson", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Clemson Tigers", homeTeamSlug: "clemson-tigers", awayTeamName: "Virginia Tech Hokies", venueSlug: "memorial-stadium-clemson", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Clemson Tigers", homeTeamSlug: "clemson-tigers", awayTeamName: "Georgia Tech Yellow Jackets", venueSlug: "memorial-stadium-clemson", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Clemson Tigers", homeTeamSlug: "clemson-tigers", awayTeamName: "South Carolina Gamecocks", venueSlug: "memorial-stadium-clemson", kickoffEt: null, kickoffTbd: true },
];

const DUKE: AccHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Duke Blue Devils", homeTeamSlug: "duke-blue-devils", awayTeamName: "Tulane Green Wave", venueSlug: "wallace-wade-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Duke Blue Devils", homeTeamSlug: "duke-blue-devils", awayTeamName: "Stanford Cardinal", venueSlug: "wallace-wade-stadium", kickoffEt: "4:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Duke Blue Devils", homeTeamSlug: "duke-blue-devils", awayTeamName: "William & Mary Tribe", venueSlug: "wallace-wade-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "Duke Blue Devils", homeTeamSlug: "duke-blue-devils", awayTeamName: "North Carolina Tar Heels", venueSlug: "wallace-wade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Duke Blue Devils", homeTeamSlug: "duke-blue-devils", awayTeamName: "Boston College Eagles", venueSlug: "wallace-wade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-20", homeTeamName: "Duke Blue Devils", homeTeamSlug: "duke-blue-devils", awayTeamName: "Clemson Tigers", venueSlug: "wallace-wade-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
];

const FLORIDA_STATE: AccHomeFixture[] = [
  { date: "2026-08-29", homeTeamName: "Florida State Seminoles", homeTeamSlug: "florida-state-seminoles", awayTeamName: "New Mexico State Aggies", venueSlug: "doak-campbell-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-07", homeTeamName: "Florida State Seminoles", homeTeamSlug: "florida-state-seminoles", awayTeamName: "SMU Mustangs", venueSlug: "doak-campbell-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Florida State Seminoles", homeTeamSlug: "florida-state-seminoles", awayTeamName: "Central Arkansas Bears", venueSlug: "doak-campbell-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-03", homeTeamName: "Florida State Seminoles", homeTeamSlug: "florida-state-seminoles", awayTeamName: "Virginia Cavaliers", venueSlug: "doak-campbell-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Florida State Seminoles", homeTeamSlug: "florida-state-seminoles", awayTeamName: "Clemson Tigers", venueSlug: "doak-campbell-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Florida State Seminoles", homeTeamSlug: "florida-state-seminoles", awayTeamName: "NC State Wolfpack", venueSlug: "doak-campbell-stadium", kickoffEt: null, kickoffTbd: true },
];

const GEORGIA_TECH: AccHomeFixture[] = [
  { date: "2026-09-03", homeTeamName: "Georgia Tech Yellow Jackets", homeTeamSlug: "georgia-tech-yellow-jackets", awayTeamName: "Colorado Buffaloes", venueSlug: "bobby-dodd-stadium-at-hyundai-field", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Georgia Tech Yellow Jackets", homeTeamSlug: "georgia-tech-yellow-jackets", awayTeamName: "Tennessee Volunteers", venueSlug: "bobby-dodd-stadium-at-hyundai-field", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Georgia Tech Yellow Jackets", homeTeamSlug: "georgia-tech-yellow-jackets", awayTeamName: "Mercer Bears", venueSlug: "bobby-dodd-stadium-at-hyundai-field", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "Georgia Tech Yellow Jackets", homeTeamSlug: "georgia-tech-yellow-jackets", awayTeamName: "Duke Blue Devils", venueSlug: "bobby-dodd-stadium-at-hyundai-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Georgia Tech Yellow Jackets", homeTeamSlug: "georgia-tech-yellow-jackets", awayTeamName: "Boston College Eagles", venueSlug: "bobby-dodd-stadium-at-hyundai-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Georgia Tech Yellow Jackets", homeTeamSlug: "georgia-tech-yellow-jackets", awayTeamName: "Louisville Cardinals", venueSlug: "bobby-dodd-stadium-at-hyundai-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Georgia Tech Yellow Jackets", homeTeamSlug: "georgia-tech-yellow-jackets", awayTeamName: "Wake Forest Demon Deacons", venueSlug: "bobby-dodd-stadium-at-hyundai-field", kickoffEt: null, kickoffTbd: true },
];

const LOUISVILLE: AccHomeFixture[] = [
  { date: "2026-09-11", homeTeamName: "Louisville Cardinals", homeTeamSlug: "louisville-cardinals", awayTeamName: "Villanova Wildcats", venueSlug: "ln-federal-credit-union-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Louisville Cardinals", homeTeamSlug: "louisville-cardinals", awayTeamName: "SMU Mustangs", venueSlug: "ln-federal-credit-union-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Louisville Cardinals", homeTeamSlug: "louisville-cardinals", awayTeamName: "Wake Forest Demon Deacons", venueSlug: "ln-federal-credit-union-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-09", homeTeamName: "Louisville Cardinals", homeTeamSlug: "louisville-cardinals", awayTeamName: "Florida State Seminoles", venueSlug: "ln-federal-credit-union-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-10-31", homeTeamName: "Louisville Cardinals", homeTeamSlug: "louisville-cardinals", awayTeamName: "Stanford Cardinal", venueSlug: "ln-federal-credit-union-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Louisville Cardinals", homeTeamSlug: "louisville-cardinals", awayTeamName: "Pittsburgh Panthers", venueSlug: "ln-federal-credit-union-stadium", kickoffEt: null, kickoffTbd: true },
];

const MIAMI: AccHomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "Miami Hurricanes", homeTeamSlug: "miami-hurricanes", awayTeamName: "Florida A&M Rattlers", venueSlug: "hard-rock-stadium", kickoffEt: null, kickoffTbd: true, notes: "CBS/ACC schedule; ESPN scoreboard incomplete for this date" },
  { date: "2026-09-26", homeTeamName: "Miami Hurricanes", homeTeamSlug: "miami-hurricanes", awayTeamName: "Central Michigan Chippewas", venueSlug: "hard-rock-stadium", kickoffEt: "6:30 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "Miami Hurricanes", homeTeamSlug: "miami-hurricanes", awayTeamName: "Florida State Seminoles", venueSlug: "hard-rock-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Miami Hurricanes", homeTeamSlug: "miami-hurricanes", awayTeamName: "Pittsburgh Panthers", venueSlug: "hard-rock-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Miami Hurricanes", homeTeamSlug: "miami-hurricanes", awayTeamName: "Duke Blue Devils", venueSlug: "hard-rock-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Miami Hurricanes", homeTeamSlug: "miami-hurricanes", awayTeamName: "Virginia Tech Hokies", venueSlug: "hard-rock-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Miami Hurricanes", homeTeamSlug: "miami-hurricanes", awayTeamName: "Boston College Eagles", venueSlug: "hard-rock-stadium", kickoffEt: null, kickoffTbd: true },
];

const NORTH_CAROLINA: AccHomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "North Carolina Tar Heels", homeTeamSlug: "north-carolina-tar-heels", awayTeamName: "East Tennessee State Buccaneers", venueSlug: "kenan-memorial-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "North Carolina Tar Heels", homeTeamSlug: "north-carolina-tar-heels", awayTeamName: "Notre Dame Fighting Irish", venueSlug: "kenan-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "North Carolina Tar Heels", homeTeamSlug: "north-carolina-tar-heels", awayTeamName: "Syracuse Orange", venueSlug: "kenan-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "North Carolina Tar Heels", homeTeamSlug: "north-carolina-tar-heels", awayTeamName: "Miami Hurricanes", venueSlug: "kenan-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "North Carolina Tar Heels", homeTeamSlug: "north-carolina-tar-heels", awayTeamName: "Louisville Cardinals", venueSlug: "kenan-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "North Carolina Tar Heels", homeTeamSlug: "north-carolina-tar-heels", awayTeamName: "NC State Wolfpack", venueSlug: "kenan-memorial-stadium", kickoffEt: null, kickoffTbd: true },
];

const NC_STATE: AccHomeFixture[] = [
  { date: "2026-09-11", homeTeamName: "NC State Wolfpack", homeTeamSlug: "nc-state-wolfpack", awayTeamName: "Richmond Spiders", venueSlug: "carter-finley-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "NC State Wolfpack", homeTeamSlug: "nc-state-wolfpack", awayTeamName: "App State Mountaineers", venueSlug: "carter-finley-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-03", homeTeamName: "NC State Wolfpack", homeTeamSlug: "nc-state-wolfpack", awayTeamName: "Louisville Cardinals", venueSlug: "carter-finley-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "NC State Wolfpack", homeTeamSlug: "nc-state-wolfpack", awayTeamName: "Wake Forest Demon Deacons", venueSlug: "carter-finley-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "NC State Wolfpack", homeTeamSlug: "nc-state-wolfpack", awayTeamName: "California Golden Bears", venueSlug: "carter-finley-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "NC State Wolfpack", homeTeamSlug: "nc-state-wolfpack", awayTeamName: "Duke Blue Devils", venueSlug: "carter-finley-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "NC State Wolfpack", homeTeamSlug: "nc-state-wolfpack", awayTeamName: "Syracuse Orange", venueSlug: "carter-finley-stadium", kickoffEt: null, kickoffTbd: true },
];

const PITTSBURGH: AccHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Pittsburgh Panthers", homeTeamSlug: "pittsburgh-panthers", awayTeamName: "Miami (OH) RedHawks", venueSlug: "acrisure-stadium", kickoffEt: "12:30 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Pittsburgh Panthers", homeTeamSlug: "pittsburgh-panthers", awayTeamName: "UCF Knights", venueSlug: "acrisure-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-17", homeTeamName: "Pittsburgh Panthers", homeTeamSlug: "pittsburgh-panthers", awayTeamName: "Syracuse Orange", venueSlug: "acrisure-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Pittsburgh Panthers", homeTeamSlug: "pittsburgh-panthers", awayTeamName: "Bucknell Bison", venueSlug: "acrisure-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "Pittsburgh Panthers", homeTeamSlug: "pittsburgh-panthers", awayTeamName: "North Carolina Tar Heels", venueSlug: "acrisure-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Pittsburgh Panthers", homeTeamSlug: "pittsburgh-panthers", awayTeamName: "Georgia Tech Yellow Jackets", venueSlug: "acrisure-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Pittsburgh Panthers", homeTeamSlug: "pittsburgh-panthers", awayTeamName: "Florida State Seminoles", venueSlug: "acrisure-stadium", kickoffEt: null, kickoffTbd: true, notes: "CBS/ACC schedule; ESPN scoreboard incomplete for this date" },
];

const SMU: AccHomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "SMU Mustangs", homeTeamSlug: "smu-mustangs", awayTeamName: "UC Davis Aggies", venueSlug: "gerald-j-ford-stadium", kickoffEt: "4:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "SMU Mustangs", homeTeamSlug: "smu-mustangs", awayTeamName: "Missouri State Bears", venueSlug: "gerald-j-ford-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-03", homeTeamName: "SMU Mustangs", homeTeamSlug: "smu-mustangs", awayTeamName: "Boston College Eagles", venueSlug: "gerald-j-ford-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "SMU Mustangs", homeTeamSlug: "smu-mustangs", awayTeamName: "Virginia Cavaliers", venueSlug: "gerald-j-ford-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "SMU Mustangs", homeTeamSlug: "smu-mustangs", awayTeamName: "California Golden Bears", venueSlug: "gerald-j-ford-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-06", homeTeamName: "SMU Mustangs", homeTeamSlug: "smu-mustangs", awayTeamName: "Virginia Tech Hokies", venueSlug: "gerald-j-ford-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-11-14", homeTeamName: "SMU Mustangs", homeTeamSlug: "smu-mustangs", awayTeamName: "Wake Forest Demon Deacons", venueSlug: "gerald-j-ford-stadium", kickoffEt: null, kickoffTbd: true },
];

const STANFORD: AccHomeFixture[] = [
  { date: "2026-08-29", homeTeamName: "Stanford Cardinal", homeTeamSlug: "stanford-cardinal", awayTeamName: "Hawaiʻi Rainbow Warriors", venueSlug: "stanford-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-04", homeTeamName: "Stanford Cardinal", homeTeamSlug: "stanford-cardinal", awayTeamName: "Miami Hurricanes", venueSlug: "stanford-stadium", kickoffEt: "9:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Stanford Cardinal", homeTeamSlug: "stanford-cardinal", awayTeamName: "Georgia Tech Yellow Jackets", venueSlug: "stanford-stadium", kickoffEt: "10:30 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "Stanford Cardinal", homeTeamSlug: "stanford-cardinal", awayTeamName: "Elon Phoenix", venueSlug: "stanford-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-10-23", homeTeamName: "Stanford Cardinal", homeTeamSlug: "stanford-cardinal", awayTeamName: "NC State Wolfpack", venueSlug: "stanford-stadium", kickoffEt: "10:30 PM", kickoffTbd: false },
  { date: "2026-11-28", homeTeamName: "Stanford Cardinal", homeTeamSlug: "stanford-cardinal", awayTeamName: "SMU Mustangs", venueSlug: "stanford-stadium", kickoffEt: null, kickoffTbd: true },
];

const SYRACUSE: AccHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Syracuse Orange", homeTeamSlug: "syracuse-orange", awayTeamName: "New Hampshire Wildcats", venueSlug: "jma-wireless-dome", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Syracuse Orange", homeTeamSlug: "syracuse-orange", awayTeamName: "California Golden Bears", venueSlug: "jma-wireless-dome", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "Syracuse Orange", homeTeamSlug: "syracuse-orange", awayTeamName: "Louisville Cardinals", venueSlug: "jma-wireless-dome", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Syracuse Orange", homeTeamSlug: "syracuse-orange", awayTeamName: "SMU Mustangs", venueSlug: "jma-wireless-dome", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Syracuse Orange", homeTeamSlug: "syracuse-orange", awayTeamName: "Clemson Tigers", venueSlug: "jma-wireless-dome", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Syracuse Orange", homeTeamSlug: "syracuse-orange", awayTeamName: "Notre Dame Fighting Irish", venueSlug: "jma-wireless-dome", kickoffEt: null, kickoffTbd: true },
];

const VIRGINIA: AccHomeFixture[] = [
  { date: "2026-09-11", homeTeamName: "Virginia Cavaliers", homeTeamSlug: "virginia-cavaliers", awayTeamName: "Norfolk State Spartans", venueSlug: "scott-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Virginia Cavaliers", homeTeamSlug: "virginia-cavaliers", awayTeamName: "Delaware Blue Hens", venueSlug: "scott-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Virginia Cavaliers", homeTeamSlug: "virginia-cavaliers", awayTeamName: "Syracuse Orange", venueSlug: "scott-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-23", homeTeamName: "Virginia Cavaliers", homeTeamSlug: "virginia-cavaliers", awayTeamName: "Duke Blue Devils", venueSlug: "scott-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-11-14", homeTeamName: "Virginia Cavaliers", homeTeamSlug: "virginia-cavaliers", awayTeamName: "California Golden Bears", venueSlug: "scott-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Virginia Cavaliers", homeTeamSlug: "virginia-cavaliers", awayTeamName: "North Carolina Tar Heels", venueSlug: "scott-stadium", kickoffEt: null, kickoffTbd: true },
];

const VIRGINIA_TECH: AccHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Virginia Tech Hokies", homeTeamSlug: "virginia-tech-hokies", awayTeamName: "VMI Keydets", venueSlug: "lane-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Virginia Tech Hokies", homeTeamSlug: "virginia-tech-hokies", awayTeamName: "Old Dominion Monarchs", venueSlug: "lane-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-10-02", homeTeamName: "Virginia Tech Hokies", homeTeamSlug: "virginia-tech-hokies", awayTeamName: "Pittsburgh Panthers", venueSlug: "lane-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "Virginia Tech Hokies", homeTeamSlug: "virginia-tech-hokies", awayTeamName: "Georgia Tech Yellow Jackets", venueSlug: "lane-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Virginia Tech Hokies", homeTeamSlug: "virginia-tech-hokies", awayTeamName: "Stanford Cardinal", venueSlug: "lane-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Virginia Tech Hokies", homeTeamSlug: "virginia-tech-hokies", awayTeamName: "Virginia Cavaliers", venueSlug: "lane-stadium", kickoffEt: null, kickoffTbd: true },
];

const WAKE_FOREST: AccHomeFixture[] = [
  { date: "2026-09-03", homeTeamName: "Wake Forest Demon Deacons", homeTeamSlug: "wake-forest-demon-deacons", awayTeamName: "Akron Zips", venueSlug: "allegacy-federal-credit-union-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-18", homeTeamName: "Wake Forest Demon Deacons", homeTeamSlug: "wake-forest-demon-deacons", awayTeamName: "Miami Hurricanes", venueSlug: "allegacy-federal-credit-union-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Wake Forest Demon Deacons", homeTeamSlug: "wake-forest-demon-deacons", awayTeamName: "Stanford Cardinal", venueSlug: "allegacy-federal-credit-union-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Wake Forest Demon Deacons", homeTeamSlug: "wake-forest-demon-deacons", awayTeamName: "Virginia Cavaliers", venueSlug: "allegacy-federal-credit-union-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Wake Forest Demon Deacons", homeTeamSlug: "wake-forest-demon-deacons", awayTeamName: "Merrimack Warriors", venueSlug: "allegacy-federal-credit-union-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-11-28", homeTeamName: "Wake Forest Demon Deacons", homeTeamSlug: "wake-forest-demon-deacons", awayTeamName: "Duke Blue Devils", venueSlug: "allegacy-federal-credit-union-stadium", kickoffEt: null, kickoffTbd: true },
];

export const NCAA_ACC_2026_HOME_FIXTURES: AccHomeFixture[] = [
  ...BOSTON_COLLEGE,
  ...CALIFORNIA,
  ...CLEMSON,
  ...DUKE,
  ...FLORIDA_STATE,
  ...GEORGIA_TECH,
  ...LOUISVILLE,
  ...MIAMI,
  ...NORTH_CAROLINA,
  ...NC_STATE,
  ...PITTSBURGH,
  ...SMU,
  ...STANFORD,
  ...SYRACUSE,
  ...VIRGINIA,
  ...VIRGINIA_TECH,
  ...WAKE_FOREST
];

export const NCAA_ACC_2026_EXCLUDED_NEUTRALS = [
  {
    date: "2026-08-29",
    homeTeamName: "TCU Horned Frogs",
    awayTeamName: "North Carolina Tar Heels",
    location: "Aviva Stadium, Dublin, Ireland",
    reason: "Aer Lingus College Football Classic — not a Kenan Memorial campus home"
  },
  {
    date: "2026-08-29",
    homeTeamName: "Virginia Cavaliers",
    awayTeamName: "NC State Wolfpack",
    location: "Nilton Santos Stadium, Rio de Janeiro, Brazil",
    reason: "College Football Brasil — ACC conference game on neutral international site"
  },
  {
    date: "2026-09-05",
    homeTeamName: "Louisville Cardinals",
    awayTeamName: "Ole Miss Rebels",
    location: "Nissan Stadium, Nashville, Tenn.",
    reason: "Neutral-site kickoff classic — not L&N Federal Credit Union Stadium"
  },
  {
    date: "2026-09-19",
    homeTeamName: "Virginia Cavaliers",
    awayTeamName: "West Virginia Mountaineers",
    location: "Bank of America Stadium, Charlotte, N.C.",
    reason: "Neutral-site rivalry / Duke's Mayo-style Charlotte game — not Scott Stadium"
  },
  {
    date: "2026-12-05",
    homeTeamName: "ACC Championship",
    awayTeamName: "ACC Championship",
    location: "Bank of America Stadium, Charlotte, N.C.",
    reason: "Conference championship — not a school home game"
  }
] as const;
