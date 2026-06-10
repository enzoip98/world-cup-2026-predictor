// components/MyPredictionsTab.tsx
import { PredictionsMap, SpecialPrediction } from "@/lib/predictions";
import { ScoreResultSection } from "@/components/ScoreResultSection";
import { Match } from "@/types/Match";
import { ResultsMap } from "@/lib/results";
import { calculatePredictionPoints } from "@/utils/scoring";
import { teamsById } from "@/data/Teams";
import { SpecialPredictionsSection } from "./SpecialPredictionsSection";

type Props = {
    matches: Match[];
    predictions: PredictionsMap;
    results: ResultsMap;
    userId: string;
    onGoToMatches: () => void;
    specialPrediction: SpecialPrediction | null;
    hasWorldCupStarted: boolean;
    onSaveSpecialPredictionField: (
        field: "championTeamId" | "runnerUpTeamId" | "topScorerPlayerId" | "bestPlayerId",
        value: string
    ) => Promise<void>;
};

export function MyPredictionsTab({
    matches,
    predictions,
    results,
    userId,
    onGoToMatches, specialPrediction, hasWorldCupStarted, onSaveSpecialPredictionField
}: Props) {
    const myPredictions = predictions[userId] ?? {};

    const predictedMatches = matches
        .filter((match) => myPredictions[match.id])
        .sort(
            (a, b) =>
                new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
        );

    const pendingPredictions = predictedMatches.filter(
        (match) => results[match.id]?.status !== "finished"
    );

    const finishedPredictions = predictedMatches.filter(
        (match) => results[match.id]?.status === "finished"
    );

    const totalPoints = finishedPredictions.reduce((total, match) => {
        const prediction = myPredictions[match.id];
        const result = results[match.id];

        if (!prediction || !result) return total;

        return total + calculatePredictionPoints(prediction, result).points;
    }, 0);

    const exactHits = finishedPredictions.filter((match) => {
        const prediction = myPredictions[match.id];
        const result = results[match.id];

        if (!prediction || !result) return false;

        return calculatePredictionPoints(prediction, result).points === 3;
    }).length;

    return (
        <>
            <section>
                <SpecialPredictionsSection
                    prediction={specialPrediction}
                    hasWorldCupStarted={hasWorldCupStarted}
                    onSaveField={onSaveSpecialPredictionField}
                />
            </section>

            {predictedMatches.length === 0 ?
                <section className="rounded-3xl bg-white px-6 py-10 text-center shadow-sm my-5">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-4xl">
                        📝
                    </div>

                    <h2 className="text-xl font-black text-gray-900">
                        Mis pronósticos
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        Todavía no hiciste ningún pronóstico.
                        <br />
                        Ve a la pestaña Partidos y registra tus marcadores antes de que
                        empiece cada encuentro.
                    </p>

                    <button
                        onClick={onGoToMatches}
                        className="mt-6 w-full rounded-2xl bg-gray-900 py-4 text-sm font-black text-white"
                    >
                        Ver partidos
                    </button>
                </section>
                : <section className="space-y-5 my-5">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">
                            Mis pronósticos
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Revisa los marcadores que ya registraste.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <SummaryCard label="Hechos" value={predictedMatches.length} />
                        <SummaryCard label="Puntos" value={totalPoints} />
                        <SummaryCard label="Exactos" value={exactHits} />
                    </div>


                    {pendingPredictions.length > 0 && (
                        <PredictionGroup
                            title="🟡 Pendientes"
                            matches={pendingPredictions}
                            myPredictions={myPredictions}
                            results={results}
                        />
                    )}

                    {finishedPredictions.length > 0 && (
                        <PredictionGroup
                            title="🟢 Finalizados"
                            matches={finishedPredictions}
                            myPredictions={myPredictions}
                            results={results}
                        />
                    )}
                </section>
            }
        </>

    );
}

function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="mt-1 text-xs font-bold text-gray-500">{label}</p>
        </div>
    );
}

function PredictionGroup({
    title,
    matches,
    myPredictions,
    results,
}: {
    title: string;
    matches: Match[];
    myPredictions: Record<
        string,
        {
            homeScore: number;
            awayScore: number;
        }
    >;
    results: ResultsMap;
}) {
    return (
        <div className="space-y-3">
            <h3 className="px-1 text-base font-black text-gray-900">
                {title}
            </h3>

            {matches.map((match) => {
                const homeTeam = match.homeTeamId ? teamsById[match.homeTeamId] : null;
                const awayTeam = match.awayTeamId ? teamsById[match.awayTeamId] : null;
                const prediction = myPredictions[match.id];
                const result = results[match.id];

                if (!homeTeam || !awayTeam || !prediction) return null;

                const points =
                    result?.status === "finished"
                        ? calculatePredictionPoints(prediction, result).points
                        : null;

                return (
                    <article
                        key={match.id}
                        className="rounded-3xl bg-white p-5 shadow-sm"
                    >
                        <div className="mb-4">
                            <p className="text-sm font-bold text-gray-400">
                                {formatMatchDate(match.kickoff)}
                            </p>

                            <h4 className="mt-1 text-lg font-black text-gray-900">
                                {homeTeam.nameEs} vs {awayTeam.nameEs}
                            </h4>
                        </div>

                        <p className="mb-2 text-xs font-black uppercase tracking-wide text-gray-400">
                            Tu pronóstico
                        </p>

                        <ScoreResultSection
                            homeTeam={homeTeam}
                            awayTeam={awayTeam}
                            result={{
                                matchId: match.id,
                                homeScore: prediction.homeScore,
                                awayScore: prediction.awayScore,
                                status: "scheduled",
                            }}
                        />

                        {result?.status === "finished" && (
                            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                                    Resultado final
                                </p>

                                <div className="mt-2">
                                    <ScoreResultSection
                                        homeTeam={homeTeam}
                                        awayTeam={awayTeam}
                                        result={result}
                                    />
                                </div>

                                <p className="mt-3 text-sm font-black text-gray-900">
                                    {points === 1
                                        ? "+1 punto"
                                        : points === 3
                                            ? "+3 puntos"
                                            : "+0 puntos"}
                                </p>
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
}

function formatMatchDate(kickoff: string) {
    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Lima",
    }).format(new Date(kickoff));
}