import { Phases } from "./backend/services/blizzard.service";

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

export type Encounter = {
    id: number;
    name: string;
    phases: Phases[];
}

export type CurrentRaid = {
    id: number;
    name: string;
    bosses: Encounter[];
}

