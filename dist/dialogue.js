// Fictional arcade dialogue informed by documented public debate.
// Sources and important qualifications are recorded in sources.html.
// Voice is assigned independently of appearance; this is not polling data.
export const criticism={
 PA:[
  'PA? Nee, my bru. Julle belowe baie. Waar’s die werk?',
  'I want jobs, PA. Not neighbours blamed for everything.',
  'PA, your immigration rhetoric puts me off.',
  'Coalition today, new partners tomorrow? Nee, man.',
  'My vote is not a coalition bargaining chip, PA.',
  'Ons soek werk en veiligheid, nie net slogans nie.',
  'PA, I want safer streets. Show me results first.',
  'A green shirt won’t fix my street, my friend.'
 ],
 ANC:[
  'ANC, more than 30 years. Where are the basic services?',
  'A liberation history doesn’t pay my electricity bill.',
  'Nee, ANC. Ek is moeg vir beloftes.',
  'Sort out corruption before you ask for my vote.',
  'Another promise? My street is still full of potholes.',
  'ANC, I want work. I can’t eat a campaign T-shirt.',
  'Dertig jaar later en ons wag nog, my bru.',
  'I respect the struggle. I still want accountability.'
 ],
 DA:[
  'DA, your Gaza stance lost my vote. Free Palestine!',
  'I think the DA is too soft on Israel. Free Palestine.',
  'DA, nice suburbs aren’t the whole city, hey.',
  'Nee, DA. Kom kyk hoe lyk ons straat.',
  'I want services in every neighbourhood, not just mine.',
  'Blue promises? Show me affordable living first.',
  'DA, I want a stronger stand for Palestinian rights.',
  'A clean audit is good. What about my rent, my bru?'
 ],
 EFF:[
  'EFF, I still want answers about the VBS allegations.',
  'Big speeches, EFF. How will you deliver the jobs?',
  'Nee, my bru. ’n Rooi beret betaal nie die huur nie.',
  'EFF, I want the plan and the numbers, not just slogans.',
  'Land matters. So do jobs and working services.',
  'I hear the promises. I’m not convinced by the plans.',
  'Julle praat hard, maar ek soek resultate.',
  'A revolution? First help me get to work on time.'
 ]
};
export const everyday=[
 'Eish, I was just buying bread!',
 'Aweh! At least let me finish my chips.',
 'Wag ’n bietjie! My taxi is coming.',
 'Ag nee, my groceries!',
 'Does this shortcut come with a cooldrink?',
 'My bru, I’m late for work already.',
 'Ek gaan net gou winkel toe!',
 'Politics before breakfast? Yoh.',
 'Another hole? The council must come see this.',
 'Okay, but who’s paying my taxi fare?',
 'Mooi shirt. Still need a job, though.',
 'Sharp, sharp. Now let me get home.'
];
export function reactionFor(person,targetParty){
 const own=person.party;
 // Rotate a resident's responses instead of repeating one catchphrase.
 const turn=person.dialogueTurn||0;person.dialogueTurn=turn+1;
 if(person.loyal&&turn%3===0){const lines=[`Nah, bru. ${own} till I die!`,`Nee dankie. Ek bly by ${own}.`,`My ${own} shirt stays on, thanks.`];return lines[(person.voice+Math.floor(turn/3))%lines.length]}
 const lines=criticism[targetParty]||[
 'Nice poster, '+targetParty+'. Now show me the plan.',
 'My vote needs more than a fresh T-shirt, bru.',
 'Eers water en werk. Dan praat ons.',
 'You can win this street when you fix this street.',
 'Ag nee, I came for a walk, not a manifesto.',
 'Promises again? Ek wag nog vir resultate.',
 'Let me finish my coffee before the coalition talk.',
 'The view is lovely. The rent? Not so lovely.'
 ];return lines[(person.voice+turn)%lines.length];
}
