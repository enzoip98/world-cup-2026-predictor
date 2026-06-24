import { Player } from "@/data/players";
import { teamsByFifaCode } from "@/data/Teams";
import { CountryFlag } from "./CountryFlag";

function getPositionLabel(position: Player["position"]) {
    const labels = {
        GK: "Arquero",
        DF: "Defensa",
        MF: "Mediocampista",
        FW: "Delantero",
    };

    return labels[position];
}

export function PlayerSearchResultRow({
    player,
    isSaving,
    onSelectPlayer,
}: {
    player: Player;
    isSaving: boolean;
    onSelectPlayer: (playerId: string) => void;
}) {
    const team = teamsByFifaCode[player.teamId];

    return (
        <button
            disabled={isSaving}
            onClick={() => onSelectPlayer(player.id)}
            className="flex w-full items-center gap-3 rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 text-left transition active:scale-[0.99] disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
            {team && <CountryFlag homeTeam={team} />}

            <div className="min-w-0 flex-1">
                <p className="truncate capitalize text-sm font-black text-gray-900 dark:text-gray-100">
                    {player.fullName.toLowerCase()}
                </p>

                <p className="truncate text-xs font-bold text-gray-400">
                    {team?.nameEs} · {getPositionLabel(player.position)}
                </p>

                {player.club && (
                    <p className="truncate text-xs font-medium text-gray-400">
                        {player.club}
                    </p>
                )}
            </div>
        </button>
    );
}