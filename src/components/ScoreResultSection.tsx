import { Team } from "@/data/Teams";
import { MatchResult } from "@/types/MatchResult";

export function ScoreResultSection({ homeTeam, awayTeam, result }:
    { homeTeam: Team, awayTeam: Team, result: MatchResult }) {
    return (<>
        <div className="my-2 flex items-center justify-center gap-4 text-2xl 
        font-black text-gray-950">
            <div className="flex flex-row items-center gap-1">
                <span className="font-bold text-xl">{homeTeam.fifaCode}</span>
                <span><img
                    src={`https://flagcdn.com/w40/${homeTeam.iso2.toLowerCase()}.png`}
                    alt={homeTeam.nameEs}
                    className="h-5 w-full rounded-sm object-cover shadow-sm"
                /></span>
            </div>

            <span>{result?.homeScore}</span>
            <span>-</span>
            <span>{result?.awayScore}</span>
            <div className="flex flex-row items-center gap-1">
                <span className="font-bold text-xl">{awayTeam.fifaCode}</span>
                <span><img
                    src={`https://flagcdn.com/w40/${awayTeam.iso2.toLowerCase()}.png`}
                    alt={awayTeam.nameEs}
                    className="h-5 w-full rounded-sm object-cover shadow-sm"
                /></span>
            </div>
        </div>
    </>);
}