// Realistic South African community political dialogue and voter complaints.
// Fictional arcade satire reflecting authentic public local government debates.
// Dialogue reflects real community issues: water, electricity, jobs, crime, and delivery.

export const criticism = {
  PA: [
    'PA, where are the jobs and swimming pools Gayton promised on TikTok?',
    'Coalition hopping for cabinet seats — my vote isn’t a bargaining chip!',
    'Blaming foreign nationals won’t fix our broken local economy, my bru.',
    'All talk and swagger on social media, but zero local service delivery.',
    'Nee my bru, julle belowe goue berge maar die vullis lê nog in ons straat.',
    'Border stunts won’t stop the gangsters and drug lords in our ward.',
    'Show me working clinics and safe roads, not just green t-shirts.',
    'Ons soek regte werk en veiligheid, nie net leë beloftes nie.'
  ],
  ANC: [
    'ANC, 30 years in government and our water taps are still running dry!',
    'Load shedding and power cuts destroyed our neighbourhood spaza shops.',
    'Where are the millions of jobs you promise before every election?',
    'Cadres eat tender money while youth sit on street corners unemployed.',
    'Fix the sewage leaks and potholes before asking for my vote, ANC.',
    'Ek kan nie ’n ANC T-hemp eet nie — ons soek regte werk en kos op die tafel.',
    'Bailouts for SOEs while our local clinics have no medicine.',
    'Another election manifesto? We’re still waiting on the promises from 1994.'
  ],
  DA: [
    'DA, you only care about Camps Bay and the wealthy suburbs — what about our ward?',
    'Sky-high water tariffs and electricity surcharges are bleeding us dry!',
    'A clean audit doesn’t put food on the table in the Cape Flats!',
    'Nee DA, come see the unpaved roads and broken streetlights on our side.',
    'Your foreign policy stance on Palestine lost my family’s vote!',
    'Cape Town is becoming unaffordable for local residents — stop gentrification!',
    'Arrogant leadership that only remembers us when you need a majority.',
    'Fix the sewage overflowing in the flats before bragging about clean governance.'
  ],
  'FF+': [
    'FF+, you only fight for one minority group — what about the whole community?',
    'Obsessed with Cape independence fantasies instead of fixing daily municipal delivery.',
    'Coalition squabbling in councils — you fight for mayoral chains, not residents.',
    'Afrikaans culture is important, but can you fix the water pressure and power cuts?',
    'Out of touch with the everyday struggles of working-class South Africans.',
    'Nee man, Vryheidsfront, ons soek dienslewering vir almal in die wyk.'
  ],
  ActionSA: [
    'ActionSA, you collapsed coalitions in Joburg and Tshwane and left chaos!',
    'Herman Mashaba’s ego politics destroyed service delivery stability.',
    'Always fighting with every coalition partner — who will you even govern with?',
    'Empty deportation rhetoric won’t build our local schools or clinics.',
    'You promised principled governance, then allied with the very people you called corrupt.'
  ],
  MK: [
    'Zuma’s 9 wasted years and State Capture wrecked our public infrastructure!',
    'VBS bank looting and corruption allegations — our pensioners haven’t forgotten.',
    'Threatening the constitution and courts won’t bring investment or electricity.',
    'A revenge party for one man won’t fix our local neighbourhood water cuts.',
    'Tribal rhetoric and factional battles have no place in our community.'
  ],
  EFF: [
    'Chanting slogans and shutting down streets won’t build factories or create jobs!',
    'What happened to the pensioners’ money in the VBS mutual bank scandal?',
    'Red berets and designer suits don’t solve the cost of living crisis.',
    'Chaos in council chambers and parliament is not service delivery.',
    'Flip-flopping on coalitions from Joburg to Ekurhuleni for perks and tenders.',
    'Nee my bru, shouting in council won’t fix the burst pipe in front of my gate.'
  ],
  GOOD: [
    'Always sitting on the fence — are you opposition or in cabinet with the ANC?',
    'What has GOOD delivered for local communities besides press statements?'
  ],
  NCC: [
    'Council grandstanding and screaming into megaphones won’t pave our roads.',
    'Identity politics won’t lower our food prices or create youth jobs.'
  ],
  PMC: [
    'Who are you and what have you ever delivered for our ward?'
  ]
};

export const everyday = [
  'Fix our water and electricity first, then we can talk about my vote!',
  'Politicians only walk our streets when election posters go up.',
  'Show me your delivery track record, not just party t-shirts!',
  'Tired of municipal excuses — what’s your concrete plan for our youth?',
  'Crime and gang violence are out of control. Where is visible policing?',
  'My vote isn’t cheap — I want a councillor who actually answers the phone.',
  'Potholes, sewage leaks, and power cuts. Who is fixing this ward?',
  'We need local jobs and skills centres, not food parcel handouts!',
  'I’m holding your party to every single word in this manifesto.',
  'If I give you my vote today, will you actually deliver tomorrow?',
  'One cross on the ballot for genuine community change in this ward!',
  'Deliver on basic services and the whole neighbourhood will back you.',
  'We pay rates and taxes every month. Where is the return for our community?',
  'Don’t just make promises in the street — show me action in council!'
];

export function reactionFor(person, targetParty) {
  const own = person.party;
  const turn = person.dialogueTurn || 0;
  person.dialogueTurn = turn + 1;
  if (person.loyal && turn % 3 === 0) {
    const lines = [
      `Nah, my family has voted ${own} for decades. Show me why I should switch.`,
      `Nee dankie, ek staan vas by ${own} tot die dienslewering bewys is.`,
      `You have to work ten times harder to earn my vote away from ${own}!`,
      `I’m ${own} all the way — what can your party do better than them?`
    ];
    return lines[(person.voice + Math.floor(turn / 3)) % lines.length];
  }
  const lines = criticism[targetParty] || [
    'Nice poster, ' + targetParty + '. Now show me the municipal budget plan.',
    'My vote needs more than empty slogans, my bru.',
    'Eers water, ligte en werk. Dan praat ons oor stemme.',
    'You can win this ward when you fix the potholes in this ward.',
    'Promises again? Ons wag nog vir regte dienslewering.',
    'What’s your plan to lower the cost of electricity in our neighbourhood?',
    'Fix the sewage in this ward before you ask for my cross on the ballot.'
  ];
  return lines[(person.voice + turn) % lines.length];
}
