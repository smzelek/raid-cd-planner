import { NextFunction, Request, Response, Router } from "express";
import { RaidTimersApi } from "../services/raidtimers.service";
import { logFunction } from "../../utils";

export const raidtimers = Router();
const api = new RaidTimersApi();

const loadCurrentRaidEncounters = async (req: Request, res: Response, next: NextFunction) => {
    logFunction(loadCurrentRaidEncounters, req.path)
    try {
        const response = await api.loadCurrentRaidEncounters();
        res.send(response);
    } catch (err) {
        next(err);
    }
};

raidtimers.get('/raid', loadCurrentRaidEncounters);

