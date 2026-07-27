/**
 * Curated 2026 SEC regular-season home football fixtures.
 *
 * Sources: ESPN team schedules (season/2026) cross-checked with SEC athletics.
 * Kickoff times from ESPN are Eastern Time unless marked TBD.
 *
 * Exclusions (neutral / non-campus):
 * - Auburn vs Baylor (Sep 5) at Mercedes-Benz Stadium — Aflac Kickoff
 * - Ole Miss vs Louisville (Sep 6) at Nissan Stadium — Music City Kickoff
 * - Georgia vs Florida (Oct 31) at Mercedes-Benz Stadium — Cocktail Party
 * - Oklahoma vs Texas (Oct 10) at Cotton Bowl — Red River
 */

export type SecHomeFixture = {
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

const ALABAMA: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Alabama Crimson Tide", homeTeamSlug: "alabama-crimson-tide", awayTeamName: "East Carolina Pirates", venueSlug: "bryant-denny-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Alabama Crimson Tide", homeTeamSlug: "alabama-crimson-tide", awayTeamName: "Florida State Seminoles", venueSlug: "bryant-denny-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Alabama Crimson Tide", homeTeamSlug: "alabama-crimson-tide", awayTeamName: "South Carolina Gamecocks", venueSlug: "bryant-denny-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Alabama Crimson Tide", homeTeamSlug: "alabama-crimson-tide", awayTeamName: "Georgia Bulldogs", venueSlug: "bryant-denny-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Alabama Crimson Tide", homeTeamSlug: "alabama-crimson-tide", awayTeamName: "Texas A&M Aggies", venueSlug: "bryant-denny-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Alabama Crimson Tide", homeTeamSlug: "alabama-crimson-tide", awayTeamName: "Chattanooga Mocs", venueSlug: "bryant-denny-stadium", kickoffEt: "2:00 PM", kickoffTbd: false },
  { date: "2026-11-28", homeTeamName: "Alabama Crimson Tide", homeTeamSlug: "alabama-crimson-tide", awayTeamName: "Auburn Tigers", venueSlug: "bryant-denny-stadium", kickoffEt: null, kickoffTbd: true },
];

const ARKANSAS: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Arkansas Razorbacks", homeTeamSlug: "arkansas-razorbacks", awayTeamName: "North Alabama Lions", venueSlug: "donald-w-reynolds-razorback-stadium", kickoffEt: "4:15 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Arkansas Razorbacks", homeTeamSlug: "arkansas-razorbacks", awayTeamName: "Georgia Bulldogs", venueSlug: "donald-w-reynolds-razorback-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Arkansas Razorbacks", homeTeamSlug: "arkansas-razorbacks", awayTeamName: "Tulsa Golden Hurricane", venueSlug: "donald-w-reynolds-razorback-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "Arkansas Razorbacks", homeTeamSlug: "arkansas-razorbacks", awayTeamName: "Tennessee Volunteers", venueSlug: "donald-w-reynolds-razorback-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Arkansas Razorbacks", homeTeamSlug: "arkansas-razorbacks", awayTeamName: "Missouri Tigers", venueSlug: "donald-w-reynolds-razorback-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Arkansas Razorbacks", homeTeamSlug: "arkansas-razorbacks", awayTeamName: "South Carolina Gamecocks", venueSlug: "donald-w-reynolds-razorback-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Arkansas Razorbacks", homeTeamSlug: "arkansas-razorbacks", awayTeamName: "LSU Tigers", venueSlug: "donald-w-reynolds-razorback-stadium", kickoffEt: null, kickoffTbd: true },
];

const AUBURN: SecHomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "Auburn Tigers", homeTeamSlug: "auburn-tigers", awayTeamName: "Southern Miss Golden Eagles", venueSlug: "jordan-hare-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Auburn Tigers", homeTeamSlug: "auburn-tigers", awayTeamName: "Florida Gators", venueSlug: "jordan-hare-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Auburn Tigers", homeTeamSlug: "auburn-tigers", awayTeamName: "Vanderbilt Commodores", venueSlug: "jordan-hare-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Auburn Tigers", homeTeamSlug: "auburn-tigers", awayTeamName: "LSU Tigers", venueSlug: "jordan-hare-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-11-07", homeTeamName: "Auburn Tigers", homeTeamSlug: "auburn-tigers", awayTeamName: "Arkansas Razorbacks", venueSlug: "jordan-hare-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Auburn Tigers", homeTeamSlug: "auburn-tigers", awayTeamName: "Samford Bulldogs", venueSlug: "jordan-hare-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
];

const FLORIDA: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Florida Gators", homeTeamSlug: "florida-gators", awayTeamName: "Florida Atlantic Owls", venueSlug: "ben-hill-griffin-stadium", kickoffEt: "7:45 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Florida Gators", homeTeamSlug: "florida-gators", awayTeamName: "Campbell Fighting Camels", venueSlug: "ben-hill-griffin-stadium", kickoffEt: "5:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Florida Gators", homeTeamSlug: "florida-gators", awayTeamName: "Ole Miss Rebels", venueSlug: "ben-hill-griffin-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Florida Gators", homeTeamSlug: "florida-gators", awayTeamName: "South Carolina Gamecocks", venueSlug: "ben-hill-griffin-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Florida Gators", homeTeamSlug: "florida-gators", awayTeamName: "Oklahoma Sooners", venueSlug: "ben-hill-griffin-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Florida Gators", homeTeamSlug: "florida-gators", awayTeamName: "Vanderbilt Commodores", venueSlug: "ben-hill-griffin-stadium", kickoffEt: null, kickoffTbd: true },
];

const GEORGIA: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Georgia Bulldogs", homeTeamSlug: "georgia-bulldogs", awayTeamName: "Tennessee State Tigers", venueSlug: "sanford-stadium", kickoffEt: "3:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Georgia Bulldogs", homeTeamSlug: "georgia-bulldogs", awayTeamName: "Western Kentucky Hilltoppers", venueSlug: "sanford-stadium", kickoffEt: "12:45 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Georgia Bulldogs", homeTeamSlug: "georgia-bulldogs", awayTeamName: "Oklahoma Sooners", venueSlug: "sanford-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-03", homeTeamName: "Georgia Bulldogs", homeTeamSlug: "georgia-bulldogs", awayTeamName: "Vanderbilt Commodores", venueSlug: "sanford-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Georgia Bulldogs", homeTeamSlug: "georgia-bulldogs", awayTeamName: "Auburn Tigers", venueSlug: "sanford-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Georgia Bulldogs", homeTeamSlug: "georgia-bulldogs", awayTeamName: "Missouri Tigers", venueSlug: "sanford-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Georgia Bulldogs", homeTeamSlug: "georgia-bulldogs", awayTeamName: "Georgia Tech Yellow Jackets", venueSlug: "sanford-stadium", kickoffEt: null, kickoffTbd: true },
];

const KENTUCKY: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Kentucky Wildcats", homeTeamSlug: "kentucky-wildcats", awayTeamName: "Youngstown State Penguins", venueSlug: "kroger-field", kickoffEt: "1:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Kentucky Wildcats", homeTeamSlug: "kentucky-wildcats", awayTeamName: "Alabama Crimson Tide", venueSlug: "kroger-field", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Kentucky Wildcats", homeTeamSlug: "kentucky-wildcats", awayTeamName: "South Alabama Jaguars", venueSlug: "kroger-field", kickoffEt: "12:45 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "Kentucky Wildcats", homeTeamSlug: "kentucky-wildcats", awayTeamName: "LSU Tigers", venueSlug: "kroger-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Kentucky Wildcats", homeTeamSlug: "kentucky-wildcats", awayTeamName: "Vanderbilt Commodores", venueSlug: "kroger-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Kentucky Wildcats", homeTeamSlug: "kentucky-wildcats", awayTeamName: "Florida Gators", venueSlug: "kroger-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Kentucky Wildcats", homeTeamSlug: "kentucky-wildcats", awayTeamName: "Louisville Cardinals", venueSlug: "kroger-field", kickoffEt: null, kickoffTbd: true },
];

const LSU: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "LSU Tigers", homeTeamSlug: "lsu-tigers", awayTeamName: "Clemson Tigers", venueSlug: "tiger-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "LSU Tigers", homeTeamSlug: "lsu-tigers", awayTeamName: "Louisiana Tech Bulldogs", venueSlug: "tiger-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "LSU Tigers", homeTeamSlug: "lsu-tigers", awayTeamName: "Texas A&M Aggies", venueSlug: "tiger-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-03", homeTeamName: "LSU Tigers", homeTeamSlug: "lsu-tigers", awayTeamName: "McNeese Cowboys", venueSlug: "tiger-stadium", kickoffEt: "7:45 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "LSU Tigers", homeTeamSlug: "lsu-tigers", awayTeamName: "Mississippi State Bulldogs", venueSlug: "tiger-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "LSU Tigers", homeTeamSlug: "lsu-tigers", awayTeamName: "Alabama Crimson Tide", venueSlug: "tiger-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "LSU Tigers", homeTeamSlug: "lsu-tigers", awayTeamName: "Texas Longhorns", venueSlug: "tiger-stadium", kickoffEt: null, kickoffTbd: true },
];

const OLE_MISS: SecHomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "Ole Miss Rebels", homeTeamSlug: "ole-miss-rebels", awayTeamName: "Charlotte 49ers", venueSlug: "vaught-hemingway-stadium", kickoffEt: "7:45 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Ole Miss Rebels", homeTeamSlug: "ole-miss-rebels", awayTeamName: "LSU Tigers", venueSlug: "vaught-hemingway-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "Ole Miss Rebels", homeTeamSlug: "ole-miss-rebels", awayTeamName: "Missouri Tigers", venueSlug: "vaught-hemingway-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Ole Miss Rebels", homeTeamSlug: "ole-miss-rebels", awayTeamName: "Auburn Tigers", venueSlug: "vaught-hemingway-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Ole Miss Rebels", homeTeamSlug: "ole-miss-rebels", awayTeamName: "Georgia Bulldogs", venueSlug: "vaught-hemingway-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Ole Miss Rebels", homeTeamSlug: "ole-miss-rebels", awayTeamName: "Wofford Terriers", venueSlug: "vaught-hemingway-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-11-27", homeTeamName: "Ole Miss Rebels", homeTeamSlug: "ole-miss-rebels", awayTeamName: "Mississippi State Bulldogs", venueSlug: "vaught-hemingway-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
];

const MISSISSIPPI_STATE: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Mississippi State Bulldogs", homeTeamSlug: "mississippi-state-bulldogs", awayTeamName: "UL Monroe Warhawks", venueSlug: "davis-wade-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Mississippi State Bulldogs", homeTeamSlug: "mississippi-state-bulldogs", awayTeamName: "Missouri Tigers", venueSlug: "davis-wade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-03", homeTeamName: "Mississippi State Bulldogs", homeTeamSlug: "mississippi-state-bulldogs", awayTeamName: "Alabama Crimson Tide", venueSlug: "davis-wade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Mississippi State Bulldogs", homeTeamSlug: "mississippi-state-bulldogs", awayTeamName: "Oklahoma Sooners", venueSlug: "davis-wade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Mississippi State Bulldogs", homeTeamSlug: "mississippi-state-bulldogs", awayTeamName: "Vanderbilt Commodores", venueSlug: "davis-wade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Mississippi State Bulldogs", homeTeamSlug: "mississippi-state-bulldogs", awayTeamName: "Auburn Tigers", venueSlug: "davis-wade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Mississippi State Bulldogs", homeTeamSlug: "mississippi-state-bulldogs", awayTeamName: "Tennessee Tech Golden Eagles", venueSlug: "davis-wade-stadium", kickoffEt: "1:00 PM", kickoffTbd: false },
];

const MISSOURI: SecHomeFixture[] = [
  { date: "2026-09-03", homeTeamName: "Missouri Tigers", homeTeamSlug: "missouri-tigers", awayTeamName: "Arkansas-Pine Bluff Golden Lions", venueSlug: "faurot-field-at-memorial-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Missouri Tigers", homeTeamSlug: "missouri-tigers", awayTeamName: "Troy Trojans", venueSlug: "faurot-field-at-memorial-stadium", kickoffEt: "12:45 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Missouri Tigers", homeTeamSlug: "missouri-tigers", awayTeamName: "Florida Gators", venueSlug: "faurot-field-at-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Missouri Tigers", homeTeamSlug: "missouri-tigers", awayTeamName: "Texas A&M Aggies", venueSlug: "faurot-field-at-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Missouri Tigers", homeTeamSlug: "missouri-tigers", awayTeamName: "Texas Longhorns", venueSlug: "faurot-field-at-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Missouri Tigers", homeTeamSlug: "missouri-tigers", awayTeamName: "Kentucky Wildcats", venueSlug: "faurot-field-at-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Missouri Tigers", homeTeamSlug: "missouri-tigers", awayTeamName: "Oklahoma Sooners", venueSlug: "faurot-field-at-memorial-stadium", kickoffEt: null, kickoffTbd: true },
];

const OKLAHOMA: SecHomeFixture[] = [
  { date: "2026-09-04", homeTeamName: "Oklahoma Sooners", homeTeamSlug: "oklahoma-sooners", awayTeamName: "UTEP Miners", venueSlug: "gaylord-family-oklahoma-memorial-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Oklahoma Sooners", homeTeamSlug: "oklahoma-sooners", awayTeamName: "New Mexico Lobos", venueSlug: "gaylord-family-oklahoma-memorial-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "Oklahoma Sooners", homeTeamSlug: "oklahoma-sooners", awayTeamName: "Kentucky Wildcats", venueSlug: "gaylord-family-oklahoma-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Oklahoma Sooners", homeTeamSlug: "oklahoma-sooners", awayTeamName: "South Carolina Gamecocks", venueSlug: "gaylord-family-oklahoma-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Oklahoma Sooners", homeTeamSlug: "oklahoma-sooners", awayTeamName: "Ole Miss Rebels", venueSlug: "gaylord-family-oklahoma-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Oklahoma Sooners", homeTeamSlug: "oklahoma-sooners", awayTeamName: "Texas A&M Aggies", venueSlug: "gaylord-family-oklahoma-memorial-stadium", kickoffEt: null, kickoffTbd: true },
];

const SOUTH_CAROLINA: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "South Carolina Gamecocks", homeTeamSlug: "south-carolina-gamecocks", awayTeamName: "Kent State Golden Flashes", venueSlug: "williams-brice-stadium", kickoffEt: "12:45 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "South Carolina Gamecocks", homeTeamSlug: "south-carolina-gamecocks", awayTeamName: "Towson Tigers", venueSlug: "williams-brice-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "South Carolina Gamecocks", homeTeamSlug: "south-carolina-gamecocks", awayTeamName: "Mississippi State Bulldogs", venueSlug: "williams-brice-stadium", kickoffEt: "4:15 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "South Carolina Gamecocks", homeTeamSlug: "south-carolina-gamecocks", awayTeamName: "Kentucky Wildcats", venueSlug: "williams-brice-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "South Carolina Gamecocks", homeTeamSlug: "south-carolina-gamecocks", awayTeamName: "Tennessee Volunteers", venueSlug: "williams-brice-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "South Carolina Gamecocks", homeTeamSlug: "south-carolina-gamecocks", awayTeamName: "Texas A&M Aggies", venueSlug: "williams-brice-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "South Carolina Gamecocks", homeTeamSlug: "south-carolina-gamecocks", awayTeamName: "Georgia Bulldogs", venueSlug: "williams-brice-stadium", kickoffEt: null, kickoffTbd: true },
];

const TENNESSEE: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Tennessee Volunteers", homeTeamSlug: "tennessee-volunteers", awayTeamName: "Furman Paladins", venueSlug: "neyland-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Tennessee Volunteers", homeTeamSlug: "tennessee-volunteers", awayTeamName: "Kennesaw State Owls", venueSlug: "neyland-stadium", kickoffEt: "7:45 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Tennessee Volunteers", homeTeamSlug: "tennessee-volunteers", awayTeamName: "Texas Longhorns", venueSlug: "neyland-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Tennessee Volunteers", homeTeamSlug: "tennessee-volunteers", awayTeamName: "Auburn Tigers", venueSlug: "neyland-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Tennessee Volunteers", homeTeamSlug: "tennessee-volunteers", awayTeamName: "Alabama Crimson Tide", venueSlug: "neyland-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Tennessee Volunteers", homeTeamSlug: "tennessee-volunteers", awayTeamName: "Kentucky Wildcats", venueSlug: "neyland-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Tennessee Volunteers", homeTeamSlug: "tennessee-volunteers", awayTeamName: "LSU Tigers", venueSlug: "neyland-stadium", kickoffEt: null, kickoffTbd: true },
];

const TEXAS: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Texas Longhorns", homeTeamSlug: "texas-longhorns", awayTeamName: "Texas State Bobcats", venueSlug: "darrell-k-royal-texas-memorial-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Texas Longhorns", homeTeamSlug: "texas-longhorns", awayTeamName: "Ohio State Buckeyes", venueSlug: "darrell-k-royal-texas-memorial-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Texas Longhorns", homeTeamSlug: "texas-longhorns", awayTeamName: "UTSA Roadrunners", venueSlug: "darrell-k-royal-texas-memorial-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "Texas Longhorns", homeTeamSlug: "texas-longhorns", awayTeamName: "Florida Gators", venueSlug: "darrell-k-royal-texas-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Texas Longhorns", homeTeamSlug: "texas-longhorns", awayTeamName: "Ole Miss Rebels", venueSlug: "darrell-k-royal-texas-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Texas Longhorns", homeTeamSlug: "texas-longhorns", awayTeamName: "Mississippi State Bulldogs", venueSlug: "darrell-k-royal-texas-memorial-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Texas Longhorns", homeTeamSlug: "texas-longhorns", awayTeamName: "Arkansas Razorbacks", venueSlug: "darrell-k-royal-texas-memorial-stadium", kickoffEt: null, kickoffTbd: true },
];

const TEXAS_AM: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Texas A&M Aggies", homeTeamSlug: "texas-am-aggies", awayTeamName: "Missouri State Bears", venueSlug: "kyle-field", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Texas A&M Aggies", homeTeamSlug: "texas-am-aggies", awayTeamName: "Arizona State Sun Devils", venueSlug: "kyle-field", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Texas A&M Aggies", homeTeamSlug: "texas-am-aggies", awayTeamName: "Kentucky Wildcats", venueSlug: "kyle-field", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Texas A&M Aggies", homeTeamSlug: "texas-am-aggies", awayTeamName: "Arkansas Razorbacks", venueSlug: "kyle-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Texas A&M Aggies", homeTeamSlug: "texas-am-aggies", awayTeamName: "The Citadel Bulldogs", venueSlug: "kyle-field", kickoffEt: "1:00 PM", kickoffTbd: false },
  { date: "2026-11-14", homeTeamName: "Texas A&M Aggies", homeTeamSlug: "texas-am-aggies", awayTeamName: "Tennessee Volunteers", venueSlug: "kyle-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-27", homeTeamName: "Texas A&M Aggies", homeTeamSlug: "texas-am-aggies", awayTeamName: "Texas Longhorns", venueSlug: "kyle-field", kickoffEt: "7:30 PM", kickoffTbd: false },
];

const VANDERBILT: SecHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Vanderbilt Commodores", homeTeamSlug: "vanderbilt-commodores", awayTeamName: "Austin Peay Governors", venueSlug: "firstbank-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Vanderbilt Commodores", homeTeamSlug: "vanderbilt-commodores", awayTeamName: "Delaware Fightin' Blue Hens", venueSlug: "firstbank-stadium", kickoffEt: "4:15 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Vanderbilt Commodores", homeTeamSlug: "vanderbilt-commodores", awayTeamName: "NC State Wolfpack", venueSlug: "firstbank-stadium", kickoffEt: "12:45 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "Vanderbilt Commodores", homeTeamSlug: "vanderbilt-commodores", awayTeamName: "Ole Miss Rebels", venueSlug: "firstbank-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Vanderbilt Commodores", homeTeamSlug: "vanderbilt-commodores", awayTeamName: "Arkansas Razorbacks", venueSlug: "firstbank-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Vanderbilt Commodores", homeTeamSlug: "vanderbilt-commodores", awayTeamName: "Alabama Crimson Tide", venueSlug: "firstbank-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Vanderbilt Commodores", homeTeamSlug: "vanderbilt-commodores", awayTeamName: "Tennessee Volunteers", venueSlug: "firstbank-stadium", kickoffEt: null, kickoffTbd: true },
];

export const NCAA_SEC_2026_HOME_FIXTURES: SecHomeFixture[] = [
  ...ALABAMA,
  ...ARKANSAS,
  ...AUBURN,
  ...FLORIDA,
  ...GEORGIA,
  ...KENTUCKY,
  ...LSU,
  ...OLE_MISS,
  ...MISSISSIPPI_STATE,
  ...MISSOURI,
  ...OKLAHOMA,
  ...SOUTH_CAROLINA,
  ...TENNESSEE,
  ...TEXAS,
  ...TEXAS_AM,
  ...VANDERBILT,
];

/** Neutral / non-campus games intentionally omitted from campus stadium seeds. */
export const NCAA_SEC_2026_EXCLUDED_NEUTRALS = [
  {
    date: "2026-09-05",
    homeTeamName: "Auburn Tigers",
    awayTeamName: "Baylor Bears",
    location: "Mercedes-Benz Stadium, Atlanta, Ga.",
    reason: "Aflac Kickoff — not Jordan-Hare"
  },
  {
    date: "2026-09-06",
    homeTeamName: "Ole Miss Rebels",
    awayTeamName: "Louisville Cardinals",
    location: "Nissan Stadium, Nashville, Tenn.",
    reason: "Liberty Mutual Music City Kickoff — not Vaught-Hemingway"
  },
  {
    date: "2026-10-31",
    homeTeamName: "Georgia Bulldogs",
    awayTeamName: "Florida Gators",
    location: "Mercedes-Benz Stadium, Atlanta, Ga.",
    reason: "Florida–Georgia Cocktail Party — not Sanford or The Swamp"
  },
  {
    date: "2026-10-10",
    homeTeamName: "Oklahoma Sooners",
    awayTeamName: "Texas Longhorns",
    location: "Cotton Bowl, Dallas, Texas",
    reason: "Red River Rivalry — not Oklahoma Memorial or DKR"
  }
] as const;

