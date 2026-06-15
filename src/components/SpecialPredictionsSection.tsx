// components/SpecialPredictionsSection.tsx

import { useState } from "react";
import { teamsByFifaCode, teamsById } from "@/data/Teams";
import { SpecialPrediction } from "@/lib/predictions";
import { CountryFlag } from "./CountryFlag";
import { Player, playersById } from "@/data/players";
import { PlayerPickerModal } from "./PlayerPickerModal";
import { TeamPickerModal } from "./TeamPickerModal";
import { SpecialPickCard } from "./SpecialPickCard";

type SpecialPickField =
    | "championTeamId"
    | "runnerUpTeamId"
    | "topScorerPlayerId"
    | "bestPlayerId";

type Props = {
    prediction: SpecialPrediction | null;
    hasWorldCupStarted: boolean;
    onSaveField: (field: SpecialPickField, value: string) => Promise<void>;
};

function PlayerValue({ player }: { player: Player }) {
    const team = teamsByFifaCode[player.teamId];

    return (
        <div className="flex flex-col items-center gap-2">
            {team && <CountryFlag homeTeam={team} />}

            <span className="text-center capitalize">{player.fullName.toLowerCase()}</span>
        </div>
    );
}

export function SpecialPredictionsSection({
    prediction,
    hasWorldCupStarted,
    onSaveField,
}: Props) {
    const [activePicker, setActivePicker] = useState<SpecialPickField | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const championTeam = prediction?.championTeamId
        ? teamsById[prediction.championTeamId]
        : null;

    const runnerUpTeam = prediction?.runnerUpTeamId
        ? teamsById[prediction.runnerUpTeamId]
        : null;

    const topScorerPlayer = prediction?.topScorerPlayerId
        ? playersById[prediction.topScorerPlayerId]
        : null;

    const bestPlayer = prediction?.bestPlayerId
        ? playersById[prediction.bestPlayerId]
        : null;

    async function handleSelectTeam(teamId: string) {
        if (!activePicker) return;

        if (
            activePicker === "runnerUpTeamId" &&
            teamId === prediction?.championTeamId
        ) {
            alert("El subcampeón no puede ser el mismo que el campeón.");
            return;
        }

        if (
            activePicker === "championTeamId" &&
            teamId === prediction?.runnerUpTeamId
        ) {
            alert("El campeón no puede ser el mismo que el subcampeón.");
            return;
        }

        const confirmed = window.confirm(
            "¿Seguro que deseas guardar esta elección? Luego no podrás cambiarla."
        );

        if (!confirmed) return;

        try {
            setIsSaving(true);
            await onSaveField(activePicker, teamId);
            setActivePicker(null);
        } catch (error) {
            console.error(error);
            alert("No se pudo guardar la elección.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <>
            <section className="rounded-3xl bg-white p-5 shadow-sm my-4">
                <div className="mb-5">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-md font-black text-gray-900">
                            🏆 Pronósticos especiales
                        </h3>

                        <span className="rounded-full bg-cyan-600 px-3 py-1 text-center text-[9px] font-light text-white">
                            Hasta 50 pts más!
                        </span>
                    </div>

                    <p className="mt-2 text-xs leading-6 text-gray-500">
                        Cada elección se guarda una sola vez y se bloquea cuando empiece el
                        Mundial.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <SpecialPickCard
                        title="Campeón"
                        emoji="🏆"
                        points={20}
                        emptyText="Elige a tu campeón"
                        value={
                            championTeam && (
                                <div className="flex flex-col items-center gap-2">
                                    <CountryFlag homeTeam={championTeam} />
                                    <span>{championTeam.nameEs}</span>
                                </div>
                            )
                        }
                        disabled={hasWorldCupStarted || Boolean(prediction?.championTeamId)}
                        onClick={() => setActivePicker("championTeamId")}
                    />

                    <SpecialPickCard
                        title="Subcampeón"
                        emoji="🥈"
                        points={10}
                        emptyText="Elige a tu subcampeón"
                        value={
                            runnerUpTeam && (
                                <div className="flex flex-col items-center gap-2">
                                    <CountryFlag homeTeam={runnerUpTeam} />
                                    <span>{runnerUpTeam.nameEs}</span>
                                </div>
                            )
                        }
                        disabled={hasWorldCupStarted || Boolean(prediction?.runnerUpTeamId)}
                        onClick={() => setActivePicker("runnerUpTeamId")}
                    />

                    <SpecialPickCard
                        title="Goleador"
                        emoji="⚽"
                        points={10}
                        emptyText="Elige a tu goleador"
                        value={
                            topScorerPlayer && (
                                <PlayerValue player={topScorerPlayer} />
                            )
                        }
                        disabled={hasWorldCupStarted || Boolean(prediction?.topScorerPlayerId)}
                        onClick={() => setActivePicker("topScorerPlayerId")}
                    />

                    <SpecialPickCard
                        title="Mejor jugador"
                        emoji="🌟"
                        points={10}
                        emptyText="Elige al mejor jugador"
                        value={
                            bestPlayer && (
                                <PlayerValue player={bestPlayer} />
                            )
                        }
                        disabled={hasWorldCupStarted || Boolean(prediction?.bestPlayerId)}
                        onClick={() => setActivePicker("bestPlayerId")}
                    />
                </div>
            </section>

            {(activePicker === "championTeamId" ||
                activePicker === "runnerUpTeamId") && (
                    <TeamPickerModal
                        title={
                            activePicker === "championTeamId"
                                ? "Elige tu campeón"
                                : "Elige tu subcampeón"
                        }
                        disabledTeamId={
                            activePicker === "runnerUpTeamId"
                                ? prediction?.championTeamId
                                : prediction?.runnerUpTeamId
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
                                ? "Elige tu goleador"
                                : "Elige al mejor jugador"
                        }
                        mode={
                            activePicker === "topScorerPlayerId"
                                ? "topScorer"
                                : "bestPlayer"
                        }
                        isSaving={isSaving}
                        onClose={() => setActivePicker(null)}
                        onSelectPlayer={async (playerId) => {
                            const player = playersById[playerId];

                            const confirmed = window.confirm(
                                `¿Seguro que deseas guardar a ${player.fullName}? Luego no podrás cambiar esta elección.`
                            );

                            if (!confirmed) return;

                            await onSaveField(activePicker, playerId);
                            setActivePicker(null);
                        }}
                    />
                )}
        </>
    );
}