import { Player } from "@/data/players";
import { PlayerPickerCard } from "./PlayerPickerCard";

export function PlayerPositionGroup({
    title,
    players,
    isSaving,
    onSelectPlayer,
}: {
    title: string;
    players: Player[];
    isSaving: boolean;
    onSelectPlayer: (playerId: string) => void;
}) {
    if (players.length === 0) return null;

    return (
        <div className="mb-6">
            <h4 className="mb-3 px-1 text-xs font-black uppercase tracking-wide text-gray-400">
                {title}
            </h4>

            <div className="grid grid-cols-2 gap-3">
                {players.map((player) => (
                    <PlayerPickerCard
                        key={player.id}
                        player={player}
                        isSaving={isSaving}
                        onSelectPlayer={onSelectPlayer}
                    />
                ))}
            </div>
        </div>
    );
}