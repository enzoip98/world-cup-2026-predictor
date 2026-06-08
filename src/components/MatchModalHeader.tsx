import { Team } from "@/data/Teams";

export function MatchModalHeader({
    homeTeam,
    awayTeam,
}: {
    homeTeam: Team;
    awayTeam: Team;
}) {
    return <>
        <div className="mt-12 mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-center gap-3 text-center">
                <img
                    src={`https://flagcdn.com/w40/${homeTeam.iso2.toLowerCase()}.png`}
                    alt={homeTeam.nameEs}
                    className="h-5 w-7 rounded-sm object-cover shadow-sm"
                />
                <h2 className="text-xl font-black text-gray-950">
                    {homeTeam.nameEs}
                </h2>
            </div>

            <span className="text-lg font-bold text-gray-600">
                VS
            </span>

            <div className="flex flex-col items-center gap-3 text-center">
                <img
                    src={`https://flagcdn.com/w40/${awayTeam.iso2.toLowerCase()}.png`}
                    alt={awayTeam.nameEs}
                    className="h-5 w-7 rounded-sm object-cover shadow-sm"
                />
                <h2 className="text-xl font-black text-gray-950">
                    {awayTeam.nameEs}
                </h2>
            </div>
        </div>
    </>
}