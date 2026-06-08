import { Team } from "@/data/Teams";

export function ScoreInput({ homeTeam, awayTeam, homeScore, setHomeScore, awayScore,
    setAwayScore }: {
        homeTeam: Team;
        awayTeam: Team;
        homeScore: string;
        setHomeScore: (score: string) => void;
        awayScore: string;
        setAwayScore: (score: string) => void;
    }) {
    return (<>
        <div className="flex items-center justify-center gap-3">
            <div className="flex flex-1 flex-col items-center gap-2">
                <span className="flex flex-row gap-1 text-sm font-semibold text-gray-700">
                    {homeTeam.fifaCode}<img
                        src={`https://flagcdn.com/w40/${homeTeam.iso2.toLowerCase()}.png`}
                        alt={homeTeam.nameEs}
                        className="h-5 w-7 rounded-sm object-cover shadow-sm"
                    />
                </span>

                <input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(event) => setHomeScore(event.target.value)}
                    className="h-14 w-full rounded-2xl border bg-white text-center text-2xl font-black outline-none focus:ring-2 focus:ring-gray-900"
                />
            </div>

            <span className="mt-7 text-xl font-black text-gray-400">-</span>

            <div className="flex flex-1 flex-col items-center gap-2">
                <span className="flex flex-row gap-1 text-sm font-semibold text-gray-700">
                    {awayTeam.fifaCode}<img
                        src={`https://flagcdn.com/w40/${awayTeam.iso2.toLowerCase()}.png`}
                        alt={awayTeam.nameEs}
                        className="h-5 w-7 rounded-sm object-cover shadow-sm"
                    />
                </span>

                <input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(event) => setAwayScore(event.target.value)}
                    className="h-14 w-full rounded-2xl border bg-white text-center text-2xl font-black outline-none focus:ring-2 focus:ring-gray-900"
                />
            </div>
        </div>
    </>);
}