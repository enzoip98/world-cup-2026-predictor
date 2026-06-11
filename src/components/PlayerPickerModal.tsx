import { useState } from "react";
import { TeamMiniCard } from "./TeamMiniCard";
import { favoriteTeamIds, Teams, teamsByFifaCode, teamsById } from "@/data/Teams";
import { players } from "@/data/players";
import { CountryFlag } from "./CountryFlag";
import { PlayerPositionGroup } from "./PlayerPositionGroup";
import { PlayerSearchResultRow } from "./PlayerSearchResultRow";

export function PlayerPickerModal({
    title,
    mode,
    isSaving,
    onClose,
    onSelectPlayer,
}: {
    title: string;
    mode: "topScorer" | "bestPlayer";
    isSaving: boolean;
    onClose: () => void;
    onSelectPlayer: (playerId: string) => void;
}) {
    const [search, setSearch] = useState("");
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    const normalizedSearch = search.trim().toLowerCase();

    const favoriteTeams = favoriteTeamIds
        .map((teamId) => teamsById[teamId])
        .filter(Boolean);

    const sortedTeams = [...Teams].sort((a, b) =>
        a.nameEs.localeCompare(b.nameEs)
    );

    const searchResults = normalizedSearch
        ? players
            .filter((player) => {
                const team = teamsByFifaCode[player.teamId];

                return (
                    player.fullName.toLowerCase().includes(normalizedSearch) ||
                    player.fullName?.toLowerCase().includes(normalizedSearch) ||
                    player.shirtName.toLowerCase().includes(normalizedSearch) ||
                    team?.nameEs.toLowerCase().includes(normalizedSearch)
                );
            })
            .slice(0, 40)
        : [];

    const selectedTeam = selectedTeamId ? teamsById[selectedTeamId] : null;

    const selectedTeamPlayers = selectedTeamId
        ? players.filter((player) => player.teamId === teamsById[selectedTeamId].fifaCode.toLowerCase())
        : [];

    if (selectedTeam) {
        return (
            <div className="fixed inset-0 z-50 flex bg-black/60 px-4 justify-center items-center pb-4"
                onClick={onClose}>
                <div className="max-h-[88vh] w-full overflow-hidden rounded-3xl bg-white shadow-xl sm:max-w-lg">
                    <div className="border-b border-gray-100 p-5">
                        <button
                            onClick={() => setSelectedTeamId(null)}
                            className="mb-4 rounded-full bg-gray-100 px-4 py-2 text-sm font-black text-gray-500"
                        >
                            ← Volver
                        </button>

                        <div className="flex items-center gap-3">
                            <CountryFlag homeTeam={selectedTeam} />

                            <div>
                                <h3 className="text-2xl font-black text-gray-900">
                                    {selectedTeam.nameEs}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Elige un jugador de esta selección.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[65vh] overflow-y-auto p-4">
                        <PlayerPositionGroup
                            title="⚽ Delanteros"
                            players={selectedTeamPlayers.filter(
                                (player) => player.position === "FW"
                            )}
                            isSaving={isSaving}
                            onSelectPlayer={onSelectPlayer}
                        />

                        <PlayerPositionGroup
                            title="🎯 Mediocampistas"
                            players={selectedTeamPlayers.filter(
                                (player) => player.position === "MF"
                            )}
                            isSaving={isSaving}
                            onSelectPlayer={onSelectPlayer}
                        />

                        <PlayerPositionGroup
                            title="🛡 Defensas"
                            players={selectedTeamPlayers.filter(
                                (player) => player.position === "DF"
                            )}
                            isSaving={isSaving}
                            onSelectPlayer={onSelectPlayer}
                        />

                        <PlayerPositionGroup
                            title="🧤 Arqueros"
                            players={selectedTeamPlayers.filter(
                                (player) => player.position === "GK"
                            )}
                            isSaving={isSaving}
                            onSelectPlayer={onSelectPlayer}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex bg-black/60 px-4 justify-center items-center pb-4">
            <div className="max-h-[88vh] w-full overflow-hidden rounded-3xl bg-white shadow-xl sm:max-w-lg">
                <div className="border-b border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">
                                {title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Busca directamente o entra por selección.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="shrink-0 rounded-full bg-gray-100 px-4 py-3 text-sm font-black text-gray-500 disabled:opacity-50"
                        >
                            X
                        </button>
                    </div>

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar jugador..."
                        className="mt-5 w-full rounded-2xl bg-gray-100 px-4 py-4 text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400"
                    />
                </div>

                <div className="max-h-[62vh] overflow-y-auto p-4">
                    {normalizedSearch ? (
                        <div className="space-y-2">
                            <h4 className="mb-3 px-1 text-xs font-black uppercase tracking-wide text-gray-400">
                                Resultados
                            </h4>

                            {searchResults.length === 0 ? (
                                <div className="rounded-3xl bg-gray-50 p-8 text-center">
                                    <p className="text-sm font-bold text-gray-500">
                                        No encontramos ese jugador.
                                    </p>
                                </div>
                            ) : (
                                searchResults.map((player) => (
                                    <PlayerSearchResultRow
                                        key={player.id}
                                        player={player}
                                        isSaving={isSaving}
                                        onSelectPlayer={onSelectPlayer}
                                    />
                                ))
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h4 className="mb-3 px-1 text-xs font-black uppercase tracking-wide text-gray-400">
                                    ⭐ Selecciones favoritas
                                </h4>

                                <div className="grid grid-cols-2 gap-3">
                                    {favoriteTeams.map((team) => (
                                        <TeamMiniCard
                                            key={team.id}
                                            team={team}
                                            onClick={() =>
                                                setSelectedTeamId(team.id)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3 px-1 text-xs font-black uppercase tracking-wide text-gray-400">
                                    🌍 Todas las selecciones
                                </h4>

                                <div className="grid grid-cols-2 gap-3">
                                    {sortedTeams.map((team) => (
                                        <TeamMiniCard
                                            key={team.id}
                                            team={team}
                                            onClick={() =>
                                                setSelectedTeamId(team.id)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}