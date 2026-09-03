import { ComplaintData } from '../complaints';

export const HANOVER_PARK_COMPLAINTS: ComplaintData[] = [
  {
    id: 'hanover_court_sewage',
    category: 'hanover_court_sewage',
    targetParty: 'all',
    complaintText: 'THE COUNCIL SEWAGE PIPE BEHIND OUR COURT HAS BEEN OVERFLOWING FOR THREE WEEKS! THE KIDS CANNOT EVEN PLAY IN THE SQUARE!',
    responses: {
      promise: 'A HIGH-PRESSURE JET TRUCK IS DISPATCHED AND WILL CLEAR THE DRAIN TODAY!',
      blame: 'BLAME ILLEGAL DUMPING AND FOREIGN OBJECTS FLUSHED DOWN THE MAIN LINE!',
      lie: 'OUR SATELLITE SENSORS ALREADY CLEARED AND STERILIZED THE WHOLE COURT THIS MORNING!',
      honesty: 'HONESTLY... THE MUNICIPAL TRUCKS ARE STUCK WAITING FOR DIESEL AT THE DEPOT!',
      honestyEmoji: '🚰'
    },
    partyResponses: {
      da: {
        promise: 'WE HAVE LOGGED C3 NOTIFICATION #88492 FOR PRIORITY JETTING ACTION!',
        blame: 'BLAME NATIONAL WATER DEPT FOR FAILING BULK INFRASTRUCTURE SUBSIDIES!',
        lie: 'A TIER-1 CLEAN AUDIT RAPID REPAIR SQUAD IS ALREADY TURNING THE VALVE!',
        honesty: 'HONESTLY... OUR CALL CENTRE BACKLOG HAS 1,400 OPEN PLUMBING TICKETS!',
        honestyEmoji: '📋'
      },
      anc: {
        promise: 'WE WILL BRING DIGNITY AND DRAINAGE SYSTEM RESTORATION TO THE WORKING CLASS!',
        blame: 'BLAME CITY OF CAPE TOWN FOR SPENDING THE CAPITAL BUDGET ON SEABOARD PROMENADES!',
        lie: 'WE ARE REPLACING EVERY SEWERAGE PIPE IN THE CAPE FLATS WITH STAINLESS STEEL!',
        honesty: 'HONESTLY... OUR COMRADES AT WATER AFFAIRS ARE STILL AT A STRATEGIC LEKGOTLA!',
        honestyEmoji: '✊'
      },
      pa: {
        promise: 'WE WILL GET A SHOVEL AND CLEAR THIS DRAIN RIGHT NOW WITH OUR OWN HANDS!',
        blame: 'BLAME SNOBBY CITY OFFICIALS SITTING IN AIR-CONDITIONED OFFICES IN TOWN!',
        lie: 'I PERSONALLY ORDERED A BRAND NEW GERMAN PUMP TRUCK LANDING AT THE PORT TODAY!',
        honesty: 'HONESTLY... I BROUGHT MY GUMBOOTS, BUT THIS SMELL IS SOMETHING ELSE MY BRASSE!',
        honestyEmoji: '🥾'
      }
    },
    reactions: {
      promise: {
        positive: 'Thank you! Please make sure the jet truck actually pitches up before sunset!',
        doubtful: 'You gave us a reference number last election and the water is still bubbling.',
        negative: 'Reference number?! We are wearing plastic bags over our shoes to buy bread!'
      },
      blame: {
        positive: 'True, people must stop throwing engine oil and blankets down the manholes!',
        doubtful: 'Don’t blame the residents! We pay our council rates every single month!',
        negative: 'Passing the buck while our washing lines smell like a septic tank?! Voetsek!'
      },
      lie: {
        positive: 'Sterilized this morning?! Yoh, you guys work fast, take my vote!',
        doubtful: 'Sterilized?! My slippers are literally soaked in a green puddle right now!',
        negative: 'You think people in Hanover Park are blind?! Look at the ground in front of you!'
      },
      honesty: {
        positive: 'Hahaha! At least you don’t lie to our faces! Come take a cup of Rooibos tea!',
        doubtful: 'No diesel?! With the fuel levy we pay?! What kind of governance is that?!',
        negative: 'No diesel?! Then push the bakkie yourself, you want our votes but no work!'
      }
    }
  },
  {
    id: 'hanover_flats_paint',
    category: 'hanover_flats_paint',
    targetParty: 'all',
    complaintText: 'THESE COUNCIL FLATS HAVEN’T SEEN A LICK OF PAINT SINCE 1994! THE BALCONIES ARE CRUMBLING OVER OUR HEADS!',
    responses: {
      promise: 'WE HAVE EARMARKED R15 MILLION FOR STRUCTURAL REPAIRS AND WATERPROOF COATING!',
      blame: 'BLAME HISTORIC DEBT AND TENANTS NOT CONTRIBUTING TO THE MAINTENANCE LEVY!',
      lie: '50 MASTER PAINTERS WITH BRAND NEW SCAFFOLDING ARE ARRIVING TOMORROW MORNING!',
      honesty: 'HONESTLY... THE TENDER APPEALS TRIBUNAL FROZE THE RESURFACING CONTRACT AGAIN!',
      honestyEmoji: '🏢'
    },
    partyResponses: {
      da: {
        promise: 'WE HAVE ALLOCATED R12 MILLION IN THE NEW CAPEX CYCLE FOR RESURFACING!',
        blame: 'BLAME NON-PAYING TENANTS FOR RUNNING DOWN THE METRO REPAIR FUND!',
        lie: 'A FLEET OF 50 MASTER PAINTERS IS PARKED AT THE CIVIC CENTRE RIGHT NOW!',
        honesty: 'HONESTLY... THE HERITAGE PRESERVATION COMMITTEE OBJECTED TO THE BEIGE PAINT!',
        honestyEmoji: '📊'
      },
      anc: {
        promise: 'WE WILL TRANSFORM THESE COURTS INTO MODERN, DIGNIFIED MULTI-STOREY RESIDENCES!',
        blame: 'BLAME THE PROVINCIAL DA ADMINISTRATION FOR STARVING WORKING-CLASS TOWNSHIPS!',
        lie: 'WE HAVE APPROVED FREE RE-BRICKING AND BALCONY TILING FOR EVERY FLAT IN WARD 47!',
        honesty: 'HONESTLY... HOUSING REPAIR BUDGETS WERE REALLOCATED TO OUR ELECTION RALLIES!',
        honestyEmoji: '🚩'
      },
      pa: {
        promise: 'WE WILL DONATE PAINT FROM OUR OWN POCKETS AND PUT UP SCAFFOLDING THIS WEEK!',
        blame: 'BLAME BUREAUCRATS WHO ONLY VISIT HANOVER PARK WHEN IT’S TIME TO BEG FOR VOTES!',
        lie: 'I SIGNED A DEAL WITH DULUX TO PAINT THE ENTIRE SUBURB BRIGHT GREEN FOR FREE!',
        honesty: 'HONESTLY... I CAN PAINT A WALL, BUT BALCONY CONCRETE REPAIR NEEDS A STRUCTURAL ENGINEER!',
        honestyEmoji: '🥊'
      }
    },
    reactions: {
      promise: {
        positive: 'Praat jy die waarheid?! If you paint our court, we will vote for you forever!',
        doubtful: 'Every politician promises paint before the ballot, and leaves us peeling concrete.',
        negative: 'A chunk of balcony fell on Uncle Joey’s Toyota yesterday! We need bricks, not promises!'
      },
      blame: {
        positive: 'It’s true, some tenants haven’t paid R50 rent in twenty years.',
        doubtful: 'Blaming poor pensioners who survive on SASSA grants won’t fix crumbling stairs.',
        negative: 'Don’t come preach about levies when you drive past in a R1.5 million SUV!'
      },
      lie: {
        positive: 'Arriving tomorrow morning?! Praise the Lord! I’m taking down my curtains right now!',
        doubtful: 'Tomorrow morning? On a Sunday? You really take us for foolish people, hey?',
        negative: 'Lies, sweet lies! You couldn’t even fix the broken glass in the foyer!'
      },
      honesty: {
        positive: 'Hahaha! The heritage committee?! On council flats?! That made my whole day, take my vote!',
        doubtful: 'Frozen tenders don’t stop falling plaster from cracking our heads open.',
        negative: 'So you came here to tell us you are completely powerless?! Why must we vote for you?!'
      }
    }
  },
  {
    id: 'hanover_meter_deductions',
    category: 'hanover_meter_deductions',
    targetParty: 'all',
    complaintText: 'I BOUGHT R100 PREPAID ELECTRICITY AT THE SPAZA SHOP AND ONLY GOT 18 UNITS AFTER CITY DEDUCTIONS!',
    responses: {
      promise: 'WE ARE RAISING THE FREE BASIC ELECTRICITY THRESHOLD TO 75 UNITS PER MONTH!',
      blame: 'BLAME ESKOM BULK GENERATION HIKES AND THE NATIONAL ENERGY REGULATOR (NERSA)!',
      lie: 'EVERY PREPAID METER IN HANOVER PARK HAS BEEN CREDITED WITH 200 FREE UNITS TODAY!',
      honesty: 'HONESTLY... THE AUTOMATED DEBT RECOVERY SYSTEM SLAPS A 70% LEVY ON ARREARS!',
      honestyEmoji: '⚡'
    },
    partyResponses: {
      da: {
        promise: 'WE ARE RESTRUCTURING THE LIFELINE TARIFF BRACKETS TO GIVE 60 FREE UNITS!',
        blame: 'BLAME ESKOM’S MASSIVE 18.6% BULK GENERATION TARIFF HIKE FORCED ON US!',
        lie: 'EVERY HOUSEHOLD IN THIS COURT HAS A R500 REBATE VOUCHER SMS’D TODAY!',
        honesty: 'HONESTLY... OUR BILLING ALGORITHM AUTOMATICALLY RECOVERS WATER ARREARS FROM POWER TOKENS!',
        honestyEmoji: '💻'
      },
      anc: {
        promise: 'FREE BASIC ELECTRICITY MUST BE DOUBLED FOR ALL WORKING FAMILIES IMMEDIATELY!',
        blame: 'BLAME CITY OF CAPE TOWN SURCHARGES FOR SQUEEZING THE POOREST CITIZENS!',
        lie: 'ESKOM HAS CANCELLED ALL RESIDENTIAL TARIFF CHARGES FOR HANOVER PARK RESIDENTS!',
        honesty: 'HONESTLY... NATIONAL TREASURY FORCED MUNICIPALITIES TO CLAW BACK EVERY CENT OF DEBT!',
        honestyEmoji: '⚡'
      },
      pa: {
        promise: 'WE WILL SCRAP ALL HISTORICAL COUNCIL DEBT ATTACHED TO PREPAID METERS!',
        blame: 'BLAME HEARTLESS COMPUTER SYSTEMS PROGRAMMED BY PEOPLE WHO HAVE NEVER RUN OUT OF UNITS!',
        lie: 'I PERSONALLY INSTALLED FREE ROOFTOP SOLAR PANELS ON EVERY ROOF IN THIS SECTION!',
        honesty: 'HONESTLY... THOSE METERS EAT MONEY FASTER THAN A SLOT MACHINE AT GRANDWEST CASINO!',
        honestyEmoji: '🎰'
      }
    },
    reactions: {
      promise: {
        positive: 'Dankie tog! 75 free units means the kettle can boil and the children can do homework!',
        doubtful: 'Lifeline tariffs sound fancy, but my box still beeps red on the 10th of every month.',
        negative: 'Promise, promise! In winter we sit under three blankets because units vanish!'
      },
      blame: {
        positive: 'Eskom is the real criminal! R100 for two days of lights is highway robbery!',
        doubtful: 'Eskom or City, at the end of the day my fridge turns off and milk goes sour.',
        negative: 'Don’t point fingers at Pretoria when the deduction slip says City of Cape Town!'
      },
      lie: {
        positive: '200 free units credited today?! Let me go punch the code into the box right now!',
        doubtful: 'Credited? I just bought units 10 minutes ago and got 14 units on my receipt.',
        negative: 'Haibo! You lie smoother than a car salesman on Voortrekker Road!'
      },
      honesty: {
        positive: 'Hahaha! Slot machine at Grandwest! You speak our language, take my vote my leader!',
        doubtful: 'At least you admit it’s an automatic clawback, but it’s starving our families.',
        negative: 'Taking food money for historical water bills from ten years ago?! Cruel!'
      }
    }
  },
  {
    id: 'hanover_gang_ceasefire',
    category: 'hanover_gang_ceasefire',
    targetParty: 'all',
    complaintText: 'WHERE IS THE POLICE VISIBILITY OUTSIDE OUR CORNER SHOPS? ELDERLY RESIDENTS CANNOT SAFELY WALK TO THE CASH DISPENSER!',
    responses: {
      promise: 'WE ARE ESTABLISHING A PERMANENT TACTICAL COMMAND POST RIGHT ON THIS CORNER!',
      blame: 'BLAME GANG SYNDICATES AND A WEAK JUSTICE SYSTEM RELEASING SUSPECTS ON R200 BAIL!',
      lie: '500 UNDERCOVER ELITE OPERATIVES ARE IN POSITION ON THIS STREET AS WE SPEAK!',
      honesty: 'HONESTLY... WHEN BULLETS FLY, EVEN THE METRO PATROL VEHICLES WAIT FOR BACKUP!',
      honestyEmoji: '🛡️'
    },
    partyResponses: {
      da: {
        promise: 'WE ARE DEPLOYING 120 LAW ENFORCEMENT ADVANCEMENT PLAN (LEAP) OFFICERS HERE!',
        blame: 'BLAME SAPS AND NATIONAL POLICE MINISTRY FOR CHRONICALLY UNDER-STAFFING OUR PRECINCT!',
        lie: 'HIGH-TECH SKY POLICE DRONES WITH THERMAL CAMERAS ARE OVERHEAD 24/7!',
        honesty: 'HONESTLY... OUR LEAP SQUADS GET SPREAD THIN ACROSS 15 NEIGHBOURHOODS EVERY NIGHT!',
        honestyEmoji: '🚨'
      },
      anc: {
        promise: 'WE WILL MOBILIZE SPECIAL TACTICAL FORCES AND AMMUNITION INTERDICTION RAIDS!',
        blame: 'BLAME PROVINCIAL COLLUSION AND BROKEN COMMUNITY POLICING FORUM STRATEGIES!',
        lie: 'WE HAVE DEPLOYED 300 UNDERCOVER DETECTIVES INTEGRATED INTO THE COMMUNITY!',
        honesty: 'HONESTLY... PHILIPPI POLICE STATION ONLY HAS 4 RUNNING BAKKIES FOR 60,000 RESIDENTS!',
        honestyEmoji: '🚓'
      },
      pa: {
        promise: 'WE DON’T NEGOTIATE WITH THUGS! WE WILL PERSONALLY SECURE EVERY SHOPPING CORNER!',
        blame: 'BLAME CORRUPT MAGISTRATES WHO RELEASE REPEAT OFFENDERS BEFORE BREAKFAST!',
        lie: 'EVERY LOCAL GANG GENERAL SIGNED AN UNCONDITIONAL CEASEFIRE DIRECTLY WITH ME TODAY!',
        honesty: 'HONESTLY... I WAS IN PRISON WITH THEIR BOSSES, IT TAKES BRUTAL REALITY TO STOP THEM!',
        honestyEmoji: '👊'
      }
    },
    reactions: {
      promise: {
        positive: 'A permanent command post?! If my granny can walk safely to the corner shop, you have our votes!',
        doubtful: 'They park the van for 20 minutes, take a selfie for social media, and drive off.',
        negative: 'Empty promises while mothers cry on the news every single weekend.'
      },
      blame: {
        positive: 'True! The magistrate lets them out on R200 bail before the docket is even written!',
        doubtful: 'Blaming the court doesn’t stop the bullets hitting our corrugated iron gates.',
        negative: 'Politicians always blame the police ministry, but nobody ever stops the shooting!'
      },
      lie: {
        positive: 'Ceasefire signed today?! Praise God, may peace finally return to our square!',
        doubtful: 'Ceasefire? Shots rang out by the terminus less than two hours ago.',
        negative: 'How dare you make jokes about our safety?! You have no shame!'
      },
      honesty: {
        positive: 'Hahaha! Well, at least you are real about how scary it gets. Respect for the truth!',
        doubtful: 'Four bakkies for 60,000 people?! No wonder 10111 rings until the line dies.',
        negative: 'If the police are waiting for backup, then who is supposed to protect our children?!'
      }
    }
  },
  {
    id: 'hanover_clinic_queue',
    category: 'hanover_clinic_queue',
    targetParty: 'all',
    complaintText: 'PENSIONERS STAND AT THE DAY HOSPITAL FROM 4 AM IN THE FREEZING RAIN, ONLY TO BE TOLD FILES ARE LOST BY 9 AM!',
    responses: {
      promise: 'WE ARE INSTALLING DIGITAL TABLET CHECK-INS AND COVERED HEATED WAITING CANOPIES!',
      blame: 'BLAME CHRONIC SHORTAGES OF PROVINCIAL PHARMACISTS AND UNPRECEDENTED PATIENT INFLUX!',
      lie: '40 SPECIALIST DOCTORS FROM GROOTE SCHUUR HAVE BEEN TRANSFERRED TO THIS CLINIC TODAY!',
      honesty: 'HONESTLY... THE SYSTEM WENT DOWN AT 7 AM AND STAFF WERE USING PAPER FILES FROM 1982!',
      honestyEmoji: '🏥'
    },
    partyResponses: {
      da: {
        promise: 'WE ARE ROLLING OUT DIGITIZED BIOMETRIC PATIENT FOLDERS TO ELIMINATE PHYSICAL FILES!',
        blame: 'BLAME UNPRECEDENTED INFLUX FROM OTHER PROVINCES STRAINING OUR LOCAL CLINIC CAPEX!',
        lie: 'EVERY CHRONIC PATIENT IN HANOVER PARK IS GETTING HOME-DELIVERED MEDS BY DRONE NEXT WEEK!',
        honesty: 'HONESTLY... THREE SENIOR NURSES RETIRED AND THE HIRING FREEZE FROZE REPLACEMENTS!',
        honestyEmoji: '🩺'
      },
      anc: {
        promise: 'NATIONAL HEALTH INSURANCE (NHI) WILL GUARANTEE TOP-TIER PRIVATE DOCTORS FOR ALL CITIZENS!',
        blame: 'BLAME APARTHEID-ERA TWO-TIER HEALTH SYSTEMS HOARDING DOCTORS IN PRIVATE HOSPITALS!',
        lie: 'WE HAVE APPROVED A 24-HOUR TRAUMA HOSPITAL WITH MRI SCANNERS ON THIS EXACT CORNER!',
        honesty: 'HONESTLY... NHI FUNDING IS STILL BEING HAMMERED OUT IN PARLIAMENTARY COMMITTEES!',
        honestyEmoji: '💉'
      },
      pa: {
        promise: 'WE WILL BRING PRIVATE MOBILE CLINIC BUSSES WITH FREE ROOIBOS AND SOUP FOR GOGOS!',
        blame: 'BLAME SMUG BUREAUCRATS WHO HAVE PRIVATE MEDICAL AID AND NEVER QUEUED FOR BLOOD PRESSURE PILLS!',
        lie: 'I PERSONALLY BOUGHT 100 NEW COMPUTERS FOR THE RECORD ROOM OUT OF MY OWN POCKET!',
        honesty: 'HONESTLY... MY OWN AUNTIE SAT ON THAT WOODEN BENCH FOR 7 HOURS AND LEFT WITH HALF HER PILLS!',
        honestyEmoji: '👵'
      }
    },
    reactions: {
      promise: {
        positive: 'Biometric tablets and heated waiting seats?! My poor arthritis will finally rest! You have my vote!',
        doubtful: 'You promised digital cards three years ago, and Aunty Mary still stands with her paper book.',
        negative: 'Digital tablets?! The Wi-Fi doesn’t even work at the post office down the street!'
      },
      blame: {
        positive: 'Private medical aids take all the young doctors, that part is definitely true!',
        doubtful: 'Influx or not, our grandmothers cannot sit on cold concrete slabs for six hours.',
        negative: 'Don’t make excuses for lost folders when the clerk is playing Candy Crush on her phone!'
      },
      lie: {
        positive: 'Home delivered by drone?! Yoh! Hanover Park is living in the 22nd century!',
        doubtful: 'A drone? In Hanover Park? It will get intercepted and stripped for parts before it lands!',
        negative: 'Lying to sick pensioners about doctors? Have you no fear of God?!'
      },
      honesty: {
        positive: 'Hahaha! Your own auntie waited 7 hours?! That’s the most honest thing a politician ever said!',
        doubtful: 'Hiring freeze?! We pay taxes every day on bread and milk, hire the nurses!',
        negative: 'Paper files from 1982?! No wonder my blood test results ended up in Kimberley!'
      }
    }
  }
];
