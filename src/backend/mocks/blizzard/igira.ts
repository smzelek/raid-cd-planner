import { BlizzardApiEncounter } from "../../services/blizzard.service";

const igira: BlizzardApiEncounter = {
    "_links": {
        "self": {
            "href": "https://us.api.blizzard.com/data/wow/journal-encounter/2554?namespace=static-10.2.0_51825-us"
        }
    },
    "id": 2554,
    "name": "Igira the Cruel",
    "description": "Driven by cruelty, Igira is able to forge devastating weapons from the screams of her enemies. Within the verdant realm of the Emerald Dream, the torturer seeks to expand her arsenal.",
    "creatures": [
        {
            "id": 5555,
            "name": "Igira the Cruel",
            "creature_display": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/media/creature-display/112382?namespace=static-10.2.0_51825-us"
                },
                "id": 112382
            }
        }
    ],
    "items": [
        {
            "id": 43781,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/210148?namespace=static-10.2.0_51825-us"
                },
                "name": "Overflowing Satchel of Pilfered Recipes",
                "id": 210148
            }
        },
        {
            "id": 43704,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207466?namespace=static-10.2.0_51825-us"
                },
                "name": "Dreadful Tormented Dreamheart",
                "id": 207466
            }
        },
        {
            "id": 43706,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207469?namespace=static-10.2.0_51825-us"
                },
                "name": "Zenith Tormented Dreamheart",
                "id": 207469
            }
        },
        {
            "id": 43707,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207467?namespace=static-10.2.0_51825-us"
                },
                "name": "Mystic Tormented Dreamheart",
                "id": 207467
            }
        },
        {
            "id": 43709,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207468?namespace=static-10.2.0_51825-us"
                },
                "name": "Venerated Tormented Dreamheart",
                "id": 207468
            }
        },
        {
            "id": 43822,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207787?namespace=static-10.2.0_51825-us"
                },
                "name": "Igira's Flaying Hatchet",
                "id": 207787
            }
        },
        {
            "id": 43823,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207131?namespace=static-10.2.0_51825-us"
                },
                "name": "Bloody Dragonhide Belt",
                "id": 207131
            }
        },
        {
            "id": 43824,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207783?namespace=static-10.2.0_51825-us"
                },
                "name": "Cruel Dreamcarver",
                "id": 207783
            }
        },
        {
            "id": 43825,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207162?namespace=static-10.2.0_51825-us"
                },
                "name": "Signet of the Last Elder",
                "id": 207162
            }
        },
        {
            "id": 43826,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207150?namespace=static-10.2.0_51825-us"
                },
                "name": "Agonizing Manacles",
                "id": 207150
            }
        },
        {
            "id": 43827,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207165?namespace=static-10.2.0_51825-us"
                },
                "name": "Bandolier of Twisted Blades",
                "id": 207165
            }
        },
        {
            "id": 43828,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207118?namespace=static-10.2.0_51825-us"
                },
                "name": "Elder's Volcanic Wrap",
                "id": 207118
            }
        },
        {
            "id": 43829,
            "item": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/item/207140?namespace=static-10.2.0_51825-us"
                },
                "name": "Drakestalker's Trophy Pauldrons",
                "id": 207140
            }
        }
    ],
    "sections": [
        {
            "id": 27268,
            "title": "Overview",
            "body_text": "Igira unleashes [Blistering Spears] to restrict how far her victims can flee. At 100 energy, Igira uses [Marked for Torment] to ignite areas in her chamber, tormenting players standing within them. Based on the ignited area players stand within, Igira changes her weapon and gains new abilities.\r\n",
            "sections": [
                {
                    "id": 27269,
                    "title": "Damage Dealers",
                    "body_text": "$bullet;While a player is tethered to a [Blistering Spear] their movement is restricted."
                },
                {
                    "id": 27270,
                    "title": "Healers",
                    "body_text": "$bullet;[Heart Stopper] inflicts significant damage upon expiration.\r\n$bullet;Each application of [Harvest of Screams] increases Igira's damage."
                },
                {
                    "id": 27271,
                    "title": "Tanks",
                    "body_text": "$bullet;[Vicious Swing] causes Igira's melee attacks to also strike the next closest target."
                }
            ]
        },
        {
            "id": 27274,
            "title": "Vicious Swing",
            "sections": [
                {
                    "id": 27691,
                    "title": "Drenched Blades",
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/414340?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Drenched Blades",
                        "id": 414340
                    }
                }
            ],
            "spell": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/spell/423108?namespace=static-10.2.0_51825-us"
                },
                "name": "Vicious Swing",
                "id": 423108
            }
        },
        {
            "id": 27276,
            "title": "Blistering Spear",
            "sections": [
                {
                    "id": 27277,
                    "title": "Blistering Torment",
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/414770?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Blistering Torment",
                        "id": 414770
                    }
                }
            ],
            "spell": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/spell/414425?namespace=static-10.2.0_51825-us"
                },
                "name": "Blistering Spear",
                "id": 414425
            }
        },
        {
            "id": 27292,
            "title": "Twisting Blade",
            "spell": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/spell/416998?namespace=static-10.2.0_51825-us"
                },
                "name": "Twisting Blade",
                "id": 416998
            }
        },
        {
            "id": 27389,
            "title": "Harvest of Screams",
            "spell": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/spell/420251?namespace=static-10.2.0_51825-us"
                },
                "name": "Harvest of Screams",
                "id": 420251
            }
        },
        {
            "id": 28112,
            "title": "Marked for Torment",
            "sections": [
                {
                    "id": 28110,
                    "title": "Gathering Torment",
                    "sections": [
                        {
                            "id": 28111,
                            "title": "Flesh Mortification",
                            "spell": {
                                "key": {
                                    "href": "https://us.api.blizzard.com/data/wow/spell/419462?namespace=static-10.2.0_51825-us"
                                },
                                "name": "Flesh Mortification",
                                "id": 419462
                            }
                        }
                    ],
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/414367?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Gathering Torment",
                        "id": 414367
                    }
                },
                {
                    "id": 28113,
                    "title": "Searing Sparks",
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/423715?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Searing Sparks",
                        "id": 423715
                    }
                },
                {
                    "id": 28114,
                    "title": "Ruinous End",
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/419048?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Ruinous End",
                        "id": 419048
                    }
                }
            ],
            "spell": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/spell/422776?namespace=static-10.2.0_51825-us"
                },
                "name": "Marked for Torment",
                "id": 422776
            }
        },
        {
            "id": 27381,
            "title": "Marked for Torment",
            "sections": [
                {
                    "id": 27769,
                    "title": "Gathering Torment",
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/414367?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Gathering Torment",
                        "id": 414367
                    }
                },
                {
                    "id": 28115,
                    "title": "Gathering Torment",
                    "sections": [
                        {
                            "id": 28116,
                            "title": "Flesh Mortification",
                            "spell": {
                                "key": {
                                    "href": "https://us.api.blizzard.com/data/wow/spell/419462?namespace=static-10.2.0_51825-us"
                                },
                                "name": "Flesh Mortification",
                                "id": 419462
                            }
                        }
                    ],
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/414367?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Gathering Torment",
                        "id": 414367
                    }
                },
                {
                    "id": 27382,
                    "title": "Searing Sparks",
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/423715?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Searing Sparks",
                        "id": 423715
                    }
                },
                {
                    "id": 27660,
                    "title": "Ruinous End",
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/419048?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Ruinous End",
                        "id": 419048
                    }
                }
            ],
            "spell": {
                "key": {
                    "href": "https://us.api.blizzard.com/data/wow/spell/422776?namespace=static-10.2.0_51825-us"
                },
                "name": "Marked for Torment",
                "id": 422776
            }
        },
        {
            "id": 27278,
            "title": "Hacking Torment",
            "body_text": "Igira forges an axe that drinks the agony of her enemies.",
            "sections": [
                {
                    "id": 27290,
                    "title": "Umbral Destruction",
                    "sections": [
                        {
                            "id": 28309,
                            "title": "Brutalized",
                            "spell": {
                                "key": {
                                    "href": "https://us.api.blizzard.com/data/wow/spell/429277?namespace=static-10.2.0_51825-us"
                                },
                                "name": "Brutalized",
                                "id": 429277
                            }
                        }
                    ],
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/416056?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Umbral Destruction",
                        "id": 416056
                    }
                }
            ]
        },
        {
            "id": 27288,
            "title": "Slicing Torment",
            "body_text": "Igira forges a sword that sunders the earth with each swing.",
            "sections": [
                {
                    "id": 28108,
                    "title": "Smashing Viscera",
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/418533?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Smashing Viscera",
                        "id": 418533
                    }
                },
                {
                    "id": 27690,
                    "title": "Smashing Viscera",
                    "sections": [
                        {
                            "id": 28109,
                            "title": "Devastation",
                            "spell": {
                                "key": {
                                    "href": "https://us.api.blizzard.com/data/wow/spell/424347?namespace=static-10.2.0_51825-us"
                                },
                                "name": "Devastation",
                                "id": 424347
                            }
                        }
                    ],
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/418533?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Smashing Viscera",
                        "id": 418533
                    }
                }
            ]
        },
        {
            "id": 27282,
            "title": "Flaying Torment",
            "body_text": "Igira forges a knife to carve the hearts from her victims.",
            "sections": [
                {
                    "id": 28264,
                    "title": "Heart Stopper",
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/415624?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Heart Stopper",
                        "id": 415624
                    }
                },
                {
                    "id": 27280,
                    "title": "Heart Stopper",
                    "sections": [
                        {
                            "id": 28065,
                            "title": "Vital Rupture",
                            "spell": {
                                "key": {
                                    "href": "https://us.api.blizzard.com/data/wow/spell/426017?namespace=static-10.2.0_51825-us"
                                },
                                "name": "Vital Rupture",
                                "id": 426017
                            }
                        }
                    ],
                    "spell": {
                        "key": {
                            "href": "https://us.api.blizzard.com/data/wow/spell/415624?namespace=static-10.2.0_51825-us"
                        },
                        "name": "Heart Stopper",
                        "id": 415624
                    }
                }
            ]
        }
    ],
    "instance": {
        "key": {
            "href": "https://us.api.blizzard.com/data/wow/journal-instance/1207?namespace=static-10.2.0_51825-us"
        },
        "name": "Amirdrassil, the Dream's Hope",
        "id": 1207
    },
    "category": {
        "type": "RAID"
    },
    "modes": [
        {
            "type": "LFR",
            "name": "Raid Finder"
        },
        {
            "type": "NORMAL",
            "name": "Normal"
        },
        {
            "type": "HEROIC",
            "name": "Heroic"
        },
        {
            "type": "MYTHIC",
            "name": "Mythic"
        }
    ]
};

export default igira;
