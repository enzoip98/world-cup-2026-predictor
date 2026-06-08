import { Team } from "@/data/Teams";

export function MatchModalHeader({
    homeTeam,
    awayTeam,
}: {
    homeTeam: Team;
    awayTeam: Team;
}) {
    return <>
        <div>
            <p className="text-sm my-5 font-semibold uppercase tracking-widest text-green-600">
                Partido
            </p>

            <div className="flex flex-row gap-4 my-3 justify-center mx-auto text-2xl font-black text-gray-950">
                <div className="flex flex-col gap-3 items-center justify-center">
                    <img
                        src={`https://flagcdn.com/w40/${homeTeam.iso2.toLowerCase()}.png`}
                        alt={homeTeam.nameEs}
                        className="h-5 w-7 rounded-sm object-cover shadow-sm"
                    />
                    <h2>{homeTeam.nameEs}</h2>
                </div>
                vs
                <div className="flex flex-col gap-3 items-center justify-center">
                    <img
                        src={`https://flagcdn.com/w40/${awayTeam.iso2.toLowerCase()}.png`}
                        alt={awayTeam.nameEs}
                        className="h-5 w-7 rounded-sm object-cover shadow-sm"
                    />
                    <h2>{awayTeam.nameEs}</h2>
                </div>
            </div>
        </div>
    </>
}