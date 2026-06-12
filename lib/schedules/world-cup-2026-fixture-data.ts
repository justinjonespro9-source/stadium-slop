/**
 * FIFA World Cup 2026 fixture seeds (local venue kickoffs).
 * Source: FIFA final draw schedule (Dec 2025), cross-checked with official fixture listings.
 * Do not edit UTC times directly — derive from localDate + localTime + venue IANA timezone.
 */

import type { WorldCupVenueSlug } from "@/lib/schedules/world-cup-venue-map";

export type WorldCupFixtureSeed = {
  matchNumber: number;
  localDate: string;
  localTime: string;
  venueSlug: WorldCupVenueSlug;
  stage: string;
  teamOneName: string;
  teamTwoName: string;
};

export const WORLD_CUP_2026_FIXTURE_SEEDS: WorldCupFixtureSeed[] = [
  {
    "matchNumber": 1,
    "localDate": "2026-06-11",
    "localTime": "13:00",
    "venueSlug": "estadio-azteca",
    "stage": "Group Stage",
    "teamOneName": "Mexico",
    "teamTwoName": "South Africa"
  },
  {
    "matchNumber": 2,
    "localDate": "2026-06-11",
    "localTime": "20:00",
    "venueSlug": "estadio-akron",
    "stage": "Group Stage",
    "teamOneName": "Korea Republic",
    "teamTwoName": "Czechia"
  },
  {
    "matchNumber": 3,
    "localDate": "2026-06-12",
    "localTime": "15:00",
    "venueSlug": "bmo-field",
    "stage": "Group Stage",
    "teamOneName": "Canada",
    "teamTwoName": "Bosnia and Herzegovina"
  },
  {
    "matchNumber": 4,
    "localDate": "2026-06-12",
    "localTime": "18:00",
    "venueSlug": "sofi-stadium",
    "stage": "Group Stage",
    "teamOneName": "United States",
    "teamTwoName": "Paraguay"
  },
  {
    "matchNumber": 5,
    "localDate": "2026-06-13",
    "localTime": "21:00",
    "venueSlug": "gillette-stadium",
    "stage": "Group Stage",
    "teamOneName": "Haiti",
    "teamTwoName": "Scotland"
  },
  {
    "matchNumber": 6,
    "localDate": "2026-06-12",
    "localTime": "21:00",
    "venueSlug": "bc-place",
    "stage": "Group Stage",
    "teamOneName": "Australia",
    "teamTwoName": "Türkiye"
  },
  {
    "matchNumber": 7,
    "localDate": "2026-06-13",
    "localTime": "18:00",
    "venueSlug": "metlife-stadium",
    "stage": "Group Stage",
    "teamOneName": "Brazil",
    "teamTwoName": "Morocco"
  },
  {
    "matchNumber": 8,
    "localDate": "2026-06-13",
    "localTime": "12:00",
    "venueSlug": "levi-s-stadium",
    "stage": "Group Stage",
    "teamOneName": "Qatar",
    "teamTwoName": "Switzerland"
  },
  {
    "matchNumber": 9,
    "localDate": "2026-06-14",
    "localTime": "19:00",
    "venueSlug": "lincoln-financial-field",
    "stage": "Group Stage",
    "teamOneName": "Côte d'Ivoire",
    "teamTwoName": "Ecuador"
  },
  {
    "matchNumber": 10,
    "localDate": "2026-06-14",
    "localTime": "12:00",
    "venueSlug": "nrg-stadium",
    "stage": "Group Stage",
    "teamOneName": "Germany",
    "teamTwoName": "Curaçao"
  },
  {
    "matchNumber": 11,
    "localDate": "2026-06-14",
    "localTime": "15:00",
    "venueSlug": "att-stadium",
    "stage": "Group Stage",
    "teamOneName": "Netherlands",
    "teamTwoName": "Japan"
  },
  {
    "matchNumber": 12,
    "localDate": "2026-06-14",
    "localTime": "20:00",
    "venueSlug": "estadio-bbva",
    "stage": "Group Stage",
    "teamOneName": "Sweden",
    "teamTwoName": "Tunisia"
  },
  {
    "matchNumber": 13,
    "localDate": "2026-06-15",
    "localTime": "18:00",
    "venueSlug": "hard-rock-stadium",
    "stage": "Group Stage",
    "teamOneName": "Saudi Arabia",
    "teamTwoName": "Uruguay"
  },
  {
    "matchNumber": 14,
    "localDate": "2026-06-15",
    "localTime": "12:00",
    "venueSlug": "mercedes-benz-stadium",
    "stage": "Group Stage",
    "teamOneName": "Spain",
    "teamTwoName": "Cabo Verde"
  },
  {
    "matchNumber": 15,
    "localDate": "2026-06-15",
    "localTime": "18:00",
    "venueSlug": "sofi-stadium",
    "stage": "Group Stage",
    "teamOneName": "IR Iran",
    "teamTwoName": "New Zealand"
  },
  {
    "matchNumber": 16,
    "localDate": "2026-06-15",
    "localTime": "12:00",
    "venueSlug": "lumen-field",
    "stage": "Group Stage",
    "teamOneName": "Belgium",
    "teamTwoName": "Egypt"
  },
  {
    "matchNumber": 17,
    "localDate": "2026-06-16",
    "localTime": "15:00",
    "venueSlug": "metlife-stadium",
    "stage": "Group Stage",
    "teamOneName": "France",
    "teamTwoName": "Senegal"
  },
  {
    "matchNumber": 18,
    "localDate": "2026-06-16",
    "localTime": "18:00",
    "venueSlug": "gillette-stadium",
    "stage": "Group Stage",
    "teamOneName": "Iraq",
    "teamTwoName": "Norway"
  },
  {
    "matchNumber": 19,
    "localDate": "2026-06-16",
    "localTime": "20:00",
    "venueSlug": "geha-field-at-arrowhead-stadium",
    "stage": "Group Stage",
    "teamOneName": "Argentina",
    "teamTwoName": "Algeria"
  },
  {
    "matchNumber": 20,
    "localDate": "2026-06-15",
    "localTime": "21:00",
    "venueSlug": "levi-s-stadium",
    "stage": "Group Stage",
    "teamOneName": "Austria",
    "teamTwoName": "Jordan"
  },
  {
    "matchNumber": 21,
    "localDate": "2026-06-17",
    "localTime": "19:00",
    "venueSlug": "bmo-field",
    "stage": "Group Stage",
    "teamOneName": "Ghana",
    "teamTwoName": "Panama"
  },
  {
    "matchNumber": 22,
    "localDate": "2026-06-17",
    "localTime": "15:00",
    "venueSlug": "att-stadium",
    "stage": "Group Stage",
    "teamOneName": "England",
    "teamTwoName": "Croatia"
  },
  {
    "matchNumber": 23,
    "localDate": "2026-06-17",
    "localTime": "12:00",
    "venueSlug": "nrg-stadium",
    "stage": "Group Stage",
    "teamOneName": "Portugal",
    "teamTwoName": "Congo DR"
  },
  {
    "matchNumber": 24,
    "localDate": "2026-06-17",
    "localTime": "20:00",
    "venueSlug": "estadio-azteca",
    "stage": "Group Stage",
    "teamOneName": "Uzbekistan",
    "teamTwoName": "Colombia"
  },
  {
    "matchNumber": 25,
    "localDate": "2026-06-18",
    "localTime": "12:00",
    "venueSlug": "mercedes-benz-stadium",
    "stage": "Group Stage",
    "teamOneName": "Czechia",
    "teamTwoName": "South Africa"
  },
  {
    "matchNumber": 26,
    "localDate": "2026-06-18",
    "localTime": "12:00",
    "venueSlug": "sofi-stadium",
    "stage": "Group Stage",
    "teamOneName": "Switzerland",
    "teamTwoName": "Bosnia and Herzegovina"
  },
  {
    "matchNumber": 27,
    "localDate": "2026-06-18",
    "localTime": "15:00",
    "venueSlug": "bc-place",
    "stage": "Group Stage",
    "teamOneName": "Canada",
    "teamTwoName": "Qatar"
  },
  {
    "matchNumber": 28,
    "localDate": "2026-06-18",
    "localTime": "19:00",
    "venueSlug": "estadio-akron",
    "stage": "Group Stage",
    "teamOneName": "Mexico",
    "teamTwoName": "Korea Republic"
  },
  {
    "matchNumber": 29,
    "localDate": "2026-06-19",
    "localTime": "21:00",
    "venueSlug": "lincoln-financial-field",
    "stage": "Group Stage",
    "teamOneName": "Brazil",
    "teamTwoName": "Haiti"
  },
  {
    "matchNumber": 30,
    "localDate": "2026-06-19",
    "localTime": "18:00",
    "venueSlug": "gillette-stadium",
    "stage": "Group Stage",
    "teamOneName": "Scotland",
    "teamTwoName": "Morocco"
  },
  {
    "matchNumber": 31,
    "localDate": "2026-06-19",
    "localTime": "20:00",
    "venueSlug": "levi-s-stadium",
    "stage": "Group Stage",
    "teamOneName": "Türkiye",
    "teamTwoName": "Paraguay"
  },
  {
    "matchNumber": 32,
    "localDate": "2026-06-19",
    "localTime": "12:00",
    "venueSlug": "lumen-field",
    "stage": "Group Stage",
    "teamOneName": "United States",
    "teamTwoName": "Australia"
  },
  {
    "matchNumber": 33,
    "localDate": "2026-06-20",
    "localTime": "16:00",
    "venueSlug": "bmo-field",
    "stage": "Group Stage",
    "teamOneName": "Germany",
    "teamTwoName": "Côte d'Ivoire"
  },
  {
    "matchNumber": 34,
    "localDate": "2026-06-20",
    "localTime": "19:00",
    "venueSlug": "geha-field-at-arrowhead-stadium",
    "stage": "Group Stage",
    "teamOneName": "Ecuador",
    "teamTwoName": "Curaçao"
  },
  {
    "matchNumber": 35,
    "localDate": "2026-06-20",
    "localTime": "12:00",
    "venueSlug": "nrg-stadium",
    "stage": "Group Stage",
    "teamOneName": "Netherlands",
    "teamTwoName": "Sweden"
  },
  {
    "matchNumber": 36,
    "localDate": "2026-06-19",
    "localTime": "22:00",
    "venueSlug": "estadio-bbva",
    "stage": "Group Stage",
    "teamOneName": "Tunisia",
    "teamTwoName": "Japan"
  },
  {
    "matchNumber": 37,
    "localDate": "2026-06-21",
    "localTime": "18:00",
    "venueSlug": "hard-rock-stadium",
    "stage": "Group Stage",
    "teamOneName": "Uruguay",
    "teamTwoName": "Cabo Verde"
  },
  {
    "matchNumber": 38,
    "localDate": "2026-06-21",
    "localTime": "12:00",
    "venueSlug": "mercedes-benz-stadium",
    "stage": "Group Stage",
    "teamOneName": "Spain",
    "teamTwoName": "Saudi Arabia"
  },
  {
    "matchNumber": 39,
    "localDate": "2026-06-21",
    "localTime": "12:00",
    "venueSlug": "sofi-stadium",
    "stage": "Group Stage",
    "teamOneName": "Belgium",
    "teamTwoName": "IR Iran"
  },
  {
    "matchNumber": 40,
    "localDate": "2026-06-21",
    "localTime": "18:00",
    "venueSlug": "bc-place",
    "stage": "Group Stage",
    "teamOneName": "New Zealand",
    "teamTwoName": "Egypt"
  },
  {
    "matchNumber": 41,
    "localDate": "2026-06-22",
    "localTime": "20:00",
    "venueSlug": "metlife-stadium",
    "stage": "Group Stage",
    "teamOneName": "Norway",
    "teamTwoName": "Senegal"
  },
  {
    "matchNumber": 42,
    "localDate": "2026-06-22",
    "localTime": "17:00",
    "venueSlug": "lincoln-financial-field",
    "stage": "Group Stage",
    "teamOneName": "France",
    "teamTwoName": "Iraq"
  },
  {
    "matchNumber": 43,
    "localDate": "2026-06-22",
    "localTime": "12:00",
    "venueSlug": "att-stadium",
    "stage": "Group Stage",
    "teamOneName": "Argentina",
    "teamTwoName": "Austria"
  },
  {
    "matchNumber": 44,
    "localDate": "2026-06-22",
    "localTime": "20:00",
    "venueSlug": "levi-s-stadium",
    "stage": "Group Stage",
    "teamOneName": "Jordan",
    "teamTwoName": "Algeria"
  },
  {
    "matchNumber": 45,
    "localDate": "2026-06-23",
    "localTime": "16:00",
    "venueSlug": "gillette-stadium",
    "stage": "Group Stage",
    "teamOneName": "England",
    "teamTwoName": "Ghana"
  },
  {
    "matchNumber": 46,
    "localDate": "2026-06-23",
    "localTime": "19:00",
    "venueSlug": "bmo-field",
    "stage": "Group Stage",
    "teamOneName": "Panama",
    "teamTwoName": "Croatia"
  },
  {
    "matchNumber": 47,
    "localDate": "2026-06-23",
    "localTime": "12:00",
    "venueSlug": "nrg-stadium",
    "stage": "Group Stage",
    "teamOneName": "Portugal",
    "teamTwoName": "Uzbekistan"
  },
  {
    "matchNumber": 48,
    "localDate": "2026-06-23",
    "localTime": "20:00",
    "venueSlug": "estadio-akron",
    "stage": "Group Stage",
    "teamOneName": "Colombia",
    "teamTwoName": "Congo DR"
  },
  {
    "matchNumber": 49,
    "localDate": "2026-06-24",
    "localTime": "18:00",
    "venueSlug": "hard-rock-stadium",
    "stage": "Group Stage",
    "teamOneName": "Scotland",
    "teamTwoName": "Brazil"
  },
  {
    "matchNumber": 50,
    "localDate": "2026-06-24",
    "localTime": "18:00",
    "venueSlug": "mercedes-benz-stadium",
    "stage": "Group Stage",
    "teamOneName": "Morocco",
    "teamTwoName": "Haiti"
  },
  {
    "matchNumber": 51,
    "localDate": "2026-06-24",
    "localTime": "12:00",
    "venueSlug": "bc-place",
    "stage": "Group Stage",
    "teamOneName": "Switzerland",
    "teamTwoName": "Canada"
  },
  {
    "matchNumber": 52,
    "localDate": "2026-06-24",
    "localTime": "12:00",
    "venueSlug": "lumen-field",
    "stage": "Group Stage",
    "teamOneName": "Bosnia and Herzegovina",
    "teamTwoName": "Qatar"
  },
  {
    "matchNumber": 53,
    "localDate": "2026-06-24",
    "localTime": "19:00",
    "venueSlug": "estadio-azteca",
    "stage": "Group Stage",
    "teamOneName": "Czechia",
    "teamTwoName": "Mexico"
  },
  {
    "matchNumber": 54,
    "localDate": "2026-06-24",
    "localTime": "19:00",
    "venueSlug": "estadio-bbva",
    "stage": "Group Stage",
    "teamOneName": "South Africa",
    "teamTwoName": "Korea Republic"
  },
  {
    "matchNumber": 55,
    "localDate": "2026-06-25",
    "localTime": "16:00",
    "venueSlug": "lincoln-financial-field",
    "stage": "Group Stage",
    "teamOneName": "Curaçao",
    "teamTwoName": "Côte d'Ivoire"
  },
  {
    "matchNumber": 56,
    "localDate": "2026-06-25",
    "localTime": "16:00",
    "venueSlug": "metlife-stadium",
    "stage": "Group Stage",
    "teamOneName": "Ecuador",
    "teamTwoName": "Germany"
  },
  {
    "matchNumber": 57,
    "localDate": "2026-06-25",
    "localTime": "18:00",
    "venueSlug": "att-stadium",
    "stage": "Group Stage",
    "teamOneName": "Japan",
    "teamTwoName": "Sweden"
  },
  {
    "matchNumber": 58,
    "localDate": "2026-06-25",
    "localTime": "18:00",
    "venueSlug": "geha-field-at-arrowhead-stadium",
    "stage": "Group Stage",
    "teamOneName": "Tunisia",
    "teamTwoName": "Netherlands"
  },
  {
    "matchNumber": 59,
    "localDate": "2026-06-25",
    "localTime": "19:00",
    "venueSlug": "sofi-stadium",
    "stage": "Group Stage",
    "teamOneName": "Türkiye",
    "teamTwoName": "United States"
  },
  {
    "matchNumber": 60,
    "localDate": "2026-06-25",
    "localTime": "19:00",
    "venueSlug": "levi-s-stadium",
    "stage": "Group Stage",
    "teamOneName": "Paraguay",
    "teamTwoName": "Australia"
  },
  {
    "matchNumber": 61,
    "localDate": "2026-06-26",
    "localTime": "15:00",
    "venueSlug": "gillette-stadium",
    "stage": "Group Stage",
    "teamOneName": "Norway",
    "teamTwoName": "France"
  },
  {
    "matchNumber": 62,
    "localDate": "2026-06-26",
    "localTime": "15:00",
    "venueSlug": "bmo-field",
    "stage": "Group Stage",
    "teamOneName": "Senegal",
    "teamTwoName": "Iraq"
  },
  {
    "matchNumber": 63,
    "localDate": "2026-06-26",
    "localTime": "20:00",
    "venueSlug": "lumen-field",
    "stage": "Group Stage",
    "teamOneName": "Egypt",
    "teamTwoName": "IR Iran"
  },
  {
    "matchNumber": 64,
    "localDate": "2026-06-26",
    "localTime": "20:00",
    "venueSlug": "bc-place",
    "stage": "Group Stage",
    "teamOneName": "New Zealand",
    "teamTwoName": "Belgium"
  },
  {
    "matchNumber": 65,
    "localDate": "2026-06-26",
    "localTime": "19:00",
    "venueSlug": "nrg-stadium",
    "stage": "Group Stage",
    "teamOneName": "Cabo Verde",
    "teamTwoName": "Saudi Arabia"
  },
  {
    "matchNumber": 66,
    "localDate": "2026-06-26",
    "localTime": "18:00",
    "venueSlug": "estadio-akron",
    "stage": "Group Stage",
    "teamOneName": "Uruguay",
    "teamTwoName": "Spain"
  },
  {
    "matchNumber": 67,
    "localDate": "2026-06-27",
    "localTime": "17:00",
    "venueSlug": "metlife-stadium",
    "stage": "Group Stage",
    "teamOneName": "Panama",
    "teamTwoName": "England"
  },
  {
    "matchNumber": 68,
    "localDate": "2026-06-27",
    "localTime": "17:00",
    "venueSlug": "lincoln-financial-field",
    "stage": "Group Stage",
    "teamOneName": "Croatia",
    "teamTwoName": "Ghana"
  },
  {
    "matchNumber": 69,
    "localDate": "2026-06-27",
    "localTime": "21:00",
    "venueSlug": "geha-field-at-arrowhead-stadium",
    "stage": "Group Stage",
    "teamOneName": "Algeria",
    "teamTwoName": "Austria"
  },
  {
    "matchNumber": 70,
    "localDate": "2026-06-27",
    "localTime": "21:00",
    "venueSlug": "att-stadium",
    "stage": "Group Stage",
    "teamOneName": "Jordan",
    "teamTwoName": "Argentina"
  },
  {
    "matchNumber": 71,
    "localDate": "2026-06-27",
    "localTime": "19:30",
    "venueSlug": "hard-rock-stadium",
    "stage": "Group Stage",
    "teamOneName": "Colombia",
    "teamTwoName": "Portugal"
  },
  {
    "matchNumber": 72,
    "localDate": "2026-06-27",
    "localTime": "19:30",
    "venueSlug": "mercedes-benz-stadium",
    "stage": "Group Stage",
    "teamOneName": "Congo DR",
    "teamTwoName": "Uzbekistan"
  },
  {
    "matchNumber": 73,
    "localDate": "2026-06-28",
    "localTime": "12:00",
    "venueSlug": "sofi-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group A Runners Up",
    "teamTwoName": "Group B Runners Up"
  },
  {
    "matchNumber": 74,
    "localDate": "2026-06-29",
    "localTime": "16:30",
    "venueSlug": "gillette-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group E Winners",
    "teamTwoName": "Group A/B/C/D/F 3rd Place"
  },
  {
    "matchNumber": 75,
    "localDate": "2026-06-29",
    "localTime": "19:00",
    "venueSlug": "estadio-bbva",
    "stage": "Round of 32",
    "teamOneName": "Group F Winners",
    "teamTwoName": "Group C Runners Up"
  },
  {
    "matchNumber": 76,
    "localDate": "2026-06-29",
    "localTime": "12:00",
    "venueSlug": "nrg-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group C Winners",
    "teamTwoName": "Group F Runners Up"
  },
  {
    "matchNumber": 77,
    "localDate": "2026-06-30",
    "localTime": "17:00",
    "venueSlug": "metlife-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group I Winners",
    "teamTwoName": "Group C/D/F/G/H 3rd Place"
  },
  {
    "matchNumber": 78,
    "localDate": "2026-06-30",
    "localTime": "12:00",
    "venueSlug": "att-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group E Runners Up",
    "teamTwoName": "Group I Runners Up"
  },
  {
    "matchNumber": 79,
    "localDate": "2026-06-30",
    "localTime": "19:00",
    "venueSlug": "estadio-azteca",
    "stage": "Round of 32",
    "teamOneName": "Group A Winners",
    "teamTwoName": "Group C/E/F/H/I 3rd Place"
  },
  {
    "matchNumber": 80,
    "localDate": "2026-07-01",
    "localTime": "12:00",
    "venueSlug": "mercedes-benz-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group L Winners",
    "teamTwoName": "Group E/H/I/J/K 3rd Place"
  },
  {
    "matchNumber": 81,
    "localDate": "2026-07-01",
    "localTime": "17:00",
    "venueSlug": "levi-s-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group D Winners",
    "teamTwoName": "Group B/E/F/I/J 3rd Place"
  },
  {
    "matchNumber": 82,
    "localDate": "2026-07-01",
    "localTime": "13:00",
    "venueSlug": "lumen-field",
    "stage": "Round of 32",
    "teamOneName": "Group G Winners",
    "teamTwoName": "Group A/E/H/I/J 3rd Place"
  },
  {
    "matchNumber": 83,
    "localDate": "2026-07-02",
    "localTime": "19:00",
    "venueSlug": "bmo-field",
    "stage": "Round of 32",
    "teamOneName": "Group K Runners Up",
    "teamTwoName": "Group L Runners Up"
  },
  {
    "matchNumber": 84,
    "localDate": "2026-07-02",
    "localTime": "12:00",
    "venueSlug": "sofi-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group H Winners",
    "teamTwoName": "Group J Runners Up"
  },
  {
    "matchNumber": 85,
    "localDate": "2026-07-02",
    "localTime": "20:00",
    "venueSlug": "bc-place",
    "stage": "Round of 32",
    "teamOneName": "Group B Winners",
    "teamTwoName": "Group E/F/G/I/J 3rd Place"
  },
  {
    "matchNumber": 86,
    "localDate": "2026-07-03",
    "localTime": "18:00",
    "venueSlug": "hard-rock-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group J Winners",
    "teamTwoName": "Group H Runners Up"
  },
  {
    "matchNumber": 87,
    "localDate": "2026-07-03",
    "localTime": "20:30",
    "venueSlug": "geha-field-at-arrowhead-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group K Winners",
    "teamTwoName": "Group D/E/I/J/L 3rd Place"
  },
  {
    "matchNumber": 88,
    "localDate": "2026-07-03",
    "localTime": "13:00",
    "venueSlug": "att-stadium",
    "stage": "Round of 32",
    "teamOneName": "Group D Runners Up",
    "teamTwoName": "Group G Runners Up"
  },
  {
    "matchNumber": 89,
    "localDate": "2026-07-04",
    "localTime": "17:00",
    "venueSlug": "lincoln-financial-field",
    "stage": "Round of 16",
    "teamOneName": "Match 74 Winner",
    "teamTwoName": "Match 77 Winner"
  },
  {
    "matchNumber": 90,
    "localDate": "2026-07-04",
    "localTime": "12:00",
    "venueSlug": "nrg-stadium",
    "stage": "Round of 16",
    "teamOneName": "Match 73 Winner",
    "teamTwoName": "Match 75 Winner"
  },
  {
    "matchNumber": 91,
    "localDate": "2026-07-05",
    "localTime": "16:00",
    "venueSlug": "metlife-stadium",
    "stage": "Round of 16",
    "teamOneName": "Match 76 Winner",
    "teamTwoName": "Match 78 Winner"
  },
  {
    "matchNumber": 92,
    "localDate": "2026-07-05",
    "localTime": "18:00",
    "venueSlug": "estadio-azteca",
    "stage": "Round of 16",
    "teamOneName": "Match 79 Winner",
    "teamTwoName": "Match 80 Winner"
  },
  {
    "matchNumber": 93,
    "localDate": "2026-07-06",
    "localTime": "14:00",
    "venueSlug": "att-stadium",
    "stage": "Round of 16",
    "teamOneName": "Match 83 Winner",
    "teamTwoName": "Match 84 Winner"
  },
  {
    "matchNumber": 94,
    "localDate": "2026-07-06",
    "localTime": "17:00",
    "venueSlug": "lumen-field",
    "stage": "Round of 16",
    "teamOneName": "Match 81 Winner",
    "teamTwoName": "Match 82 Winner"
  },
  {
    "matchNumber": 95,
    "localDate": "2026-07-07",
    "localTime": "12:00",
    "venueSlug": "mercedes-benz-stadium",
    "stage": "Round of 16",
    "teamOneName": "Match 86 Winner",
    "teamTwoName": "Match 88 Winner"
  },
  {
    "matchNumber": 96,
    "localDate": "2026-07-07",
    "localTime": "13:00",
    "venueSlug": "bc-place",
    "stage": "Round of 16",
    "teamOneName": "Match 85 Winner",
    "teamTwoName": "Match 87 Winner"
  },
  {
    "matchNumber": 97,
    "localDate": "2026-07-09",
    "localTime": "16:00",
    "venueSlug": "gillette-stadium",
    "stage": "Quarter-Final",
    "teamOneName": "Match 89 Winner",
    "teamTwoName": "Match 90 Winner"
  },
  {
    "matchNumber": 98,
    "localDate": "2026-07-10",
    "localTime": "12:00",
    "venueSlug": "sofi-stadium",
    "stage": "Quarter-Final",
    "teamOneName": "Match 93 Winner",
    "teamTwoName": "Match 94 Winner"
  },
  {
    "matchNumber": 99,
    "localDate": "2026-07-11",
    "localTime": "17:00",
    "venueSlug": "hard-rock-stadium",
    "stage": "Quarter-Final",
    "teamOneName": "Match 91 Winner",
    "teamTwoName": "Match 92 Winner"
  },
  {
    "matchNumber": 100,
    "localDate": "2026-07-11",
    "localTime": "20:00",
    "venueSlug": "geha-field-at-arrowhead-stadium",
    "stage": "Quarter-Final",
    "teamOneName": "Match 95 Winner",
    "teamTwoName": "Match 96 Winner"
  },
  {
    "matchNumber": 101,
    "localDate": "2026-07-14",
    "localTime": "14:00",
    "venueSlug": "att-stadium",
    "stage": "Semi-Final",
    "teamOneName": "Match 97 Winner",
    "teamTwoName": "Match 98 Winner"
  },
  {
    "matchNumber": 102,
    "localDate": "2026-07-15",
    "localTime": "15:00",
    "venueSlug": "mercedes-benz-stadium",
    "stage": "Semi-Final",
    "teamOneName": "Match 99 Winner",
    "teamTwoName": "Match 100 Winner"
  },
  {
    "matchNumber": 103,
    "localDate": "2026-07-18",
    "localTime": "17:00",
    "venueSlug": "hard-rock-stadium",
    "stage": "Third Place",
    "teamOneName": "Match 101 Loser",
    "teamTwoName": "Match 102 Loser"
  },
  {
    "matchNumber": 104,
    "localDate": "2026-07-19",
    "localTime": "15:00",
    "venueSlug": "metlife-stadium",
    "stage": "Final",
    "teamOneName": "Match 101 Winner",
    "teamTwoName": "Match 102 Winner"
  }
] as WorldCupFixtureSeed[];
