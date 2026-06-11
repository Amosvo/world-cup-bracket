"use client";

import { useEffect, useRef, useState } from "react";
import { getDisplayNameError, normalizeDisplayName } from "./lib/displayName";

const SUBMISSION_DEADLINE = new Date("2026-06-27T23:59:00-05:00");

const roundOf32 = [
  ["2A", "2B"],
  ["1C", "2F"],
  ["1E", "3RD A/B/C/D/F"],
  ["1F", "2C"],
  ["2E", "2I"],
  ["1I", "3RD C/D/F/G/H"],
  ["1A", "3RD C/E/F/H/I"],
  ["1L", "3RD E/H/I/J/K"],
  ["1G", "3RD A/E/H/I/J"],
  ["1D", "3RD B/E/F/I/J"],
  ["1H", "2J"],
  ["2K", "2L"],
  ["1B", "3RD E/F/G/I/J"],
  ["2D", "2G"],
  ["1J", "2H"],
  ["1K", "3RD D/E/I/J/L"],
];

const roundMeta = {
  r32: [
    { matchNo: 73, date: "Jun 28 - 2:00 PM" },
    { matchNo: 76, date: "Jun 29 - 12:00 PM" },
    { matchNo: 74, date: "Jun 29 - 3:30 PM" },
    { matchNo: 75, date: "Jun 29 - 8:00 PM" },
    { matchNo: 78, date: "Jun 30 - 12:00 PM" },
    { matchNo: 77, date: "Jun 30 - 4:00 PM" },
    { matchNo: 79, date: "Jun 30 - 8:00 PM" },
    { matchNo: 80, date: "Jul 1 - 11:00 AM" },
    { matchNo: 82, date: "Jul 1 - 3:00 PM" },
    { matchNo: 81, date: "Jul 1 - 7:00 PM" },
    { matchNo: 84, date: "Jul 2 - 2:00 PM" },
    { matchNo: 83, date: "Jul 2 - 6:00 PM" },
    { matchNo: 85, date: "Jul 2 - 10:00 PM" },
    { matchNo: 88, date: "Jul 3 - 1:00 PM" },
    { matchNo: 86, date: "Jul 3 - 5:00 PM" },
    { matchNo: 87, date: "Jul 3 - 8:30 PM" },
  ],
  r16: [
    { matchNo: 90, date: "Jul 4 - 12:00 PM" },
    { matchNo: 89, date: "Jul 4 - 4:00 PM" },
    { matchNo: 91, date: "Jul 5 - 3:00 PM" },
    { matchNo: 92, date: "Jul 5 - 7:00 PM" },
    { matchNo: 93, date: "Jul 6 - 2:00 PM" },
    { matchNo: 94, date: "Jul 6 - 7:00 PM" },
    { matchNo: 95, date: "Jul 7 - 11:00 AM" },
    { matchNo: 96, date: "Jul 7 - 3:00 PM" },
  ],
  qf: [
    { matchNo: 97, date: "Jul 9 - 3:00 PM" },
    { matchNo: 98, date: "Jul 10 - 2:00 PM" },
    { matchNo: 99, date: "Jul 11 - 4:00 PM" },
    { matchNo: 100, date: "Jul 11 - 8:00 PM" },
  ],
  sf: [
    { matchNo: 101, date: "Jul 14 - 2:00 PM" },
    { matchNo: 102, date: "Jul 15 - 2:00 PM" },
  ],
  final: [{ matchNo: 104, date: "Jul 19 - 2:00 PM" }],
};

type RoundKey = "r32" | "r16" | "qf" | "sf" | "final";

type LeaderboardEntry = {
  id: string;
  name: string;
  champion: string;
  points: number;
};

type MatchMeta = {
  matchNo: number;
  date: string;
};

function randomPick(match: string[]) {
  return match[Math.floor(Math.random() * match.length)];
}

function getTimeRemaining() {
  const total = Math.max(
    0,
    SUBMISSION_DEADLINE.getTime() - new Date().getTime()
  );

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
  };
}

export default function Home() {
  const [r32Winners, setR32Winners] = useState<string[]>(Array(16).fill(""));
  const [r16Winners, setR16Winners] = useState<string[]>(Array(8).fill(""));
  const [qfWinners, setQfWinners] = useState<string[]>(Array(4).fill(""));
  const [sfWinners, setSfWinners] = useState<string[]>(Array(2).fill(""));
  const [champion, setChampion] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [mobileRound, setMobileRound] = useState<RoundKey>("r32");
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());
  const mobileBracketRef = useRef<HTMLElement | null>(null);

  const submissionsClosed = timeLeft.total <= 0;

  const totalPicks = 31;

  const completedPicks =
    r32Winners.filter(Boolean).length +
    r16Winners.filter(Boolean).length +
    qfWinners.filter(Boolean).length +
    sfWinners.filter(Boolean).length +
    (champion ? 1 : 0);

  const completionPercent = Math.round((completedPicks / totalPicks) * 100);
  async function loadLeaderboard() {
    try {
      setIsLoadingLeaderboard(true);
      const response = await fetch("/api/leaderboard");
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    fetch("/api/leaderboard")
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && data.success) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch((error) => {
        console.error("Failed to load leaderboard:", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingLeaderboard(false);
        }
      });

    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  if (submissionsClosed) {
    return (
      <FullLeaderboardView
        leaderboard={leaderboard}
        isLoadingLeaderboard={isLoadingLeaderboard}
        loadLeaderboard={loadLeaderboard}
      />
    );
  }

  function pickWinner(round: string, index: number, team: string) {
    if (team.includes("TBD")) return;

    setSubmitted(false);

    if (round === "r32") {
      const updated = [...r32Winners];
      updated[index] = team;
      setR32Winners(updated);
    }

    if (round === "r16") {
      const updated = [...r16Winners];
      updated[index] = team;
      setR16Winners(updated);
    }

    if (round === "qf") {
      const updated = [...qfWinners];
      updated[index] = team;
      setQfWinners(updated);
    }

    if (round === "sf") {
      const updated = [...sfWinners];
      updated[index] = team;
      setSfWinners(updated);
    }

    if (round === "final") {
      setChampion(team);
    }
  }

  function autoSelectBracket() {
    setError("");
    setSubmitted(false);

    const autoR32 = roundOf32.map((match) => randomPick(match));

    const autoR16Matches = Array.from({ length: 8 }, (_, i) => [
      autoR32[i * 2],
      autoR32[i * 2 + 1],
    ]);
    const autoR16 = autoR16Matches.map((match) => randomPick(match));

    const autoQfMatches = Array.from({ length: 4 }, (_, i) => [
      autoR16[i * 2],
      autoR16[i * 2 + 1],
    ]);
    const autoQf = autoQfMatches.map((match) => randomPick(match));

    const autoSfMatches = Array.from({ length: 2 }, (_, i) => [
      autoQf[i * 2],
      autoQf[i * 2 + 1],
    ]);
    const autoSf = autoSfMatches.map((match) => randomPick(match));

    const autoChampion = randomPick(autoSf);

    setR32Winners(autoR32);
    setR16Winners(autoR16);
    setQfWinners(autoQf);
    setSfWinners(autoSf);
    setChampion(autoChampion);
  }

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    if (!name.trim()) {
      setError("Please enter your name or nickname.");
      setIsSubmitting(false);
      return;
    }

    const nameError = getDisplayNameError(name);

    if (nameError) {
      setError(nameError);
      setIsSubmitting(false);
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      setIsSubmitting(false);
      return;
    }

    if (!champion) {
      setError("Please pick a champion before submitting.");
      setIsSubmitting(false);
      return;
    }

    if (
      r32Winners.includes("") ||
      r16Winners.includes("") ||
      qfWinners.includes("") ||
      sfWinners.includes("")
    ) {
      setError("Please complete every round before submitting.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/submit-bracket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizeDisplayName(name),
          email: email.trim(),
          champion,
          roundOf32: r32Winners,
          roundOf16: r16Winners,
          quarterfinals: qfWinners,
          semifinals: sfWinners,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        loadLeaderboard();

        setTimeout(() => {
          document
            .getElementById("submit")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        setError(data.error || "Failed to submit bracket.");
      }
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetBracket() {
    setR32Winners(Array(16).fill(""));
    setR16Winners(Array(8).fill(""));
    setQfWinners(Array(4).fill(""));
    setSfWinners(Array(2).fill(""));
    setChampion("");
    setSubmitted(false);
    setError("");
    setMobileRound("r32");
  }

  const r16Matches = Array.from({ length: 8 }, (_, i) => [
    r32Winners[i * 2] || "Winner TBD",
    r32Winners[i * 2 + 1] || "Winner TBD",
  ]);

  const qfMatches = Array.from({ length: 4 }, (_, i) => [
    r16Winners[i * 2] || "Winner TBD",
    r16Winners[i * 2 + 1] || "Winner TBD",
  ]);

  const sfMatches = Array.from({ length: 2 }, (_, i) => [
    qfWinners[i * 2] || "Winner TBD",
    qfWinners[i * 2 + 1] || "Winner TBD",
  ]);

  const finalMatch = [
    sfWinners[0] || "Winner TBD",
    sfWinners[1] || "Winner TBD",
  ];

  const mobileRounds = [
    {
      key: "r32" as RoundKey,
      title: "Round of 32",
      matches: roundOf32,
      winners: r32Winners,
      meta: roundMeta.r32,
    },
    {
      key: "r16" as RoundKey,
      title: "Round of 16",
      matches: r16Matches,
      winners: r16Winners,
      meta: roundMeta.r16,
    },
    {
      key: "qf" as RoundKey,
      title: "Quarterfinals",
      matches: qfMatches,
      winners: qfWinners,
      meta: roundMeta.qf,
    },
    {
      key: "sf" as RoundKey,
      title: "Semifinals",
      matches: sfMatches,
      winners: sfWinners,
      meta: roundMeta.sf,
    },
    {
      key: "final" as RoundKey,
      title: "Final",
      matches: [finalMatch],
      winners: [champion],
      meta: roundMeta.final,
    },
  ];

  const currentMobileRoundIndex = mobileRounds.findIndex(
    (round) => round.key === mobileRound
  );
  const currentMobileRound = mobileRounds[currentMobileRoundIndex];

  function navigateMobileRound(round: RoundKey) {
    setMobileRound(round);

    window.setTimeout(() => {
      mobileBracketRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  return (
    <main className="min-h-screen bg-[var(--app-page)] text-[var(--app-text)]">
      <header className="bg-[var(--app-green)] px-5 pb-7 pt-7 text-white md:px-8 md:pb-8 md:pt-5">
        <div className="mx-auto max-w-[1800px]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.4rem] bg-white/10 shadow-inner ring-1 ring-white/15 md:h-20 md:w-20">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[conic-gradient(from_20deg,#f2673a_0_17%,#eef0e8_17%_35%,#a5aaa2_35%_52%,#1b9fcb_52%_70%,#13b37f_70%_86%,#eef0e8_86%_100%)] shadow-[0_10px_24px_rgba(0,0,0,0.35)] md:h-14 md:w-14">
                  <div className="h-5 w-5 rounded-full bg-[var(--app-green)] md:h-6 md:w-6" />
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--app-accent)]">
                  2026
                </p>
                <h1 className="text-[2.65rem] font-black leading-none tracking-normal md:text-7xl">
                  World Cup
                </h1>
              </div>
            </div>

            <a
              href="#leaderboard"
              className="hidden rounded-full bg-[var(--app-button)] px-5 py-3 text-sm font-black text-[var(--app-button-text)] shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition hover:bg-[var(--app-accent)] sm:inline-flex"
            >
              Leaderboard
            </a>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="max-w-2xl text-base font-bold text-white/85 md:text-lg">
                Can you predict the champion?! Once the group stage finishes on
                June 27, the qualified teams will automatically replace the
                placeholders. From there, you can fill out the knockout bracket
                and predict the 2026 World Cup champion!
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--app-accent)]/70 bg-[var(--app-surface-deep)]/85 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--app-accent)]">
                Deadline
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                Jun 27, 2026 at 11:59 PM CDT
              </p>
              <p
                suppressHydrationWarning
                className="mt-2 text-3xl font-black leading-none text-white"
              >
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-[var(--app-sticky)] px-3 pb-2 pt-3 shadow-[0_12px_28px_var(--app-shadow)] backdrop-blur md:hidden">
        <div className="mb-3 flex justify-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={autoSelectBracket}
            className="shrink-0 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-button)] px-4 py-2 text-xs font-black text-[var(--app-button-text)] shadow-sm transition active:bg-[var(--app-accent)]"
          >
            Auto Select
          </button>

          <button
            type="button"
            onClick={resetBracket}
            className="shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-button)] px-4 py-2 text-xs font-black text-[var(--app-button-text)] shadow-sm transition active:bg-[var(--app-accent)]"
          >
            Reset
          </button>

          <a
            href="#submit"
            className="shrink-0 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-button)] px-4 py-2 text-xs font-black text-[var(--app-button-text)] shadow-sm transition active:bg-[var(--app-accent)]"
          >
            Submit
          </a>
        </div>

        <RoundStageRail
          rounds={mobileRounds}
          activeRound={mobileRound}
          onSelect={setMobileRound}
          compact
        />
      </div>

      <div className="sticky top-0 z-40 hidden border-b border-[var(--app-gold-border)] bg-[var(--app-sticky)] px-8 py-3 shadow-[0_12px_28px_var(--app-shadow)] backdrop-blur md:block">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.16em] text-[var(--app-muted-strong)]">
              <span>Bracket Progress</span>
              <span>{completedPicks}/31</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[var(--app-border)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--app-accent)] via-white to-[var(--app-accent)] transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={autoSelectBracket}
              className="shrink-0 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-button)] px-4 py-2 text-xs font-black text-[var(--app-button-text)] shadow-sm transition active:bg-[var(--app-accent)]"
            >
              Auto Select
            </button>

            <button
              type="button"
              onClick={resetBracket}
              className="shrink-0 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-button)] px-4 py-2 text-xs font-black text-[var(--app-button-text)] shadow-sm transition active:bg-[var(--app-accent)]"
            >
              Reset
            </button>

            <a
              href="#submit"
              className="shrink-0 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-button)] px-4 py-2 text-xs font-black text-[var(--app-button-text)] shadow-sm transition active:bg-[var(--app-accent)]"
            >
              Submit
            </a>
          </div>
        </div>
      </div>

      <section
        ref={mobileBracketRef}
        className="scroll-mt-40 px-4 pb-7 pt-6 md:hidden"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black leading-none tracking-normal">
              Bracket
            </h2>
          </div>

          <a
            href="#leaderboard"
            className="rounded-full bg-[var(--app-accent)] px-4 py-2.5 text-sm font-black text-[var(--app-button-text)] shadow-sm"
          >
            Leaderboard
          </a>
        </div>

        <MobileRound
          title={currentMobileRound.title}
          matches={currentMobileRound.matches}
          winners={currentMobileRound.winners}
          roundKey={currentMobileRound.key}
          meta={currentMobileRound.meta}
          onPick={pickWinner}
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={currentMobileRoundIndex === 0}
            onClick={() =>
              navigateMobileRound(mobileRounds[currentMobileRoundIndex - 1].key)
            }
            className="rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-button)] px-4 py-4 text-sm font-black text-[var(--app-button-text)] shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <button
            type="button"
            disabled={currentMobileRoundIndex === mobileRounds.length - 1}
            onClick={() =>
              navigateMobileRound(mobileRounds[currentMobileRoundIndex + 1].key)
            }
            className="rounded-2xl bg-[var(--app-surface-deep)] px-4 py-4 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next Round
          </button>
        </div>
      </section>

      <section className="hidden px-6 py-8 md:block">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--app-accent)]">
                Bracket
              </p>
              <h2 className="mt-2 text-4xl font-black">Knockout Predictor</h2>
            </div>
            <p className="max-w-md text-right text-sm font-medium text-[var(--app-muted-strong)]">
              Desktop keeps the full bracket in view with cleaner match lanes
              and connector lines.
            </p>
          </div>

          <div className="overflow-x-auto rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_22px_70px_var(--app-shadow)]">
            <div className="grid min-w-[1600px] grid-cols-5 items-center gap-16">
              <Round
                title="Round of 32"
                matches={roundOf32}
                winners={r32Winners}
                roundKey="r32"
                meta={roundMeta.r32}
                onPick={pickWinner}
              />

              <Round
                title="Round of 16"
                matches={r16Matches}
                winners={r16Winners}
                roundKey="r16"
                meta={roundMeta.r16}
                onPick={pickWinner}
              />

              <Round
                title="Quarterfinals"
                matches={qfMatches}
                winners={qfWinners}
                roundKey="qf"
                meta={roundMeta.qf}
                onPick={pickWinner}
              />

              <Round
                title="Semifinals"
                matches={sfMatches}
                winners={sfWinners}
                roundKey="sf"
                meta={roundMeta.sf}
                onPick={pickWinner}
              />

              <Round
                title="Final"
                matches={[finalMatch]}
                winners={[champion]}
                roundKey="final"
                meta={roundMeta.final}
                onPick={pickWinner}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 pb-8 md:px-6">
        <div className="mx-auto grid max-w-[1800px] gap-5 lg:grid-cols-2">
          <ChampionCard champion={champion} />

          <SubmitCard
            submitted={submitted}
            name={name}
            email={email}
            champion={champion}
            error={error}
            isSubmitting={isSubmitting}
            setSubmitted={setSubmitted}
            setName={setName}
            setEmail={setEmail}
            handleSubmit={handleSubmit}
          />
        </div>

        <section
          id="leaderboard"
          className="mx-auto mt-6 max-w-[1800px] rounded-[1.5rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-[var(--app-panel-text)] shadow-[0_18px_50px_var(--app-shadow)] md:rounded-[2rem] md:p-6"
        >
          <div className="rounded-[1.25rem] border border-[var(--app-gold-border)] bg-[var(--app-surface-strong)] p-4 shadow-[0_18px_44px_var(--app-shadow)] md:rounded-[1.5rem] md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--app-accent)]">
                  Leaderboard
                </p>

                <h2 className="mt-2 text-3xl font-black">Current Top 3</h2>

                <p className="mt-2 max-w-2xl text-sm font-medium text-[var(--app-muted)]">
                  Standings pull from Notion and update when Total Points are
                  updated.
                </p>
              </div>

              <button
                type="button"
                onClick={loadLeaderboard}
                className="rounded-full border border-[var(--app-border-strong)] bg-[var(--app-button)] px-5 py-3 text-sm font-black text-[var(--app-button-text)] shadow-[0_10px_24px_var(--app-shadow)] transition hover:bg-[var(--app-accent)] active:bg-[var(--app-accent)]"
              >
                Refresh
              </button>
            </div>
          </div>

          <LeaderboardGrid
            leaderboard={leaderboard.slice(0, 3)}
            isLoadingLeaderboard={isLoadingLeaderboard}
          />
        </section>

        <FooterNote />
      </div>
    </main>
  );
}

function ChampionCard({ champion }: { champion: string }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-panel-text)] shadow-[0_18px_50px_var(--app-shadow)] md:rounded-[2rem]">
      <div className="border-b border-[var(--app-gold-border)] bg-[var(--app-surface-strong)] px-5 py-3">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--app-accent)]">
          Champion Pick
        </p>
      </div>

      <div className="p-5 md:p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[var(--app-gold-border)] bg-[var(--app-border)]">
            <div className="h-9 w-9 rounded-full bg-[conic-gradient(from_20deg,#ffab00,#ffffff,#ffab00,#ffab00)]" />
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--app-muted-strong)]">
              Your predicted winner
            </p>
            <p
              className={`mt-1 text-4xl font-black leading-none tracking-normal md:text-5xl ${
                champion ? "text-[var(--app-panel-text)]" : "text-[var(--app-muted-strong)]"
              }`}
            >
              {champion || "Select Champion"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--app-gold-border)] bg-[var(--app-surface-strong)] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--app-accent)]">
            Final Status
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--app-muted)]">
            {champion
              ? "Champion selected and ready for submission."
              : "Choose the Final winner to unlock your champion."}
          </p>
        </div>
      </div>
    </div>
  );
}

function SubmitCard({
  submitted,
  name,
  email,
  champion,
  error,
  isSubmitting,
  setSubmitted,
  setName,
  setEmail,
  handleSubmit,
}: {
  submitted: boolean;
  name: string;
  email: string;
  champion: string;
  error: string;
  isSubmitting: boolean;
  setSubmitted: (value: boolean) => void;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  handleSubmit: () => void;
}) {
  return (
    <div
      id="submit"
      className="rounded-[1.5rem] border border-[var(--app-border)] bg-[var(--app-panel)] p-5 text-[var(--app-panel-text)] shadow-[0_16px_44px_var(--app-shadow)] md:rounded-[2rem] md:p-6"
    >
      {submitted ? (
        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--app-accent)]">
            Submission Received
          </p>

          <h2 className="text-3xl font-black">Bracket Submitted</h2>

          <div className="mt-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-input)] p-5 text-[var(--app-text)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--app-muted-strong)]">
              Name
            </p>
            <p className="text-xl font-black">{name}</p>

            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--app-muted-strong)]">
              Champion Pick
            </p>
            <p className="text-xl font-black">{champion}</p>
          </div>

          <p className="mt-4 text-sm font-medium text-[var(--app-muted)]">
            Thank you for participating in the World Cup Knockout Challenge.
          </p>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-deep)] px-4 py-4 text-sm font-black text-white transition hover:bg-[var(--app-green)]"
          >
            Edit Bracket
          </button>
        </div>
      ) : (
        <>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--app-accent)]">
            Entry
          </p>
          <h2 className="mb-5 whitespace-nowrap text-2xl font-black sm:text-3xl">
            Submit Your Bracket
          </h2>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-[var(--app-muted)]">
              Name / Nickname
            </label>

            <input
              type="text"
              autoComplete="name"
              maxLength={25}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-input)] px-4 py-4 text-base font-bold text-[var(--app-panel-text)] outline-none transition placeholder:text-[var(--app-muted-strong)] focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-accent)]/20"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-[var(--app-muted)]">
              Email
            </label>

            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-input)] px-4 py-4 text-base font-bold text-[var(--app-panel-text)] outline-none transition placeholder:text-[var(--app-muted-strong)] focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-accent)]/20"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500 md:text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[var(--app-accent)] px-4 py-4 text-sm font-black text-[var(--app-button-text)] transition hover:bg-[var(--app-button)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Bracket"}
          </button>
        </>
      )}
    </div>
  );
}

function MatchHeader({ meta, index }: { meta: MatchMeta[]; index: number }) {
  const [date = "", time = ""] = (meta[index]?.date || "").split(" - ");

  return (
    <div className="mb-1.5 flex items-start justify-between gap-3 border-b border-[var(--app-border-strong)] pb-1.5 md:mb-3 md:pb-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-muted-strong)] md:text-[11px]">
        Match {meta[index]?.matchNo || index + 1}
      </p>

      <div className="text-right">
        <p className="text-xs font-black text-[var(--app-panel-text)] md:text-sm">
          {date}
        </p>
        <p className="text-xs font-black text-[var(--app-panel-text)] md:text-sm md:text-[var(--app-accent)]">
          {time}
        </p>
      </div>
    </div>
  );
}

function RoundStageRail({
  rounds,
  activeRound,
  onSelect,
  compact = false,
}: {
  rounds: {
    key: RoundKey;
    title: string;
    matches: string[][];
    winners: string[];
    meta: MatchMeta[];
  }[];
  activeRound: RoundKey;
  onSelect: (round: RoundKey) => void;
  compact?: boolean;
}) {
  const roundButtonRefs = useRef<Record<RoundKey, HTMLButtonElement | null>>({
    r32: null,
    r16: null,
    qf: null,
    sf: null,
    final: null,
  });

  useEffect(() => {
    roundButtonRefs.current[activeRound]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeRound]);

  return (
    <div
      className={`${compact ? "" : "mb-6"} round-rail-scroll overflow-x-auto`}
    >
      <div
        className={`flex w-max snap-x snap-mandatory items-end gap-2 rounded-[1.6rem] bg-[var(--app-rail)] p-2 ${
          compact ? "min-w-full" : "min-w-[680px]"
        }`}
      >
        {rounds.map((round) => {
          const isActive = activeRound === round.key;
          const picked = round.winners.filter(Boolean).length;
          const completion = picked / round.matches.length;
          const filledBars = picked > 0 ? Math.ceil(completion * 5) : 0;

          return (
            <button
              ref={(button) => {
                roundButtonRefs.current[round.key] = button;
              }}
              key={round.key}
              type="button"
              onClick={() => onSelect(round.key)}
              className={`snap-center rounded-[1.35rem] px-3 text-left transition ${
                isActive
                  ? "bg-[var(--app-green)] text-white shadow-[0_14px_28px_rgba(0,89,46,0.24)]"
                  : "text-[var(--app-rail-muted)]"
              } ${compact ? "min-h-14 w-[122px] py-2" : "min-h-24 flex-1 py-3"}`}
            >
              <span
                className={`block font-black leading-tight ${
                  compact ? "text-[11px]" : "text-sm"
                }`}
              >
                {round.title}
              </span>

              <span
                className={`flex items-center gap-1.5 ${
                  compact ? "mt-1.5 h-3.5" : "mt-4 h-7"
                }`}
              >
                {Array.from({ length: 5 }).map((_, index) => {
                  const isFilled = index < filledBars;

                  return (
                    <span
                      key={`${round.key}-bar-${index}`}
                      className={`h-1.5 rounded-full transition ${
                        isFilled
                          ? isActive
                            ? "bg-[var(--app-accent)]"
                            : "bg-[var(--app-green)]"
                          : isActive
                            ? "bg-white/35"
                            : "bg-white/80"
                      }`}
                      style={{
                        width: `${Math.max(compact ? 10 : 22, (compact ? 24 : 46) - index * 5)}px`,
                      }}
                    />
                  );
                })}
              </span>

              <span
                className={`mt-2 block text-[11px] font-black uppercase tracking-[0.14em] ${
                  isActive ? "text-[var(--app-accent)]" : "text-[var(--app-rail-muted)]"
                }`}
              >
                {picked}/{round.matches.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TeamPickButton({
  team,
  selected,
  onClick,
  compact = false,
}: {
  team: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const isDisabled = team.includes("TBD");

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
        selected
          ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-button-text)] shadow-[0_10px_22px_rgba(255,171,0,0.28)]"
          : "border-[var(--app-border)] bg-[var(--app-team)] text-[var(--app-team-text)] hover:border-[var(--app-accent)] md:hover:bg-[var(--app-border-strong)]"
      } ${compact ? "md:rounded-xl md:px-3 md:py-2.5" : ""}`}
    >
      <span
        className={`grid shrink-0 place-items-center rounded-full font-black ${
          compact ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-[11px]"
        } ${
          selected
            ? "bg-[var(--app-surface-deep)] text-white"
            : "bg-[var(--app-seed)] text-white"
        }`}
      >
        {team.includes("TBD") ? "TBD" : team.slice(0, 3)}
      </span>

      <span
        className={`min-w-0 flex-1 font-black leading-tight ${
          compact ? "text-sm" : "text-lg"
        }`}
      >
        {team}
      </span>
    </button>
  );
}

function MobileRound({
  title,
  matches,
  winners,
  roundKey,
  meta,
  onPick,
}: {
  title: string;
  matches: string[][];
  winners: string[];
  roundKey: string;
  meta: MatchMeta[];
  onPick: (round: string, index: number, team: string) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--app-muted-strong)]">
          {title}
        </p>
        <p className="text-xs font-black text-[var(--app-muted-strong)]">
          {winners.filter(Boolean).length}/{matches.length}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {matches.map((match, index) => (
          <div
            key={`${roundKey}-${index}`}
            className="relative rounded-[1.2rem] bg-[var(--app-surface)] p-2.5 text-[var(--app-panel-text)] shadow-[0_12px_26px_var(--app-shadow)]"
          >
            <MatchHeader meta={meta} index={index} />

            <div className="grid gap-3">
              {match.map((team, teamIndex) => (
                <TeamPickButton
                  key={`${roundKey}-${index}-${teamIndex}`}
                  team={team}
                  selected={winners[index] === team}
                  onClick={() => onPick(roundKey, index, team)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Round({
  title,
  matches,
  winners,
  roundKey,
  meta,
  onPick,
}: {
  title: string;
  matches: string[][];
  winners: string[];
  roundKey: string;
  meta: MatchMeta[];
  onPick: (round: string, index: number, team: string) => void;
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-black text-[var(--app-panel-text)]">{title}</h2>

      <div className="flex flex-col gap-10">
        {matches.map((match, index) => (
          <div
            key={`${roundKey}-${index}`}
            className={`relative rounded-[1.35rem] border border-[var(--app-border)] bg-[var(--app-surface-strong)] p-4 shadow-[0_14px_34px_var(--app-shadow)] transition ${
              title === "Final"
                ? "scale-110 border-[var(--app-accent)]"
                : title === "Semifinals"
                  ? "scale-105"
                  : ""
            }`}
          >
            {title !== "Final" && (
              <>
                <div className="absolute -right-8 top-1/2 hidden h-[2px] w-8 -translate-y-1/2 bg-[var(--app-accent)]/35 lg:block" />

                {index % 2 === 0 ? (
                  <div className="absolute -right-8 top-1/2 hidden h-[calc(100%+40px)] w-[2px] bg-[var(--app-accent)]/20 lg:block" />
                ) : (
                  <div className="absolute -right-8 bottom-1/2 hidden h-[calc(100%+40px)] w-[2px] bg-[var(--app-accent)]/20 lg:block" />
                )}
              </>
            )}

            <MatchHeader meta={meta} index={index} />

            <div className="grid gap-2">
              {match.map((team, teamIndex) => (
                <TeamPickButton
                  key={`${roundKey}-${index}-${teamIndex}`}
                  team={team}
                  selected={winners[index] === team}
                  onClick={() => onPick(roundKey, index, team)}
                  compact
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LeaderboardGrid({
  leaderboard,
  isLoadingLeaderboard,
}: {
  leaderboard: LeaderboardEntry[];
  isLoadingLeaderboard: boolean;
}) {
  if (isLoadingLeaderboard) {
    return (
      <p className="mt-5 text-sm font-bold text-[var(--app-muted)]">
        Loading leaderboard...
      </p>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <p className="mt-5 text-sm font-bold text-[var(--app-muted)]">
        No leaderboard entries yet.
      </p>
    );
  }

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      {leaderboard.map((entry, index) => (
        <div
          key={entry.id}
          className={`rounded-[1.35rem] border p-4 transition-all ${
            index === 0
              ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-button-text)]"
            : index === 1
                ? "border-[#d7dde0] bg-[#e9edf0] text-[#071007]"
                : "border-[#cd7f32] bg-[#cd7f32] text-[#071007]"
          }`}
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">
            Rank {index + 1}
          </p>

          <p className="mt-3 text-2xl font-black">{entry.name}</p>

          <p className="mt-1 text-sm font-bold opacity-70">
            Champion: {entry.champion}
          </p>

          <p className="mt-5 text-3xl font-black">{entry.points} pts</p>
        </div>
      ))}
    </div>
  );
}

function FullLeaderboardView({
  leaderboard,
  isLoadingLeaderboard,
  loadLeaderboard,
}: {
  leaderboard: LeaderboardEntry[];
  isLoadingLeaderboard: boolean;
  loadLeaderboard: () => void;
}) {
  return (
    <main className="min-h-screen bg-[var(--app-page)] text-[var(--app-text)]">
      <div className="bg-[var(--app-green)] px-5 pb-8 pt-6 text-white md:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--app-accent)]">
            2026 World Cup
          </p>

          <h1 className="mt-3 text-5xl font-black leading-none tracking-normal md:text-7xl">
            Leaderboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-medium text-white/70 md:text-base">
            Submissions are closed. Standings are updated as tournament results
            come in.
          </p>

          <button
            type="button"
            onClick={loadLeaderboard}
            className="mt-5 rounded-full bg-[var(--app-button)] px-5 py-3 text-sm font-black text-[var(--app-button-text)] transition hover:bg-[var(--app-accent)]"
          >
            Refresh Leaderboard
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        <div className="mb-5 rounded-[1.5rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-[0_16px_44px_var(--app-shadow)]">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--app-accent)]">
            Coming Next
          </p>
          <h2 className="mt-2 text-2xl font-black">Find My Bracket</h2>
          <p className="mt-2 text-sm font-medium text-[var(--app-muted)]">
            This area is reserved for the post-deadline email lookup flow.
          </p>
        </div>

        {isLoadingLeaderboard ? (
          <p className="text-sm font-bold text-[var(--app-muted)]">
            Loading leaderboard...
          </p>
        ) : leaderboard.length === 0 ? (
          <p className="text-sm font-bold text-[var(--app-muted)]">
            No leaderboard entries yet.
          </p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`rounded-[1.35rem] border p-5 shadow-[0_12px_34px_rgba(0,0,0,0.1)] ${
                  index === 0
                    ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-button-text)]"
                    : index === 1
                      ? "border-[#cfd4d0] bg-[#e9edf0] text-[#071007]"
                      : index === 2
                        ? "border-[#cd7f32] bg-[#cd7f32] text-[#071007]"
                        : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-panel-text)]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.18em] opacity-65">
                      Rank {index + 1}
                    </p>

                    <h2 className="mt-1 truncate text-2xl font-black">
                      {entry.name}
                    </h2>

                    <p className="mt-1 text-sm font-bold opacity-70">
                      Champion Pick: {entry.champion}
                    </p>
                  </div>

                  <p className="shrink-0 text-3xl font-black">
                    {entry.points} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FooterNote />
    </main>
  );
}

function FooterNote() {
  return (
    <footer className="mx-auto max-w-[1800px] px-4 pb-6 pt-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-muted-strong)] md:px-6">
      Design by Amos, do not distribute without permission.
    </footer>
  );
}
