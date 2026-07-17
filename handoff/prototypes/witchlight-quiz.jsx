import { useState, useEffect } from "react";

// ————— Palette: Feywild twilight carnival —————
const C = {
  night: "#181030",      // deep twilight
  panel: "#251A48",      // violet panel
  panelEdge: "#3A2C66",
  gold: "#E8B84B",       // lantern gold
  goldDim: "#B58A2E",
  sea: "#7FD4C1",        // moonlit seafoam (the sea's echo)
  parchment: "#F2E9D8",
  ink: "#241A42",
  faint: "#9C8FC4",
};

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Sorts+Mill+Goudy&display=swap');
@keyframes cardRise { from { opacity: 0; transform: translateY(24px) rotate(-1deg); } to { opacity: 1; transform: translateY(0) rotate(0); } }
@keyframes glow { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

const display = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const body = { fontFamily: "'Sorts Mill Goudy', Georgia, serif" };

// ————— Class data —————
const CLASSES = {
  Barbarian: { blurb: "Unstoppable fury. Charge in, rage, and shrug off blows that would fell an ox.", fit: 3, tag: "Simple & mighty" },
  Bard: { blurb: "A performer whose art is magic. Charm, trick, inspire — the carnival is your home turf.", fit: 5, tag: "The carnival's darling" },
  Cleric: { blurb: "Champion of a higher power. Mend wounds, turn fate, and stand where others fall.", fit: 4, tag: "The party's anchor" },
  Druid: { blurb: "Speaker for wild places. Shapeshift, summon, and bend nature to your will.", fit: 4, tag: "Nature's voice" },
  Fighter: { blurb: "Master of arms. The simplest class to play and deadly in any hands.", fit: 3, tag: "Easiest to learn" },
  Monk: { blurb: "Living weapon. Dart, flurry, and flow through danger like water.", fit: 4, tag: "The acrobat" },
  Paladin: { blurb: "A knight bound by an oath — and in the Feywild, oaths have teeth.", fit: 4, tag: "Sworn protector" },
  Ranger: { blurb: "Hunter at the edge of the map. Half warrior, half whisper of the wild.", fit: 3, tag: "The tracker" },
  Rogue: { blurb: "The clever one. Locks, lies, and one perfectly placed blade.", fit: 5, tag: "Made for mysteries" },
  Sorcerer: { blurb: "Magic in your blood — wild, bright, and barely on a leash.", fit: 4, tag: "Wild magic rising" },
  Warlock: { blurb: "You made a deal with something powerful. In this campaign… that matters.", fit: 5, tag: "Perfect for this tale" },
  Wizard: { blurb: "Magic as scholarship. The biggest spell toolbox in the game — if you'll do the homework.", fit: 3, tag: "The deep toolbox" },
};

// ————— Questions —————
// type: "choice" (scored/captured) or "text" (captured)
const QUESTIONS = [
  {
    id: "moment",
    prompt: "Picture your finest moment at the table. What are you doing?",
    type: "choice",
    options: [
      { label: "Winning a glorious fight", pts: { Fighter: 2, Barbarian: 2, Paladin: 1, Monk: 1 } },
      { label: "Talking my way out of anything", pts: { Bard: 3, Rogue: 1, Warlock: 1 } },
      { label: "Casting something spectacular", pts: { Wizard: 2, Sorcerer: 2, Warlock: 1, Druid: 1 } },
      { label: "Outsmarting everyone in the room", pts: { Rogue: 3, Wizard: 1, Bard: 1 } },
      { label: "Protecting someone who needed me", pts: { Paladin: 2, Cleric: 2, Fighter: 1 } },
      { label: "Making the whole table laugh", pts: { Bard: 2, Rogue: 1, Sorcerer: 1 } },
    ],
  },
  {
    id: "solve",
    prompt: "Trouble finds you at the carnival. How do you answer it?",
    type: "choice",
    options: [
      { label: "Steel and strength", pts: { Fighter: 2, Barbarian: 2, Paladin: 1 } },
      { label: "Magic, obviously", pts: { Wizard: 2, Sorcerer: 2, Warlock: 2, Druid: 1 } },
      { label: "Words — honeyed or sharp", pts: { Bard: 3, Warlock: 1 } },
      { label: "You never saw me", pts: { Rogue: 3, Monk: 1, Ranger: 1 } },
      { label: "Beasts and green growing things", pts: { Druid: 3, Ranger: 2 } },
      { label: "A little of everything", pts: { Bard: 1, Paladin: 1, Ranger: 1 } },
    ],
  },
  {
    id: "complexity",
    prompt: "How much do you want to keep track of?",
    type: "choice",
    options: [
      { label: "Give me 2–3 clear things I can do", pts: { Fighter: 3, Barbarian: 3, Rogue: 2 } },
      { label: "Some choices — but not homework", pts: { Paladin: 2, Warlock: 2, Monk: 2, Bard: 2, Ranger: 1 } },
      { label: "Hand me the whole toolbox", pts: { Wizard: 3, Cleric: 2, Druid: 2, Sorcerer: 2 } },
    ],
  },
  {
    id: "vibe",
    prompt: "What feeling should follow your character into the room?",
    type: "choice",
    options: [
      { label: "Heroic", pts: { Paladin: 2, Fighter: 1, Cleric: 1 } },
      { label: "Strange", pts: { Warlock: 2, Druid: 1, Sorcerer: 1 } },
      { label: "Funny", pts: { Bard: 2, Rogue: 1, Sorcerer: 1 } },
      { label: "Mysterious", pts: { Rogue: 2, Warlock: 2, Wizard: 1 } },
      { label: "A little frightening", pts: { Warlock: 2, Barbarian: 1, Paladin: 1 } },
      { label: "Utterly charming", pts: { Bard: 3, Warlock: 1 } },
    ],
  },
  {
    id: "fight",
    prompt: "And when a fight can't be avoided?",
    type: "choice",
    options: [
      { label: "Nose to nose, blade to blade", pts: { Fighter: 2, Barbarian: 2, Paladin: 2, Monk: 1 } },
      { label: "From a safe, clever distance", pts: { Ranger: 2, Rogue: 1, Wizard: 1, Sorcerer: 1, Warlock: 1 } },
      { label: "Helping, healing, tipping the scales", pts: { Cleric: 3, Bard: 2, Druid: 1 } },
      { label: "Everywhere at once", pts: { Monk: 3, Rogue: 1 } },
      { label: "I'd rather there be no fight at all", pts: { Bard: 2, Rogue: 1, Druid: 1 } },
    ],
  },
  {
    id: "heroes",
    prompt: "Name two or three fictional characters you love. Any book, film, show, or game.",
    type: "text",
    placeholder: "e.g. Howl, Puss in Boots, Geralt…",
  },
  {
    id: "look",
    prompt: "Close your eyes. What does your character look like? Don't filter — 'a rabbit in a waistcoat' is a legal answer here.",
    type: "text",
    placeholder: "Describe the picture in your head…",
  },
  {
    id: "recover",
    prompt: "What would your character risk everything to get back?",
    type: "text",
    placeholder: "A person, a memory, a name, a promise…",
  },
  {
    id: "fear",
    prompt: "And what are they most afraid of losing?",
    type: "text",
    placeholder: "Be honest. The Feywild will know anyway.",
  },
  {
    id: "why",
    prompt: "The Witchlight Carnival comes but once every eight years. Why does your character walk through its gates?",
    type: "choice",
    captureOnly: true,
    options: [
      { label: "Chasing something", pts: {} },
      { label: "Running from something", pts: {} },
      { label: "Pure curiosity", pts: {} },
      { label: "Following someone", pts: {} },
      { label: "They work there", pts: {} },
    ],
  },
];

function topClasses(scores, n = 3) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, score]) => ({ name, score }));
}

const Lantern = () => (
  <div className="flex justify-center gap-3 mb-6" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <span key={i} style={{ color: C.gold, animation: `glow 3s ease-in-out ${i * 0.7}s infinite`, fontSize: 14 }}>✦</span>
    ))}
  </div>
);

const Frame = ({ children }) => (
  <div style={{ minHeight: "100vh", background: `radial-gradient(1200px 600px at 50% -10%, #2B1E55 0%, ${C.night} 55%)`, ...body, color: C.parchment }} className="flex flex-col items-center px-4 py-8">
    <style>{FONT_IMPORT}</style>
    <div className="w-full" style={{ maxWidth: 560 }}>{children}</div>
    <p className="mt-8 text-center text-xs" style={{ color: C.faint }}>
      The Witchlight Divination Booth · a fortune costs nothing but honesty
    </p>
  </div>
);

const Stars = ({ n }) => (
  <span aria-label={`${n} of 5 campaign fit`} style={{ color: C.gold, letterSpacing: 2 }}>
    {"★".repeat(n)}
    <span style={{ opacity: 0.25 }}>{"★".repeat(5 - n)}</span>
  </span>
);

export default function WitchlightQuiz() {
  const [stage, setStage] = useState("intro"); // intro | quiz | results
  const [name, setName] = useState("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [textDraft, setTextDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const q = QUESTIONS[idx];

  const choose = (opt) => {
    const next = { ...answers, [q.id]: opt.label };
    setAnswers(next);
    if (!q.captureOnly) {
      const s = { ...scores };
      for (const [cls, p] of Object.entries(opt.pts)) s[cls] = (s[cls] || 0) + p;
      setScores(s);
    }
    advance(next);
  };

  const submitText = () => {
    const val = textDraft.trim();
    if (!val) return;
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    setTextDraft("");
    advance(next);
  };

  const advance = () => {
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
    else setStage("results");
  };

  const goBack = () => {
    if (idx === 0) { setStage("intro"); return; }
    // Remove the previous answer's points if it was scored
    const prev = QUESTIONS[idx - 1];
    const prevLabel = answers[prev.id];
    if (prev.type === "choice" && !prev.captureOnly && prevLabel) {
      const opt = prev.options.find((o) => o.label === prevLabel);
      if (opt) {
        const s = { ...scores };
        for (const [cls, p] of Object.entries(opt.pts)) s[cls] = (s[cls] || 0) - p;
        setScores(s);
      }
    }
    setTextDraft(prev.type === "text" ? (answers[prev.id] || "") : "");
    setIdx(idx - 1);
  };

  const buildSummary = () => {
    const top = topClasses(scores);
    const lines = [
      `🎪 THE WITCHLIGHT DIVINATION — ${name || "A mysterious stranger"}`,
      ``,
      `The carnival's lanterns have read your fate. Your callings:`,
      ...top.map((t, i) => `  ${i + 1}. ${t.name} — ${CLASSES[t.name].tag}`),
      ``,
      `— Their answers —`,
      ...QUESTIONS.map((qq) => `• ${qq.prompt}\n  → ${answers[qq.id] || "(skipped)"}`),
      ``,
      `Send this to your Dungeon Master. Your story begins soon.`,
    ];
    return lines.join("\n");
  };

  const copyResults = async () => {
    const text = buildSummary();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const restart = () => {
    setStage("intro"); setIdx(0); setAnswers({}); setScores({}); setTextDraft(""); setName("");
  };

  // ————— Intro —————
  if (stage === "intro") {
    return (
      <Frame>
        <Lantern />
        <div className="text-center">
          <p className="uppercase text-xs tracking-widest mb-3" style={{ color: C.sea, letterSpacing: "0.3em" }}>Admit one · free of charge*</p>
          <h1 style={{ ...display, fontSize: 44, lineHeight: 1.05, fontWeight: 700, color: C.parchment }}>
            The Witchlight<br />Divination Booth
          </h1>
          <p className="mt-5 text-base leading-relaxed" style={{ color: C.faint }}>
            Once every eight years the carnival returns — and its lanterns can read what kind of hero you were always meant to be. Answer ten questions truthfully. The Feywild will know if you don't.
          </p>
          <div className="mt-8">
            <label className="block text-sm mb-2" style={{ color: C.sea }} htmlFor="pname">What shall the lanterns call you?</label>
            <input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg px-4 py-3 text-base outline-none"
              style={{ background: C.panel, border: `1px solid ${C.panelEdge}`, color: C.parchment }}
            />
          </div>
          <button
            onClick={() => setStage("quiz")}
            className="mt-6 w-full rounded-lg py-4 text-lg font-semibold"
            style={{ ...display, background: C.gold, color: C.ink, boxShadow: `0 0 40px ${C.gold}33` }}
          >
            Step inside
          </button>
          <p className="mt-4 text-xs" style={{ color: C.faint }}>*The carnival never charges coin. What it does charge is another matter.</p>
        </div>
      </Frame>
    );
  }

  // ————— Results —————
  if (stage === "results") {
    const top = topClasses(scores);
    return (
      <Frame>
        <Lantern />
        <div style={{ animation: "cardRise .6s ease-out" }}>
          <p className="text-center uppercase text-xs tracking-widest mb-2" style={{ color: C.sea, letterSpacing: "0.3em" }}>Your fortune, {name || "stranger"}</p>
          <h2 className="text-center" style={{ ...display, fontSize: 34, fontWeight: 700 }}>The lanterns have spoken</h2>
          <div className="mt-6 flex flex-col gap-4">
            {top.map((t, i) => (
              <div key={t.name} className="rounded-xl p-5" style={{ background: i === 0 ? C.parchment : C.panel, color: i === 0 ? C.ink : C.parchment, border: `1px solid ${i === 0 ? C.gold : C.panelEdge}`, boxShadow: i === 0 ? `0 0 50px ${C.gold}26` : "none" }}>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 style={{ ...display, fontSize: 26, fontWeight: 700 }}>{i === 0 ? "✦ " : ""}{t.name}</h3>
                  <Stars n={CLASSES[t.name].fit} />
                </div>
                <p className="text-xs uppercase tracking-widest mt-1" style={{ color: i === 0 ? C.goldDim : C.sea }}>{CLASSES[t.name].tag}</p>
                <p className="mt-2 text-sm leading-relaxed" style={{ opacity: 0.9 }}>{CLASSES[t.name].blurb}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-center leading-relaxed" style={{ color: C.faint }}>
            Stars show how naturally each calling fits <em>this</em> carnival's tale. Your Dungeon Master will help you choose — and yes, you may play a fairy or a rabbitfolk.
          </p>
          <button
            onClick={copyResults}
            className="mt-6 w-full rounded-lg py-4 text-lg font-semibold"
            style={{ ...display, background: copied ? C.sea : C.gold, color: C.ink }}
          >
            {copied ? "Copied — send it to your DM" : "Copy my fortune for the DM"}
          </button>
          <button onClick={restart} className="mt-3 w-full rounded-lg py-3 text-sm" style={{ background: "transparent", border: `1px solid ${C.panelEdge}`, color: C.faint }}>
            Consult the lanterns again
          </button>
        </div>
      </Frame>
    );
  }

  // ————— Quiz —————
  return (
    <Frame>
      <div className="flex items-center justify-between mb-5">
        <button onClick={goBack} className="text-sm px-3 py-2 rounded-md" style={{ color: C.faint, border: `1px solid ${C.panelEdge}` }}>
          ← Back
        </button>
        <div aria-label={`Question ${idx + 1} of ${QUESTIONS.length}`} style={{ color: C.gold, letterSpacing: 4, fontSize: 12 }}>
          {QUESTIONS.map((_, i) => (
            <span key={i} style={{ opacity: i <= idx ? 1 : 0.25 }}>✦</span>
          ))}
        </div>
      </div>

      <div key={idx} style={{ animation: "cardRise .45s ease-out" }}>
        <p className="uppercase text-xs tracking-widest mb-2" style={{ color: C.sea, letterSpacing: "0.25em" }}>
          The lanterns ask —
        </p>
        <h2 style={{ ...display, fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}>{q.prompt}</h2>

        {q.type === "choice" ? (
          <div className="mt-6 flex flex-col gap-3">
            {q.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => choose(opt)}
                className="text-left rounded-lg px-4 py-4 text-base"
                style={{ background: C.panel, border: `1px solid ${answers[q.id] === opt.label ? C.gold : C.panelEdge}`, color: C.parchment }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <textarea
              value={textDraft}
              onChange={(e) => setTextDraft(e.target.value)}
              placeholder={q.placeholder}
              rows={4}
              className="w-full rounded-lg px-4 py-3 text-base outline-none"
              style={{ background: C.panel, border: `1px solid ${C.panelEdge}`, color: C.parchment, resize: "vertical" }}
            />
            <button
              onClick={submitText}
              disabled={!textDraft.trim()}
              className="mt-4 w-full rounded-lg py-4 text-lg font-semibold"
              style={{ ...display, background: textDraft.trim() ? C.gold : C.panelEdge, color: textDraft.trim() ? C.ink : C.faint }}
            >
              Tell the lanterns
            </button>
          </div>
        )}
      </div>
    </Frame>
  );
}
