import { test, describe, } from 'node:test';
import assert from 'node:assert';
import { parsePhasesForEncounter } from '../services/blizzard.service';
import gnarlroot from '../mocks/blizzard/gnarlroot';
import igira from '../mocks/blizzard/igira';

describe('function: parsePhasesForEncounter', () => {
    test('gnarlroot', async () => {
        const result = parsePhasesForEncounter(gnarlroot);
        assert.deepEqual(
            result,
            [
                {
                    "title": "Stage One: Garden of Despair",
                    "spells": [{ "id": 421898, "name": "Flaming Pestilence" }, { "id": 421971, "name": "Controlled Burn" }, { "id": 421986, "name": "Tainted Bloom" }, { "id": 422023, "name": "Shadow-Scorched Earth" }, { "id": 422026, "name": "Tortured Scream" }, { "id": 422039, "name": "Shadowflame Cleave" }, { "id": 422053, "name": "Shadow Spines" }, { "id": 424352, "name": "Dreadfire Barrage" }, { "id": 425816, "name": "Blazing Pollen" }, { "id": 425819, "name": "Flaming Sap" }, { "id": 428992, "name": "Vicious Thicket" }, { "id": 429009, "name": "Overgrown" }]
                },
                {
                    "title": "Stage Two: Agonizing Growth",
                    "spells": [{ "id": 421013, "name": "Doom Cultivation" }, { "id": 421038, "name": "Ember-Charred" }, { "id": 421350, "name": "Splintering Charcoal" }, { "id": 421840, "name": "Uprooted Agony" }, { "id": 422373, "name": "Toxic Loam" }, { "id": 425648, "name": "Doom Roots" }, { "id": 425709, "name": "Rising Mania" }, { "id": 426548, "name": "Searing Bramble" }]
                }
            ]
        );
    });

    test('igira', async () => {
        const result = parsePhasesForEncounter(igira);
        assert.deepEqual(
            result,
            [
                {
                    "title": "Igira the Cruel",
                    "spells": [
                        { "id": 414340, "name": "Drenched Blades" },
                        { "id": 414367, "name": "Gathering Torment" },
                        { "id": 414425, "name": "Blistering Spear" },
                        { "id": 414770, "name": "Blistering Torment" },
                        { "id": 415624, "name": "Heart Stopper" },
                        { "id": 416056, "name": "Umbral Destruction" },
                        { "id": 416998, "name": "Twisting Blade" },
                        { "id": 418533, "name": "Smashing Viscera" },
                        { "id": 419048, "name": "Ruinous End" },
                        { "id": 419462, "name": "Flesh Mortification" },
                        { "id": 420251, "name": "Harvest of Screams" },
                        { "id": 422776, "name": "Marked for Torment" },
                        { "id": 423108, "name": "Vicious Swing" },
                        { "id": 423715, "name": "Searing Sparks" },
                        { "id": 424347, "name": "Devastation" },
                        { "id": 426017, "name": "Vital Rupture" },
                        { "id": 429277, "name": "Brutalized" }
                    ]
                }]
        );
    });
});
