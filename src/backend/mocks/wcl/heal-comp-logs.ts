import { http, HttpResponse } from 'msw';
const healCompLogs = [
    http.get('https://www.warcraftlogs.com/v1/rankings/encounter/2820', ({ request }) => {
        const url = new URL(request.url)
        const params = url.searchParams.toString();

        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=1') {
            return HttpResponse.json(
                {
                    "page": 1,
                    "hasMorePages": true,
                    "count": 50,
                    "rankings": []
                },
                { status: 200 }
            )
        }
        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=2') {
            return HttpResponse.json({
                "page": 2,
                "hasMorePages": true,
                "count": 50,
                "rankings": [
                    {
                        "serverID": 407,
                        "serverName": "Blackmoore",
                        "regionName": "EU",
                        "duration": 229070,
                        "startTime": 1701288159740,
                        "reportStart": 1701283382376,
                        "damageTaken": 198906280,
                        "deaths": 0,
                        "fightID": 38,
                        "reportID": "jxqQD3wt1yXfk6zH",
                        "exploit": 0,
                        "tanks": 2,
                        "healers": 4,
                        "melee": 6,
                        "ranged": 8,
                        "guildFaction": 0,
                        "guildName": "Burden",
                        "guildID": 476166,
                        "bracket": 478.75
                    }
                ]
            },
                { status: 200 })
        }
        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=3') {
            return HttpResponse.json({
                "page": 3,
                "hasMorePages": true,
                "count": 50,
                "rankings": []
            },
                { status: 200 })
        }
        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=4') {
            return HttpResponse.json({
                "page": 4,
                "hasMorePages": true,
                "count": 50,
                "rankings": []
            },
                { status: 200 })
        }
        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=5') {
            return HttpResponse.json({
                "page": 5,
                "hasMorePages": true,
                "count": 50,
                "rankings": []
            },
                { status: 200 })
        }
        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=6') {
            return HttpResponse.json({
                "page": 6,
                "hasMorePages": true,
                "count": 50,
                "rankings": [
                    {
                        "serverID": 435,
                        "serverName": "Gul'dan",
                        "regionName": "EU",
                        "duration": 273991,
                        "startTime": 1701367268430,
                        "reportStart": 1701366202832,
                        "damageTaken": 256738086,
                        "deaths": 0,
                        "fightID": 7,
                        "reportID": "GHW1Tg7X3FaAP8vt",
                        "exploit": 0,
                        "tanks": 2,
                        "healers": 5,
                        "melee": 4,
                        "ranged": 9,
                        "guildFaction": 1,
                        "guildName": "Divinum",
                        "guildID": 18347,
                        "bracket": 479.05
                    }
                ]
            },
                { status: 200 })
        }
        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=7') {
            return HttpResponse.json({
                "page": 7,
                "hasMorePages": true,
                "count": 50,
                "rankings": [
                    {
                        "serverID": 320,
                        "serverName": "Ragnaros",
                        "regionName": "EU",
                        "duration": 292136,
                        "startTime": 1701377003642,
                        "reportStart": 1701369948033,
                        "damageTaken": 270622058,
                        "deaths": 0,
                        "fightID": 50,
                        "reportID": "BKCyL1D4whXVn7Ff",
                        "exploit": 0,
                        "tanks": 2,
                        "healers": 4,
                        "melee": 6,
                        "ranged": 8,
                        "guildFaction": 1,
                        "guildName": "Ecl\u00edpse",
                        "guildID": 611711,
                        "bracket": 476.15
                    }
                ]
            },
                { status: 200 })
        }
        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=8') {
            return HttpResponse.json({
                "page": 8,
                "hasMorePages": true,
                "count": 50,
                "rankings": [
                    {
                        "serverID": 408,
                        "serverName": "Blackrock",
                        "regionName": "EU",
                        "duration": 286829,
                        "startTime": 1701286804926,
                        "reportStart": 1701280450322,
                        "damageTaken": 273645016,
                        "deaths": 0,
                        "fightID": 46,
                        "reportID": "Cbv2t4ZjqAzr8m7D",
                        "exploit": 0,
                        "tanks": 3,
                        "healers": 4,
                        "melee": 5,
                        "ranged": 8,
                        "guildFaction": 1,
                        "guildName": "Untauntable",
                        "guildID": 572019,
                        "bracket": 475.8
                    }
                ]
            },
                { status: 200 })
        }
        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=9') {
            return HttpResponse.json({
                "page": 9,
                "hasMorePages": true,
                "count": 50,
                "rankings": [
                    {
                        "serverID": 219,
                        "serverName": "Thrall",
                        "regionName": "US",
                        "duration": 293455,
                        "startTime": 1701918497738,
                        "reportStart": 1701913906454,
                        "damageTaken": 286254466,
                        "deaths": 0,
                        "fightID": 46,
                        "reportID": "Jhkw7N3XfqD249ZP",
                        "exploit": 0,
                        "tanks": 2,
                        "healers": 4,
                        "melee": 6,
                        "ranged": 8,
                        "guildFaction": 1,
                        "guildName": "smoothbrains",
                        "guildID": 452739,
                        "bracket": 479.5
                    },
                    {
                        "serverID": 205,
                        "serverName": "Stonemaul",
                        "regionName": "US",
                        "duration": 282410,
                        "startTime": 1701999055769,
                        "reportStart": 1701998423462,
                        "damageTaken": 287345061,
                        "deaths": 0,
                        "fightID": 4,
                        "reportID": "XJcmG1L8pTq2adQk",
                        "exploit": 0,
                        "tanks": 2,
                        "healers": 4,
                        "melee": 8,
                        "ranged": 6,
                        "guildFaction": 0,
                        "guildName": "Euphoric",
                        "guildID": 21771,
                        "bracket": 479.9
                    },
                    {
                        "serverID": 270,
                        "serverName": "Burning Legion",
                        "regionName": "EU",
                        "duration": 348212,
                        "startTime": 1701891877683,
                        "reportStart": 1701888334567,
                        "damageTaken": 293027080,
                        "deaths": 0,
                        "fightID": 15,
                        "reportID": "9mzGCNwvQpDXdxFK",
                        "exploit": 0,
                        "tanks": 2,
                        "healers": 4,
                        "melee": 6,
                        "ranged": 8,
                        "guildFaction": 1,
                        "guildName": "Placeholder",
                        "guildID": 692932,
                        "bracket": 473.8
                    }
                ]
            },
                { status: 200 })
        }
        if (params === 'api_key=MOCK_API_KEY&filter=2.4.1%2C5.2.1%2C6.1.1%2C13.2.1&difficulty=5&metric=execution&page=10') {
            return HttpResponse.json({
                "page": 10,
                "hasMorePages": true,
                "count": 50,
                "rankings": [
                    {
                        "serverID": 340,
                        "serverName": "Tarren Mill",
                        "regionName": "EU",
                        "duration": 307447,
                        "startTime": 1701624241102,
                        "reportStart": 1701613304782,
                        "damageTaken": 301015442,
                        "deaths": 0,
                        "fightID": 33,
                        "reportID": "aV4Pt8hGb397r6ZW",
                        "exploit": 0,
                        "tanks": 2,
                        "healers": 5,
                        "melee": 6,
                        "ranged": 7,
                        "guildFaction": 1,
                        "guildName": "Project Mayhem",
                        "guildID": 711249,
                        "bracket": 472.75
                    },
                    {
                        "serverID": 495,
                        "serverName": "\u0420\u0435\u0432\u0443\u0449\u0438\u0439 \u0444\u044c\u043e\u0440\u0434",
                        "regionName": "EU",
                        "duration": 309066,
                        "startTime": 1701369928965,
                        "reportStart": 1701367997632,
                        "damageTaken": 313315725,
                        "deaths": 0,
                        "fightID": 8,
                        "reportID": "v8yBWfYJCK7jhzLN",
                        "exploit": 0,
                        "tanks": 2,
                        "healers": 5,
                        "melee": 8,
                        "ranged": 5,
                        "guildFaction": 1,
                        "guildName": "\u0425\u0430\u043c\u043c\u0435\u0440\u0442\u0430\u0439\u043c",
                        "guildID": 570580,
                        "bracket": 470.55
                    },
                    {
                        "serverID": 30,
                        "serverName": "Barthilas",
                        "regionName": "US",
                        "duration": 315487,
                        "startTime": 1700734201037,
                        "reportStart": 1700726071808,
                        "damageTaken": 321127507,
                        "deaths": 0,
                        "fightID": 32,
                        "reportID": "pgP2fyv6xWwCt83K",
                        "exploit": 0,
                        "tanks": 2,
                        "healers": 4,
                        "melee": 6,
                        "ranged": 8,
                        "guildFaction": 1,
                        "guildName": "TBA",
                        "guildID": 280135,
                        "bracket": 466.5
                    }
                ]
            },
                { status: 200 })
        }
    }),
];

export default healCompLogs;