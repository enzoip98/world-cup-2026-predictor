// components/SpecialPredictionsSection.tsx

import { ReactNode, useMemo, useState } from "react";
import { Team, Teams, teamsById } from "@/data/Teams";
import { SpecialPrediction } from "@/lib/predictions";
import { CountryFlag } from "./CountryFlag";

type TeamPickField = "championTeamId" | "runnerUpTeamId";

type Props = {
    prediction: SpecialPrediction | null;
    hasWorldCupStarted: boolean;
    onSaveField: (field: TeamPickField, value: string) => Promise<void>;
};

export function SpecialPredictionsSection({
    prediction,
    hasWorldCupStarted,
    onSaveField,
}: Props) {
    const [activePicker, setActivePicker] = useState<TeamPickField | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const championTeam = prediction?.championTeamId
        ? teamsById[prediction.championTeamId]
        : null;

    const runnerUpTeam = prediction?.runnerUpTeamId
        ? teamsById[prediction.runnerUpTeamId]
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
            <section className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="mb-5">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black text-gray-900">
                            🏆 Pronósticos especiales
                        </h3>

                        <span className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-black text-white">
                            Hasta 50 pts más!
                        </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Cada elección se guarda una sola vez y se bloquea cuando empiece el
                        Mundial.
                    </p>
                </div>

                <div className="space-y-3">
                    <SpecialPickCard
                        title="Campeón"
                        emoji="🏆"
                        points={20}
                        emptyText="Elige a tu campeón"
                        value={
                            championTeam && (
                                <div className="flex items-center gap-2">
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
                                <div className="flex items-center gap-2">
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
                        value={null}
                        disabled
                        badge="Pronto"
                        onClick={() => { }}
                    />

                    <SpecialPickCard
                        title="Mejor jugador"
                        emoji="🌟"
                        points={10}
                        emptyText="Elige a tu mejor jugador"
                        value={null}
                        disabled
                        badge="Pronto"
                        onClick={() => { }}
                    />
                </div>
            </section>

            {activePicker && (
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
        </>
    );
}

function SpecialPickCard({
    title,
    emoji,
    points,
    emptyText,
    value,
    disabled,
    badge,
    onClick,
}: {
    title: string;
    emoji: string;
    value?: ReactNode;
    points: number;
    emptyText: string;
    disabled: boolean;
    badge?: string;
    onClick: () => void;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`w-full rounded-3xl border p-4 text-left transition ${disabled
                ? "border-gray-100 bg-gray-50"
                : "border-gray-100 bg-white active:scale-[0.99]"
                }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black uppercase tracking-wide text-gray-900">
                            {emoji} {title}
                        </p>

                        <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-black text-gray-500">
                            +{points} pts
                        </span>
                    </div>

                    <div className="mt-3 text-base font-black text-gray-900">
                        {value ?? (
                            <span className="text-sm text-gray-500">{emptyText}</span>
                        )}
                    </div>
                </div>

                {badge ? (
                    <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1 text-xs font-black text-gray-500">
                        {badge}
                    </span>
                ) : value ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        Guardado
                    </span>
                ) : disabled ? (
                    <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1 text-xs font-black text-gray-500">
                        Bloqueado
                    </span>
                ) : (
                    <span className="shrink-0 text-xl text-gray-300">›</span>
                )}
            </div>
        </button>
    );
}

function TeamPickerModal({
    title,
    disabledTeamId,
    isSaving,
    onClose,
    onSelectTeam,
}: {
    title: string;
    disabledTeamId?: string;
    isSaving: boolean;
    onClose: () => void;
    onSelectTeam: (teamId: string) => void;
}) {
    const [search, setSearch] = useState("");

    const favoriteTeamIds = [
        "argentina",
        "brazil",
        "france",
        "spain",
        "england",
        "germany",
        "portugal"
    ];

    const favoriteTeams = useMemo(() => {
        return favoriteTeamIds
            .map((teamId) => Teams.find((team) => team.id === teamId))
            .filter((team): team is Team => Boolean(team));
    }, []);

    const sortedTeams = [...Teams].sort((a, b) =>
        a.nameEs.localeCompare(b.nameEs)
    );

    const filteredTeams = sortedTeams.filter((team) => {
        const searchText = search.toLowerCase();

        return (
            team.nameEs.toLowerCase().includes(searchText) ||
            team.fifaCode.toLowerCase().includes(searchText)
        );
    });

    const showFavorites = search.trim().length === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 px-4 pb-4 sm:items-center sm:justify-center">
            <div className="max-h-[88vh] w-full overflow-hidden rounded-3xl bg-white shadow-xl sm:max-w-lg">
                <div className="border-b border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">
                                {title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Esta elección se guarda una sola vez.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="shrink-0 rounded-full bg-gray-100 px-4 py-3 text-sm font-black text-gray-500 disabled:opacity-50"
                        >
                            Cerrar
                        </button>
                    </div>

                    <div className="mt-5">
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar selección..."
                            className="w-full rounded-2xl bg-gray-100 px-4 py-4 text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="max-h-[62vh] overflow-y-auto p-4">
                    {showFavorites && (
                        <div className="mb-6">
                            <h4 className="mb-3 px-1 text-xs font-black uppercase tracking-wide text-gray-400">
                                ⭐ Favoritos
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                                {favoriteTeams.map((team) => (
                                    <TeamPickerCard
                                        key={team.id}
                                        team={team}
                                        isDisabled={team.id === disabledTeamId}
                                        isSaving={isSaving}
                                        onSelectTeam={onSelectTeam}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="mb-3 px-1 text-xs font-black uppercase tracking-wide text-gray-400">
                            🌍 Todas las selecciones
                        </h4>

                        {filteredTeams.length === 0 ? (
                            <div className="rounded-3xl bg-gray-50 p-8 text-center">
                                <p className="text-sm font-bold text-gray-500">
                                    No encontramos esa selección.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {filteredTeams.map((team) => (
                                    <TeamPickerCard
                                        key={team.id}
                                        team={team}
                                        isDisabled={team.id === disabledTeamId}
                                        isSaving={isSaving}
                                        onSelectTeam={onSelectTeam}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TeamPickerCard({
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