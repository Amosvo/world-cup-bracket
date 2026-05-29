type RoundProps = {
  title: string;
  matches: string[][];
  winners: string[];
  roundKey: string;
  onPick: (round: string, index: number, team: string) => void;
};

export default function BracketRound({
  title,
  matches,
  winners,
  roundKey,
  onPick,
}: RoundProps) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-neutral-300">{title}</h2>

      <div className="flex flex-col gap-4">
        {matches.map((match, index) => (
          <div
            key={`${roundKey}-${index}`}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
          >
            <p className="mb-3 text-xs uppercase tracking-widest text-neutral-500">
              Match {index + 1}
            </p>

            {match.map((team, teamIndex) => (
              <button
                key={`${roundKey}-${index}-${teamIndex}`}
                type="button"
                disabled={team.includes("TBD")}
                onClick={() => onPick(roundKey, index, team)}
                className={`mb-2 block w-full rounded-xl px-4 py-3 text-left font-semibold transition ${
                  winners[index] === team
                    ? "bg-white text-black"
                    : "bg-neutral-800 hover:bg-neutral-700"
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