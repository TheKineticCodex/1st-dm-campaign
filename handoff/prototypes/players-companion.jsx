import { useState, useEffect } from "react";

// ————————————— Palette & type: Feywild twilight carnival —————————————
const C = {
  night: "#181030", panel: "#251A48", panelEdge: "#3A2C66",
  gold: "#E8B84B", goldDim: "#B58A2E", sea: "#7FD4C1",
  parchment: "#F2E9D8", ink: "#241A42", faint: "#9C8FC4",
};
const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Sorts+Mill+Goudy&display=swap');
@keyframes cardRise { from { opacity:0; transform:translateY(20px);} to { opacity:1; transform:translateY(0);} }
@keyframes glow { 0%,100%{opacity:.5;} 50%{opacity:1;} }
@media (prefers-reduced-motion: reduce) { * { animation:none !important; transition:none !important; } }
`;
const display = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const body = { fontFamily: "'Sorts Mill Goudy', Georgia, serif" };

// ————————————— Game data (2024 rules, level 1) —————————————
const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const ARRAY_VALS = [15, 14, 13, 12, 10, 8];
const mod = (s) => Math.floor((s - 10) / 2);
const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);

const SKILL_ABILITY = {
  Acrobatics:"DEX", "Animal Handling":"WIS", Arcana:"INT", Athletics:"STR", Deception:"CHA",
  History:"INT", Insight:"WIS", Intimidation:"CHA", Investigation:"INT", Medicine:"WIS",
  Nature:"INT", Perception:"WIS", Performance:"CHA", Persuasion:"CHA", Religion:"INT",
  "Sleight of Hand":"DEX", Stealth:"DEX", Survival:"WIS",
};

const CLASSES = {
  Barbarian:{ die:12, prime:"STR", saves:["STR","CON"], skills:{n:2, from:["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"]},
    blurb:"Unstoppable fury. Simple and mighty.", complexity:"Simple",
    features:["Rage (2/day): bonus action — advantage on STR checks, +2 melee damage, resist physical damage","Unarmored Defense","Weapon Mastery"],
    weapon:{name:"Greataxe", die:"1d12", ab:"STR"}, kit:"Greataxe, 4 handaxes, explorer's pack",
    ac:(a)=>({val:10+mod(a.DEX)+mod(a.CON), note:"Unarmored Defense"}) },
  Bard:{ die:8, prime:"CHA", saves:["DEX","CHA"], skills:{n:3, from:Object.keys(SKILL_ABILITY)},
    blurb:"A performer whose art is magic. The carnival's darling.", complexity:"Medium",
    features:["Bardic Inspiration (d6): bonus action — give an ally a die to add to a roll","Spellcasting (CHA)"],
    weapon:{name:"Rapier", die:"1d8", ab:"DEX"}, kit:"Rapier, leather armor, musical instrument, entertainer's pack",
    spells:{cantrips:["Vicious Mockery","Dancing Lights"], leveled:["Healing Word","Dissonant Whispers","Charm Person","Faerie Fire"]},
    ac:(a)=>({val:11+mod(a.DEX), note:"Leather armor"}) },
  Cleric:{ die:8, prime:"WIS", saves:["WIS","CHA"], skills:{n:2, from:["History","Insight","Medicine","Persuasion","Religion"]},
    blurb:"Champion of a higher power. Mends wounds, turns fate.", complexity:"Involved",
    features:["Spellcasting (WIS) — prepared caster","Divine Order: Protector (armor) or Thaumaturge (extra cantrip)"],
    weapon:{name:"Mace", die:"1d6", ab:"STR"}, kit:"Mace, chain shirt, shield, holy symbol, priest's pack",
    spells:{cantrips:["Sacred Flame","Guidance","Thaumaturgy"], leveled:["Cure Wounds","Bless","Guiding Bolt","Shield of Faith"]},
    ac:(a)=>({val:13+Math.min(mod(a.DEX),2)+2, note:"Chain shirt & shield"}) },
  Druid:{ die:8, prime:"WIS", saves:["INT","WIS"], skills:{n:2, from:["Arcana","Animal Handling","Insight","Medicine","Nature","Perception","Religion","Survival"]},
    blurb:"Speaker for wild places. Nature's voice.", complexity:"Involved",
    features:["Spellcasting (WIS) — prepared caster","Druidic (secret language)","Primal Order: Magician or Warden"],
    weapon:{name:"Quarterstaff", die:"1d6", ab:"STR"}, kit:"Quarterstaff, leather armor, shield, druidic focus, explorer's pack",
    spells:{cantrips:["Produce Flame","Guidance"], leveled:["Cure Wounds","Entangle","Faerie Fire","Thunderwave"]},
    ac:(a)=>({val:11+mod(a.DEX)+2, note:"Leather armor & shield"}) },
  Fighter:{ die:10, prime:"STR", saves:["STR","CON"], skills:{n:2, from:["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Persuasion","Survival"]},
    blurb:"Master of arms. The easiest class to learn.", complexity:"Simple",
    features:["Second Wind: bonus action — heal 1d10+level (2 uses)","Fighting Style","Weapon Mastery"],
    weapon:{name:"Longsword", die:"1d8", ab:"STR"}, kit:"Longsword, chain mail, shield, dungeoneer's pack",
    ac:()=>({val:18, note:"Chain mail & shield"}) },
  Monk:{ die:8, prime:"DEX", saves:["STR","DEX"], skills:{n:2, from:["Acrobatics","Athletics","History","Insight","Religion","Stealth"]},
    blurb:"Living weapon. Speed, discipline, flow.", complexity:"Medium",
    features:["Martial Arts (d6): unarmed strikes use DEX; bonus-action strike","Unarmored Defense"],
    weapon:{name:"Unarmed Strike", die:"1d6", ab:"DEX"}, kit:"Spear, 5 daggers, explorer's pack",
    ac:(a)=>({val:10+mod(a.DEX)+mod(a.WIS), note:"Unarmored Defense"}) },
  Paladin:{ die:10, prime:"STR", saves:["WIS","CHA"], skills:{n:2, from:["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"]},
    blurb:"A knight bound by an oath — and in the Feywild, oaths have teeth.", complexity:"Medium",
    features:["Lay On Hands: heal a pool of 5 × level HP","Spellcasting (CHA)","Weapon Mastery"],
    weapon:{name:"Longsword", die:"1d8", ab:"STR"}, kit:"Longsword, chain mail, shield, holy symbol, priest's pack",
    spells:{cantrips:[], leveled:["Divine Smite","Cure Wounds"]},
    ac:()=>({val:18, note:"Chain mail & shield"}) },
  Ranger:{ die:10, prime:"DEX", saves:["STR","DEX"], skills:{n:3, from:["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"]},
    blurb:"Hunter at the edge of the map.", complexity:"Medium",
    features:["Spellcasting (WIS)","Favored Enemy: always-prepared Hunter's Mark","Weapon Mastery"],
    weapon:{name:"Longbow", die:"1d8", ab:"DEX"}, kit:"Longbow & 20 arrows, shortswords ×2, studded leather, explorer's pack",
    spells:{cantrips:[], leveled:["Hunter's Mark","Cure Wounds"]},
    ac:(a)=>({val:12+mod(a.DEX), note:"Studded leather"}) },
  Rogue:{ die:8, prime:"DEX", saves:["DEX","INT"], skills:{n:4, from:["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Persuasion","Sleight of Hand","Stealth"]},
    blurb:"The clever one. Locks, lies, one perfect blade.", complexity:"Simple",
    features:["Sneak Attack (+1d6 once/turn with advantage or a nearby ally)","Expertise: double proficiency in 2 skills","Thieves' Cant"],
    weapon:{name:"Rapier", die:"1d8", ab:"DEX"}, kit:"Rapier, shortbow, leather armor, thieves' tools, burglar's pack",
    ac:(a)=>({val:11+mod(a.DEX), note:"Leather armor"}) },
  Sorcerer:{ die:6, prime:"CHA", saves:["CON","CHA"], skills:{n:2, from:["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"]},
    blurb:"Magic in your blood — wild and barely on a leash.", complexity:"Involved",
    features:["Spellcasting (CHA)","Innate Sorcery: bonus action — spell save DC +1, advantage on spell attacks"],
    weapon:{name:"Fire Bolt (cantrip)", die:"1d10", ab:"CHA"}, kit:"Daggers ×2, arcane focus, dungeoneer's pack",
    spells:{cantrips:["Fire Bolt","Light","Minor Illusion","Prestidigitation"], leveled:["Shield","Chromatic Orb"]},
    ac:(a)=>({val:10+mod(a.DEX), note:"Unarmored"}) },
  Warlock:{ die:8, prime:"CHA", saves:["WIS","CHA"], skills:{n:2, from:["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"]},
    blurb:"You made a deal with something powerful. In this campaign, that matters.", complexity:"Medium",
    features:["Pact Magic: few slots, always cast at max, recharge on short rest","Eldritch Invocations (recommend Agonizing Blast)"],
    weapon:{name:"Eldritch Blast (cantrip)", die:"1d10", ab:"CHA"}, kit:"Daggers ×2, leather armor, arcane focus, scholar's pack",
    spells:{cantrips:["Eldritch Blast","Minor Illusion"], leveled:["Hex","Charm Person"]},
    ac:(a)=>({val:11+mod(a.DEX), note:"Leather armor"}) },
  Wizard:{ die:6, prime:"INT", saves:["INT","WIS"], skills:{n:2, from:["Arcana","History","Insight","Investigation","Medicine","Nature","Religion"]},
    blurb:"Magic as scholarship. The deepest toolbox.", complexity:"Involved",
    features:["Spellcasting (INT) — spellbook","Arcane Recovery: regain slots on a short rest","Ritual Adept"],
    weapon:{name:"Fire Bolt (cantrip)", die:"1d10", ab:"INT"}, kit:"Quarterstaff, spellbook, arcane focus, scholar's pack",
    spells:{cantrips:["Fire Bolt","Mage Hand","Light"], leveled:["Magic Missile","Shield","Sleep","Detect Magic"]},
    ac:(a)=>({val:10+mod(a.DEX), note:"Unarmored (ask about Mage Armor)"}) },
};

const SPECIES = {
  Human:{ speed:30, traits:["Resourceful: Heroic Inspiration each long rest","Skillful: one extra skill","Versatile: bonus origin feat"] },
  Elf:{ speed:30, traits:["Darkvision 60 ft","Fey Ancestry: advantage vs. charm","Trance: 4-hour rest","Lineage cantrip"] },
  Dwarf:{ speed:30, traits:["Darkvision 120 ft","Dwarven Resilience: resist poison","Stonecunning"] },
  Halfling:{ speed:30, traits:["Luck: reroll 1s on d20s","Brave: advantage vs. fear","Nimble: move through bigger creatures' spaces"] },
  Gnome:{ speed:30, traits:["Darkvision 60 ft","Gnomish Cunning: advantage on INT/WIS/CHA saves"] },
  Orc:{ speed:30, traits:["Adrenaline Rush: bonus-action Dash + temp HP","Relentless Endurance: drop to 1 HP instead of 0 (1/day)","Darkvision 120 ft"] },
  Tiefling:{ speed:30, traits:["Darkvision 60 ft","Fiendish Legacy: resistance + Thaumaturgy cantrip"] },
  Dragonborn:{ speed:30, traits:["Breath Weapon (1d10 cone/line)","Damage resistance (chosen type)","Darkvision 60 ft"] },
  Goliath:{ speed:35, traits:["Giant Ancestry boon","Powerful Build: carry big, shrug off grapples"] },
  Aasimar:{ speed:30, traits:["Celestial Resistance: necrotic & radiant","Healing Hands (1/day)","Light Bearer cantrip"] },
  "Fairy ✦":{ speed:30, traits:["Small size","Flight 30 ft (no heavy armor)","Fairy Magic: Druidcraft & Faerie Fire","From the Witchlight book"] },
  "Harengon ✦":{ speed:30, traits:["Hare-Trigger: add proficiency to initiative","Lucky Footwork: reroll a failed DEX save","Rabbit Hop: bonus-action leap","From the Witchlight book"] },
};

const BACKGROUNDS = {
  Acolyte:{ skills:["Insight","Religion"], feat:"Magic Initiate (Cleric)", abis:["INT","WIS","CHA"] },
  Criminal:{ skills:["Sleight of Hand","Stealth"], feat:"Alert", abis:["DEX","CON","INT"] },
  Entertainer:{ skills:["Acrobatics","Performance"], feat:"Musician", abis:["STR","DEX","CHA"] },
  Sage:{ skills:["Arcana","History"], feat:"Magic Initiate (Wizard)", abis:["CON","INT","WIS"] },
  Sailor:{ skills:["Acrobatics","Perception"], feat:"Tavern Brawler", abis:["STR","DEX","WIS"] },
  Soldier:{ skills:["Athletics","Intimidation"], feat:"Savage Attacker", abis:["STR","DEX","CON"] },
  "Feylost ✦":{ skills:["Deception","Survival"], feat:"Feywild Whimsy (story gift — ask your DM)", abis:ABILITIES },
  "Witchlight Hand ✦":{ skills:["Performance","Sleight of Hand"], feat:"Carnival Fixture (free admission forever)", abis:ABILITIES },
};

// ————————————— Quiz data —————————————
const QUIZ = [
  { id:"moment", prompt:"Picture your finest moment at the table. What are you doing?", type:"choice", options:[
    { label:"Winning a glorious fight", pts:{Fighter:2,Barbarian:2,Paladin:1,Monk:1} },
    { label:"Talking my way out of anything", pts:{Bard:3,Rogue:1,Warlock:1} },
    { label:"Casting something spectacular", pts:{Wizard:2,Sorcerer:2,Warlock:1,Druid:1} },
    { label:"Outsmarting everyone in the room", pts:{Rogue:3,Wizard:1,Bard:1} },
    { label:"Protecting someone who needed me", pts:{Paladin:2,Cleric:2,Fighter:1} },
    { label:"Making the whole table laugh", pts:{Bard:2,Rogue:1,Sorcerer:1} } ]},
  { id:"solve", prompt:"Trouble finds you at the carnival. How do you answer it?", type:"choice", options:[
    { label:"Steel and strength", pts:{Fighter:2,Barbarian:2,Paladin:1} },
    { label:"Magic, obviously", pts:{Wizard:2,Sorcerer:2,Warlock:2,Druid:1} },
    { label:"Words — honeyed or sharp", pts:{Bard:3,Warlock:1} },
    { label:"You never saw me", pts:{Rogue:3,Monk:1,Ranger:1} },
    { label:"Beasts and green growing things", pts:{Druid:3,Ranger:2} },
    { label:"A little of everything", pts:{Bard:1,Paladin:1,Ranger:1} } ]},
  { id:"complexity", prompt:"How much do you want to keep track of?", type:"choice", options:[
    { label:"Give me 2–3 clear things I can do", pts:{Fighter:3,Barbarian:3,Rogue:2} },
    { label:"Some choices — but not homework", pts:{Paladin:2,Warlock:2,Monk:2,Bard:2,Ranger:1} },
    { label:"Hand me the whole toolbox", pts:{Wizard:3,Cleric:2,Druid:2,Sorcerer:2} } ]},
  { id:"vibe", prompt:"What feeling should follow your character into the room?", type:"choice", options:[
    { label:"Heroic", pts:{Paladin:2,Fighter:1,Cleric:1} },
    { label:"Strange", pts:{Warlock:2,Druid:1,Sorcerer:1} },
    { label:"Funny", pts:{Bard:2,Rogue:1,Sorcerer:1} },
    { label:"Mysterious", pts:{Rogue:2,Warlock:2,Wizard:1} },
    { label:"A little frightening", pts:{Warlock:2,Barbarian:1,Paladin:1} },
    { label:"Utterly charming", pts:{Bard:3,Warlock:1} } ]},
  { id:"fight", prompt:"And when a fight can't be avoided?", type:"choice", options:[
    { label:"Nose to nose, blade to blade", pts:{Fighter:2,Barbarian:2,Paladin:2,Monk:1} },
    { label:"From a safe, clever distance", pts:{Ranger:2,Rogue:1,Wizard:1,Sorcerer:1,Warlock:1} },
    { label:"Helping, healing, tipping the scales", pts:{Cleric:3,Bard:2,Druid:1} },
    { label:"Everywhere at once", pts:{Monk:3,Rogue:1} },
    { label:"I'd rather there be no fight at all", pts:{Bard:2,Rogue:1,Druid:1} } ]},
  { id:"heroes", prompt:"Name two or three fictional characters you love. Any book, film, show, or game.", type:"text", placeholder:"e.g. Howl, Puss in Boots, Geralt…" },
  { id:"look", prompt:"Close your eyes. What does your character look like? 'A rabbit in a waistcoat' is a legal answer here.", type:"text", placeholder:"Describe the picture in your head…" },
  { id:"recover", prompt:"What would your character risk everything to get back?", type:"text", placeholder:"A person, a memory, a name, a promise…" },
  { id:"fear", prompt:"And what are they most afraid of losing?", type:"text", placeholder:"Be honest. The Feywild will know anyway." },
  { id:"why", prompt:"The Witchlight Carnival comes but once every eight years. Why does your character walk through its gates?", type:"choice", captureOnly:true, options:[
    { label:"Chasing something", pts:{} },{ label:"Running from something", pts:{} },{ label:"Pure curiosity", pts:{} },{ label:"Following someone", pts:{} },{ label:"They work there", pts:{} } ]},
];

const GUIDE = [
  { t:"What is D&D, in one breath?", b:"A group story. The Dungeon Master describes the world; you say what your character does; dice decide the uncertain parts. There is no winning or losing — only what happens next." },
  { t:"The one rule that runs everything", b:"When the outcome is uncertain, roll a 20-sided die (the d20), add your bonus, and try to meet a target number the DM sets. Higher is better. That's an ability check, an attack roll, and a saving throw — same idea, three uses." },
  { t:"Advantage & disadvantage", b:"Circumstances favor you? Roll two d20s, keep the higher (advantage). Circumstances hurt you? Keep the lower (disadvantage). That's the whole rule." },
  { t:"Your key numbers", b:"Armor Class (AC): how hard you are to hit — enemies must roll your AC or higher. Hit Points (HP): your fight left in you; at 0 you fall unconscious. Initiative: a DEX roll at the start of combat that sets the turn order." },
  { t:"Your turn in combat", b:"You get: Movement (up to your speed), one Action (attack, cast, dash, hide, help…), maybe one Bonus Action (if something grants it), and one Reaction per round (used on other people's turns, like an opportunity attack). You can split movement around your action." },
  { t:"Spellcasting basics", b:"Cantrips are free — cast them all day. Leveled spells burn spell slots, which come back when you rest. If a spell says 'Concentration,' you can only hold one such spell at a time, and taking damage may break it." },
  { t:"Resting", b:"Short Rest (1 hour): spend Hit Dice to heal; some abilities recharge. Long Rest (8 hours): back to full HP and all spell slots. You get one long rest per day." },
  { t:"Dropping to 0 HP", b:"You fall unconscious and make death saving throws: d20, no bonus. 10+ is a success, 9 or less a failure. Three successes: you stabilize. Three failures: you die. Any healing wakes you instantly — even 1 HP." },
  { t:"Heroic Inspiration", b:"A reward for great roleplay or luck of the species (humans get it every morning). Spend it to reroll any die. You can only bank one at a time — use it!" },
  { t:"The only real etiquette", b:"Say what you TRY, not what happens. Let the dice and the DM finish the sentence. And when in doubt: 'Can I try to…?' is always a legal move." },
];

// ————————————— Small shared components (module-level: never remount) —————————————
const Section = ({ children, style }) => (
  <div className="rounded-xl p-5 mb-4" style={{ background:C.panel, border:`1px solid ${C.panelEdge}`, ...style }}>{children}</div>
);
const H = ({ children }) => <h2 style={{ ...display, fontSize:26, fontWeight:700, color:C.parchment }}>{children}</h2>;
const Eyebrow = ({ children }) => <p className="uppercase text-xs tracking-widest mb-1" style={{ color:C.sea, letterSpacing:"0.25em" }}>{children}</p>;
const Btn = ({ onClick, disabled, children, secondary }) => (
  <button onClick={onClick} disabled={disabled} className="w-full rounded-lg py-3 text-base font-semibold mt-3"
    style={{ ...display, fontSize:18, background: disabled ? C.panelEdge : secondary ? "transparent" : C.gold,
      color: disabled ? C.faint : secondary ? C.faint : C.ink, border: secondary ? `1px solid ${C.panelEdge}` : "none" }}>
    {children}</button>
);
const Pick = ({ selected, onClick, children }) => (
  <button onClick={onClick} className="text-left rounded-lg px-4 py-3 text-base w-full"
    style={{ background:C.panel, border:`1px solid ${selected ? C.gold : C.panelEdge}`, color:C.parchment }}>
    {children}</button>
);

// ————————————— Main app —————————————
export default function PlayersCompanion() {
  const [tab, setTab] = useState("fortune"); // fortune | build | sheet | guide
  // quiz state
  const [qStage, setQStage] = useState("intro");
  const [qIdx, setQIdx] = useState(0);
  const [qName, setQName] = useState("");
  const [qAns, setQAns] = useState({});
  const [qScores, setQScores] = useState({});
  const [qDraft, setQDraft] = useState("");
  const [copied, setCopied] = useState(false);
  // builder state
  const [step, setStep] = useState(0);
  const [ch, setCh] = useState({ name:"", species:null, klass:null, bg:null, bump2:null, bump1:null,
    assign:{STR:null,DEX:null,CON:null,INT:null,WIS:null,CHA:null}, skills:[], notes:"" });
  const [saved, setSaved] = useState(null);
  const [openGuide, setOpenGuide] = useState(null);

  // load saved character
  useEffect(() => { (async () => {
    try { const r = await window.storage.get("sotsf-character");
      if (r?.value) { const c = JSON.parse(r.value); setSaved(c); setCh(c); setTab("sheet"); } } catch {}
  })(); }, []);

  const persist = async (c) => { try { await window.storage.set("sotsf-character", JSON.stringify(c)); } catch {} };

  // ————— quiz logic —————
  const q = QUIZ[qIdx];
  const qChoose = (opt) => {
    setQAns({ ...qAns, [q.id]: opt.label });
    if (!q.captureOnly) { const s = { ...qScores };
      for (const [k,p] of Object.entries(opt.pts)) s[k]=(s[k]||0)+p; setQScores(s); }
    qIdx+1 < QUIZ.length ? setQIdx(qIdx+1) : setQStage("results");
  };
  const qSubmitText = () => { const v=qDraft.trim(); if(!v) return;
    setQAns({ ...qAns, [q.id]: v }); setQDraft("");
    qIdx+1 < QUIZ.length ? setQIdx(qIdx+1) : setQStage("results"); };
  const qTop = () => Object.entries(qScores).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n])=>n);
  const qCopy = async () => {
    const lines = [`🎪 WITCHLIGHT DIVINATION — ${qName||"A stranger"}`,``,`Callings: ${qTop().join(", ")}`,``,
      ...QUIZ.map(x=>`• ${x.prompt}\n  → ${qAns[x.id]||"(skipped)"}`),``,`Send this to your DM.`].join("\n");
    try { await navigator.clipboard.writeText(lines); } catch {
      const ta=document.createElement("textarea"); ta.value=lines; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
    setCopied(true); setTimeout(()=>setCopied(false),2500);
  };

  // ————— builder helpers —————
  const abilityFinal = () => {
    const base = {}; ABILITIES.forEach(a=>base[a]=ch.assign[a]??10);
    if (ch.bump2) base[ch.bump2]+=2; if (ch.bump1) base[ch.bump1]+=1; return base;
  };
  const assignedVals = Object.values(ch.assign).filter(v=>v!==null);
  const remaining = ARRAY_VALS.filter(v=>{ let c=ARRAY_VALS.filter(x=>x===v).length;
    let used=assignedVals.filter(x=>x===v).length; return used<c; });
  const allAssigned = assignedVals.length===6;
  const kl = ch.klass ? CLASSES[ch.klass] : null;
  const bgd = ch.bg ? BACKGROUNDS[ch.bg] : null;

  const finishBuild = () => { const done={...ch}; setSaved(done); persist(done); setTab("sheet"); };

  const STEPS = ["Name","Species","Class","Background","Scores","Skills","Done"];

  // ————— sheet derived —————
  const sheet = saved ? (() => {
    const A = (()=>{ const b={}; ABILITIES.forEach(x=>b[x]=saved.assign[x]??10);
      if(saved.bump2) b[saved.bump2]+=2; if(saved.bump1) b[saved.bump1]+=1; return b; })();
    const K = CLASSES[saved.klass]; const B = BACKGROUNDS[saved.bg]; const S = SPECIES[saved.species];
    const prof = 2;
    const hp = K.die + mod(A.CON);
    const ac = K.ac(A);
    const atkMod = mod(A[K.weapon.ab]) + prof;
    const allSkills = [...new Set([...(saved.skills||[]), ...(B?.skills||[])])];
    return { A, K, B, S, prof, hp, ac, atkMod, allSkills };
  })() : null;

  // ————— render —————
  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(1200px 600px at 50% -10%, #2B1E55 0%, ${C.night} 55%)`, ...body, color:C.parchment }}
      className="flex flex-col items-center px-4 pt-6 pb-24">
      <style>{FONT_IMPORT}</style>
      <div className="w-full" style={{ maxWidth:560 }}>

        {/* ————— FORTUNE (quiz) ————— */}
        {tab==="fortune" && (qStage==="intro" ? (
          <div className="text-center" style={{ animation:"cardRise .4s ease-out" }}>
            <Eyebrow>Admit one · free of charge*</Eyebrow>
            <h1 style={{ ...display, fontSize:40, lineHeight:1.05, fontWeight:700 }}>The Witchlight<br/>Divination Booth</h1>
            <p className="mt-4 leading-relaxed" style={{ color:C.faint }}>
              Ten questions. The lanterns will read what kind of hero you were always meant to be — then head to the Build tab to make it real.</p>
            <div className="mt-6 text-left">
              <label className="block text-sm mb-2" style={{ color:C.sea }} htmlFor="qn">What shall the lanterns call you?</label>
              <input id="qn" value={qName} onChange={(e)=>setQName(e.target.value)} placeholder="Your name"
                className="w-full rounded-lg px-4 py-3 outline-none" style={{ background:C.panel, border:`1px solid ${C.panelEdge}`, color:C.parchment }} />
            </div>
            <Btn onClick={()=>setQStage("quiz")}>Step inside</Btn>
            <p className="mt-3 text-xs" style={{ color:C.faint }}>*The carnival never charges coin. What it does charge is another matter.</p>
          </div>
        ) : qStage==="quiz" ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={()=>{ qIdx===0 ? setQStage("intro") : setQIdx(qIdx-1); }} className="text-sm px-3 py-2 rounded-md"
                style={{ color:C.faint, border:`1px solid ${C.panelEdge}` }}>← Back</button>
              <div style={{ color:C.gold, letterSpacing:4, fontSize:12 }}>
                {QUIZ.map((_,i)=><span key={i} style={{ opacity:i<=qIdx?1:0.25 }}>✦</span>)}</div>
            </div>
            <div key={qIdx} style={{ animation:"cardRise .4s ease-out" }}>
              <Eyebrow>The lanterns ask —</Eyebrow>
              <H>{q.prompt}</H>
              {q.type==="choice" ? (
                <div className="mt-5 flex flex-col gap-3">
                  {q.options.map(o=><Pick key={o.label} selected={qAns[q.id]===o.label} onClick={()=>qChoose(o)}>{o.label}</Pick>)}
                </div>
              ) : (
                <div className="mt-5">
                  <textarea value={qDraft} onChange={(e)=>setQDraft(e.target.value)} placeholder={q.placeholder} rows={4}
                    className="w-full rounded-lg px-4 py-3 outline-none" style={{ background:C.panel, border:`1px solid ${C.panelEdge}`, color:C.parchment, resize:"vertical" }} />
                  <Btn onClick={qSubmitText} disabled={!qDraft.trim()}>Tell the lanterns</Btn>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ animation:"cardRise .5s ease-out" }}>
            <Eyebrow>Your fortune, {qName||"stranger"}</Eyebrow>
            <H>The lanterns have spoken</H>
            <div className="mt-4 flex flex-col gap-3">
              {qTop().map((n,i)=>(
                <div key={n} className="rounded-xl p-4" style={{ background:i===0?C.parchment:C.panel, color:i===0?C.ink:C.parchment,
                  border:`1px solid ${i===0?C.gold:C.panelEdge}` }}>
                  <h3 style={{ ...display, fontSize:24, fontWeight:700 }}>{i===0?"✦ ":""}{n}</h3>
                  <p className="text-sm mt-1" style={{ opacity:.9 }}>{CLASSES[n].blurb} <em>({CLASSES[n].complexity})</em></p>
                </div>))}
            </div>
            <Btn onClick={qCopy}>{copied ? "Copied — send it to your DM" : "Copy my fortune for the DM"}</Btn>
            <Btn secondary onClick={()=>{ setCh({...ch, name:qName||ch.name, klass:qTop()[0]||null}); setTab("build"); setStep(0); }}>
              Build this character →</Btn>
          </div>
        ))}

        {/* ————— BUILD ————— */}
        {tab==="build" && (
          <div style={{ animation:"cardRise .4s ease-out" }}>
            <Eyebrow>Character forge · step {step+1} of {STEPS.length}</Eyebrow>
            {step===0 && (<div>
              <H>Who are you?</H>
              <input value={ch.name} onChange={(e)=>setCh({...ch,name:e.target.value})} placeholder="Character name"
                className="w-full mt-4 rounded-lg px-4 py-3 outline-none" style={{ background:C.panel, border:`1px solid ${C.panelEdge}`, color:C.parchment }} />
              <p className="text-sm mt-2" style={{ color:C.faint }}>Stuck? Fey names love nature and mischief: Bramble, Marisol, Wick, Thistledown…</p>
              <Btn onClick={()=>setStep(1)} disabled={!ch.name.trim()}>Next: species</Btn>
            </div>)}
            {step===1 && (<div>
              <H>Choose your species</H>
              <p className="text-sm mb-3" style={{ color:C.faint }}>✦ marks Witchlight-book options — very welcome here.</p>
              <div className="flex flex-col gap-2">
                {Object.entries(SPECIES).map(([n,s])=>(
                  <Pick key={n} selected={ch.species===n} onClick={()=>setCh({...ch,species:n})}>
                    <strong>{n}</strong><span className="block text-sm" style={{ color:C.faint }}>{s.traits[0]} · {s.traits[1]||""}</span>
                  </Pick>))}
              </div>
              <Btn onClick={()=>setStep(2)} disabled={!ch.species}>Next: class</Btn>
            </div>)}
            {step===2 && (<div>
              <H>Choose your class</H>
              <div className="flex flex-col gap-2 mt-3">
                {Object.entries(CLASSES).map(([n,k])=>(
                  <Pick key={n} selected={ch.klass===n} onClick={()=>setCh({...ch,klass:n,skills:[]})}>
                    <strong>{n}</strong> <span className="text-xs" style={{ color:C.gold }}>{k.complexity}</span>
                    <span className="block text-sm" style={{ color:C.faint }}>{k.blurb}</span>
                  </Pick>))}
              </div>
              <Btn onClick={()=>setStep(3)} disabled={!ch.klass}>Next: background</Btn>
            </div>)}
            {step===3 && (<div>
              <H>Choose your background</H>
              <p className="text-sm mb-3" style={{ color:C.faint }}>Your life before the carnival. Grants two skills and a gift.</p>
              <div className="flex flex-col gap-2">
                {Object.entries(BACKGROUNDS).map(([n,b])=>(
                  <Pick key={n} selected={ch.bg===n} onClick={()=>setCh({...ch,bg:n,bump2:null,bump1:null})}>
                    <strong>{n}</strong><span className="block text-sm" style={{ color:C.faint }}>{b.skills.join(", ")} · {b.feat}</span>
                  </Pick>))}
              </div>
              {bgd && (<div className="mt-4">
                <p className="text-sm mb-2" style={{ color:C.sea }}>Your background raises two abilities: pick +2, then +1 {bgd.abis.length<6?`(from ${bgd.abis.join(", ")})`:""}</p>
                <div className="flex flex-wrap gap-2">
                  {bgd.abis.map(a=>(
                    <button key={a} onClick={()=>{ ch.bump2===a ? setCh({...ch,bump2:null}) :
                        !ch.bump2 ? setCh({...ch,bump2:a, bump1: ch.bump1===a?null:ch.bump1}) :
                        setCh({...ch,bump1: ch.bump1===a?null:a}); }}
                      className="px-3 py-2 rounded-md text-sm"
                      style={{ background: ch.bump2===a?C.gold: ch.bump1===a?C.sea:C.panel,
                        color: (ch.bump2===a||ch.bump1===a)?C.ink:C.parchment, border:`1px solid ${C.panelEdge}` }}>
                      {a}{ch.bump2===a?" +2":ch.bump1===a?" +1":""}</button>))}
                </div>
              </div>)}
              <Btn onClick={()=>setStep(4)} disabled={!ch.bg || !ch.bump2 || !ch.bump1}>Next: ability scores</Btn>
            </div>)}
            {step===4 && (<div>
              <H>Assign your abilities</H>
              <p className="text-sm mb-1" style={{ color:C.faint }}>Place 15, 14, 13, 12, 10, 8 — one per ability.</p>
              {kl && <p className="text-sm mb-3" style={{ color:C.sea }}>A {ch.klass} wants the 15 in <strong>{kl.prime}</strong>. CON is everyone's second-best friend.</p>}
              <div className="flex flex-col gap-2">
                {ABILITIES.map(a=>(
                  <div key={a} className="flex items-center justify-between rounded-lg px-4 py-2"
                    style={{ background:C.panel, border:`1px solid ${C.panelEdge}` }}>
                    <span style={{ ...display, fontSize:20, fontWeight:600 }}>{a}{kl?.prime===a?" ★":""}</span>
                    <select value={ch.assign[a]??""} onChange={(e)=>setCh({...ch, assign:{...ch.assign,[a]:e.target.value?Number(e.target.value):null}})}
                      className="rounded-md px-3 py-2" style={{ background:C.night, color:C.parchment, border:`1px solid ${C.panelEdge}` }}>
                      <option value="">—</option>
                      {[...(ch.assign[a]!==null?[ch.assign[a]]:[]), ...remaining].sort((x,y)=>y-x)
                        .filter((v,i,arr)=>arr.indexOf(v)===i).map(v=><option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>))}
              </div>
              <Btn onClick={()=>setStep(5)} disabled={!allAssigned}>Next: skills</Btn>
            </div>)}
            {step===5 && kl && (<div>
              <H>Pick your skills</H>
              <p className="text-sm mb-3" style={{ color:C.faint }}>Choose {kl.skills.n}. Your background already grants {bgd?.skills.join(" & ")}.</p>
              <div className="flex flex-col gap-2">
                {kl.skills.from.map(s=>{
                  const on = ch.skills.includes(s);
                  const dupe = bgd?.skills.includes(s);
                  return (<Pick key={s} selected={on} onClick={()=>{
                      on ? setCh({...ch,skills:ch.skills.filter(x=>x!==s)}) :
                      ch.skills.length<kl.skills.n && setCh({...ch,skills:[...ch.skills,s]}); }}>
                    {s} <span className="text-xs" style={{ color:C.faint }}>({SKILL_ABILITY[s]}){dupe?" · already from background":""}</span>
                  </Pick>);})}
              </div>
              <Btn onClick={()=>setStep(6)} disabled={ch.skills.length!==kl.skills.n}>Next: review</Btn>
            </div>)}
            {step===6 && kl && (<div>
              <H>Ready to be written into the tale</H>
              <Section><p><strong>{ch.name}</strong> — {ch.species} {ch.klass}, {ch.bg}</p>
                <p className="text-sm mt-1" style={{ color:C.faint }}>Everything else — HP, AC, attacks, spells — is calculated on your sheet.</p></Section>
              <Btn onClick={finishBuild}>Forge my character sheet</Btn>
              <Btn secondary onClick={()=>setStep(0)}>Start over</Btn>
            </div>)}
            {step>0 && step<6 && <Btn secondary onClick={()=>setStep(step-1)}>← Back a step</Btn>}
          </div>
        )}

        {/* ————— SHEET ————— */}
        {tab==="sheet" && (!sheet ? (
          <div className="text-center mt-10">
            <H>No character yet</H>
            <p className="mt-2" style={{ color:C.faint }}>Take the fortune, then forge your character — your sheet will live here, saved on this device.</p>
            <Btn onClick={()=>setTab("fortune")}>Consult the lanterns</Btn>
          </div>
        ) : (
          <div style={{ animation:"cardRise .4s ease-out" }}>
            <Eyebrow>Level 1 · {saved.species} {saved.klass} · {saved.bg}</Eyebrow>
            <h1 style={{ ...display, fontSize:36, fontWeight:700 }}>{saved.name}</h1>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {ABILITIES.map(a=>(
                <div key={a} className="rounded-lg py-3 text-center" style={{ background:C.panel, border:`1px solid ${sheet.K.saves.includes(a)?C.gold:C.panelEdge}` }}>
                  <p className="text-xs" style={{ color:C.faint }}>{a}{sheet.K.saves.includes(a)?" ◈":""}</p>
                  <p style={{ ...display, fontSize:24, fontWeight:700 }}>{fmt(mod(sheet.A[a]))}</p>
                  <p className="text-xs" style={{ color:C.faint }}>{sheet.A[a]}</p>
                </div>))}
            </div>
            <p className="text-xs mt-1" style={{ color:C.faint }}>◈ = proficient saving throw (add +{sheet.prof})</p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[["HP",sheet.hp],["AC",sheet.ac.val],["Speed",`${sheet.S.speed} ft`]].map(([l,v])=>(
                <div key={l} className="rounded-lg py-3 text-center" style={{ background:C.parchment, color:C.ink }}>
                  <p className="text-xs" style={{ color:C.goldDim }}>{l}</p>
                  <p style={{ ...display, fontSize:26, fontWeight:700 }}>{v}</p>
                </div>))}
            </div>
            <p className="text-xs mt-1" style={{ color:C.faint }}>AC: {sheet.ac.note} · Hit Die: d{sheet.K.die} · Proficiency +{sheet.prof} · Initiative {fmt(mod(sheet.A.DEX))}</p>

            <Section style={{ marginTop:16 }}>
              <Eyebrow>Attack</Eyebrow>
              <p><strong>{sheet.K.weapon.name}</strong>: roll d20 {fmt(sheet.atkMod)} to hit · damage {sheet.K.weapon.die} {fmt(mod(sheet.A[sheet.K.weapon.ab]))}</p>
            </Section>
            {sheet.K.spells && (<Section>
              <Eyebrow>Recommended spells</Eyebrow>
              {sheet.K.spells.cantrips.length>0 && <p className="text-sm"><strong>Cantrips (always free):</strong> {sheet.K.spells.cantrips.join(", ")}</p>}
              <p className="text-sm mt-1"><strong>Level 1 (use spell slots):</strong> {sheet.K.spells.leveled.join(", ")}</p>
              <p className="text-xs mt-2" style={{ color:C.faint }}>Spell attack {fmt(mod(sheet.A[sheet.K.prime])+sheet.prof)} · Save DC {8+sheet.prof+mod(sheet.A[sheet.K.prime])}</p>
            </Section>)}
            <Section>
              <Eyebrow>Skills (add +{sheet.prof})</Eyebrow>
              <p className="text-sm">{sheet.allSkills.map(s=>`${s} ${fmt(mod(sheet.A[SKILL_ABILITY[s]])+sheet.prof)}`).join(" · ")}</p>
            </Section>
            <Section>
              <Eyebrow>Features & traits</Eyebrow>
              {sheet.K.features.map(f=><p key={f} className="text-sm mb-1">• {f}</p>)}
              {sheet.S.traits.map(t=><p key={t} className="text-sm mb-1">• {t}</p>)}
              <p className="text-sm mb-1">• Background gift: {sheet.B.feat}</p>
            </Section>
            <Section>
              <Eyebrow>Equipment</Eyebrow>
              <p className="text-sm">{sheet.K.kit}</p>
            </Section>
            <Section>
              <Eyebrow>Notes · what you lost, who you love, secrets…</Eyebrow>
              <textarea value={saved.notes||""} rows={4}
                onChange={(e)=>{ const c={...saved, notes:e.target.value}; setSaved(c); }}
                onBlur={()=>persist(saved)}
                className="w-full rounded-lg px-3 py-2 outline-none text-sm"
                style={{ background:C.night, border:`1px solid ${C.panelEdge}`, color:C.parchment, resize:"vertical" }} />
            </Section>
            <Btn secondary onClick={()=>{ setCh(saved); setTab("build"); setStep(0); }}>Edit character</Btn>
          </div>
        ))}

        {/* ————— GUIDE ————— */}
        {tab==="guide" && (
          <div style={{ animation:"cardRise .4s ease-out" }}>
            <Eyebrow>Pocket guide</Eyebrow>
            <H>How to play, in ten small candles</H>
            <div className="mt-4">
              {GUIDE.map((g,i)=>(
                <div key={i} className="rounded-lg mb-2 overflow-hidden" style={{ border:`1px solid ${C.panelEdge}`, background:C.panel }}>
                  <button onClick={()=>setOpenGuide(openGuide===i?null:i)} className="w-full text-left px-4 py-3 flex justify-between items-center">
                    <span style={{ ...display, fontSize:18, fontWeight:600 }}>{g.t}</span>
                    <span style={{ color:C.gold }}>{openGuide===i?"−":"+"}</span>
                  </button>
                  {openGuide===i && <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color:C.parchment, opacity:.9 }}>{g.b}</p>}
                </div>))}
            </div>
            <p className="text-sm mt-4" style={{ color:C.faint }}>Everything else, your Dungeon Master will teach you at the table. That's the fun part.</p>
          </div>
        )}
      </div>

      {/* ————— Tab bar ————— */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-center" style={{ background:`${C.night}F2`, borderTop:`1px solid ${C.panelEdge}`, backdropFilter:"blur(8px)" }}>
        <div className="flex w-full" style={{ maxWidth:560 }}>
          {[["fortune","✦","Fortune"],["build","⚒","Build"],["sheet","❖","Sheet"],["guide","✧","Guide"]].map(([id,icon,label])=>(
            <button key={id} onClick={()=>setTab(id)} className="flex-1 py-3 text-center"
              style={{ color: tab===id ? C.gold : C.faint }}>
              <span className="block text-lg">{icon}</span>
              <span className="text-xs">{label}</span>
            </button>))}
        </div>
      </nav>
    </div>
  );
}
