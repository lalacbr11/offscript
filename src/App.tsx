import { useEffect, useMemo, useState } from "react";
import { ideas, type Avoidance, type DateIdea, type Energy, type Mood } from "./dateIdeas";

type Screen =
  | "home"
  | "setup"
  | "partner1"
  | "handoff"
  | "partner2"
  | "reveal"
  | "saved"
  | "savedPlan";
type Location = "Staying in" | "Going out" | "Surprise us";
type CheckIn = { energy: Energy | ""; mood: Mood | "" };
type RotationNotice = "only" | "exhausted" | null;

type SavedDate = DateIdea & {
  completed: boolean;
  feedback?: "again" | "different";
};

const budgetOptions = [
  { label: "Free", value: 0, note: "$0" },
  { label: "Under $25", value: 25, note: "A small treat" },
  { label: "Under $50", value: 50, note: "Room to roam" },
  { label: "Under $100", value: 100, note: "Make a night of it" },
];
const timeOptions = [
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "An evening", value: 180 },
];
const locations: Location[] = ["Staying in", "Going out", "Surprise us"];
const energies: Energy[] = ["Low", "Medium", "High"];
const moods: Mood[] = ["Cozy", "Playful", "Creative", "Adventurous"];
const avoidanceOptions: Avoidance[] = [
  "Food activities",
  "Outdoor activities",
  "Walking",
  "Shopping",
  "Screens",
];
const energyRank: Record<Energy, number> = { Low: 0, Medium: 1, High: 2 };
const STORAGE_KEYS = {
  saved: "offscript:saved-dates",
  shown: "offscript:shown-date-history",
};

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked or full; state remains available for this session.
  }
}

function ArrowIcon({ direction = "right" }: { direction?: "right" | "left" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={direction === "left" ? "rotate-180" : ""}
    >
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 4.5c0-.8.7-1.5 1.5-1.5h8c.8 0 1.5.7 1.5 1.5V21L12 17.5 6.5 21V4.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2c.4 6 3.2 9.2 9 10-5.8.8-8.6 4-9 10-.4-6-3.2-9.2-9-10 5.8-.8 8.6-4 9-10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Header({
  onHome,
  onSaved,
  savedCount,
  screen,
  quiet = false,
}: {
  onHome: () => void;
  onSaved: () => void;
  savedCount: number;
  screen: Screen;
  quiet?: boolean;
}) {
  const homeActive = screen === "home";
  const savedActive = screen === "saved" || screen === "savedPlan";

  return (
    <header className={`site-header ${quiet ? "quiet" : ""}`}>
      <a
        className="wordmark"
        href="/"
        onClick={(event) => {
          event.preventDefault();
          onHome();
        }}
        aria-label="OffScript home"
      >
        Off<span>Script</span>
        <i />
      </a>
      <nav className="main-nav" aria-label="Primary navigation">
        <a
          href="#home"
          className={`header-home-link ${homeActive ? "active" : ""}`}
          aria-current={homeActive ? "page" : undefined}
          aria-label="Home"
          onClick={(event) => {
            event.preventDefault();
            onHome();
          }}
        >
          <HomeIcon />
          <span>Home</span>
        </a>
        <a
          href="#saved"
          className={savedActive ? "active" : ""}
          aria-current={savedActive ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            onSaved();
          }}
        >
          <BookmarkIcon filled={savedCount > 0} />
          <span>Saved dates</span>
          {savedCount > 0 && <b>{savedCount}</b>}
        </a>
      </nav>
    </header>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="progress-wrap" aria-label={`Step ${step} of 3`}>
      <span>Plan a date</span>
      <div className="progress-dots">
        {[1, 2, 3].map((item) => (
          <i key={item} className={item <= step ? "active" : ""} />
        ))}
      </div>
      <span>{step} of 3</span>
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
  detail,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  detail?: string;
}) {
  return (
    <button
      type="button"
      className={`choice ${selected ? "selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span>{children}</span>
      {detail && <small>{detail}</small>}
      <i className="choice-check">{selected ? "✓" : ""}</i>
    </button>
  );
}

function PrimaryButton({
  onClick,
  children,
  disabled = false,
  tone = "coral",
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  tone?: "coral" | "cream";
}) {
  return (
    <button className={`primary-button ${tone}`} onClick={onClick} disabled={disabled}>
      <span>{children}</span>
      <ArrowIcon />
    </button>
  );
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes % 60 === 0) return `${minutes / 60} ${minutes === 60 ? "hour" : "hours"}`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [budget, setBudget] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [avoidances, setAvoidances] = useState<Avoidance[]>([]);
  const [partner1, setPartner1] = useState<CheckIn>({ energy: "", mood: "" });
  const [partner2, setPartner2] = useState<CheckIn>({ energy: "", mood: "" });
  const [shownIds, setShownIds] = useState<string[]>(() =>
    readStored<string[]>(STORAGE_KEYS.shown, []),
  );
  const [currentIdea, setCurrentIdea] = useState<DateIdea | null>(null);
  const [rotationNotice, setRotationNotice] = useState<RotationNotice>(null);
  const [saved, setSaved] = useState<SavedDate[]>(() =>
    readStored<SavedDate[]>(STORAGE_KEYS.saved, []),
  );
  const [viewedSavedId, setViewedSavedId] = useState<string | null>(null);
  const [planningStarted, setPlanningStarted] = useState(false);
  const [partner1Locked, setPartner1Locked] = useState(false);
  const [usedSamplePartner, setUsedSamplePartner] = useState(false);
  const [resumeScreen, setResumeScreen] = useState<Screen>("setup");
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  // A locked partner-one check-in is never a renderable destination, including
  // when an older browser-history entry points at it.
  const renderedScreen: Screen = screen === "partner1" && partner1Locked ? "handoff" : screen;

  useEffect(() => writeStored(STORAGE_KEYS.saved, saved), [saved]);
  useEffect(() => writeStored(STORAGE_KEYS.shown, shownIds), [shownIds]);
  useEffect(() => {
    window.history.replaceState({ offscriptScreen: "home" }, "", window.location.href);
    const handlePopState = (event: PopStateEvent) => {
      const next = event.state?.offscriptScreen as Screen | undefined;
      if (next) setScreen(next);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen]);

  const matches = useMemo(() => {
    if (
      budget === null ||
      time === null ||
      !location ||
      !partner1.energy ||
      !partner1.mood ||
      !partner2.energy ||
      !partner2.mood
    )
      return [];
    const lowerEnergy = Math.min(
      energyRank[partner1.energy as Energy],
      energyRank[partner2.energy as Energy],
    );
    const dislikedIds = new Set(
      saved
        .filter((date) => date.completed && date.feedback === "different")
        .map((date) => date.id),
    );
    return ideas
      .filter(
        (idea) =>
          idea.cost <= budget &&
          idea.duration <= time &&
          (location === "Surprise us" || idea.location === location) &&
          energyRank[idea.energy] <= lowerEnergy &&
          !idea.avoid.some((item) => avoidances.includes(item)) &&
          !dislikedIds.has(idea.id),
      )
      .map((idea) => {
        const moodScore =
          Number(idea.moods.includes(partner1.mood as Mood)) +
          Number(idea.moods.includes(partner2.mood as Mood));
        const energyScore =
          Number(idea.energy === partner1.energy) + Number(idea.energy === partner2.energy);
        return { idea, score: moodScore * 4 + energyScore };
      })
      .sort((a, b) => b.score - a.score || a.idea.cost - b.idea.cost)
      .map(({ idea }) => idea);
  }, [avoidances, budget, location, partner1, partner2, saved, time]);

  const scrollToDateTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const navigate = (next: Screen, replace = false) => {
    if (next === screen) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({ offscriptScreen: next }, "", window.location.href);
    setScreen(next);
  };

  const planningScreens: Screen[] = ["setup", "partner1", "handoff", "partner2", "reveal"];

  const rememberPlanningScreen = () => {
    if (planningScreens.includes(renderedScreen)) {
      setResumeScreen(renderedScreen === "partner2" ? "handoff" : renderedScreen);
      setPlanningStarted(true);
    }
  };

  const showInitialIdea = () => {
    setRotationNotice(null);
    if (!matches.length) {
      setCurrentIdea(null);
      navigate("reveal");
      return;
    }
    const unseen = matches.filter((idea) => !shownIds.includes(idea.id));
    const pool = unseen.length ? unseen : matches;
    const next = pool[0];
    setShownIds(unseen.length ? [...shownIds, next.id] : [next.id]);
    setCurrentIdea(next);
    navigate("reveal");
  };

  const showAnotherIdea = () => {
    if (matches.length === 1) {
      setRotationNotice("only");
      return;
    }

    const unseen = matches.filter(
      (idea) => !shownIds.includes(idea.id) && idea.id !== currentIdea?.id,
    );
    if (!unseen.length) {
      setRotationNotice("exhausted");
      return;
    }

    const next = unseen.find((idea) => idea.category !== currentIdea?.category) ?? unseen[0];
    setCurrentIdea(next);
    setShownIds((ids) => [...ids, next.id]);
    setRotationNotice(null);
    scrollToDateTop();
  };

  const restartRotation = () => {
    const next = matches.find((idea) => idea.id !== currentIdea?.id) ?? matches[0];
    if (!next) return;
    setCurrentIdea(next);
    setShownIds([next.id]);
    setRotationNotice(null);
    scrollToDateTop();
  };

  const goHome = () => {
    setShowRestartConfirm(false);
    rememberPlanningScreen();
    navigate("home");
  };
  const goSaved = () => {
    setShowRestartConfirm(false);
    rememberPlanningScreen();
    navigate("saved");
  };
  const startNewDate = () => {
    setBudget(null);
    setTime(null);
    setLocation(null);
    setAvoidances([]);
    setPartner1({ energy: "", mood: "" });
    setPartner2({ energy: "", mood: "" });
    setCurrentIdea(null);
    setRotationNotice(null);
    setPartner1Locked(false);
    setUsedSamplePartner(false);
    setShowRestartConfirm(false);
    setPlanningStarted(true);
    setResumeScreen("setup");
    navigate("setup");
  };
  const resumePlanning = () => navigate(resumeScreen);
  const restartCheckIns = () => {
    setPartner1({ energy: "", mood: "" });
    setPartner2({ energy: "", mood: "" });
    setPartner1Locked(false);
    setUsedSamplePartner(false);
    setCurrentIdea(null);
    setRotationNotice(null);
    setShowRestartConfirm(false);
    setResumeScreen("partner1");
    navigate("partner1", true);
  };
  const setupReady = budget !== null && time !== null && location !== null;
  const p1Ready = Boolean(partner1.energy && partner1.mood);
  const p2Ready = Boolean(partner2.energy && partner2.mood);
  const viewedSavedDate = saved.find((date) => date.id === viewedSavedId) ?? null;

  const saveCurrent = () => {
    if (!currentIdea) return;
    setSaved((existing) =>
      existing.some((item) => item.id === currentIdea.id)
        ? existing
        : [...existing, { ...currentIdea, completed: false }],
    );
    setPlanningStarted(false);
    navigate("saved");
  };

  const updateSaved = (id: string, patch: Partial<SavedDate>) => {
    setSaved((dates) => dates.map((date) => (date.id === id ? { ...date, ...patch } : date)));
  };

  const openSavedPlan = (id: string) => {
    setViewedSavedId(id);
    navigate("savedPlan");
  };

  const undoCompletion = (id: string) => {
    updateSaved(id, { completed: false, feedback: undefined });
  };

  return (
    <div className="app-shell">
      <Header
        onHome={goHome}
        onSaved={goSaved}
        savedCount={saved.length}
        screen={renderedScreen}
        quiet={renderedScreen === "home"}
      />

      {renderedScreen === "home" && (
        <main className="home">
          <div className="sun-shape" />
          <div className="home-copy">
            <p className="eyebrow">
              <SparkIcon /> Date night, unscripted
            </p>
            <h1>
              Same person.
              <br />
              <em>New plans.</em>
            </h1>
            <p className="home-sub">Find a little adventure for the two of you.</p>
            <div className="home-actions">
              {planningStarted ? (
                <>
                  <PrimaryButton onClick={resumePlanning}>Resume planning</PrimaryButton>
                  <button className="outline-button" onClick={startNewDate}>
                    Start a new date
                  </button>
                </>
              ) : (
                <PrimaryButton onClick={startNewDate}>Start a new date</PrimaryButton>
              )}
              <button className="text-button" onClick={goSaved}>
                <BookmarkIcon /> Saved dates
              </button>
            </div>
          </div>
          <div className="home-art" aria-hidden="true">
            <div className="ticket ticket-one">
              <i>01</i>
              <span>
                do something
                <br />
                <b>unexpected</b>
              </span>
            </div>
            <div className="ticket ticket-two">
              <i>02</i>
              <span>
                laugh until
                <br />
                <b>way too late</b>
              </span>
            </div>
            <div className="orbit">
              <SparkIcon />
            </div>
          </div>
          <p className="home-note">
            Plans shaped around both of you <span>•</span> No endless scrolling
          </p>
        </main>
      )}

      {renderedScreen === "setup" && (
        <main className="page">
          <Progress step={1} />
          <button className="back-button" onClick={goHome}>
            <ArrowIcon direction="left" /> Back to Home
          </button>
          <div className="page-heading">
            <p className="eyebrow">First, the practical stuff</p>
            <h2>
              Set the <em>evening.</em>
            </h2>
            <p>Give us the guardrails. We’ll take care of the unexpected part.</p>
          </div>

          <section className="form-section">
            <div className="section-number">01</div>
            <div>
              <h3>What’s the budget?</h3>
              <p>We’ll never suggest something over it.</p>
              <div className="choice-grid budget-grid">
                {budgetOptions.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    selected={budget === option.value}
                    onClick={() => setBudget(option.value)}
                    detail={option.note}
                  >
                    {option.label}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          </section>
          <section className="form-section">
            <div className="section-number">02</div>
            <div>
              <h3>How much time do you have?</h3>
              <div className="choice-grid three-grid">
                {timeOptions.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    selected={time === option.value}
                    onClick={() => setTime(option.value)}
                  >
                    {option.label}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          </section>
          <section className="form-section">
            <div className="section-number">03</div>
            <div>
              <h3>Where are you headed?</h3>
              <div className="choice-grid three-grid">
                {locations.map((option) => (
                  <ChoiceButton
                    key={option}
                    selected={location === option}
                    onClick={() => setLocation(option)}
                  >
                    {option}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          </section>
          <section className="form-section">
            <div className="section-number">04</div>
            <div>
              <h3>Anything to avoid?</h3>
              <p>Optional. We’ll leave every selected activity type out completely.</p>
              <div className="choice-grid avoidance-grid">
                {avoidanceOptions.map((option) => (
                  <ChoiceButton
                    key={option}
                    selected={avoidances.includes(option)}
                    onClick={() =>
                      setAvoidances((current) =>
                        current.includes(option)
                          ? current.filter((item) => item !== option)
                          : [...current, option],
                      )
                    }
                  >
                    {option}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          </section>
          <div className="sticky-action">
            <PrimaryButton
              onClick={() => navigate(partner1Locked ? "handoff" : "partner1")}
              disabled={!setupReady}
            >
              {partner1Locked ? "Return to handoff" : "Check in with each other"}
            </PrimaryButton>
            {!setupReady && <span>Choose one from each section to continue</span>}
          </div>
        </main>
      )}

      {renderedScreen === "partner1" && (
        <main className="page checkin-page">
          <Progress step={2} />
          <button className="back-button" onClick={() => navigate("setup")}>
            <ArrowIcon direction="left" /> Back to evening setup
          </button>
          <div className="partner-badge">Partner one</div>
          <div className="page-heading centered">
            <p className="eyebrow">No overthinking</p>
            <h2>
              How are <em>you</em> feeling?
            </h2>
            <p>Pick what feels true right now. Your answers will stay hidden from your partner.</p>
          </div>
          <section className="check-card">
            <div className="question-row">
              <span>1</span>
              <div>
                <h3>Your energy</h3>
                <p>What pace sounds good tonight?</p>
              </div>
            </div>
            <div className="pill-grid">
              {energies.map((item) => (
                <ChoiceButton
                  key={item}
                  selected={partner1.energy === item}
                  onClick={() => setPartner1({ ...partner1, energy: item })}
                >
                  {item}
                </ChoiceButton>
              ))}
            </div>
            <div className="question-row second">
              <span>2</span>
              <div>
                <h3>Your mood</h3>
                <p>What are you hoping to feel?</p>
              </div>
            </div>
            <div className="mood-grid">
              {moods.map((item) => (
                <ChoiceButton
                  key={item}
                  selected={partner1.mood === item}
                  onClick={() => setPartner1({ ...partner1, mood: item })}
                >
                  {item}
                </ChoiceButton>
              ))}
            </div>
          </section>
          <div className="sticky-action">
            <PrimaryButton
              onClick={() => {
                setPartner1Locked(true);
                navigate("handoff", true);
              }}
              disabled={!p1Ready}
            >
              Lock in my answers
            </PrimaryButton>
          </div>
        </main>
      )}

      {renderedScreen === "handoff" && (
        <main className="handoff-page">
          <div className="handoff-art" aria-hidden="true">
            <span>1</span>
            <i>
              <ArrowIcon />
            </i>
            <span>2</span>
          </div>
          <p className="eyebrow">Answers safely tucked away</p>
          <h2>
            Pass the phone
            <br />
            to your <em>partner.</em>
          </h2>
          <p>When they’re ready, they can tap below. Your choices won’t be shown.</p>
          <div className="handoff-actions">
            <PrimaryButton
              onClick={() => {
                setUsedSamplePartner(false);
                navigate("partner2");
              }}
            >
              I’m partner two
            </PrimaryButton>
            <button
              className="sample-button"
              onClick={() => {
                setUsedSamplePartner(true);
                setPartner2({
                  energy: partner1.energy === "High" ? "Medium" : "High",
                  mood: partner1.mood === "Cozy" ? "Creative" : "Cozy",
                });
                setTimeout(() => {
                  const sampleP2: CheckIn = {
                    energy: partner1.energy === "High" ? "Medium" : "High",
                    mood: partner1.mood === "Cozy" ? "Creative" : "Cozy",
                  };
                  const maxEffort = Math.min(
                    energyRank[partner1.energy as Energy],
                    energyRank[sampleP2.energy as Energy],
                  );
                  const dislikedIds = new Set(
                    saved
                      .filter((date) => date.completed && date.feedback === "different")
                      .map((date) => date.id),
                  );
                  const localMatches = ideas
                    .filter(
                      (idea) =>
                        budget !== null &&
                        time !== null &&
                        location &&
                        idea.cost <= budget &&
                        idea.duration <= time &&
                        (location === "Surprise us" || idea.location === location) &&
                        energyRank[idea.energy] <= maxEffort &&
                        !idea.avoid.some((item) => avoidances.includes(item)) &&
                        !dislikedIds.has(idea.id),
                    )
                    .sort((a, b) => {
                      const score = (entry: DateIdea) =>
                        Number(entry.moods.includes(partner1.mood as Mood)) +
                        Number(entry.moods.includes(sampleP2.mood as Mood));
                      return score(b) - score(a) || a.cost - b.cost;
                    });
                  const next = localMatches[0] || null;
                  setRotationNotice(null);
                  setCurrentIdea(next);
                  if (next) setShownIds((ids) => (ids.includes(next.id) ? ids : [...ids, next.id]));
                  navigate("reveal");
                }, 0);
              }}
            >
              <SparkIcon /> Try with a sample partner
            </button>
            <div className="handoff-secondary-actions">
              <button onClick={() => navigate("setup")}>Edit evening</button>
              <button onClick={() => setShowRestartConfirm(true)}>Restart check-ins</button>
            </div>
          </div>
          <small>Testing by yourself? We’ll add a balanced sample check-in.</small>
          {showRestartConfirm && (
            <div className="dialog-backdrop">
              <section
                className="confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="restart-title"
                aria-describedby="restart-description"
              >
                <p className="eyebrow">Start fresh together</p>
                <h3 id="restart-title">Restart both check-ins?</h3>
                <p id="restart-description">
                  This clears both partners’ energy and mood answers. Your evening choices and saved
                  dates will stay exactly as they are.
                </p>
                <div>
                  <button
                    className="outline-button"
                    onClick={() => setShowRestartConfirm(false)}
                    autoFocus
                  >
                    Cancel
                  </button>
                  <button className="confirm-restart-button" onClick={restartCheckIns}>
                    Clear answers and restart
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      )}

      {renderedScreen === "partner2" && (
        <main className="page checkin-page">
          <Progress step={2} />
          <button className="back-button" onClick={() => window.history.back()}>
            <ArrowIcon direction="left" /> Back to handoff
          </button>
          <div className="partner-badge">Partner two</div>
          <div className="page-heading centered">
            <p className="eyebrow">Just your take</p>
            <h2>
              What sounds good
              <br />
              to <em>you?</em>
            </h2>
            <p>Your partner’s answers are hidden. Go with your first instinct.</p>
          </div>
          <section className="check-card">
            <div className="question-row">
              <span>1</span>
              <div>
                <h3>Your energy</h3>
                <p>What pace sounds good tonight?</p>
              </div>
            </div>
            <div className="pill-grid">
              {energies.map((item) => (
                <ChoiceButton
                  key={item}
                  selected={partner2.energy === item}
                  onClick={() => setPartner2({ ...partner2, energy: item })}
                >
                  {item}
                </ChoiceButton>
              ))}
            </div>
            <div className="question-row second">
              <span>2</span>
              <div>
                <h3>Your mood</h3>
                <p>What are you hoping to feel?</p>
              </div>
            </div>
            <div className="mood-grid">
              {moods.map((item) => (
                <ChoiceButton
                  key={item}
                  selected={partner2.mood === item}
                  onClick={() => setPartner2({ ...partner2, mood: item })}
                >
                  {item}
                </ChoiceButton>
              ))}
            </div>
          </section>
          <div className="sticky-action">
            <PrimaryButton onClick={showInitialIdea} disabled={!p2Ready}>
              Find our date
            </PrimaryButton>
          </div>
        </main>
      )}

      {renderedScreen === "reveal" && currentIdea && (
        <main className="reveal-page">
          <Progress step={3} />
          <button
            className="back-button reveal-back"
            onClick={() => navigate(usedSamplePartner ? "handoff" : "partner2")}
          >
            <ArrowIcon direction="left" />{" "}
            {usedSamplePartner ? "Back to handoff" : "Back to partner two"}
          </button>
          <div className={`reveal-hero ${currentIdea.accent}`}>
            <div className="reveal-topline">
              <span>
                <SparkIcon /> Your date is ready
              </span>
              <span>Matched for both of you</span>
            </div>
            <div className="reveal-title">
              <p>Tonight’s plan</p>
              <h2>{currentIdea.title}</h2>
              <p className="invitation">{currentIdea.invitation}</p>
            </div>
            <div className="date-facts">
              <div>
                <span>Estimated cost</span>
                <b>{currentIdea.cost === 0 ? "Free" : `$${currentIdea.cost} total`}</b>
              </div>
              <div>
                <span>Time</span>
                <b>{formatDuration(currentIdea.duration)}</b>
              </div>
              <div>
                <span>Setting</span>
                <b>{currentIdea.location}</b>
              </div>
            </div>
            <p className="cost-assumption">{currentIdea.costAssumption}</p>
          </div>
          <div className="reveal-content">
            <section className="fit-note">
              <span>
                <SparkIcon />
              </span>
              <div>
                <p>Why it fits you both</p>
                <h3>{currentIdea.fit}</h3>
              </div>
            </section>
            <div className="reveal-columns">
              <section>
                <p className="section-label">Before you begin</p>
                <h3>What to prepare</h3>
                <ul className="prepare-list">
                  {currentIdea.prepare.map((item) => (
                    <li key={item}>
                      <span>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <p className="section-label">Your evening, off script</p>
                <h3>Three simple steps</h3>
                <div className="steps-list">
                  {currentIdea.steps.map((step, index) => (
                    <div key={step.title}>
                      <span>0{index + 1}</span>
                      <div>
                        <h4>{step.title}</h4>
                        <p>
                          {step.detail}{" "}
                          {"minutes" in step && (
                            <b className="step-time">About {step.minutes} min</b>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            {"twist" in currentIdea && currentIdea.twist && (
              <section className="twist-note">
                <p className="section-label">Optional twist</p>
                <h3>{currentIdea.twist}</h3>
                <span>No extra time or spending needed.</span>
              </section>
            )}
            <div className="reveal-actions">
              <PrimaryButton onClick={saveCurrent}>Let’s do this</PrimaryButton>
              <button className="outline-button" onClick={showAnotherIdea}>
                <SparkIcon /> Another idea
              </button>
              {!rotationNotice && (
                <button className="text-button" onClick={() => navigate("setup")}>
                  Adjust our evening
                </button>
              )}
            </div>
            {rotationNotice && (
              <section className="rotation-notice" role="status" aria-live="polite">
                <div>
                  <span>
                    <SparkIcon />
                  </span>
                  <p>
                    {rotationNotice === "only"
                      ? "This is our only match for your current choices."
                      : "You’ve seen all the dates that fit your choices."}
                  </p>
                </div>
                <div className="rotation-notice-actions">
                  <button className="text-button" onClick={() => navigate("setup")}>
                    Adjust choices
                  </button>
                  {rotationNotice === "exhausted" && (
                    <button className="outline-button" onClick={restartRotation}>
                      Show these again
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      )}

      {renderedScreen === "reveal" && !currentIdea && (
        <main className="no-match page">
          <Progress step={3} />
          <button
            className="back-button"
            onClick={() => navigate(usedSamplePartner ? "handoff" : "partner2")}
          >
            <ArrowIcon direction="left" />{" "}
            {usedSamplePartner ? "Back to handoff" : "Back to partner two"}
          </button>
          <div className="no-match-mark">
            <SparkIcon />
          </div>
          <p className="eyebrow">A little too specific</p>
          <h2>
            Nothing fits <em>just yet.</em>
          </h2>
          <p>
            We couldn’t find an idea within your budget, time, setting, energy, and activity
            choices. Try adjusting one guardrail—we’ll never quietly relax it.
          </p>
          <PrimaryButton onClick={() => navigate("setup")}>Adjust our evening</PrimaryButton>
        </main>
      )}

      {renderedScreen === "saved" && (
        <main className="saved-page page">
          <div className="saved-heading">
            <div>
              <p className="eyebrow">A little collection of possibility</p>
              <h2>
                Saved <em>dates.</em>
              </h2>
              <p>Plans you said yes to, ready whenever you are.</p>
            </div>
            {saved.length > 0 && (
              <PrimaryButton onClick={startNewDate}>Plan another date</PrimaryButton>
            )}
          </div>
          {saved.length === 0 ? (
            <section className="empty-state">
              <div className="empty-tickets" aria-hidden="true">
                <span />
                <span />
                <SparkIcon />
              </div>
              <h3>Your next story starts here.</h3>
              <p>
                No saved dates yet. Tell us how you’re both feeling and we’ll find a plan worth
                keeping.
              </p>
              <PrimaryButton onClick={startNewDate}>Find our first date</PrimaryButton>
            </section>
          ) : (
            <div className="saved-grid">
              {saved.map((date, index) => (
                <article
                  className={`saved-card ${date.completed ? "completed" : ""}`}
                  key={date.id}
                >
                  <div className="saved-card-top">
                    <span>Date {String(index + 1).padStart(2, "0")}</span>
                    <BookmarkIcon filled />
                  </div>
                  <h3>{date.title}</h3>
                  <p>{date.invitation}</p>
                  <div className="saved-meta">
                    <span>{date.cost === 0 ? "Free" : `$${date.cost}`}</span>
                    <span>{formatDuration(date.duration)}</span>
                    <span>{date.location}</span>
                  </div>
                  <button className="view-plan-button" onClick={() => openSavedPlan(date.id)}>
                    <span>View date plan</span>
                    <ArrowIcon />
                  </button>
                  {!date.completed ? (
                    <button
                      className="complete-button"
                      onClick={() => updateSaved(date.id, { completed: true })}
                    >
                      <span>Mark as completed</span>
                      <span>✓</span>
                    </button>
                  ) : (
                    <div className="feedback">
                      <div className="complete-label">
                        <span>✓</span> Date completed
                      </div>
                      <p>How did it feel?</p>
                      <div>
                        <button
                          className={date.feedback === "again" ? "selected" : ""}
                          onClick={() => updateSaved(date.id, { feedback: "again" })}
                        >
                          Would do again
                        </button>
                        <button
                          className={date.feedback === "different" ? "selected" : ""}
                          onClick={() => updateSaved(date.id, { feedback: "different" })}
                        >
                          Try something different next time
                        </button>
                      </div>
                      {date.feedback && (
                        <p className="undo-note">Undoing completion will clear your feedback.</p>
                      )}
                      <button className="undo-button" onClick={() => undoCompletion(date.id)}>
                        Undo completion
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>
      )}

      {renderedScreen === "savedPlan" && viewedSavedDate && (
        <main className="reveal-page saved-plan-page">
          <div className="saved-plan-nav">
            <button className="back-button" onClick={() => navigate("saved")}>
              <ArrowIcon direction="left" /> Back to saved dates
            </button>
            <span>
              <BookmarkIcon filled /> Saved plan
            </span>
          </div>
          <div className={`reveal-hero ${viewedSavedDate.accent}`}>
            <div className="reveal-topline">
              <span>
                <BookmarkIcon filled /> Your saved date
              </span>
              <span>{viewedSavedDate.completed ? "Completed" : "Ready when you are"}</span>
            </div>
            <div className="reveal-title">
              <p>Saved plan</p>
              <h2>{viewedSavedDate.title}</h2>
              <p className="invitation">{viewedSavedDate.invitation}</p>
            </div>
            <div className="date-facts">
              <div>
                <span>Estimated cost</span>
                <b>{viewedSavedDate.cost === 0 ? "Free" : `$${viewedSavedDate.cost} total`}</b>
              </div>
              <div>
                <span>Duration</span>
                <b>{formatDuration(viewedSavedDate.duration)}</b>
              </div>
              <div>
                <span>Setting</span>
                <b>{viewedSavedDate.location}</b>
              </div>
            </div>
            {"costAssumption" in viewedSavedDate && viewedSavedDate.costAssumption && (
              <p className="cost-assumption">{viewedSavedDate.costAssumption}</p>
            )}
          </div>
          <div className="reveal-content">
            <section className="fit-note">
              <span>
                <SparkIcon />
              </span>
              <div>
                <p>Why it fits you both</p>
                <h3>{viewedSavedDate.fit}</h3>
              </div>
            </section>
            <div className="reveal-columns">
              <section>
                <p className="section-label">Before you begin</p>
                <h3>What to prepare</h3>
                <ul className="prepare-list">
                  {viewedSavedDate.prepare.map((item) => (
                    <li key={item}>
                      <span>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <p className="section-label">Your evening, off script</p>
                <h3>Three simple steps</h3>
                <div className="steps-list">
                  {viewedSavedDate.steps.map((step, index) => (
                    <div key={step.title}>
                      <span>0{index + 1}</span>
                      <div>
                        <h4>{step.title}</h4>
                        <p>
                          {step.detail}{" "}
                          {"minutes" in step && (
                            <b className="step-time">About {step.minutes} min</b>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            {"twist" in viewedSavedDate && viewedSavedDate.twist && (
              <section className="twist-note">
                <p className="section-label">Optional twist</p>
                <h3>{viewedSavedDate.twist}</h3>
                <span>No extra time or spending needed.</span>
              </section>
            )}
            <section className="saved-plan-status">
              {viewedSavedDate.completed ? (
                <>
                  <div>
                    <span className="status-mark">✓</span>
                    <div>
                      <p className="section-label">Date status</p>
                      <h3>Completed</h3>
                      {viewedSavedDate.feedback && (
                        <p>
                          Your feedback:{" "}
                          <b>
                            {viewedSavedDate.feedback === "again"
                              ? "Would do again"
                              : "Try something different next time"}
                          </b>
                        </p>
                      )}
                      <div className="detail-feedback">
                        <p>Change your feedback</p>
                        <button
                          className={viewedSavedDate.feedback === "again" ? "selected" : ""}
                          onClick={() => updateSaved(viewedSavedDate.id, { feedback: "again" })}
                        >
                          Would do again
                        </button>
                        <button
                          className={viewedSavedDate.feedback === "different" ? "selected" : ""}
                          onClick={() => updateSaved(viewedSavedDate.id, { feedback: "different" })}
                        >
                          Try something different next time
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="undo-group">
                    {viewedSavedDate.feedback && (
                      <p>Undoing completion will clear your feedback.</p>
                    )}
                    <button
                      className="outline-button"
                      onClick={() => undoCompletion(viewedSavedDate.id)}
                    >
                      Undo completion
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="status-mark open" />
                    <div>
                      <p className="section-label">Date status</p>
                      <h3>Still planning</h3>
                    </div>
                  </div>
                  <button
                    className="outline-button"
                    onClick={() => updateSaved(viewedSavedDate.id, { completed: true })}
                  >
                    Mark as completed
                  </button>
                </>
              )}
            </section>
            <div className="saved-plan-back">
              <button className="text-button" onClick={() => navigate("saved")}>
                <ArrowIcon direction="left" /> Back to saved dates
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
