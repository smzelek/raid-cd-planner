import { Instance } from '../../services/blizzard.service'

const amirdrassil: Instance = {
    "_links": {
        "self": {
            "href": "https://us.api.blizzard.com/data/wow/journal-instance/1207?namespace=static-10.2.0_51825-us"
        }
    },
    "id": 1207,
    "name": "Amirdrassil, the Dream's Hope",
    "map": {
        "name": "Amirdrassil, the Dream's Hope",
        "id": 2549
    },
    "description": "Having been carefully nurtured within the Emerald Dream, Amirdrassil is preparing to bloom and cross into Azeroth. But the fate of the new world tree cannot be secured until Azeroth's champions come together to face Fyrakk and his molten allies, before he devours the heart of Amirdrassil and bathes the world in flame.",
    "encounters": [
        {
            "key": {
                "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2564?namespace=static-10.2.0_51825-us"
            },
            "name": "Gnarlroot",
            "id": 2564
        },
        {
            "key": {
                "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2554?namespace=static-10.2.0_51825-us"
            },
            "name": "Igira the Cruel",
            "id": 2554
        },
        {
            "key": {
                "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2557?namespace=static-10.2.0_51825-us"
            },
            "name": "Volcoross",
            "id": 2557
        },
        {
            "key": {
                "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2555?namespace=static-10.2.0_51825-us"
            },
            "name": "Council of Dreams",
            "id": 2555
        },
        {
            "key": {
                "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2553?namespace=static-10.2.0_51825-us"
            },
            "name": "Larodar, Keeper of the Flame",
            "id": 2553
        },
        {
            "key": {
                "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2556?namespace=static-10.2.0_51825-us"
            },
            "name": "Nymue, Weaver of the Cycle",
            "id": 2556
        },
        {
            "key": {
                "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2563?namespace=static-10.2.0_51825-us"
            },
            "name": "Smolderon",
            "id": 2563
        },
        {
            "key": {
                "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2565?namespace=static-10.2.0_51825-us"
            },
            "name": "Tindral Sageswift, Seer of the Flame",
            "id": 2565
        },
        {
            "key": {
                "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2519?namespace=static-10.2.0_51825-us"
            },
            "name": "Fyrakk the Blazing",
            "id": 2519
        }
    ],
    "expansion": {
        "key": {
            "href": "https://us.api.blizzard.com/data/wow/journal-expansion/503?namespace=static-10.2.0_51825-us"
        },
        "name": "Dragonflight",
        "id": 503
    },
    "modes": [
        {
            "mode": {
                "type": "LFR",
                "name": "Raid Finder"
            },
            "players": 30,
            "is_tracked": true
        },
        {
            "mode": {
                "type": "NORMAL",
                "name": "Normal"
            },
            "players": 30,
            "is_tracked": true
        },
        {
            "mode": {
                "type": "HEROIC",
                "name": "Heroic"
            },
            "players": 30,
            "is_tracked": true
        },
        {
            "mode": {
                "type": "MYTHIC",
                "name": "Mythic"
            },
            "players": 20,
            "is_tracked": true
        }
    ],
    "media": {
        "key": {
            "href": "https://us.api.blizzard.com/data/wow/media/journal-instance/1207?namespace=static-10.2.0_51825-us"
        },
        "id": 1207
    },
    "minimum_level": 70,
    "category": {
        "type": "RAID"
    },
    "order_index": 4
}

export default amirdrassil;
