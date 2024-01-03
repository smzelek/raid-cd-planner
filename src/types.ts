import { Phases, Spell } from "./backend/services/blizzard.service";
import { Class, Spec } from "./frontend/constants";
import { CURRENT_RAID_ENCOUNTER_IDS } from "./utils";

export type dash_case_string = string;
export type formatted_string = string;
export type milliseconds_since_epoch_timestamp = number;
export type guid = string;

export interface ApiErrorResponse extends ApiResponse {
    error: string;
}

export interface ApiSuccessResponse<T extends string | object> extends ApiResponse {
    body: T;
}

export interface ApiResponse {
    status: number;
}

export type BlizzardEncounter = {
    id: number;
    name: string;
    phases: Phases[];
}

export type Encounter = BlizzardEncounter & {
    wclId: CURRENT_RAID_ENCOUNTER_IDS;
}

export type CurrentRaid = {
    id: number;
    name: string;
    bosses: Encounter[];
}

export type HealerComp = Array<{
    class: Class;
    spec: Spec;
    count: number;
}>;

