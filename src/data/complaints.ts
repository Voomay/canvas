export type ResponseType = 'promise' | 'blame' | 'honesty' | 'lie';

export interface ResidentReactionTexts {
  positive: string;
  doubtful: string;
  negative: string;
}

export interface ComplaintData {
  id: string;
  category: 'roads' | 'streetlights' | 'water' | 'rubbish' | 'electricity' | 'housing' | 'safety' | 'health' | 'jobs' | 'promises' | 'socialmedia';
  targetParty?: 'da' | 'anc' | 'pa' | 'all';
  complaintText: string;
  responses: {
    promise: string;
    blame: string;
    honesty: string;
    honestyEmoji?: string;
    lie?: string;
  };
  partyResponses?: Partial<Record<'da' | 'anc' | 'pa', {
    promise?: string;
    blame?: string;
    honesty?: string;
    honestyEmoji?: string;
    lie?: string;
  }>>;
  reactions: {
    promise: ResidentReactionTexts;
    blame: ResidentReactionTexts;
    honesty: ResidentReactionTexts;
    lie?: ResidentReactionTexts;
  };
  partyReactions?: Partial<Record<'da' | 'anc' | 'pa', {
    promise?: ResidentReactionTexts;
    blame?: ResidentReactionTexts;
    honesty?: ResidentReactionTexts;
    lie?: ResidentReactionTexts;
  }>>;
}

export function getComplaintChoice(
  complaint: ComplaintData,
  type: ResponseType,
  partyId?: 'da' | 'anc' | 'pa'
): { text: string; emoji?: string } {
  const partySpecific = partyId && complaint.partyResponses?.[partyId];
  if (type === 'promise') {
    return { text: partySpecific?.promise || complaint.responses.promise };
  }
  if (type === 'blame') {
    return { text: partySpecific?.blame || complaint.responses.blame };
  }
  if (type === 'honesty') {
    // Honesty / Spin / Deflection option
    return {
      text: partySpecific?.honesty || complaint.responses.honesty
    };
  }
  if (type === 'lie') {
    const customLie = partySpecific?.lie || complaint.responses.lie;
    if (customLie) return { text: customLie };
    const defaultLies: Record<string, string> = {
      socialmedia: 'WE NEVER PAID 1 CENT! THAT HASHTAG WAS 100% ORGANIC PASSION!',
      roads: 'WE APPROVED R50 MILLION FOR THIS ROAD LAST NIGHT!',
      streetlights: 'SOLAR SATELLITE LIGHTING IS ON ITS WAY FROM GERMANY!',
      water: 'THE MAIN RESERVOIR HAS BEEN UPGRADED AND WATER IS FLOWING RIGHT NOW!',
      electricity: 'LOADSHEDDING IN THIS AREA HAS BEEN PERMANENTLY EXEMPTED!',
      rubbish: '20 NEW COMPACTOR TRUCKS ARE PARKED JUST AROUND THE CORNER!',
      housing: 'YOUR TITLE DEEDS ARE PRINTED AND SITTING ON MY DESK RIGHT NOW!',
      safety: 'WE HAVE DEPLOYED 500 UNDERCOVER METRO OFFICERS ON THIS STREET!',
      jobs: 'WE HAVE 10,000 GUARANTEED HIGH-PAYING METRO JOBS STARTING MONDAY!'
    };
    return { text: defaultLies[complaint.category] || 'OUR AUDIT SHOWS THIS WAS ALREADY 100% FIXED YESTERDAY!' };
  }
  return { text: 'NO COMMENT' };
}

export function getComplaintReaction(
  complaint: ComplaintData,
  type: ResponseType,
  outcome: 'positive' | 'doubtful' | 'negative',
  partyId?: 'da' | 'anc' | 'pa'
): string {
  const partySpecificReaction = partyId && complaint.partyReactions?.[partyId]?.[type]?.[outcome];
  if (partySpecificReaction) return partySpecificReaction;

  const baseReaction = complaint.reactions[type]?.[outcome];
  if (baseReaction) return baseReaction;

  if (type === 'lie') {
    if (outcome === 'positive') {
      return 'Yoh! R50 million approved already?! God bless you, take my vote!';
    }
    if (outcome === 'doubtful') {
      return 'Mxm... that sounds way too good to be true, politician.';
    }
    return 'YOH! You think we cannot smell a lie?! You are lying through your teeth!';
  }

  return 'The resident stares at you skeptically...';
}

export const COMPLAINTS: ComplaintData[] = [
  // ==========================================
  // 0. SOCIAL MEDIA & INFLUENCER WARS COMPLAINT
  // ==========================================
  {
    id: 'socialmedia_feud',
    category: 'socialmedia',
    targetParty: 'all',
    complaintText: 'WHY ARE YOU GUYS FIGHTING ON SOCIAL MEDIA?! ARE YOU PAYING INFLUENCERS TO TRASH EACH OTHER INSTEAD OF FIXING OUR ROADS?!',
    responses: {
      promise: 'WE WILL BAN OUR COALITION PARTNERS FROM TWITTER/X!',
      blame: 'BLAME THE OPPOSITION INFLUENCER TROLL FARMS!',
      lie: 'WE NEVER SPENT 1 CENT! THAT VIRAL HASHTAG WAS 100% ORGANIC!',
      honesty: 'HONESTLY... OUR PR TEAM DRANK 4 RED BULLS AND WENT ROGUE!',
      honestyEmoji: '🤦'
    },
    partyResponses: {
      da: {
        promise: 'WE ARE ENACTING STRICT DIGITAL DISCIPLINE PROTOCOLS!',
        blame: 'BLAME OPPOSITION BOT FARMS FOR STARTING THE HASHTAG WAR!',
        lie: 'NONE OF OUR MEMBERS USE TWITTER! WE ONLY READ POLICY BRIEFS!',
        honesty: 'HONESTLY... WE CONFISCATED OUR COUNCILLOR\'S PHONE AFTER MIDNIGHT!',
        honestyEmoji: '📱'
      },
      anc: {
        promise: 'WE WILL DEPLOY REVOLUTIONARY DISCIPLINE ON ALL SOCIAL PLATFORMS!',
        blame: 'BLAME AGENTS OF COUNTER-REVOLUTIONARY TWITTER ALGORITHMS!',
        lie: 'WE HAVE ZERO INFLUENCERS ON THE PAYROLL, COMRADE!',
        honesty: 'HONESTLY... THE COALITION GROUP CHAT GOT VERY MESSY!',
        honestyEmoji: '😂'
      },
      pa: {
        promise: 'WE WILL DEAL WITH THIS LIVE ON FACEBOOK TONIGHT!',
        blame: 'BLAME THE SOFT COCKTAIL-PARTY TWEETERS IN PARLIAMENT!',
        lie: 'OUR INFLUENCERS WORK FOR FREE PATRIOTIC LOVE!',
        honesty: 'HONESTLY... SOMETIMES YOU HAVE TO CLAP BACK ON TIKTOK!',
        honestyEmoji: '🔥'
      }
    },
    reactions: {
      promise: {
        positive: 'Good! Put the phones down and pick up the spades!',
        doubtful: 'Until the next trending hashtag, then you start tweeting again.',
        negative: 'Promises on paper, but drama on the timeline!'
      },
      blame: {
        positive: 'Ey, that is true! Those troll bots are completely out of control!',
        doubtful: 'Both sides are tweeting nonsense while our water is cut.',
        negative: 'Stop blaming other parties! Take responsibility for your own drama!'
      },
      lie: {
        positive: 'Ah, so it really was just enthusiastic youth! Fair enough!',
        doubtful: 'Mxm... that trending hashtag felt very coordinated.',
        negative: 'YOH! You think we cannot smell a lie?! You paid those influencers R50,000!'
      },
      honesty: {
        positive: 'Hahaha! At least you admitted your PR team is completely unhinged!',
        doubtful: 'Funny, but revoke their internet access before they tweet again.',
        negative: 'Laughing about paid influencers will not fix our municipal taps!'
      }
    }
  },
  // ==========================================
  // 1. GENERAL COMMUNITY COMPLAINTS
  // ==========================================
  {
    id: 'road',
    category: 'roads',
    targetParty: 'all',
    complaintText: 'YOU PROMISED TO FIX OUR ROAD!',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'HONESTLY... I JUST TRIPPED OVER THAT SAME POTHOLE!',
      honestyEmoji: '😂'
    },
    partyResponses: {
      da: {
        promise: 'WE HAVE RESURFACING TEAMS ON STANDBY!',
        blame: 'BLAME NATIONAL TRANSPORT INFRASTRUCTURE CUTS!',
        honesty: 'HONESTLY... I JUST TRIPPED OVER THAT SAME POTHOLE!',
        honestyEmoji: '😂'
      },
      anc: {
        promise: 'THE PUBLIC WORKS TARMAC TRUCK IS ON ITS WAY!',
        blame: 'BLAME HISTORIC APARTHEID INFRASTRUCTURE BACKLOGS!',
        honesty: 'HONESTLY... I JUST TRIPPED OVER THAT SAME POTHOLE!',
        honestyEmoji: '😂'
      },
      pa: {
        promise: 'WE WILL PAVE THIS STREET OURSELVES!',
        blame: 'BLAME THE OLD ESTABLISHED PARTIES SLEEPING IN COUNCIL!',
        honesty: 'HONESTLY... I JUST TRIPPED OVER THAT SAME POTHOLE!',
        honestyEmoji: '😂'
      }
    },
    reactions: {
      promise: {
        positive: 'Okay! Let us see if the tar truck actually arrives!',
        doubtful: 'Hmm... you said that at the last general election.',
        negative: 'Haibo! This pothole now has its own postal code!'
      },
      blame: {
        positive: 'That is true, those other parties never lift a shovel!',
        doubtful: 'Everyone blames everyone, but the hole is still there.',
        negative: 'Stop finger-pointing and fix our tyres!'
      },
      honesty: {
        positive: 'Hahaha! At least you feel our daily pain!',
        doubtful: 'Well, watching you stumble was funny, but still...',
        negative: 'Laughter won’t fix my car’s suspension!'
      }
    }
  },
  {
    id: 'streetlights',
    category: 'streetlights',
    targetParty: 'all',
    complaintText: 'OUR STREETLIGHTS NEVER WORK!',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'HONESTLY... WE HAVE NO PLAN YET!',
      honestyEmoji: '😂'
    },
    reactions: {
      promise: {
        positive: 'Great! We need light on this corner at night!',
        doubtful: 'You promise light, but we stay in the dark.',
        negative: 'Yoh! The only thing glowing here is your campaign smile!'
      },
      blame: {
        positive: 'Exactly! The ward councillor was asleep at the switch!',
        doubtful: 'Whoever’s fault it is, it is pitch black out here.',
        negative: 'Don’t pass the torch, just turn on the bulb!'
      },
      honesty: {
        positive: 'Hahaha! Finally an honest politician in daylight!',
        doubtful: 'No plan? At least you did not make up a story.',
        negative: 'No plan?! Why did you come canvas here then?!'
      }
    }
  },
  {
    id: 'water',
    category: 'water',
    targetParty: 'all',
    complaintText: 'WE HAVE NOT HAD WATER FOR THREE DAYS!',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'THE BUDGET DISAPPEARED SOMEWHERE!',
      honestyEmoji: '💸'
    },
    reactions: {
      promise: {
        positive: 'Thank goodness! Send the water tankers today!',
        doubtful: 'I will believe it when water comes out the tap.',
        negative: 'We cannot drink promises, my friend!'
      },
      blame: {
        positive: 'Yes! The provincial water board dropped the ball!',
        doubtful: 'Passing the bucket won’t fill our buckets.',
        negative: 'Do not tell me stories, my kettle is empty!'
      },
      honesty: {
        positive: 'Eish! At least you admit where the money went!',
        doubtful: 'Disappeared? Did the pipes swallow the cash?',
        negative: 'Disappeared?! We want our water now!'
      }
    }
  },
  {
    id: 'rubbish',
    category: 'rubbish',
    targetParty: 'all',
    complaintText: 'WHEN WILL YOU COLLECT OUR RUBBISH?',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'WE ARE STILL HAVING MEETINGS ABOUT IT!',
      honestyEmoji: '📑'
    },
    reactions: {
      promise: {
        positive: 'Good! The rubbish bags are piling up to the sky!',
        doubtful: 'The refuse truck always breaks down on our street.',
        negative: 'You talk rubbish while the bins overflow!'
      },
      blame: {
        positive: 'Yes! The previous administration mismanaged the trucks!',
        doubtful: 'Blame whoever, just pick up the black bags!',
        negative: 'Haibo! Excuses do not stop the flies!'
      },
      honesty: {
        positive: 'Meetings? Hahaha! Classic! Bring me some tea next meeting!',
        doubtful: 'Endless meetings while the cats rip the bags open...',
        negative: 'Have the meeting next to the rubbish heap then!'
      }
    }
  },
  {
    id: 'electricity',
    category: 'electricity',
    targetParty: 'all',
    complaintText: 'THE ELECTRICITY IS ALWAYS OFF!',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'WE WILL ADD IT TO THE NEXT MANIFESTO!',
      honestyEmoji: '📝'
    },
    reactions: {
      promise: {
        positive: 'If you keep our fridge cold, you have my vote!',
        doubtful: 'Stage 6 promises, Stage 1 delivery.',
        negative: 'Load shedding is temporary, but broken promises are forever!'
      },
      blame: {
        positive: 'True! The grid operators failed the whole nation!',
        doubtful: 'Both sides talk big when the generator is on.',
        negative: 'Stop debating and fix the substation transformer!'
      },
      honesty: {
        positive: 'Hahaha! Page 42 of the upcoming manifesto, right?',
        doubtful: 'Another booklet to read by candlelight...',
        negative: 'A manifesto won’t boil my water!'
      }
    }
  },
  {
    id: 'housing',
    category: 'housing',
    targetParty: 'all',
    complaintText: 'WHAT HAPPENED TO THE NEW HOUSES?',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'I ONLY STARTED CANVASSING THIS MORNING!',
      honestyEmoji: '🏃'
    },
    reactions: {
      promise: {
        positive: 'We have been waiting for brick houses for 10 years!',
        doubtful: 'The foundation stones are getting dusty.',
        negative: 'All talk, no roof!'
      },
      blame: {
        positive: 'Yes! Corrupt contractors stole the tender!',
        doubtful: 'Tender wars don’t put a roof over our heads.',
        negative: 'Don’t blame tenders, where is my title deed?!'
      },
      honesty: {
        positive: 'Hahaha! First day on the job? Good luck, my child!',
        doubtful: 'Welcome to politics! Get ready for many more questions.',
        negative: 'First day or not, where is our housing project?!'
      }
    }
  },
  {
    id: 'safety',
    category: 'safety',
    targetParty: 'all',
    complaintText: 'THE PARK IS NOT SAFE!',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'LET ME ASK HEAD OFFICE!',
      honestyEmoji: '📞'
    },
    reactions: {
      promise: {
        positive: 'Yes! Put up fences and community patrol watch!',
        doubtful: 'We heard about neighborhood watch last December.',
        negative: 'The swings are rusted and the lights are broken!'
      },
      blame: {
        positive: 'Indeed! Police budget was cut in this municipality!',
        doubtful: 'Politics won’t protect our children in the afternoon.',
        negative: 'We need community policing, not political finger-pointing!'
      },
      honesty: {
        positive: 'Hahaha! Put Head Office on speaker phone right now!',
        doubtful: 'Head office is probably having lunch in Sandton.',
        negative: 'Head office does not live on this corner!'
      }
    }
  },
  {
    id: 'health',
    category: 'health',
    targetParty: 'all',
    complaintText: 'THE CLINIC IS ALWAYS FULL!',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'WE HAVE A BEAUTIFUL POWERPOINT ABOUT IT!',
      honestyEmoji: '📊'
    },
    reactions: {
      promise: {
        positive: 'More nurses and faster queues! You have my vote!',
        doubtful: 'I stood in line from 5 AM yesterday.',
        negative: 'Paracetamol and promises won’t cure us!'
      },
      blame: {
        positive: 'Right! The Health Department cut regional staffing!',
        doubtful: 'Cut or not cut, the clinic line reaches the corner shop.',
        negative: 'Blaming ministers doesn’t shorten the queue!'
      },
      honesty: {
        positive: 'Hahaha! PowerPoint with pie charts and colourful graphs!',
        doubtful: 'Does slide 4 have headache tablets attached?',
        negative: 'We need Panado, not presentation slides!'
      }
    }
  },
  {
    id: 'jobs',
    category: 'jobs',
    targetParty: 'all',
    complaintText: 'WHERE ARE THE JOBS?',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'CAN I GET BACK TO YOU AFTER THE ELECTION?',
      honestyEmoji: '🗳️'
    },
    reactions: {
      promise: {
        positive: 'Our youth need real opportunities and skills!',
        doubtful: 'EPWP work for two weeks is not a career.',
        negative: 'Every four years you promise millions of jobs!'
      },
      blame: {
        positive: 'The economic policies of the rivals crashed local investment!',
        doubtful: 'Everyone talks economics while the youth sit at the corner.',
        negative: 'Don’t lecture me on macroeconomics, we need work!'
      },
      honesty: {
        positive: 'Hahaha! At least you don’t pretend you have 500 CVs in your pocket!',
        doubtful: 'After the election nobody answers the phone.',
        negative: 'After the election you will be sitting in Parliament!'
      }
    }
  },
  {
    id: 'concrete_promise_roads',
    category: 'promises',
    targetParty: 'all',
    complaintText: 'YOU PROMISED TO PAVE OUR ROADS LAST ELECTION!',
    responses: {
      promise: 'WE WILL FIX IT!',
      blame: 'BLAME THE OTHER PARTIES',
      honesty: 'I CANNOT EVEN FIX MY OWN GATE AT HOME!',
      honestyEmoji: '🚪'
    },
    reactions: {
      promise: {
        positive: 'This is your absolute final chance to deliver the tar!',
        doubtful: 'Copy-pasting the same road promise since 2014.',
        negative: 'Fool me once, shame on you. Our road is still a dirt track!'
      },
      blame: {
        positive: 'True, coalition partners kept blocking the municipal budget!',
        doubtful: 'Coalitions or no coalitions, nothing moved.',
        negative: 'Stop making excuses and start working!'
      },
      honesty: {
        positive: 'Hahahahaha! Hey, at least you keep it 100% real with me!',
        doubtful: 'Your gate? Ai, no wonder our street is like this.',
        negative: 'If you can’t fix a gate, why run for office?!'
      }
    }
  },

  // ==========================================
  // 2. DA-SPECIFIC CANVASSING COMPLAINTS (Cape Town / Hanover Park)
  // ==========================================
  {
    id: 'da_best_run_city',
    category: 'promises',
    targetParty: 'da',
    complaintText: 'BEST RUN CITY FOR WHO?! OUR PEOPLE ARE STRUGGLING!',
    responses: {
      promise: 'WE WILL BRING MORE BUDGET TO HANOVER PARK!',
      blame: 'NATIONAL CUT OUR MUNICIPAL INFRASTRUCTURE GRANT!',
      honesty: 'OUR SPREADSHEETS LOOKED BETTER IN THE CBD OFFICE!',
      honestyEmoji: '📉'
    },
    reactions: {
      promise: {
        positive: 'Okay Helen! Make sure those work teams show up on Monday!',
        doubtful: 'We hear that every election, but the Cape Flats stay neglected.',
        negative: 'Best run city for Camps Bay maybe, not for our children in Hanover Park!'
      },
      blame: {
        positive: 'That is true, Pretoria keeps cutting funding to the Western Cape!',
        doubtful: 'Stop blaming Pretoria, you manage the city right in front of us!',
        negative: 'Don’t pass the buck! You’ve been in charge here for 15 years!'
      },
      honesty: {
        positive: 'Hahaha! At least you admit your spreadsheets don’t match reality!',
        doubtful: 'A spreadsheet won’t fix the broken staircases in our council court.',
        negative: 'Go back to your air-conditioned office with your fancy graphs!'
      }
    }
  },
  {
    id: 'da_suburbs_roads',
    category: 'roads',
    targetParty: 'da',
    complaintText: 'YOU PROMISED TO FIX OUR ROADS, BUT ONLY PAVE THE RICH SUBURBS!',
    responses: {
      promise: 'THE ROAD RESURFACING TRUCK IS BOOKED THIS MONTH!',
      blame: 'BLAME THE EXTORTION MAFIA DELAYING CONTRACTORS!',
      honesty: 'HONESTLY... I JUST TRIPPED OVER THAT SAME POTHOLE!',
      honestyEmoji: '😂'
    },
    reactions: {
      promise: {
        positive: 'Let’s see if the tar truck actually turns into our street!',
        doubtful: 'They tar Constantia twice a year, we’ve been waiting 3 years.',
        negative: 'Our car suspension is wrecked while you talk about clean audits!'
      },
      blame: {
        positive: 'Yoh, those construction mafias are really terrorising everyone!',
        doubtful: 'Find police protection then, because our tyres are bursting!',
        negative: 'Excuses won’t fill the hole in my street!'
      },
      honesty: {
        positive: 'Hahahahaha! You almost broke your ankle right at my gate!',
        doubtful: 'At least you feel the bumps, now go fix them!',
        negative: 'Laughter won’t buy me a new tyre, canvasser!'
      }
    }
  },
  {
    id: 'da_blue_tshirt',
    category: 'promises',
    targetParty: 'da',
    complaintText: 'YOU ONLY VISIT US IN BLUE T-SHIRTS AT ELECTION TIME!',
    responses: {
      promise: 'WE WILL OPEN A PERMANENT COMMUNITY CLINIC & DESK!',
      blame: 'BLAME OPPOSITION COALITIONS BLOCKING COUNCIL MOTIONS!',
      honesty: 'MY CAMPAIGN MANAGER FORCED ME TO RUN IN THIS HEAT!',
      honestyEmoji: '🏃'
    },
    reactions: {
      promise: {
        positive: 'A permanent desk where someone actually listens? Deal!',
        doubtful: 'The desk will vanish the second the ballots are counted.',
        negative: 'You’ll take off that blue shirt and never see Hanover Park again!'
      },
      blame: {
        positive: 'Council coalitions really do stall everything in chambers.',
        doubtful: 'All of you fight in council while we suffer on the street.',
        negative: 'Stop fighting each other and deliver services to the people!'
      },
      honesty: {
        positive: 'Hahaha! Poor candidate, you are sweating through that blue polyester!',
        doubtful: 'Honest, but running in the heat won’t lower our water bills.',
        negative: 'If you hate canvassing here so much, go back to the suburbs!'
      }
    }
  },
  {
    id: 'da_rental_housing',
    category: 'housing',
    targetParty: 'da',
    complaintText: 'CLEAN AUDIT DOESN’T FIX OUR LEAKING COUNCIL FLATS!',
    responses: {
      promise: 'WE WILL EXPAND RENTAL HOUSING UPGRADES IN HANOVER PARK!',
      blame: 'BLAME NATIONAL SUBSIDY SHORTFALLS TO CAPE TOWN!',
      honesty: 'YOU CANNOT EAT A CLEAN AUDIT CERTIFICATE, I AGREE!',
      honestyEmoji: '📜'
    },
    reactions: {
      promise: {
        positive: 'Repair the roofs and staircases! You will get our whole court’s vote!',
        doubtful: 'We have heard about rental maintenance since the 2016 local election.',
        negative: 'Your audit certificates don’t keep the winter rain off my bed!'
      },
      blame: {
        positive: 'National Treasury has been withholding grant money, that’s true.',
        doubtful: 'Passing the buck between province and national is an old trick.',
        negative: 'Take responsibility for your own municipality’s housing stock!'
      },
      honesty: {
        positive: 'Amen! First DA politician to admit we can’t eat a paper certificate!',
        doubtful: 'Good you know that, now what are you going to do about it?',
        negative: 'Then why do you print it on every single lamppost poster?!'
      }
    }
  },
  {
    id: 'da_water_bills',
    category: 'water',
    targetParty: 'da',
    complaintText: 'OUR WATER TARIFF BILLS ARE RIDICULOUSLY EXPENSIVE!',
    responses: {
      promise: 'WE WILL EXPAND INDIGENT WATER TARIFF RELIEF!',
      blame: 'BLAME DROUGHT RESILIENCE INFRASTRUCTURE LOANS!',
      honesty: 'THE BILLING SPREADSHEET EVEN CONFUSES ME SOMETIMES!',
      honestyEmoji: '🧾'
    },
    reactions: {
      promise: {
        positive: 'Indigent relief will save our family this month! Thank you!',
        doubtful: 'Qualifying for indigent relief needs 50 stamped documents.',
        negative: 'Every summer the bills go up, every winter you promise relief!'
      },
      blame: {
        positive: 'Well, Day Zero was tough, but we survived without taps running dry.',
        doubtful: 'Day Zero was years ago, why are we still paying crisis rates?',
        negative: 'We cannot pay R2000 a month for dirty tap water!'
      },
      honesty: {
        positive: 'Hahaha! Even you can’t read the municipal bill?! Respect for being real!',
        doubtful: 'If the candidate can’t read it, how must an old pensioner understand?',
        negative: 'Fix your billing system instead of making jokes about it!'
      }
    }
  },

  // ==========================================
  // 3. ANC-SPECIFIC CANVASSING COMPLAINTS (Johannesburg / Soweto)
  // ==========================================
  {
    id: 'anc_roads_unpaved',
    category: 'roads',
    targetParty: 'anc',
    complaintText: '30 YEARS OF DEMOCRACY AND OUR ROADS ARE STILL UNPAVED!',
    responses: {
      promise: 'THE PUBLIC WORKS TARMAC TRUCK IS ON ITS WAY!',
      blame: 'BLAME HISTORIC APARTHEID BACKLOGS AND CONTRACTOR THEFT!',
      honesty: 'HONESTLY... I JUST TRIPPED OVER THAT SAME POTHOLE!',
      honestyEmoji: '🕳️'
    },
    reactions: {
      promise: {
        positive: 'Amandla! Deliver the tar and we will stand with you!',
        doubtful: 'The same speech from the 2019 manifesto...',
        negative: '30 years of promises and we are still swimming in mud when it rains!'
      },
      blame: {
        positive: 'The backlogs are huge across the township, we understand.',
        doubtful: 'Stop blaming the past, you have held the budget for decades!',
        negative: 'Corrupt subcontractors got paid while our road has zero stones!'
      },
      honesty: {
        positive: 'Hahaha! Welcome to our daily reality, Comrade!',
        doubtful: 'Stepping over it is easy, living with it every day is not.',
        negative: 'Don’t laugh at our broken road while your motorcade drives on tar!'
      }
    }
  },
  {
    id: 'anc_cadres_jobs',
    category: 'jobs',
    targetParty: 'anc',
    complaintText: 'WHERE IS THE "BETTER LIFE FOR ALL" YOU PROMISED MY GOGO?!',
    responses: {
      promise: 'PRESIDENTIAL YOUTH EMPLOYMENT INITIATIVE IS EXPANDING!',
      blame: 'BLAME PRIVATE SECTOR DISINVESTMENT AND GLOBAL PRESSURES!',
      honesty: 'CAN I TAKE YOUR CV TO HEAD OFFICE RIGHT NOW?',
      honestyEmoji: '📄'
    },
    reactions: {
      promise: {
        positive: 'Our graduates need opportunities! Viva!',
        doubtful: 'Six-month contract with no stipend is not a job.',
        negative: 'Every five years you promise a million jobs and deliver zero!'
      },
      blame: {
        positive: 'Economic growth has been tough worldwide.',
        doubtful: 'Macroeconomics won’t help a matriculant buy groceries.',
        negative: 'Stop giving tenders to your friends and hire local youth!'
      },
      honesty: {
        positive: 'Hahaha! Take my grandson’s CV, please! He has an IT degree!',
        doubtful: 'You will take the CV and it will end up as packing paper.',
        negative: 'We don’t need sympathy, we need sustainable employment!'
      }
    }
  },

  // ==========================================
  // 4. PA-SPECIFIC CANVASSING COMPLAINTS
  // ==========================================
  {
    id: 'pa_gang_violence',
    category: 'safety',
    targetParty: 'pa',
    complaintText: 'YOU PROMISED TO CLEAN UP THE GANGS, BUT BULLETS STILL FLY!',
    responses: {
      promise: 'WE WILL DEPLOY ARMED CITIZEN PATROLS AND CRACKDOWN UNITS!',
      blame: 'BLAME SOFT POLICE POLICIES AND WEAK R500 BAIL JUDGES!',
      honesty: 'WE ARE ROLLING UP OUR SLEEVES TO FIGHT FOR OUR STREETS!',
      honestyEmoji: '🥊'
    },
    reactions: {
      promise: {
        positive: 'Salute! Take our streets back from the gangsters!',
        doubtful: 'Street patrols without guns won’t stop corner shootings.',
        negative: 'Lots of tough talk, but our children still sleep under the bed!'
      },
      blame: {
        positive: 'Spot on! The courts let criminals out on R500 bail the next morning!',
        doubtful: 'Bail laws don’t stop bullets at the spaza shop.',
        negative: 'Blaming judges won’t bring safety to Hanover Park!'
      },
      honesty: {
        positive: 'Respect! Straight talk, no sugar-coating!',
        doubtful: 'Swagger is good, but we need bulletproof vests and real police.',
        negative: 'Rolling up sleeves on camera is just social media theatrics!'
      }
    }
  },
  {
    id: 'pa_social_media',
    category: 'roads',
    targetParty: 'pa',
    complaintText: 'YOU TALK TOUGH ON TIKTOK, BUT WHEN WILL YOU FIX OUR ROAD?!',
    responses: {
      promise: 'WE WILL BRING TAR TRUCKS PERSONALLY THIS WEEK!',
      blame: 'BLAME THE OLD ESTABLISHED PARTIES BLOCKING OUR MOTIONS!',
      honesty: 'HONESTLY... I JUST TRIPPED OVER THAT SAME POTHOLE!',
      honestyEmoji: '😂'
    },
    reactions: {
      promise: {
        positive: 'If Gayton brings the tar himself, the whole street votes PA!',
        doubtful: 'Live streams don’t pave gravel roads, chief.',
        negative: 'More TikTok videos than delivered municipal projects!'
      },
      blame: {
        positive: 'The old parties have sat on their hands for 30 years!',
        doubtful: 'You joined their coalition, so why aren’t you pushing them?',
        negative: 'Don’t join coalitions if you can’t make them deliver!'
      },
      honesty: {
        positive: 'Hahaha! At least you don’t pretend like the high-and-mighty politicians!',
        doubtful: 'Funny stumble, now put the camera down and fix the asphalt.',
        negative: 'Being relatable doesn’t fix my taxi’s wheel alignment!'
      }
    }
  }
];
