import { Team } from "@/data/Teams";
import { MatchResult } from "@/types/MatchResult";

export function ScoreResultSection({
    homeTeam,
    awayTeam,
    result,
}: {
    homeTeam: Team;
    awayTeam: Team;
    result: MatchResult;
}) {
    return (
        <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-2xl font-black text-gray-950">
            <div className="flex min-w-0 items-center justify-end gap-1">
                <span className="w-12 text-center text-lg font-bold">
                    {homeTeam.fifaCode}
                </span>

                <img
                    src={`https://flagcdn.com/w40/${homeTeam.iso2.toLowerCase()}.png`}
                    alt={homeTeam.nameEs}
                    className="h-5 w-7 shrink-0 rounded-sm object-cover shadow-lg"
                />
            </div>

            <div className="flex w-20 shrink-0 items-center justify-center">
                <span className="w-5 text-center">{result.homeScore}</span>
                <span>-</span>
                <span className="w-5 text-center">{result.awayScore}</span>
            </div>

            <div className="flex min-w-0 items-center justify-start gap-1">
                <span className="w-12 text-center text-lg font-bold">
                    {awayTeam.fifaCode}
                </span>

                <img
                    src={`https://flagcdn.com/w40/${awayTeam.iso2.toLowerCase()}.png`}
                    alt={awayTeam.nameEs}
                    className="h-5 w-7 shrink-0 rounded-sm object-cover shadow-lg"
                />
            </div>
        </div>
    );
}