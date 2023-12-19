import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' })

export const WARCRAFT_LOGS_API_V1_KEY = () => process.env.WARCRAFT_LOGS_API_V1_KEY!;
export const WARCRAFT_LOGS_API_V2_CLIENT_KEY = () => process.env.WARCRAFT_LOGS_API_V2_CLIENT_KEY!;
export const WARCRAFT_LOGS_API_V2_SECRET_KEY = () => process.env.WARCRAFT_LOGS_API_V2_SECRET_KEY!;
export const WARCRAFT_LOGS_API_V2_ACCESS_TOKEN = () => process.env.WARCRAFT_LOGS_API_V2_ACCESS_TOKEN!;

export const BLIZZARD_CLIENT_ID = () => process.env.BLIZZARD_CLIENT_ID;
export const BLIZZARD_CLIENT_SECRET = () => process.env.BLIZZARD_CLIENT_SECRET;
