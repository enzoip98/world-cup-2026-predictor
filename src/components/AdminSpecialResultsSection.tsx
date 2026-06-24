// components/AdminSpecialResultsSection.tsx

import { useState } from "react";
import { SpecialResultField, SpecialResults } from "@/lib/specialResults";
import { teamsById } from "@/data/Teams";
import { playersById } from "@/data/players";
import { CountryFlag } from "@/components/CountryFlag";
import { TeamPickerModal } from "./TeamPickerModal";
import { PlayerPickerModal } from "./PlayerPickerModal"

type Props = {
    specialResults: SpecialResults | null;
    isSaving: boolean;
    onSaveField: (field: SpecialResultField, value: string) => Promise<void>;
};

export function AdminSpecialResultsSection({
    specialResults,
    isSaving,
    onSaveField,
}: Props) {
    const [activePicker, setActivePicker] = useState<SpecialResultField | null>(null);

    const championTeam = specialResults?.championTeamId
        ? teamsById[specialResults.championTeamId]
        : null;

    const runnerUpTeam = specialResults?.runnerUpTeamId
        ? teamsById[specialResults.runnerUpTeamId]
        : null;

    const topScorerPlayer = specialResults?.topScorerPlayerId
        ? playersById[specialResults.topScorerPlayerId]
        : null;

    const bestPlayer = specialResults?.bestPlayerId
        ? playersById[specialResults.bestPlayerId]
        : null;

    const handleSelectTeam = async (teamId: string) => {
        if (!activePicker) return;

        if (
            activePicker === "championTeamId" &&
            teamId === specialResults?.runnerUpTeamId
        ) {
            alert("El campeón no puede ser el mismo que el subcampeón.");
            return;
        }

        if (
            activePicker === "runnerUpTeamId" &&
            teamId === specialResults?.championTeamId
        ) {
            alert("El subcampeón no puede ser el mismo que el campeón.");
            return;
        }

        const confirmed = window.confirm(
            "¿Guardar este resultado final? Esto actualizará la tabla de posiciones."
        );

        if (!confirmed) return;

        await onSaveField(activePicker, teamId);
        setActivePicker(null);
    };

    const handleSelectPlayer = async (playerId: string) => {
        if (!activePicker) return;

        const player = playersById[playerId];

        const confirmed = window.confirm(
            `¿Guardar a ${player.name} como resultado final? Esto actualizará la tabla.`
        );

        if (!confirmed) return;

        await onSaveField(activePicker, playerId);
        setActivePicker(null);
    };

    return (
        <>
            <section className="space-y-5">
                <div className="rounded-3xl bg-white dark:bg-gray-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black text-gray-950 dark:text-gray-50">
                            🏁 Resultados finales
                        </h3>

                        <span className="rounded-full bg-gray-900 dark:bg-gray-100 px-3 py-1 text-xs font-black text-white dark:text-gray-900">
                            50 pts
                        </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                        Registra los resultados especiales oficiales. Estos valores se usan
                        para sumar los puntos extra de la tabla.
                    </p>
                </div>

                <div className="rounded-3xl bg-white dark:bg-gray-800 p-5 shadow-sm">
                    <div className="space-y-3">
                        <AdminFinalResultCard
                            title="Campeón"
                            emoji="🏆"
                            points={20}
                            value={
                                championTeam && (
                                    <div className="flex items-center gap-2">
                                        <CountryFlag homeTeam={championTeam} />
                                        <span>{championTeam.nameEs}</span>
                                    </div>
                                )
                            }
                            emptyText="Registrar campeón"
                            isSaving={isSaving}
                            onClick={() => setActivePicker("championTeamId")}
                        />

                        <AdminFinalResultCard
                            title="Subcampeón"
                            emoji="🥈"
                            points={10}
                            value={
                                runnerUpTeam && (
                                    <div className="flex items-center gap-2">
                                        <CountryFlag homeTeam={runnerUpTeam} />
                                        <span>{runnerUpTeam.nameEs}</span>
                                    </div>
                                )
                            }
                            emptyText="Registrar subcampeón"
                            isSaving={isSaving}
                            onClick={() => setActivePicker("runnerUpTeamId")}
                        />

                        <AdminFinalResultCard
                            title="Goleador"
                            emoji="⚽"
                            points={10}
                            value={
                                topScorerPlayer && (
                                    <PlayerValue playerId={topScorerPlayer.id} />
                                )
                            }
                            emptyText="Registrar goleador"
                            isSaving={isSaving}
                            onClick={() => setActivePicker("topScorerPlayerId")}
                        />

                        <AdminFinalResultCard
                            title="Mejor jugador"
                            emoji="🌟"
                            points={10}
                            value={
                                bestPlayer && <PlayerValue playerId={bestPlayer.id} />
                            }
                            emptyText="Registrar mejor jugador"
                            isSaving={isSaving}
                            onClick={() => setActivePicker("bestPlayerId")}
                        />
                    </div>
                </div>
            </section>

            {(activePicker === "championTeamId" ||
                activePicker === "runnerUpTeamId") && (
                    <TeamPickerModal
                        title={
                            activePicker === "championTeamId"
                                ? "Registrar campeón"
                                : "Registrar subcampeón"
                        }
                        disabledTeamId={
                            activePicker === "championTeamId"
                                ? specialResults?.runnerUpTeamId
                                : specialResults?.championTeamId
                        }
                        isSaving={isSaving}
                        onClose={() => setActivePicker(null)}
                        onSelectTeam={handleSelectTeam}
                    />
                )}

            {(activePicker === "topScorerPlayerId" ||
                activePicker === "bestPlayerId") && (
                    <PlayerPickerModal
                        title={
                            activePicker === "topScorerPlayerId"
                                ? "Registrar goleador"
                                : "Registrar mejor jugador"
                        }
                        mode={
                            activePicker === "topScorerPlayerId"
                                ? "topScorer"
                                : "bestPlayer"
                        }
                        isSaving={isSaving}
                        onClose={() => setActivePicker(null)}
                        onSelectPlayer={handleSelectPlayer}
                    />
                )}
        </>
    );
}

function AdminFinalResultCard({
    title,
    emoji,
    points,
    value,
    emptyText,
    isSaving,
    onClick,
}: {
    title: string;
    emoji: string;
    points: number;
    value?: React.ReactNode;
    emptyText: string;
    isSaving: boolean;
    onClick: () => void;
}) {
    return (
        <button
            disabled={isSaving}
            onClick={onClick}
            className="w-full rounded-3xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-5 py-4 text-left transition active:scale-[0.99] disabled:opacity-50"
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black uppercase tracking-wide text-gray-900 dark:text-gray-100">
                            {emoji} {title}
                        </p>

                        <span className="rounded-full bg-white dark:bg-gray-600 px-2 py-1 text-[11px] font-black text-gray-500 dark:text-gray-300">
                            +{points} pts
                        </span>
                    </div>

                    <div className="mt-3 text-base font-black text-gray-900 dark:text-gray-100">
                        {value ?? <span className="text-gray-400 dark:text-gray-500">{emptyText}</span>}
                    </div>
                </div>

                <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${value
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300"
                        }`}
                >
                    {value ? "Registrado" : "Pendiente"}
                </span>
            </div>
        </button>
    );
}

function PlayerValue({ playerId }: { playerId: string }) {
    const player = playersById[playerId];
    const team = teamsById[player.teamId];

    return (
        <div className="flex items-center gap-2">
            {team && <CountryFlag homeTeam={team} />}
            <span>{player.name}</span>
        </div>
    );
}