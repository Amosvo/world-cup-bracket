"use client";

import { useEffect, useState } from "react";

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

  const submissionsClosed = new Date() > SUBMISSION_DEADLINE;
const now = new Date();
const timeRemaining = SUBMISSION_DEADLINE.getTime() - now.getTime();

const daysRemaining = Math.max(
  0,
  Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
);

const hoursRemaining = Math.max(
  0,
  Math.floor((timeRemaining / (1000 * 60 * 60)) % 24)
);
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
    loadLeaderboard();
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
          name,
          email,
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

  return (
    <main className="min-h-screen bg-neutral-950 p-4 text-white md:p-6">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 md:text-sm">
              2026 World Cup
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              Knockout Challenge
            </h1>

            <p className="mt-2 text-sm text-neutral-400 md:text-base">
              Pick each winner until one champion remains.
            </p>
          </div>

          <a
  href="#leaderboard"
  className="rounded-xl bg-gradient-to-r from-yellow-400 via-neutral-300 to-amber-700 px-5 py-3 text-center text-sm font-bold text-black transition hover:opacity-90"
>
  🏆 View Leaderboard
</a>
        </div>
      </div>
<section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
  <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
    Submission Deadline
  </p>

  <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 className="text-2xl font-bold">
        June 27, 2026 at 11:59 PM
      </h2>

      <p className="mt-1 text-sm text-neutral-400">
        Brackets can be submitted or updated until the deadline.
      </p>
    </div>

    <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-yellow-300">
      <p className="text-sm font-semibold">Time Remaining</p>

      <p className="text-2xl font-bold">
        {daysRemaining}d {hoursRemaining}h
      </p>
    </div>
  </div>
</section>
      <section className="mb-6 flex flex-wrap gap-3">
  <button
    type="button"
    onClick={autoSelectBracket}
    className="rounded-full bg-neutral-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-neutral-700"
  >
    Auto Select
  </button>

  <button
    type="button"
    onClick={resetBracket}
    className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-neutral-800"
  >
    Reset Bracket
  </button>

  <a
    href="#submit"
    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
      champion
        ? "bg-white text-black hover:bg-neutral-200"
        : "bg-neutral-800 text-white hover:bg-neutral-700"
    }`}
  >
    Submit Bracket
  </a>
</section>

      <section className="md:hidden">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {mobileRounds.map((round) => (
            <button
              key={round.key}
              type="button"
              onClick={() => setMobileRound(round.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                mobileRound === round.key
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-white"
              }`}
            >
              {round.title}
            </button>
          ))}
        </div>

        <MobileRound
          title={currentMobileRound.title}
          matches={currentMobileRound.matches}
          winners={currentMobileRound.winners}
          roundKey={currentMobileRound.key}
          meta={currentMobileRound.meta}
          onPick={pickWinner}
        />

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={currentMobileRoundIndex === 0}
            onClick={() =>
              setMobileRound(mobileRounds[currentMobileRoundIndex - 1].key)
            }
            className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <button
            type="button"
            disabled={currentMobileRoundIndex === mobileRounds.length - 1}
            onClick={() =>
              setMobileRound(mobileRounds[currentMobileRoundIndex + 1].key)
            }
            className="flex-1 rounded-xl bg-white px-4 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next Round
          </button>
        </div>
      </section>

      <section className="hidden md:block">
        <div className="overflow-x-auto">
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
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-neutral-900 to-amber-700/10 p-6">
  <div className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 text-2xl">
      🏆
    </div>

    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">
        Champion Pick
      </p>

      <p className="text-sm text-neutral-400">Your predicted winner</p>
    </div>
  </div>

  <div className="mt-6">
    <p
      className={`text-3xl font-bold md:text-4xl ${
        champion ? "text-white" : "text-neutral-500"
      }`}
    >
      {champion || "Select a Champion"}
    </p>
  </div>

  {champion ? (
    <div className="mt-4 inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-300">
      Predicted World Champion
    </div>
  ) : null}
</div>

        <div
          id="submit"
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
        >
          {submitted ? (
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.3em] text-neutral-400">
                Submission Received
              </p>

              <h2 className="text-2xl font-bold">Bracket Submitted</h2>

              <div className="mt-5 rounded-xl bg-white p-5 text-black">
                <p className="text-sm text-neutral-500">Name</p>

                <p className="text-lg font-bold">{name}</p>

                <p className="mt-4 text-sm text-neutral-500">Champion Pick</p>

                <p className="text-lg font-bold">{champion}</p>
              </div>

              <p className="mt-4 text-sm text-neutral-400">
                Thank you for participating in the World Cup Knockout Challenge.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 w-full rounded-xl border border-neutral-700 px-4 py-3 font-bold text-white transition hover:bg-neutral-800"
              >
                Edit Bracket
              </button>
            </div>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-bold">Submit Your Bracket</h2>

              <div className="mb-4">
                <label className="mb-2 block text-sm text-neutral-400">
                  Name / Nickname
                </label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm text-neutral-400">
                  Email
                </label>

                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white"
                  placeholder="you@example.com"
                />
              </div>

              {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-white px-4 py-3 font-bold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Bracket"}
              </button>

            
            </>
          )}
        </div>
      </div>

      <section
        id="leaderboard"
        className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
              Leaderboard
            </p>

            <h2 className="mt-2 text-2xl font-bold">Current Top 3</h2>

            <p className="mt-2 text-neutral-400">
              Standings pull from Notion and update when Total Points are
              updated.
            </p>
          </div>

          <button
            type="button"
            onClick={loadLeaderboard}
            className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            Refresh Leaderboard
          </button>
        </div>

        <LeaderboardGrid
          leaderboard={leaderboard.slice(0, 3)}
          isLoadingLeaderboard={isLoadingLeaderboard}
        />
      </section>
    </main>
  );
}

function MatchHeader({
  meta,
  index,
}: {
  meta: MatchMeta[];
  index: number;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-xs uppercase tracking-widest text-neutral-500">
        Match {meta[index]?.matchNo || index + 1}
      </p>

      <p className="text-xs font-semibold text-neutral-400">
        {meta[index]?.date}
      </p>
    </div>
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
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>

      <div className="flex flex-col gap-4">
        {matches.map((match, index) => (
          <div
            key={`${roundKey}-${index}`}
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-3"
          >
            <MatchHeader meta={meta} index={index} />

            {match.map((team, teamIndex) => (
              <button
                key={`${roundKey}-${index}-${teamIndex}`}
                type="button"
                disabled={team.includes("TBD")}
                onClick={() => onPick(roundKey, index, team)}
                className={`mb-2 block w-full rounded-xl px-4 py-3 text-left font-semibold transition ${
                  winners[index] === team
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.35)]"
                    : "bg-neutral-800 hover:bg-neutral-700"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {team}
              </button>
            ))}
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
      <h2 className="mb-4 text-lg font-semibold text-neutral-300">{title}</h2>

      <div className="flex flex-col gap-10">
        {matches.map((match, index) => (
          <div
            key={`${roundKey}-${index}`}
            className={`rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition ${
              title === "Final"
                ? "scale-110 border-white"
                : title === "Semifinals"
                  ? "scale-105"
                  : ""
            }`}
          >
            <MatchHeader meta={meta} index={index} />

            {match.map((team, teamIndex) => (
              <button
                key={`${roundKey}-${index}-${teamIndex}`}
                type="button"
                disabled={team.includes("TBD")}
                onClick={() => onPick(roundKey, index, team)}
                className={`mb-2 block w-full rounded-xl px-4 py-3 text-left font-semibold transition ${
                  winners[index] === team
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.35)]"
                    : "bg-neutral-800 hover:scale-[1.02] hover:bg-neutral-700"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {team}
              </button>
            ))}
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
    return <p className="mt-5 text-neutral-400">Loading leaderboard...</p>;
  }

  if (leaderboard.length === 0) {
    return <p className="mt-5 text-neutral-400">No leaderboard entries yet.</p>;
  }

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      {leaderboard.map((entry, index) => (
        <div
          key={entry.id}
          className={`rounded-xl border p-4 ${
            index === 0
              ? "border-yellow-400"
              : index === 1
                ? "border-neutral-300"
                : "border-amber-700"
          }`}
        >
          <p className="text-2xl">
            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
          </p>

          <p className="mt-2 font-bold">
            {index + 1}. {entry.name}
          </p>

          <p className="text-sm text-neutral-400">
            Champion: {entry.champion}
          </p>

          <p className="mt-3 text-xl font-bold">{entry.points} pts</p>
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
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
          2026 World Cup
        </p>

        <h1 className="text-4xl font-bold">Final Leaderboard</h1>

        <p className="mt-2 text-neutral-400">
          Submissions are closed. Standings are updated as tournament results
          come in.
        </p>

        <button
          type="button"
          onClick={loadLeaderboard}
          className="mt-5 rounded-xl border border-neutral-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
        >
          Refresh Leaderboard
        </button>
      </div>

      {isLoadingLeaderboard ? (
        <p className="text-neutral-400">Loading leaderboard...</p>
      ) : leaderboard.length === 0 ? (
        <p className="text-neutral-400">No leaderboard entries yet.</p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`rounded-2xl border p-5 ${
                index === 0
                  ? "border-yellow-400 bg-neutral-900"
                  : index === 1
                    ? "border-neutral-300 bg-neutral-900"
                    : index === 2
                      ? "border-amber-700 bg-neutral-900"
                      : "border-neutral-800 bg-neutral-900"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-400">
                    Rank #{index + 1}
                  </p>

                  <h2 className="text-2xl font-bold">
                    {index === 0
                      ? "🥇 "
                      : index === 1
                        ? "🥈 "
                        : index === 2
                          ? "🥉 "
                          : ""}
                    {entry.name}
                  </h2>

                  <p className="mt-1 text-sm text-neutral-400">
                    Champion Pick: {entry.champion}
                  </p>
                </div>

                <p className="text-3xl font-bold">{entry.points} pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}