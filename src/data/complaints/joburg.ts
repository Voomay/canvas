import { ComplaintData } from '../complaints';

export const JOBURG_COMPLAINTS: ComplaintData[] = [
  {
    id: 'joburg_city_power',
    category: 'joburg_city_power',
    targetParty: 'all',
    complaintText: 'CITY POWER TOOK 72 HOURS TO REPAIR AN EXPLODED SUBSTATION IN THE CBD! ALL THE FOOD IN OUR FRIDGES SPOILED!',
    responses: {
      promise: 'WE WILL UPGRADE AGING CITY POWER SUBSTATIONS WITH AUTOMATED DIGITAL SCADA FAILOVER SWITCHING!',
      blame: 'BLAME ROTATING COALITION MAYORAL INSTABILITY FOR DEROCKING PREVENTATIVE INFRASTRUCTURE TENDERS!',
      lie: 'WE HAVE COMMISSIONED A BRAND NEW NUCLEAR-READY POWER SUBSTATION IN BRAAMFONTEIN TODAY!',
      honesty: 'HONESTLY... CITY POWER HAS NO SPARE HIGH-VOLTAGE BREAKER SWITCHES LEFT IN THE CENTRAL DEPOT!',
      honestyEmoji: '⚡'
    },
    partyResponses: {
      da: {
        promise: 'WE WILL RESTORE MERIT-BASED APPOINTMENTS AND COMMISSION INDEPENDENT POWER PRODUCER (IPP) FEED-INS!',
        blame: 'BLAME SUCCESSIVE CADRE-DEPLOYED COALITIONS FOR PILING UP R9 BILLION IN UNPAID ESKOM BULK DEBT!',
        lie: 'WE SECURED 500 MEGAWATTS OF CLEAN HYDRO-POWER FROM MOZAMBIQUE TO BYPASS LOADSHEDDING COMPLETELY!',
        honesty: 'HONESTLY... YEARS OF BUDGET NEGLECT LEFT 60% OF CITY POWER SWITCHBOARDS EXCEEDING THEIR USEFUL LIFE!',
        honestyEmoji: '📊'
      },
      anc: {
        promise: 'WE ARE MOBILIZING NATIONAL INFRASTRUCTURE REHABILITATION GRANTS TO REFURBISH THE ENTIRE METRO GRID!',
        blame: 'BLAME DELIBERATE ECONOMIC SABOTAGE BY CABLE THIEVES AND HISTORIC POPULATION INFLUX PRESSURE!',
        lie: 'EVERY RESIDENT AFFECTED BY THE BLACKOUT IS RECEIVING A R5,000 GROCERY REPLACEMENT CARD BY 2 PM!',
        honesty: 'HONESTLY... GANGS WITH GAS TORCHES STRIP TRANSFORMERS FASTER THAN OUR RAPID RESPONSE CAN ARRIVE!',
        honestyEmoji: '🚩'
      },
      pa: {
        promise: 'WE WILL FIRE EVERY INCOMPETENT EXECUTIVE AND PERSONALLY STAND GUARD OVER EVERY CITY SUBSTATION!',
        blame: 'BLAME SNOBBY POLITICIANS WHO LIVE IN ESTATES WITH MASSIVE DIESEL GENERATORS AND DON’T CARE ABOUT US!',
        lie: 'I PERSONALLY REPLACED THE 11KV CIRCUIT BREAKER AT 3 AM WITH MY OWN TWO BARE HANDS!',
        honesty: 'HONESTLY... OPENING YOUR FRIDGE AND SMELLING ROTTING MEAT WOULD MAKE ANY SANE CITIZEN VOTE AGAINST US!',
        honestyEmoji: '🥩'
      }
    },
    reactions: {
      promise: {
        positive: 'Automated failover switching?! If my lights stay on without waiting 72 hours, you have my vote in Joburg!',
        doubtful: 'Every mayor promises grid upgrades, and then the lights go pop the minute thunder rolls across the sky.',
        negative: 'Who is refunding the R2,500 of meat that turned green in my deep freezer?! Answer that!'
      },
      blame: {
        positive: 'It is true! Politicians with R100,000 diesel generators never sit in the dark like the rest of Joburg!',
        doubtful: 'Coalition instability is your own fault! Politicians play musical chairs while substations blow up.',
        negative: 'Don’t blame cable thieves when the substation exploded because it hasn’t had fresh oil since 2011!'
      },
      lie: {
        positive: 'R5,000 grocery replacement card by 2 PM?! Let me check my SMS inbox right now!',
        doubtful: 'Replaced an 11kV breaker with bare hands? My brother, 11,000 volts would turn a human into a briquette!',
        negative: 'Nuclear-ready substation in Braamfontein?! Why do politicians treat Joburg voters like idiots?!'
      },
      honesty: {
        positive: 'Hahaha! Smelling rotten meat makes anyone vote against you! That is the most honest truth in politics!',
        doubtful: 'No spare breakers in the depot?! That is reckless municipal mismanagement on a colossal scale.',
        negative: '60% of switchboards past their lifespan?! So the whole city of Gold is running on borrowed time?!'
      }
    }
  },
  {
    id: 'joburg_joburg_water',
    category: 'joburg_joburg_water',
    targetParty: 'all',
    complaintText: 'EIKENHOF PUMP STATION POWER TRIPPED AGAIN! OUR TAPS ACROSS JOBURG SOUTH HAVE BEEN BONE DRY FOR FIVE CONSECUTIVE DAYS!',
    responses: {
      promise: 'WE WILL ISOLATE AND DEDICATE PROTECTED POWER FEEDERS TO ALL CRITICAL BULK WATER BOOSTER STATIONS!',
      blame: 'BLAME ESKOM POWER TRIPS AND RAND WATER SUPPLY CURTAILMENTS RUNNING COMMUTATOR BASINS EMPTY!',
      lie: 'WE AIRLIFTED 50 ULTRA-HIGH-VOLUME INDUSTRIAL WATER PUMPS FROM SWITZERLAND TOUCHING DOWN NOW!',
      honesty: 'HONESTLY... OVER 44% OF PURIFIED TREATED WATER IN JOBURG IS LOST THROUGH UNDERGROUND PIPE LEAKS!',
      honestyEmoji: '🚰'
    },
    partyResponses: {
      da: {
        promise: 'WE WILL RING-FENCE R2 BILLION OF WATER REVENUE TO REPLACE BRITTLE ASBESTOS PIPES AND UPGRADE RESERVOIRS!',
        blame: 'BLAME RAND WATER’S SYSTEM-WIDE LOW COMMUTATOR CAPACITIES CAUSING CASCADING COMMUTATION COLLAPSE!',
        lie: 'JOBURG WATER HAS CONNECTED A SECONDARY BYPASS FEED DIRECTLY FROM THE VAAL DAM THIS MORNING!',
        honesty: 'HONESTLY... OUR MAINTENANCE DEPOTS ARE CURRENTLY DROWNING IN OVER 3,000 UNATTENDED WATER LEAK TICKETS!',
        honestyEmoji: '💻'
      },
      anc: {
        promise: 'WAR ON LEAKS BRIGADES WILL EMPLOY 10,000 YOUNG PEOPLE TO FIX CRITICAL WATER RETICULATION INFRASTRUCTURE!',
        blame: 'BLAME UNPRECEDENTED HEATWAVES AND UNRESTRICTED RESIDENTIAL WATER HOARDING EXHAUSTING BULK SUPPLY!',
        lie: 'EVERY DRY SUBURB IS GETTING 24-HOUR STAINLESS STEEL POLICE-ESCORTED WATER TANKERS ON EVERY CORNER!',
        honesty: 'HONESTLY... BACKUP GENERATORS AT EIKENHOF COULD NOT START BECAUSE THE DIESEL TANKS WERE DRY!',
        honestyEmoji: '💧'
      },
      pa: {
        promise: 'WE WILL ROLL OUT EMERGENCY WATER TANKERS AND LEGALLY SEIZE RAND WATER’S EXCLUSIVE ACCESS VALVES!',
        blame: 'BLAME HIGH-PAID CEOS WHO TAKE HOME R5 MILLION BONUSES WHILE RETIRED TEACHERS CARRY 5-LITRE BOTTLES!',
        lie: 'I PERSONALLY WRENCHED OPEN THE HIGH-PRESSURE EMERGENCY BYPASS VALVE WITH A 36-INCH SPANNER TODAY!',
        honesty: 'HONESTLY... A WORLD METROPOLIS WITHOUT RUNNING TOILETS IS A NATIONAL SHAME, NO EXCUSES WILL WASH YOUR HANDS!',
        honestyEmoji: '🔧'
      }
    },
    reactions: {
      promise: {
        positive: 'Dedicated power feeders for water pump stations?! That finally makes engineering sense! You have my vote!',
        doubtful: 'You promised R2 billion for asbestos pipes three years ago, and my tap still sputters brown air.',
        negative: 'Five days without water to wash children or cook dinner! We don’t want ring-fencing, we want water!'
      },
      blame: {
        positive: 'Rand Water bosses getting multi-million bonuses while we flush toilets with swimming pool buckets?! Sickening!',
        doubtful: 'Blaming heatwaves in autumn? It’s not even hot outside! Fix the damn pumps!',
        negative: 'Don’t tell us residents are hoarding water when the municipal pipes are gushing down Jan Smuts!'
      },
      lie: {
        positive: 'Bypass direct from the Vaal Dam connected today?! Wow, that was fast, let me turn on the tap!',
        doubtful: 'Airlifted pumps from Switzerland? On what plane?! A Boeing can’t carry 50 industrial pumps!',
        negative: 'Wrenching open the bypass with a spanner? Stop talking nonsense like a movie character!'
      },
      honesty: {
        positive: 'Hahaha! No excuses will wash your hands without water! You hit the nail on the head, take my vote!',
        doubtful: 'Diesel tanks were dry for the emergency generators?! That is criminal negligence! Who stole the fuel?!',
        negative: '44% of purified water lost through leaks?! And you have the audacity to charge us water tariffs?!'
      }
    }
  },
  {
    id: 'joburg_potholes',
    category: 'joburg_potholes',
    targetParty: 'all',
    complaintText: 'THE POTHOLES ON JAN SMUTS AND EMPIRE ROAD ARE SO DEEP YOU CAN PLANT A MEALIE FIELD INSIDE THEM!',
    responses: {
      promise: 'WE WILL EXPAND THE POTHOLE PATROL FLEET WITH REINFORCED THERMAL ASPHALT JET-PATCHING CREWS!',
      blame: 'BLAME DECADES OF CRIPPLING UNDER-INVESTMENT IN BASIC STORMWATER CHANNELS BY PREVIOUS REGIMES!',
      lie: 'EVERY ARTERIAL ROAD IN GAUTENG WAS RE-CARPETED WITH INDESTRUCTIBLE RUBBER POLYMER LAST NIGHT!',
      honesty: 'HONESTLY... BITUMEN SUPPLIES WERE STRANDED AT DURBAN HARBOUR FOR FOUR STRAIGHT MONTHS!',
      honestyEmoji: '🕳️'
    },
    partyResponses: {
      da: {
        promise: 'WE WILL DIGITIZE ROAD ASSET REGISTERS AND CONTRACT PRIVATE ROAD PAVING GUILDS ON PERFORMANCE SLA BONDS!',
        blame: 'BLAME THE TOTAL COLLAPSE OF THE JOHANNESBURG ROADS AGENCY (JRA) PROCUREMENT INTEGRITY UNDER CADRES!',
        lie: 'JAN SMUTS AVENUE WAS CERTIFIED LASER-FLAT AND SMOOTH BY AN INTERNATIONAL RACING FEDERATION TODAY!',
        honesty: 'HONESTLY... OUR ROAD CREWS HAVE TO USE GRAVEL FILLERS BECAUSE THE MUNICIPAL ASPHALT PLANT IS OFFLINE!',
        honestyEmoji: '🚗'
      },
      anc: {
        promise: 'WE WILL MOBILIZE 5,000 YOUTH INTO THE MASUPATSLA INFRASTRUCTURE BRIGADES TO TACKLE EVERY DEFECT!',
        blame: 'BLAME RECORD UNPRECEDENTED FLASH FLOODS OVERWHELMING 100-YEAR-OLD APARTHEID-ERA STORMWATER PIPES!',
        lie: 'ROBOTIC AUTONOMOUS ROAD SURFACE REPAIR VEHICLES ARE CURRENTLY WORKING DOWN EMPIRE ROAD RIGHT NOW!',
        honesty: 'HONESTLY... BITUMEN AND PETROCHEMICAL REFINERY SHUTDOWNS BROUGHT TAR PRODUCTION TO A TOTAL HALT!',
        honestyEmoji: '🚜'
      },
      pa: {
        promise: 'WE WILL SEIZE WASTED ENTERTAINMENT BUDGETS AND FIX THE ROADS WITH REAL TAR BEFORE NEXT WEEK!',
        blame: 'BLAME CORRUPT CONTRACTORS WHO DUMP THREE SHOVELS OF SAND IN A HOLE AND INVOICE THE CITY R50,000!',
        lie: 'I PURCHASED 50 STEAM ROLLERS OUT OF MY OWN POCKET TO RE-TAR EVERY HIGHWAY BEFORE TONIGHT’S RUSH HOUR!',
        honesty: 'HONESTLY... I CRACKED A SUSPENSION STRUT ON THAT SAME EMPIRE ROAD CRATER LAST WEEK IN MY BAKKIE!',
        honestyEmoji: '🚙'
      }
    },
    reactions: {
      promise: {
        positive: 'Thermal asphalt jet-patching?! If you fix the Jan Smuts potholes, motorists will build a statue of you!',
        doubtful: 'Every year you launch a "Pothole Patrol" with fancy stickers on cars, and the holes just multiply.',
        negative: 'Insurance won’t pay for my two destroyed run-flat tyres, and the city ignores all claim forms!'
      },
      blame: {
        positive: 'R50,000 invoices for three shovels of dirt is 100% facts! JRA corruption has destroyed our city roads!',
        doubtful: 'Apartheid stormwater pipes? My brother, that was thirty years ago, you had three decades to dig a ditch!',
        negative: 'Stop blaming flash floods! Proper roads in Europe survive blizzards without turning into craters!'
      },
      lie: {
        positive: 'Laser-flat certified by an international racing federation?! That made me laugh so hard, take my vote!',
        doubtful: 'Robotic autonomous road surfacing vehicles? On Empire Road? We don’t even have traffic lights that work!',
        negative: 'Re-carpeted last night?! I just swerved around a half-metre deep hole right outside this intersection!'
      },
      honesty: {
        positive: 'Hahaha! Cracked your own suspension strut in your bakkie! At least you know the pain! Respect!',
        doubtful: 'Asphalt plant offline? How does Africa’s richest business capital fail to make basic road tar?!',
        negative: 'Filling holes with loose dirt and gravel that kicks up into our windscreens is worse than doing nothing!'
      }
    }
  },
  {
    id: 'joburg_billing_crisis',
    category: 'joburg_billing_crisis',
    targetParty: 'all',
    complaintText: 'THE CITY CHARGED ME A R62,000 ESTIMATED ELECTRICITY BILL FOR AN EMPTY ONE-BEDROOM APARTMENT!',
    responses: {
      promise: 'WE WILL CANCEL UNVERIFIED ESTIMATIONS AND ROLL OUT TAMPER-PROOF CELLULAR SMART METERS CITYWIDE!',
      blame: 'BLAME AN OUTDATED 20-YEAR-OLD SAP LEGACY MAINFRAME SOFTWARE AND ROGUE METER-READING CONTRACTORS!',
      lie: 'OUR METRO AUDITORS HAVE REVERSED ALL INCORRECT MUNICIPAL ACCOUNTS TO ZERO BALANCE TODAY!',
      honesty: 'HONESTLY... THE SYSTEM ESTIMATES USAGE WHEN METER READERS CANNOT ENTER GATED HOUSES WITH GUARD DOGS!',
      honestyEmoji: '🐕'
    },
    partyResponses: {
      da: {
        promise: 'WE WILL AUDIT AND REBUILD THE REVENUE SERVICE WITH TRANSPARENT ONLINE SELF-SUBMISSION PORTALS!',
        blame: 'BLAME YEARS OF SAP MIGRATION DISASTER DEPLOYMENTS INFLICTED BY PAST CORRUPT COALITIONS!',
        lie: 'WE HAVE ISSUED A STRICT EXECUTIVE MORATORIUM PROHIBITING ANY BILLING DISCONNECTIONS PERMANENTLY!',
        honesty: 'HONESTLY... OUR CALL CENTRE HANDLES 14,000 BILLING DISPUTE TICKETS THAT TAKE 9 MONTHS TO RESOLVE!',
        honestyEmoji: '🖥️'
      },
      anc: {
        promise: 'INDIGENT REGISTER RE-CALIBRATION AND HISTORIC DEBT FORGIVENESS WILL SHIELD STRUGGLING CITIZENS!',
        blame: 'BLAME AGGRESSIVE PRIVATE DEBT-COLLECTION SYNDICATES ILLEGALLY TARGETING RESIDENTIAL ACCOUNTS!',
        lie: 'EVERY HOUSEHOLD WITH AN ESTIMATION DISPUTE IS GETTING A FULL R20,000 REFUND CHEQUE IN THE POST TODAY!',
        honesty: 'HONESTLY... ALGORITHM ESTIMATION MULTIPLIERS WENT COMPLETELY HAYWIRE AFTER THE LAST UPDATE!',
        honestyEmoji: '📜'
      },
      pa: {
        promise: 'WE WILL TEAR UP RIDICULOUS BILLS AND PHYSICALLY RECONNECT ANY PENSIONER WHO HAS BEEN CUT OFF!',
        blame: 'BLAME HEARTLESS COMPUTERS BILLING STRUGGLING RESIDENTS FORTUNES WHILE BIG COMPANIES OWE BILLIONS!',
        lie: 'I PERSONALLY LOGGED INTO THE CITY SERVER AND WIPED OUT EVERY OVERCHARGED CENT IN JOBURG!',
        honesty: 'HONESTLY... R62,000 FOR A ONE-BEDROOM IS PURE THEFT, NO HUMAN COULD BURN THAT MUCH POWER!',
        honestyEmoji: '🔥'
      }
    },
    reactions: {
      promise: {
        positive: 'Self-submission portals and smart meters?! That will save us from heart attacks when the envelope arrives!',
        doubtful: 'You promised to fix the billing crisis in 2016, then in 2019, then in 2021. The bills still arrive in millions.',
        negative: 'I spent 6 hours queuing at Thuso House and the consultant told me to "pay now and dispute later"!'
      },
      blame: {
        positive: 'Rogue meter reading contractors sit under a tree and guess numbers! Everyone in Joburg knows this!',
        doubtful: 'Blaming computers doesn’t stop the red disconnection notice from being pasted on my front gate.',
        negative: 'Pay R62,000 or get disconnected? Big corporations owe billions and never get cut off! Disgusting!'
      },
      lie: {
        positive: 'R20,000 refund cheque in the post today?! Let me run to the mailbox before the postman leaves!',
        doubtful: 'Logged into the city server and wiped it? My brother, this is not Hollywood, you don’t have the password!',
        negative: 'Reversed to zero? The municipal debt collector called me threatening court action this morning!'
      },
      honesty: {
        positive: 'Hahaha! Meter readers afraid of guard dogs! That’s why my meter was estimated for 18 months! So true!',
        doubtful: 'Nine months to resolve a billing dispute? And in the meantime they cut our power on a Friday afternoon.',
        negative: 'Algorithm went haywire?! Then why are you sending disconnect teams for money your computer made up?!'
      }
    }
  }
];
