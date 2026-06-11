import { Team } from "@/data/Teams";
import { CountryFlag } from "./CountryFlag";

export function TeamPickerCard({
    team,
    isDisabled,
    isSaving,
    onSelectTeam,
}: {
    team: Team;
    isDisabled: boolean;
    isSaving: boolean;
    onSelectTeam: (teamId: string) => void;
}) {
    return (
        <button
            disabled={isDisabled || isSaving}
            onClick={() => onSelectTeam(team.id)}
            className={`rounded-3xl border p-4 text-left transition active:scale-[0.98] ${isDisabled
                ? "border-gray-100 bg-gray-100 opacity-50"
                : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                }`}
        >
            <div className="mb-3 flex items-center justify-between">
                <CountryFlag homeTeam={team} />

                {isDisabled && (
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-gray-400">
                        Usado en otro pronóstico
                    </span>
                )}
            </div>

            <p className="line-clamp-2 text-sm font-black leading-5 text-gray-900">
                {team.nameEs}
            </p>

            <p className="mt-1 text-xs font-bold text-gray-400">
                {team.fifaCode}
            </p>
        </button>
    );
}