import { Team } from "@/data/Teams";

export function CountryFlag({ homeTeam }: { homeTeam: Team }) {
    return <img
        src={`https://flagcdn.com/w40/${homeTeam.iso2.toLowerCase()}.png`}
        alt={homeTeam.nameEs}
        className="h-5 w-7 rounded-sm object-cover shadow-sm"
    />
}