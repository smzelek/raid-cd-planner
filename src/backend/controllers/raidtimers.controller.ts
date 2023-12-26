import { NextFunction, Request, Response, Router } from "express";
import { RaidTimersApi } from "../services/raidtimers.service";
import { CURRENT_RAID_ENCOUNTER_IDS, logFunction } from "../../utils";
import { HealerComp } from "../../types";

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


export type loadTopBossLogsForSameRosterRequest = {
    encounterId: number;
    healerComp: HealerComp;
}
const loadTopBossLogsForSameRoster = async (req: Request<any, any, loadTopBossLogsForSameRosterRequest>, res: Response, next: NextFunction) => {
    logFunction(loadTopBossLogsForSameRoster, { path: req.path, body: req.body })
    try {
        const response = await api.findLogsForHealComp(req.body.encounterId, req.body.healerComp);
        if (response.error) {
            throw response.error;
        }
        res.send(response.result);
    } catch (err) {
        next(err);
    }
};
raidtimers.post('/logs/search', loadTopBossLogsForSameRoster);


export type loadFightRequest = {
    reportId: string;
    fightId: number;
    encounterId: CURRENT_RAID_ENCOUNTER_IDS;
}
const loadFight = async (req: Request<any, any, loadFightRequest>, res: Response, next: NextFunction) => {
    logFunction(loadFight, { path: req.path, body: req.body })
    try {
        const response = await api.loadReport(req.body.reportId, req.body.fightId, req.body.encounterId);
        if (response.error) {
            throw response.error;
        }
        res.send(response.result);
    } catch (err) {
        next(err);
    }
};
raidtimers.post('/logs/detail', loadFight);


