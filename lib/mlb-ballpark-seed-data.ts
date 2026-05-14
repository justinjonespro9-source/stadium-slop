import ballparksJson from "../data/mlb/mlb-ballparks-venues.json";
import type { MlbVenueImportRow } from "./mlb-import-shape";

export type MlbBallparkSeedRow = MlbVenueImportRow & { reviewNotes?: string };

type Payload = {
  version: number;
  venues: MlbBallparkSeedRow[];
  vendors: unknown[];
};

export const MLB_BALLPARKS_VENUES_PAYLOAD = ballparksJson as Payload;

export function getMlbBallparkSeedRows(): MlbBallparkSeedRow[] {
  return MLB_BALLPARKS_VENUES_PAYLOAD.venues;
}
