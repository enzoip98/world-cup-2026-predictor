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
            className="rounded-3xl bg-gray-50 dark:bg-gray-700 p-4 text-left transition active:scale-[0.98] disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
            <p className="capitalize line-clamp-2 text-sm font-black leading-5 text-gray-900 dark:text-gray-100">
                {player.name.toLowerCase()}
            </p>

            {player.club && (
                <p className="mt-2 line-clamp-2 text-xs font-bold leading-4 text-gray-400 dark:text-gray-500">
                    {player.club}
                </p>
            )}
        </button>
    );
}