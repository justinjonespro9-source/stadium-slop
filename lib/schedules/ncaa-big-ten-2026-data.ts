/**
 * Curated 2026 Big Ten regular-season home football fixtures.
 *
 * Sources: ESPN team schedules (season/2026) cross-checked with athletics sites.
 * Kickoff times from ESPN are Eastern Time unless marked TBD.
 *
 * Exclusions (neutral / non-campus):
 * - Wisconsin vs Notre Dame (Sep 6) at Lambeau Field, Green Bay — not Camp Randall.
 */

export type BigTenHomeFixture = {
  /** Local calendar date YYYY-MM-DD in the venue's region (game day). */
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

const ILLINOIS: BigTenHomeFixture[] = [
  { date: "2026-09-03", homeTeamName: "Illinois Fighting Illini", homeTeamSlug: "illinois-fighting-illini", awayTeamName: "UAB Blazers", venueSlug: "memorial-stadium-illinois", kickoffEt: "9:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Illinois Fighting Illini", homeTeamSlug: "illinois-fighting-illini", awayTeamName: "Duke Blue Devils", venueSlug: "memorial-stadium-illinois", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Illinois Fighting Illini", homeTeamSlug: "illinois-fighting-illini", awayTeamName: "Southern Illinois Salukis", venueSlug: "memorial-stadium-illinois", kickoffEt: "2:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Illinois Fighting Illini", homeTeamSlug: "illinois-fighting-illini", awayTeamName: "Purdue Boilermakers", venueSlug: "memorial-stadium-illinois", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Illinois Fighting Illini", homeTeamSlug: "illinois-fighting-illini", awayTeamName: "Oregon Ducks", venueSlug: "memorial-stadium-illinois", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-06", homeTeamName: "Illinois Fighting Illini", homeTeamSlug: "illinois-fighting-illini", awayTeamName: "Nebraska Cornhuskers", venueSlug: "memorial-stadium-illinois", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-11-21", homeTeamName: "Illinois Fighting Illini", homeTeamSlug: "illinois-fighting-illini", awayTeamName: "Iowa Hawkeyes", venueSlug: "memorial-stadium-illinois", kickoffEt: null, kickoffTbd: true }
];

const INDIANA: BigTenHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Indiana Hoosiers", homeTeamSlug: "indiana-hoosiers", awayTeamName: "North Texas Mean Green", venueSlug: "memorial-stadium-indiana", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Indiana Hoosiers", homeTeamSlug: "indiana-hoosiers", awayTeamName: "Howard Bison", venueSlug: "memorial-stadium-indiana", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Indiana Hoosiers", homeTeamSlug: "indiana-hoosiers", awayTeamName: "Western Kentucky Hilltoppers", venueSlug: "memorial-stadium-indiana", kickoffEt: "4:00 PM", kickoffTbd: false },
  { date: "2026-09-25", homeTeamName: "Indiana Hoosiers", homeTeamSlug: "indiana-hoosiers", awayTeamName: "Northwestern Wildcats", venueSlug: "memorial-stadium-indiana", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "Indiana Hoosiers", homeTeamSlug: "indiana-hoosiers", awayTeamName: "Ohio State Buckeyes", venueSlug: "memorial-stadium-indiana", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Indiana Hoosiers", homeTeamSlug: "indiana-hoosiers", awayTeamName: "Minnesota Golden Gophers", venueSlug: "memorial-stadium-indiana", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Indiana Hoosiers", homeTeamSlug: "indiana-hoosiers", awayTeamName: "USC Trojans", venueSlug: "memorial-stadium-indiana", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Indiana Hoosiers", homeTeamSlug: "indiana-hoosiers", awayTeamName: "Purdue Boilermakers", venueSlug: "memorial-stadium-indiana", kickoffEt: null, kickoffTbd: true }
];

const IOWA: BigTenHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Iowa Hawkeyes", homeTeamSlug: "iowa-hawkeyes", awayTeamName: "Northern Illinois Huskies", venueSlug: "kinnick-stadium", kickoffEt: "4:15 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Iowa Hawkeyes", homeTeamSlug: "iowa-hawkeyes", awayTeamName: "Iowa State Cyclones", venueSlug: "kinnick-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Iowa Hawkeyes", homeTeamSlug: "iowa-hawkeyes", awayTeamName: "Northern Iowa Panthers", venueSlug: "kinnick-stadium", kickoffEt: "4:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Iowa Hawkeyes", homeTeamSlug: "iowa-hawkeyes", awayTeamName: "Ohio State Buckeyes", venueSlug: "kinnick-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Iowa Hawkeyes", homeTeamSlug: "iowa-hawkeyes", awayTeamName: "Wisconsin Badgers", venueSlug: "kinnick-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Iowa Hawkeyes", homeTeamSlug: "iowa-hawkeyes", awayTeamName: "Purdue Boilermakers", venueSlug: "kinnick-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-27", homeTeamName: "Iowa Hawkeyes", homeTeamSlug: "iowa-hawkeyes", awayTeamName: "Nebraska Cornhuskers", venueSlug: "kinnick-stadium", kickoffEt: "12:00 PM", kickoffTbd: false }
];

const MARYLAND: BigTenHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Maryland Terrapins", homeTeamSlug: "maryland-terrapins", awayTeamName: "Hampton Pirates", venueSlug: "secu-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Maryland Terrapins", homeTeamSlug: "maryland-terrapins", awayTeamName: "Virginia Tech Hokies", venueSlug: "secu-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Maryland Terrapins", homeTeamSlug: "maryland-terrapins", awayTeamName: "UCLA Bruins", venueSlug: "secu-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Maryland Terrapins", homeTeamSlug: "maryland-terrapins", awayTeamName: "Rutgers Scarlet Knights", venueSlug: "secu-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Maryland Terrapins", homeTeamSlug: "maryland-terrapins", awayTeamName: "Illinois Fighting Illini", venueSlug: "secu-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Maryland Terrapins", homeTeamSlug: "maryland-terrapins", awayTeamName: "Wisconsin Badgers", venueSlug: "secu-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Maryland Terrapins", homeTeamSlug: "maryland-terrapins", awayTeamName: "Penn State Nittany Lions", venueSlug: "secu-stadium", kickoffEt: null, kickoffTbd: true }
];

const MICHIGAN: BigTenHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Michigan Wolverines", homeTeamSlug: "michigan-wolverines", awayTeamName: "Western Michigan Broncos", venueSlug: "michigan-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Michigan Wolverines", homeTeamSlug: "michigan-wolverines", awayTeamName: "Oklahoma Sooners", venueSlug: "michigan-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Michigan Wolverines", homeTeamSlug: "michigan-wolverines", awayTeamName: "UTEP Miners", venueSlug: "michigan-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Michigan Wolverines", homeTeamSlug: "michigan-wolverines", awayTeamName: "Iowa Hawkeyes", venueSlug: "michigan-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Michigan Wolverines", homeTeamSlug: "michigan-wolverines", awayTeamName: "Penn State Nittany Lions", venueSlug: "michigan-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Michigan Wolverines", homeTeamSlug: "michigan-wolverines", awayTeamName: "Indiana Hoosiers", venueSlug: "michigan-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Michigan Wolverines", homeTeamSlug: "michigan-wolverines", awayTeamName: "Michigan State Spartans", venueSlug: "michigan-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Michigan Wolverines", homeTeamSlug: "michigan-wolverines", awayTeamName: "UCLA Bruins", venueSlug: "michigan-stadium", kickoffEt: null, kickoffTbd: true }
];

const MICHIGAN_STATE: BigTenHomeFixture[] = [
  { date: "2026-09-04", homeTeamName: "Michigan State Spartans", homeTeamSlug: "michigan-state-spartans", awayTeamName: "Toledo Rockets", venueSlug: "spartan-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Michigan State Spartans", homeTeamSlug: "michigan-state-spartans", awayTeamName: "Eastern Michigan Eagles", venueSlug: "spartan-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Michigan State Spartans", homeTeamSlug: "michigan-state-spartans", awayTeamName: "Nebraska Cornhuskers", venueSlug: "spartan-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Michigan State Spartans", homeTeamSlug: "michigan-state-spartans", awayTeamName: "Illinois Fighting Illini", venueSlug: "spartan-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Michigan State Spartans", homeTeamSlug: "michigan-state-spartans", awayTeamName: "Northwestern Wildcats", venueSlug: "spartan-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Michigan State Spartans", homeTeamSlug: "michigan-state-spartans", awayTeamName: "Washington Huskies", venueSlug: "spartan-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-20", homeTeamName: "Michigan State Spartans", homeTeamSlug: "michigan-state-spartans", awayTeamName: "Oregon Ducks", venueSlug: "spartan-stadium", kickoffEt: "8:00 PM", kickoffTbd: false }
];

const MINNESOTA: BigTenHomeFixture[] = [
  { date: "2026-09-03", homeTeamName: "Minnesota Golden Gophers", homeTeamSlug: "minnesota-golden-gophers", awayTeamName: "Eastern Illinois Panthers", venueSlug: "huntington-bank-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Minnesota Golden Gophers", homeTeamSlug: "minnesota-golden-gophers", awayTeamName: "Mississippi State Bulldogs", venueSlug: "huntington-bank-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Minnesota Golden Gophers", homeTeamSlug: "minnesota-golden-gophers", awayTeamName: "Akron Zips", venueSlug: "huntington-bank-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Minnesota Golden Gophers", homeTeamSlug: "minnesota-golden-gophers", awayTeamName: "Michigan Wolverines", venueSlug: "huntington-bank-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Minnesota Golden Gophers", homeTeamSlug: "minnesota-golden-gophers", awayTeamName: "Iowa Hawkeyes", venueSlug: "huntington-bank-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Minnesota Golden Gophers", homeTeamSlug: "minnesota-golden-gophers", awayTeamName: "UCLA Bruins", venueSlug: "huntington-bank-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Minnesota Golden Gophers", homeTeamSlug: "minnesota-golden-gophers", awayTeamName: "Northwestern Wildcats", venueSlug: "huntington-bank-stadium", kickoffEt: null, kickoffTbd: true }
];

const NEBRASKA: BigTenHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Nebraska Cornhuskers", homeTeamSlug: "nebraska-cornhuskers", awayTeamName: "Ohio Bobcats", venueSlug: "memorial-stadium-nebraska", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Nebraska Cornhuskers", homeTeamSlug: "nebraska-cornhuskers", awayTeamName: "Bowling Green Falcons", venueSlug: "memorial-stadium-nebraska", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Nebraska Cornhuskers", homeTeamSlug: "nebraska-cornhuskers", awayTeamName: "North Dakota Fighting Hawks", venueSlug: "memorial-stadium-nebraska", kickoffEt: "7:15 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Nebraska Cornhuskers", homeTeamSlug: "nebraska-cornhuskers", awayTeamName: "Maryland Terrapins", venueSlug: "memorial-stadium-nebraska", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Nebraska Cornhuskers", homeTeamSlug: "nebraska-cornhuskers", awayTeamName: "Indiana Hoosiers", venueSlug: "memorial-stadium-nebraska", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Nebraska Cornhuskers", homeTeamSlug: "nebraska-cornhuskers", awayTeamName: "Washington Huskies", venueSlug: "memorial-stadium-nebraska", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Nebraska Cornhuskers", homeTeamSlug: "nebraska-cornhuskers", awayTeamName: "Ohio State Buckeyes", venueSlug: "memorial-stadium-nebraska", kickoffEt: null, kickoffTbd: true }
];

/** Northwestern: first two at Martin Stadium; rest at new Ryan Field. */
const NORTHWESTERN: BigTenHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Northwestern Wildcats", homeTeamSlug: "northwestern-wildcats", awayTeamName: "South Dakota State Jackrabbits", venueSlug: "northwestern-medicine-field-at-martin-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Northwestern Wildcats", homeTeamSlug: "northwestern-wildcats", awayTeamName: "Colorado Buffaloes", venueSlug: "northwestern-medicine-field-at-martin-stadium", kickoffEt: "7:30 PM", kickoffTbd: false },
  { date: "2026-10-02", homeTeamName: "Northwestern Wildcats", homeTeamSlug: "northwestern-wildcats", awayTeamName: "Penn State Nittany Lions", venueSlug: "ryan-field", kickoffEt: "8:00 PM", kickoffTbd: false, notes: "Ryan Field inaugural game" },
  { date: "2026-10-10", homeTeamName: "Northwestern Wildcats", homeTeamSlug: "northwestern-wildcats", awayTeamName: "Ball State Cardinals", venueSlug: "ryan-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Northwestern Wildcats", homeTeamSlug: "northwestern-wildcats", awayTeamName: "Rutgers Scarlet Knights", venueSlug: "ryan-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Northwestern Wildcats", homeTeamSlug: "northwestern-wildcats", awayTeamName: "Iowa Hawkeyes", venueSlug: "ryan-field", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Northwestern Wildcats", homeTeamSlug: "northwestern-wildcats", awayTeamName: "Illinois Fighting Illini", venueSlug: "ryan-field", kickoffEt: null, kickoffTbd: true }
];

const OHIO_STATE: BigTenHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Ohio State Buckeyes", homeTeamSlug: "ohio-state-buckeyes", awayTeamName: "Ball State Cardinals", venueSlug: "ohio-stadium", kickoffEt: "12:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Ohio State Buckeyes", homeTeamSlug: "ohio-state-buckeyes", awayTeamName: "Kent State Golden Flashes", venueSlug: "ohio-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Ohio State Buckeyes", homeTeamSlug: "ohio-state-buckeyes", awayTeamName: "Illinois Fighting Illini", venueSlug: "ohio-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Ohio State Buckeyes", homeTeamSlug: "ohio-state-buckeyes", awayTeamName: "Maryland Terrapins", venueSlug: "ohio-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Ohio State Buckeyes", homeTeamSlug: "ohio-state-buckeyes", awayTeamName: "Oregon Ducks", venueSlug: "ohio-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Ohio State Buckeyes", homeTeamSlug: "ohio-state-buckeyes", awayTeamName: "Northwestern Wildcats", venueSlug: "ohio-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Ohio State Buckeyes", homeTeamSlug: "ohio-state-buckeyes", awayTeamName: "Michigan Wolverines", venueSlug: "ohio-stadium", kickoffEt: "12:00 PM", kickoffTbd: false }
];

const OREGON: BigTenHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Oregon Ducks", homeTeamSlug: "oregon-ducks", awayTeamName: "Boise State Broncos", venueSlug: "autzen-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-18", homeTeamName: "Oregon Ducks", homeTeamSlug: "oregon-ducks", awayTeamName: "Portland State Vikings", venueSlug: "autzen-stadium", kickoffEt: "10:30 PM", kickoffTbd: false },
  { date: "2026-10-10", homeTeamName: "Oregon Ducks", homeTeamSlug: "oregon-ducks", awayTeamName: "UCLA Bruins", venueSlug: "autzen-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-17", homeTeamName: "Oregon Ducks", homeTeamSlug: "oregon-ducks", awayTeamName: "Nebraska Cornhuskers", venueSlug: "autzen-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Oregon Ducks", homeTeamSlug: "oregon-ducks", awayTeamName: "Northwestern Wildcats", venueSlug: "autzen-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Oregon Ducks", homeTeamSlug: "oregon-ducks", awayTeamName: "Michigan Wolverines", venueSlug: "autzen-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Oregon Ducks", homeTeamSlug: "oregon-ducks", awayTeamName: "Washington Huskies", venueSlug: "autzen-stadium", kickoffEt: null, kickoffTbd: true }
];

const PENN_STATE: BigTenHomeFixture[] = [
  { date: "2026-09-05", homeTeamName: "Penn State Nittany Lions", homeTeamSlug: "penn-state-nittany-lions", awayTeamName: "Marshall Thundering Herd", venueSlug: "beaver-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Penn State Nittany Lions", homeTeamSlug: "penn-state-nittany-lions", awayTeamName: "Buffalo Bulls", venueSlug: "beaver-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Penn State Nittany Lions", homeTeamSlug: "penn-state-nittany-lions", awayTeamName: "Wisconsin Badgers", venueSlug: "beaver-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Penn State Nittany Lions", homeTeamSlug: "penn-state-nittany-lions", awayTeamName: "USC Trojans", venueSlug: "beaver-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "Penn State Nittany Lions", homeTeamSlug: "penn-state-nittany-lions", awayTeamName: "Purdue Boilermakers", venueSlug: "beaver-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Penn State Nittany Lions", homeTeamSlug: "penn-state-nittany-lions", awayTeamName: "Minnesota Golden Gophers", venueSlug: "beaver-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Penn State Nittany Lions", homeTeamSlug: "penn-state-nittany-lions", awayTeamName: "Rutgers Scarlet Knights", venueSlug: "beaver-stadium", kickoffEt: null, kickoffTbd: true }
];

const PURDUE: BigTenHomeFixture[] = [
  { date: "2026-09-04", homeTeamName: "Purdue Boilermakers", homeTeamSlug: "purdue-boilermakers", awayTeamName: "Indiana State Sycamores", venueSlug: "ross-ade-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Purdue Boilermakers", homeTeamSlug: "purdue-boilermakers", awayTeamName: "Wake Forest Demon Deacons", venueSlug: "ross-ade-stadium", kickoffEt: "12:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Purdue Boilermakers", homeTeamSlug: "purdue-boilermakers", awayTeamName: "Notre Dame Fighting Irish", venueSlug: "ross-ade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-10", homeTeamName: "Purdue Boilermakers", homeTeamSlug: "purdue-boilermakers", awayTeamName: "Minnesota Golden Gophers", venueSlug: "ross-ade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-16", homeTeamName: "Purdue Boilermakers", homeTeamSlug: "purdue-boilermakers", awayTeamName: "Washington Huskies", venueSlug: "ross-ade-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-11-07", homeTeamName: "Purdue Boilermakers", homeTeamSlug: "purdue-boilermakers", awayTeamName: "Maryland Terrapins", venueSlug: "ross-ade-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Purdue Boilermakers", homeTeamSlug: "purdue-boilermakers", awayTeamName: "Wisconsin Badgers", venueSlug: "ross-ade-stadium", kickoffEt: null, kickoffTbd: true }
];

const RUTGERS: BigTenHomeFixture[] = [
  { date: "2026-09-03", homeTeamName: "Rutgers Scarlet Knights", homeTeamSlug: "rutgers-scarlet-knights", awayTeamName: "Massachusetts Minutemen", venueSlug: "shi-stadium", kickoffEt: "6:00 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Rutgers Scarlet Knights", homeTeamSlug: "rutgers-scarlet-knights", awayTeamName: "USC Trojans", venueSlug: "shi-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-25", homeTeamName: "Rutgers Scarlet Knights", homeTeamSlug: "rutgers-scarlet-knights", awayTeamName: "Howard Bison", venueSlug: "shi-stadium", kickoffEt: "7:00 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Rutgers Scarlet Knights", homeTeamSlug: "rutgers-scarlet-knights", awayTeamName: "Indiana Hoosiers", venueSlug: "shi-stadium", kickoffEt: "8:00 PM", kickoffTbd: false },
  { date: "2026-10-31", homeTeamName: "Rutgers Scarlet Knights", homeTeamSlug: "rutgers-scarlet-knights", awayTeamName: "Michigan Wolverines", venueSlug: "shi-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-14", homeTeamName: "Rutgers Scarlet Knights", homeTeamSlug: "rutgers-scarlet-knights", awayTeamName: "Nebraska Cornhuskers", venueSlug: "shi-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-28", homeTeamName: "Rutgers Scarlet Knights", homeTeamSlug: "rutgers-scarlet-knights", awayTeamName: "Michigan State Spartans", venueSlug: "shi-stadium", kickoffEt: null, kickoffTbd: true }
];

const UCLA: BigTenHomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "UCLA Bruins", homeTeamSlug: "ucla-bruins", awayTeamName: "San Diego State Aztecs", venueSlug: "rose-bowl", kickoffEt: "7:15 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "UCLA Bruins", homeTeamSlug: "ucla-bruins", awayTeamName: "Purdue Boilermakers", venueSlug: "rose-bowl", kickoffEt: "11:00 PM", kickoffTbd: false },
  { date: "2026-10-17", homeTeamName: "UCLA Bruins", homeTeamSlug: "ucla-bruins", awayTeamName: "Wisconsin Badgers", venueSlug: "rose-bowl", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "UCLA Bruins", homeTeamSlug: "ucla-bruins", awayTeamName: "Michigan State Spartans", venueSlug: "rose-bowl", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "UCLA Bruins", homeTeamSlug: "ucla-bruins", awayTeamName: "Nevada Wolf Pack", venueSlug: "rose-bowl", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-13", homeTeamName: "UCLA Bruins", homeTeamSlug: "ucla-bruins", awayTeamName: "Illinois Fighting Illini", venueSlug: "rose-bowl", kickoffEt: "9:00 PM", kickoffTbd: false },
  { date: "2026-11-28", homeTeamName: "UCLA Bruins", homeTeamSlug: "ucla-bruins", awayTeamName: "USC Trojans", venueSlug: "rose-bowl", kickoffEt: null, kickoffTbd: true }
];

const USC: BigTenHomeFixture[] = [
  { date: "2026-08-29", homeTeamName: "USC Trojans", homeTeamSlug: "usc-trojans", awayTeamName: "San José State Spartans", venueSlug: "los-angeles-memorial-coliseum", kickoffEt: "3:00 PM", kickoffTbd: false },
  { date: "2026-09-04", homeTeamName: "USC Trojans", homeTeamSlug: "usc-trojans", awayTeamName: "Fresno State Bulldogs", venueSlug: "los-angeles-memorial-coliseum", kickoffEt: "9:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "USC Trojans", homeTeamSlug: "usc-trojans", awayTeamName: "Louisiana Ragin' Cajuns", venueSlug: "los-angeles-memorial-coliseum", kickoffEt: "11:00 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "USC Trojans", homeTeamSlug: "usc-trojans", awayTeamName: "Oregon Ducks", venueSlug: "los-angeles-memorial-coliseum", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-03", homeTeamName: "USC Trojans", homeTeamSlug: "usc-trojans", awayTeamName: "Washington Huskies", venueSlug: "los-angeles-memorial-coliseum", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-31", homeTeamName: "USC Trojans", homeTeamSlug: "usc-trojans", awayTeamName: "Ohio State Buckeyes", venueSlug: "los-angeles-memorial-coliseum", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "USC Trojans", homeTeamSlug: "usc-trojans", awayTeamName: "Maryland Terrapins", venueSlug: "los-angeles-memorial-coliseum", kickoffEt: null, kickoffTbd: true }
];

const WASHINGTON: BigTenHomeFixture[] = [
  { date: "2026-09-06", homeTeamName: "Washington Huskies", homeTeamSlug: "washington-huskies", awayTeamName: "Washington State Cougars", venueSlug: "husky-stadium", kickoffEt: "4:00 PM", kickoffTbd: false },
  { date: "2026-09-12", homeTeamName: "Washington Huskies", homeTeamSlug: "washington-huskies", awayTeamName: "Utah State Aggies", venueSlug: "husky-stadium", kickoffEt: "3:30 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Washington Huskies", homeTeamSlug: "washington-huskies", awayTeamName: "Eastern Washington Eagles", venueSlug: "husky-stadium", kickoffEt: "7:15 PM", kickoffTbd: false },
  { date: "2026-09-26", homeTeamName: "Washington Huskies", homeTeamSlug: "washington-huskies", awayTeamName: "Minnesota Golden Gophers", venueSlug: "husky-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-09", homeTeamName: "Washington Huskies", homeTeamSlug: "washington-huskies", awayTeamName: "Iowa Hawkeyes", venueSlug: "husky-stadium", kickoffEt: "9:00 PM", kickoffTbd: false },
  { date: "2026-11-07", homeTeamName: "Washington Huskies", homeTeamSlug: "washington-huskies", awayTeamName: "Penn State Nittany Lions", venueSlug: "husky-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-21", homeTeamName: "Washington Huskies", homeTeamSlug: "washington-huskies", awayTeamName: "Indiana Hoosiers", venueSlug: "husky-stadium", kickoffEt: null, kickoffTbd: true }
];

/**
 * Camp Randall home slate — Notre Dame at Lambeau Field (Green Bay) excluded.
 * ESPN ET times; UW athletics lists local CT equivalents for known kickoffs.
 */
const WISCONSIN: BigTenHomeFixture[] = [
  { date: "2026-09-12", homeTeamName: "Wisconsin Badgers", homeTeamSlug: "wisconsin-badgers", awayTeamName: "Western Illinois Leathernecks", venueSlug: "camp-randall-stadium", kickoffEt: "7:15 PM", kickoffTbd: false },
  { date: "2026-09-19", homeTeamName: "Wisconsin Badgers", homeTeamSlug: "wisconsin-badgers", awayTeamName: "Eastern Michigan Eagles", venueSlug: "camp-randall-stadium", kickoffEt: "12:30 PM", kickoffTbd: false },
  { date: "2026-10-03", homeTeamName: "Wisconsin Badgers", homeTeamSlug: "wisconsin-badgers", awayTeamName: "Michigan State Spartans", venueSlug: "camp-randall-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-10-24", homeTeamName: "Wisconsin Badgers", homeTeamSlug: "wisconsin-badgers", awayTeamName: "USC Trojans", venueSlug: "camp-randall-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-07", homeTeamName: "Wisconsin Badgers", homeTeamSlug: "wisconsin-badgers", awayTeamName: "Rutgers Scarlet Knights", venueSlug: "camp-randall-stadium", kickoffEt: null, kickoffTbd: true },
  { date: "2026-11-27", homeTeamName: "Wisconsin Badgers", homeTeamSlug: "wisconsin-badgers", awayTeamName: "Minnesota Golden Gophers", venueSlug: "camp-randall-stadium", kickoffEt: "7:30 PM", kickoffTbd: false }
];

export const NCAA_BIG_TEN_2026_HOME_FIXTURES: BigTenHomeFixture[] = [
  ...ILLINOIS,
  ...INDIANA,
  ...IOWA,
  ...MARYLAND,
  ...MICHIGAN,
  ...MICHIGAN_STATE,
  ...MINNESOTA,
  ...NEBRASKA,
  ...NORTHWESTERN,
  ...OHIO_STATE,
  ...OREGON,
  ...PENN_STATE,
  ...PURDUE,
  ...RUTGERS,
  ...UCLA,
  ...USC,
  ...WASHINGTON,
  ...WISCONSIN
];

/** Neutral / non-campus games intentionally omitted from campus stadium seeds. */
export const NCAA_BIG_TEN_2026_EXCLUDED_NEUTRALS = [
  {
    date: "2026-09-06",
    homeTeamName: "Wisconsin Badgers",
    awayTeamName: "Notre Dame Fighting Irish",
    location: "Lambeau Field, Green Bay, Wis.",
    reason: "Neutral/special site — not Camp Randall"
  }
] as const;
