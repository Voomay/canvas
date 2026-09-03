import { ComplaintData } from '../complaints';

export const KHAYELITSHA_COMPLAINTS: ComplaintData[] = [
  {
    id: 'khayelitsha_communal_taps',
    category: 'khayelitsha_communal_taps',
    targetParty: 'all',
    complaintText: 'COMMUNAL WATER TAPS IN SITE C HAVE LOW PRESSURE IN THE MORNINGS, WHILE BURST PIPES FLOOD THE DIRT FOOTPATHS!',
    responses: {
      promise: 'WE ARE INSTALLING HIGH-PRESSURE BOOSTER VALVES AND REPLACING ALL CORRODED FEEDER PIPES!',
      blame: 'BLAME ILLEGAL PRIVATE HOSE CONNECTIONS AND PRESSURE SPIKES FROM DAM SLUICE RE-BALANCING!',
      lie: 'PURIFIED CHILLED SPRING WATER IS FLOWING TO EVERY SINGLE HOUSEHOLD TAP RIGHT NOW!',
      honesty: 'HONESTLY... MAIN VALVE PRESSURE WAS DELIBERATELY LOWERED TO PREVENT BULK PIPE BURSTS!',
      honestyEmoji: '💧'
    },
    partyResponses: {
      da: {
        promise: 'WE ARE REPLACING 18 KILOMETRES OF AGED WATER RETICULATION PIPES WITH REINFORCED POLYMER!',
        blame: 'BLAME UNREGISTERED PRIVATE PLUMBING CONNECTIONS DRAWING DOWN MANIFOLD PRESSURE!',
        lie: 'EVERY COMMUTAL TAP IN KHAYELITSHA HAS BEEN UPGRADED WITH AN ULTRA-FILTERED DRINKING SPOUT TODAY!',
        honesty: 'HONESTLY... WATER LOSS RATIOS ARE SO HIGH THAT OUR OPERATORS HAVE TO THROTTLE THE PRESSURE!',
        honestyEmoji: '🚰'
      },
      anc: {
        promise: 'WATER IS AN INALIENABLE CONSTITUTIONAL RIGHT! WE WILL INSTALL FREE YARD TAPS FOR EVERY FAMILY!',
        blame: 'BLAME THE METRO’S WATER-DIVIDEND POLICIES FOR PRIORITIZING SUBURBAN GOLF COURSES OVER TOWNSHIPS!',
        lie: 'A FLEET OF 200 STAINLESS STEEL WATER TANKERS IS PARKED AT LOOKOUT HILL WAITING TO DISPATCH!',
        honesty: 'HONESTLY... BULK WATER UPGRADE SUBSIDIES FROM NATIONAL TREASURY WERE DIVERTED TO FLOOD REPAIR!',
        honestyEmoji: '✊'
      },
      pa: {
        promise: 'WE WILL DIG THE TRENCHES OURSELVES AND HOOK UP SOLID COPPER PIPES TO YOUR HOUSES!',
        blame: 'BLAME WATER OFFICIALS WHO THREATEN DISCONNECTIONS WHILE MILLIONS OF LITRES LEAK UNDER ROADS!',
        lie: 'I PERSONALLY BROUGHT 50 INDUSTRIAL SOLAR BOREHOLE PUMPS COMMISSIONED ON SPINE ROAD TODAY!',
        honesty: 'HONESTLY... WATCHING ELDERLY GOGOS CARRY 25-LITRE BUCKETS IN WINTER BREAKS MY HEART COMPLETELY!',
        honestyEmoji: '🪣'
      }
    },
    reactions: {
      promise: {
        positive: 'Dedicated yard taps with good pressure?! My mother won’t have to wake at 4 AM to fetch water! Thank you!',
        doubtful: 'Booster valves? You said that before the last local election, and the tap still drips like a teardrop.',
        negative: 'The burst pipe has been running clean drinking water into the mud for two months! Fix that first!'
      },
      blame: {
        positive: 'True, some car washes hook up five illegal hoses to one tap and leave nothing for mothers cooking porridge!',
        doubtful: 'Golf courses get green grass, while 50 households stand in line with yellow buckets for one tap.',
        negative: 'Don’t blame poor people for drinking water when the municipal infrastructure is crumbling!'
      },
      lie: {
        positive: 'Chilled spring water flowing to every house right now?! Let me turn my bucket tap on... wait, nothing!',
        doubtful: 'Stainless steel tankers at Lookout Hill? I just walked down Lookout Hill and saw three goats and a donkey!',
        negative: 'Lying to thirsty residents about water is the lowest thing a politician can do!'
      },
      honesty: {
        positive: 'Hahaha! Watching gogos carry buckets breaks your heart... you speak the pure truth, take my vote!',
        doubtful: 'Throttling the pressure to save pipes means we can’t even fill a kettle before work.',
        negative: 'Water loss ratios? So you punish innocent paying residents because you can’t fix leaks?!'
      }
    }
  },
  {
    id: 'khayelitsha_illegal_connections',
    category: 'khayelitsha_illegal_connections',
    targetParty: 'all',
    complaintText: 'IZINYOKA DANGEROUS POWER CABLES ARE SPRAWLED OVER OUR ROOFS! THE OVERLOADED TRANSFORMER BLOWS EVERY WINTER!',
    responses: {
      promise: 'WE WILL FORMALLY ENCLOSE AND ELECTRIFY ALL INFORMAL SECTORS WITH TAMPER-PROOF METERS!',
      blame: 'BLAME SYNDICATES EXPLOITING RESIDENTS BY SELLING RISKY HIGH-VOLTAGE DIRECT JUMPER LINES!',
      lie: 'AN UNDERGROUND ARMOURED SUB-GRID WAS COMPLETED AND SWITCHED ON FOR THIS ENTIRE SECTION TODAY!',
      honesty: 'HONESTLY... ESKOM AND THE CITY CANNOT AGREE ON WHO OWNS THIS SUBSTATION BOUNDARY JURISDICTION!',
      honestyEmoji: '⚡'
    },
    partyResponses: {
      da: {
        promise: 'WE ARE DEPLOYING HIGH-SECURITY ENCLOSED MINI-SUBSTATIONS WITH OVERLOAD TRIP-OUT PROTECTION!',
        blame: 'BLAME CRIMINAL BRIDGING SYNDICATES CAUSING HIGH-AMPERAGE SHORT CIRCUITS THAT MELT CABLES!',
        lie: 'WE SECURED FULL GERMAN SMART-METER MICRO-GRIDS READY TO CONNECT EVERY DWELLING TOMORROW!',
        honesty: 'HONESTLY... EVERY TIME TEAMS DISCONNECT THE WIRES, THEY ARE BACK UP WITHIN 45 MINUTES!',
        honestyEmoji: '🔌'
      },
      anc: {
        promise: 'UNIVERSAL ACCESS TO ELECTRICITY! WE WILL UPGRADE THE ESKOM REGIONAL SUBSTATIONS TO HANDLE FULL PEAK LOAD!',
        blame: 'BLAME THE HISTORICAL LACK OF INFRASTRUCTURE INVESTMENT IN INFORMAL URBAN EXPANSIONS!',
        lie: 'FREE 5KVA SOLAR INVERTER KITS WITH LITHIUM BATTERIES ARE BEING HANDED OUT AT THE COMMUNITY HALL NOW!',
        honesty: 'HONESTLY... ESKOM SPARE TRANSFORMERS TAKE 6 MONTHS TO SHIP FROM OVERSEAS SUPPLIERS!',
        honestyEmoji: '💡'
      },
      pa: {
        promise: 'WE WILL TEAR DOWN THE DEATH-TRAP CABLES AND DEMAND ESKOM CONNECT PROPER SAFEKIT METERS!',
        blame: 'BLAME HEARTLESS POWER AUTHORITIES LEAVING FAMILIES IN FREEZING SHACKS WITH NO CHOICE BUT TO HOOK UP!',
        lie: 'I BOUGHT A 500-TON TRANSFORMER DIRECTLY FROM EUROPE AND IT’S BEING INSTALLED ON SPINE ROAD TODAY!',
        honesty: 'HONESTLY... WHEN IT RAINS AND THOSE WIRES SPARK ACROSS CORRUGATED ROOFS, IT IS A MIRACLE NOBODY DIES!',
        honestyEmoji: '⚠️'
      }
    },
    reactions: {
      promise: {
        positive: 'Formal electrification with safe meters?! That saves our children from stepping on live wires! God bless!',
        doubtful: 'They promise enclosed substations, but when the transformer bangs, we sit in darkness for a week.',
        negative: 'We have been asking for safe legal electricity for 15 years while children get shocked in puddles!'
      },
      blame: {
        positive: 'Syndicates charge R300 a month to connect you to a streetlight, and then the whole block burns!',
        doubtful: 'People hook up wires because they freeze in winter! Give people electricity and nobody will bridge!',
        negative: 'Passing the blame between Eskom and the municipality while our electrical appliances get fried!'
      },
      lie: {
        positive: 'Free solar inverters with lithium batteries at the hall?! I’m running there right now with my wheelbarrow!',
        doubtful: '500-ton transformer from Europe? On Spine Road? Why do you think we are fools?',
        negative: 'Stop lying! The transformer literally exploded with green sparks twenty minutes ago!'
      },
      honesty: {
        positive: 'Hahaha! Reconnected within 45 minutes! You know the real township hustle, my leader! Take my vote!',
        doubtful: 'Six months for a transformer? So we must spend another whole winter with candles and paraffin?!',
        negative: 'A miracle nobody dies?! Children DO get hurt, and you talk about it like a joke?!'
      }
    }
  },
  {
    id: 'khayelitsha_sanitation',
    category: 'khayelitsha_sanitation',
    targetParty: 'all',
    complaintText: 'CHEMICAL PORTABLE TOILETS ARE OVERFLOWING BECAUSE CONTRACTORS DON’T PUMP THEM OUT! THE SMELL IS UNBEARABLE!',
    responses: {
      promise: 'WE ARE PENALIZING DEFAULTING SANITATION CONTRACTORS AND DEPLOYING CITY RELIEF VACUUM TRUCKS!',
      blame: 'BLAME ILLEGAL ACCESS BARRICADES AND EXTORTION SYNDICATES DEMANDING PROTECTION FEES FROM DRIVERS!',
      lie: 'EVERY SINGLE HOME IN THIS SECTION IS BEING CONNECTED TO FULL FLUSH WATERBORNE DRAINAGE TODAY!',
      honesty: 'HONESTLY... THE PUMP-OUT CONTRACT EXPIRED LAST MONTH AND IS STUCK IN LEGAL AUDIT APPEALS!',
      honestyEmoji: '🚽'
    },
    partyResponses: {
      da: {
        promise: 'WE ARE AUDITING ALL INFORMAL SETTLEMENT SANITATION SERVICE CONTRACTS WITH LIVE GPS VEHICLE TRACKING!',
        blame: 'BLAME STRIKING SUBCONTRACTORS AND CRIMINAL THREATS TARGETING MUNICIPAL PUMP TRUCK CREWS!',
        lie: 'WE COMMISSIONED A BRAND NEW R2 BILLION BIOLOGICAL WASTE RECOVERY FACILITY SERVING SITE C TODAY!',
        honesty: 'HONESTLY... EXTORTION SYNDICATES DEMAND R10,000 PER TRUCK BEFORE LETTING DRIVERS SERVICE THIS AREA!',
        honestyEmoji: '📋'
      },
      anc: {
        promise: 'FULL FLUSH TOILETS AND INTEGRATED WATERBORNE RETICULATION AS A DIGNIFIED HUMAN RIGHT FOR TOWNSHIPS!',
        blame: 'BLAME THE TWO-TIER METRO THAT REFUSES TO INSTALL PERMANENT UNDERGROUND SEWERAGE IN INFORMAL AREAS!',
        lie: 'A CONVOY OF 80 GERMAN JET VACUUM TRUCKS HAS JUST ENTERED HARARE SECTION WITH ARMED ESCORTS!',
        honesty: 'HONESTLY... SANITATION RETICULATION TARGETS WERE SEVERELY MISSED DUE TO SEVERE BUDGET SHORTFALLS!',
        honestyEmoji: '✊'
      },
      pa: {
        promise: 'WE WILL PERSONALLY CANCEL THE CONTRACTS OF LAZY TENDERPRENEURS AND PUT THEM IN ORANGE OVERALLS!',
        blame: 'BLAME SNOBBY OFFICIALS SITTING IN AIR-CONDITIONED PERFUMED OFFICES WHO NEVER SMELLED A CHEMICAL TOILET!',
        lie: 'I PERSONALLY IMPORTED 2,000 FLUSHABLE LUXURY VIP TOILET TRAILERS WITH RUNNING WATER THIS MORNING!',
        honesty: 'HONESTLY... SITTING ON A CHEMICAL TOILET IN 38-DEGREE SUMMER HEAT IS AN INSULT TO HUMAN DIGNITY!',
        honestyEmoji: '🧼'
      }
    },
    reactions: {
      promise: {
        positive: 'GPS tracking on the pump trucks?! If they actually pump twice a week as promised, you have my vote!',
        doubtful: 'Every year you audit the contractors, and every week we hold our noses when walking past.',
        negative: 'Penalties don’t clean the maggots crawling out of the plastic drum outside my window!'
      },
      blame: {
        positive: 'Those extortion syndicates demand protection money from everybody, even bread delivery vans!',
        doubtful: 'Extortion syndicates or not, the government has the police! Why must the poor suffer the smell?!',
        negative: 'Don’t make excuses about tenders! Mothers and children deserve clean, flushing toilets!'
      },
      lie: {
        positive: 'Flush waterborne drainage connected today?! Oh hallelujah, my prayer has been answered!',
        doubtful: '80 German vacuum trucks? The only truck I saw today was an old bakkie selling scrap mattresses.',
        negative: 'You lie with a straight face while the toilet is overflowing right next to your expensive shoes!'
      },
      honesty: {
        positive: 'Hahaha! An insult to human dignity in 38-degree heat! You are the first politician to speak the real truth!',
        doubtful: 'R10,000 extortion per truck?! The criminals are running the city while politicians write press statements.',
        negative: 'Stuck in legal appeals?! So we must inhale human waste while lawyers drink coffee in the High Court?!'
      }
    }
  },
  {
    id: 'khayelitsha_emergency_escort',
    category: 'khayelitsha_emergency_escort',
    targetParty: 'all',
    complaintText: 'PARAMEDICS AND FIRE TRUCKS REFUSE TO ENTER OUR SECTION WITHOUT POLICE ESCORTS! PATIENTS WAIT FOR HOURS IN AGONY!',
    responses: {
      promise: 'WE ARE ESTABLISHING A DEDICATED METRO POLICE EMERGENCY RED-ZONE RAPID ESCORT FLEET!',
      blame: 'BLAME COWARDLY CRIMINAL GANGS TARGETING AMBULANCES AND ROBBING FIRST RESPONDERS OF MEDICINE!',
      lie: 'WE HAVE DEPLOYED 5 ARMOURED MEDICAL AIRLIFT HELICOPTERS ON ROOFTOP PADS ACROSS KHAYELITSHA!',
      honesty: 'HONESTLY... POLICE DISPATCH DOES NOT HAVE ENOUGH FUNCTIONING PATROL CARS TO ESCORT EVERY 10177 CALL!',
      honestyEmoji: '🚑'
    },
    partyResponses: {
      da: {
        promise: 'WE ARE DEPLOYING LEAP TASK TEAMS TO CREATE SAFE EMERGENCY CORRIDORS WITH 24/7 DASHCAM INTEGRATION!',
        blame: 'BLAME CRIMINAL ATTACKS AND STONE-THROWING ON EMS VEHICLES THAT LED UNIONS TO MANDATE ESCORTS!',
        lie: 'WE COMMISSIONED 10 BULLETPROOF ARMOURED AMBULANCES DEDICATED SOLELY TO KHAYELITSHA TODAY!',
        honesty: 'HONESTLY... DISPATCH PROTOCOLS DELAY AMBULANCES UP TO THREE HOURS WAITING FOR A POLICE SQUAD!',
        honestyEmoji: '🚨'
      },
      anc: {
        promise: 'COMMUNITY-DRIVEN PATROLLER FORUMS AND STREET COMMITTEES WILL GUARANTEE THE SAFETY OF ALL MEDICS!',
        blame: 'BLAME EXTREME SOCIAL MARGINALIZATION AND UNEMPLOYMENT DRIVING DESPERATE YOUTH TO CRIME!',
        lie: 'A BRAND NEW FULL-TRAUMA TERTIARY GENERAL HOSPITAL HAS BEEN SIGNED FOR THIS EXACT SUB-WARD TODAY!',
        honesty: 'HONESTLY... PUBLIC HEALTH UNIONS FORBID NURSES FROM ENTERING UNLESS THREE ARMED OFFICERS LEAD!',
        honestyEmoji: '🏥'
      },
      pa: {
        promise: 'WE WILL PERSONALLY ESCORT EVERY AMBULANCE! IF ANY CRIMINAL TOUCHES A MEDIC, WE WILL DEAL WITH THEM!',
        blame: 'BLAME PURE EVIL THUGS WHO ROB MEDICS TRYING TO SAVE THEIR OWN SICK COUSINS AND AUNTIES!',
        lie: 'WE DEPLOYED 500 PATRIOT SECURITY VETERANS TO GUARD EVERY EMERGENCY VEHICLE IN THE TOWNSHIP!',
        honesty: 'HONESTLY... WATCHING A FAMILY PUSH A DYING GRANDMOTHER IN A WHEELBARROW TO SPINE ROAD DESTROYS MY SOUL!',
        honestyEmoji: '💔'
      }
    },
    reactions: {
      promise: {
        positive: 'Dedicated police escorts for ambulances?! If my sick uncle can get help in time, you have our entire family’s votes!',
        doubtful: 'You promised safe corridors last year, and the ambulance still stops on the main road two kilometres away.',
        negative: 'While you hold meetings about corridors, people are dying on kitchen floors waiting for oxygen!'
      },
      blame: {
        positive: 'It is true! What kind of animal robs a paramedic who came to deliver a premature baby?! Pure evil!',
        doubtful: 'Blaming the criminals doesn’t solve the problem. The state must provide safety for emergency workers!',
        negative: 'Don’t call desperate youth an excuse! Protect the nurses so our people don’t die in wheelbarrows!'
      },
      lie: {
        positive: 'Bulletproof armoured ambulances dedicated to Khayelitsha?! Wow, that sounds like a movie!',
        doubtful: 'Medical airlift helicopters? Where are they going to land between the washing lines and television antennas?',
        negative: 'Lying about emergency ambulances while people lose their loved ones? You have no conscience!'
      },
      honesty: {
        positive: 'Pushing a gogo in a wheelbarrow to Spine Road... you really saw what we go through. Respect for your heart!',
        doubtful: 'Waiting three hours for an escort car? That is a death sentence for a heart attack or a stroke patient.',
        negative: 'Not enough running patrol cars?! Then where did the billions for the blue-light VIP convoys come from?!'
      }
    }
  },
  {
    id: 'khayelitsha_shack_fires',
    category: 'khayelitsha_shack_fires',
    targetParty: 'all',
    complaintText: 'AFTER WINTER RAINS AND SHACK FIRES DESTROY HOMES, THE CITY ONLY GIVES ONE PIECE OF THIN PLASTIC SHEETING!',
    responses: {
      promise: 'WE ARE RE-ENGINEERING EMERGENCY RELIEF KITS WITH FIRE-RETARDANT PANELS, CORRUGATED SHEETS, AND TIMBER!',
      blame: 'BLAME NATIONAL DISASTER REGULATIONS RECLASSIFYING URBAN FIRES TO ELIMINATE REBUILDING SUBSIDY KITS!',
      lie: 'A CONVOY OF 50 TRUCKS PACKED WITH FREE ZINC SHEETS, DRY BLANKETS, AND GAS STOVES IS UNLOADING NOW!',
      honesty: 'HONESTLY... NATIONAL DISASTER MANAGEMENT CUT RELIEF FUNDS, SO THE CITY COULD ONLY AFFORD PLASTIC ROLLS!',
      honestyEmoji: '⛺'
    },
    partyResponses: {
      da: {
        promise: 'WE ARE ROLLING OUT PROACTIVE FIRE-RETARDANT PAINT AND DENSELY-SPACED SMOKE ALARMS ACROSS ALL SECTORS!',
        blame: 'BLAME NATIONAL GOVERNMENT REPEALING THE HOUSING EMERGENCY STARTER KIT PROCUREMENT PROGRAMME!',
        lie: 'EVERY AFFECTED FAMILY IN WARD 93 HAS RECEIVED A R30,000 PERMANENT BUILDING MATERIAL VOUCHER TODAY!',
        honesty: 'HONESTLY... MUNICIPAL BUDGETS CANNOT AFFORD TO BUY TIMBER AND ZINC FOR 5,000 HOMES EVERY SINGLE WINTER!',
        honestyEmoji: '🌧️'
      },
      anc: {
        promise: 'WE WILL MANDATE FULL EMERGENCY STARTER KITS INCLUDING STRUCTURAL POLES, ZINC, AND MATTRESSES FOR ALL VICTIMS!',
        blame: 'BLAME THE WESTERN CAPE GOVERNMENT FOR HOARDING PROVINCIAL EMERGENCY CONTINGENCY SURPLUSES!',
        lie: 'FREE PERMANENT BRICK RECONSTRUCTION FUNDS HAVE BEEN RELEASED BY EXECUTIVE PRESIDENTIAL DECREE!',
        honesty: 'HONESTLY... DISASTER MANAGEMENT WAREHOUSES RAN COMPLETELY DRY OF STOCK AFTER THE JULY STORMS!',
        honestyEmoji: '🔥'
      },
      pa: {
        promise: 'WE WILL DELIVER SOLID WEATHERPROOF ROOFING SHEETS, DRY MATTRESSES AND HOT FOOD FROM OUR OWN POCKETS!',
        blame: 'BLAME SMUG BUREAUCRATS WHO SLEEP WARM WITH UNDERFLOOR HEATING WHILE BABIES SLEEP ON DAMP MUD!',
        lie: 'I BOUGHT 10,000 INDUSTRIAL GALVANIZED ROOFING SHEETS FROM CAPE TOWN HARBOUR THIS MORNING!',
        honesty: 'HONESTLY... PLASTIC SHEETING IN A CAPE COLD FRONT IS USELESS, IT BLOWS AWAY IN FIVE MINUTES FLAT!',
        honestyEmoji: '💨'
      }
    },
    reactions: {
      promise: {
        positive: 'Fire-retardant sheets and real zinc roofing?! That will keep our babies dry when the winter storms hit!',
        doubtful: 'Smoke alarms? When the whole row of shacks catches fire in two minutes, an alarm just screams at the smoke.',
        negative: 'You come with plastic rolls that tear on the nails! We need brick houses that don’t wash away!'
      },
      blame: {
        positive: 'Exactly! Bureaucrats with underfloor heating don’t care if our mattresses are floating in brown water!',
        doubtful: 'National or Provincial, when the fire happens at 2 AM, it is our neighbours who pull us out, not your decrees.',
        negative: 'Don’t tell us about regulations! How can a rich government give a human being plastic to live in?!'
      },
      lie: {
        positive: 'R30,000 building vouchers for every family?! Hallelujah! I am going to buy cement blocks right now!',
        doubtful: '50 trucks unloading right now? I only see the municipal bakkie driving away with two rolls of plastic.',
        negative: 'Playing with people who just lost all their clothes and IDs in a fire?! Have some respect!'
      },
      honesty: {
        positive: 'Hahaha! Plastic blows away in five minutes flat! You are the only one speaking plain truth, my brother!',
        doubtful: 'Warehouses ran dry? Then replenish them before the winter rains! That is what emergency budgets are for!',
        negative: 'Cannot afford zinc for 5,000 homes?! But you can afford R20 million for fireworks at the Waterfront?!'
      }
    }
  }
];
