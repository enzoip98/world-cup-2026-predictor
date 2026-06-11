import { Player } from "@/data/players";

export function PlayerPickerCard({
    player,
    isSaving,
    onSelectPlayer,
}: {
    player: Player;
    isSaving: boolean;
    onSelectPlayer: (playerId: string) => void;
}) {
    return (
        <button
            disabled={isSaving}
            onClick={() => onSelectPlayer(player.id)}
            className="rounded-3xl bg-gray-50 p-4 text-left transition active:scale-[0.98] disabled:opacity-50"
        >
            <p className="capitalize line-clamp-2 text-sm font-black leading-5 text-gray-900">
                {player.name.toLowerCase()}
            </p>

            {player.club && (
                <p className="mt-2 line-clamp-2 text-xs font-bold leading-4 text-gray-400">
                    {player.club}
                </p>
            )}
        </button>
    );
}