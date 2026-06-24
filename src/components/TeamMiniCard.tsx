import { Team } from "@/data/Teams";
import { CountryFlag } from "./CountryFlag";

export function TeamMiniCard({
    team,
    onClick,
}: {
    team: Team;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="rounded-3xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-4 text-left transition active:scale-[0.98] hover:bg-gray-100 dark:hover:bg-gray-600"
        >
            <div className="mb-3">
                <CountryFlag homeTeam={team} />
            </div>

            <p className="line-clamp-2 text-sm font-black leading-5 text-gray-900 dark:text-gray-100">
                {team.nameEs}
            </p>
        </button>
    );
}