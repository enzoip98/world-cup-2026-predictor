import { AttendanceStatus } from "@/types/AttendanceStatus";
import { Match } from "@/types/Match";
import { formatDate, formatTime } from "@/utils/format";
import { teamsById } from "@/data/Teams";
import { Prediction } from "@/types/Prediction";
import { useState } from "react";
import { calculatePredictionPoints } from "@/utils/scoring";
import { MatchModalHeader } from "./MatchModalHeader";
import { EditableAttendanceSelector } from "./EditableAttendanceSelector";
import { ScoreInput } from "./ScoreInput";
import { MatchResult } from "@/types/MatchResult";
import { ScoreResultSection } from "./ScoreResultSection";
import { MatchStatus } from "@/utils/matchstatus";

type Props = {
    match: Match | null;
    onClose: () => void;
    attendanceStatus: AttendanceStatus | undefined;
    onAttendanceChange: (matchId: string, status: AttendanceStatus) => void;
    onClearAttendance: (matchId: string) => void;
    onSavePrediction: (matchId: string, prediction: Prediction) => void;
    prediction?: Prediction;
    resultMatch?: MatchResult;
    onSaveResult: (matchId: string, result: MatchResult) => void;
    status: MatchStatus;
};

type AttendanceOption = {
    value: AttendanceStatus;
    label: string;
    emoji: string;
};

const finishedAttendanceOptions: AttendanceOption[] = [
    { value: "going", label: "Asististe", emoji: "✅" },
    { value: "maybe", label: "No fuiste", emoji: "❌" },
    { value: "not_going", label: "No fuiste", emoji: "❌" },
];

export function MatchModal({ match, onClose, attendanceStatus, onClearAttendance, onAttendanceChange,
    onSavePrediction, prediction, onSaveResult, resultMatch, status }: Props) {

    const [isPredicting, setIsPredicting] = useState(false);
    const [isSavingResult, setIsSavingResult] = useState(false);
    const [homeScore, setHomeScore] = useState("");
    const [realHomeScore, setRealHomeScore] = useState(resultMatch ? String(resultMatch.homeScore) : "");
    const [realAwayScore, setRealAwayScore] = useState(resultMatch ? String(resultMatch.awayScore) : "");
    const [awayScore, setAwayScore] = useState("");

    if (!match) return null;

    const isFinished = resultMatch?.status === "finished";
    const scoreResult = prediction && isFinished ? calculatePredictionPoints(prediction, resultMatch) : null;

    const homeTeam = match.homeTeamId ? teamsById[match.homeTeamId] : null;
    const awayTeam = match.awayTeamId ? teamsById[match.awayTeamId] : null;

    const canPredict = status === "scheduled" && !prediction;

    const canSavePrediction = (
        homeScore !== "" &&
        awayScore !== "" &&
        Number(homeScore) >= 0 &&
        Number(awayScore) >= 0) && canPredict;

    const canSaveResult =
        realHomeScore !== "" &&
        realAwayScore !== "" &&
        Number(realHomeScore) >= 0 &&
        Number(realAwayScore) >= 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={onClose}>
            <div
                className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}>

                <div className="my-4 flex flex-col items-center justify-center gap-2">

                    <p className="text-xs text-red-500">
                        Modal status: {status}
                    </p>

                    {homeTeam && awayTeam && (
                        <MatchModalHeader homeTeam={homeTeam} awayTeam={awayTeam} />
                    )}

                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full bg-gray-100 px-3 py-1 text-lg font-bold text-gray-600 hover:bg-gray-200">
                        ×
                    </button>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                    <p>
                        <span className="font-semibold">Fecha:</span>{" "}
                        {formatDate(match.date)}
                    </p>

                    <p>
                        <span className="font-semibold">Hora:</span>{" "}
                        {formatTime(match.time)}
                    </p>

                    <p>
                        <span className="font-semibold">Casa:</span>{" "}
                        {match.host ?? "Por definir"}
                    </p>
                </div>

                {!isFinished && <EditableAttendanceSelector
                    matchId={match.id}
                    attendanceStatus={attendanceStatus}
                    onAttendanceChange={onAttendanceChange}
                    onClearAttendance={onClearAttendance}
                />}

                {isFinished && <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Tu asistencia</p>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {attendanceStatus
                            ? finishedAttendanceOptions.find((option) => option.value === attendanceStatus)?.label
                            : "Sin confirmar"}
                    </span>
                </div>}

                <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">Asistentes</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Todavía no hay asistentes registrados.
                    </p>
                </div>

                <div className="mt-6 rounded-2xl bg-gray-50 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-950">Pronóstico</p>
                            {!prediction && !isFinished && canPredict && (<p className="mt-1 text-sm text-gray-500">
                                Una vez guardado, no podrás cambiarlo.
                            </p>)}
                        </div>

                        {prediction && !isFinished && (
                            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                                Bloqueado
                            </span>
                        )}
                    </div>

                    {prediction ? (<>
                        <div className="mt-4 rounded-2xl bg-white p-4 text-center shadow-sm">
                            <p className="text-sm text-gray-500">Tu pronóstico</p>

                            {homeTeam && awayTeam && (
                                <ScoreResultSection
                                    homeTeam={homeTeam}
                                    awayTeam={awayTeam}
                                    result={{ ...prediction, status: "scheduled" }}
                                />
                            )}

                            {scoreResult && (<><div className="my-3 rounded-2xl p-2">
                                <div className="flex items-center justify-center gap-3">
                                    <p className="text-sm font-bold text-gray-950">Obtuviste</p>
                                    <div>
                                        <div className="rounded-xl bg-green-100 p-3">
                                            <p className="font-bold">
                                                {scoreResult.points} puntos
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div></>)}
                        </div>

                    </>)
                        : !isPredicting ? (
                            !isFinished ? (
                                <>
                                    {canPredict && <button
                                        onClick={() => setIsPredicting(true)}
                                        className="mt-4 w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
                                    >Pronosticar</button>}

                                    {!canPredict && <p className="mt-4 text-center text-sm text-gray-500">
                                        Este partido ya comenzó y no se puede pronosticar.
                                    </p>}
                                </>
                            ) : (<p className="mt-4 text-center text-sm text-gray-500">
                                El partido ya terminó, no hiciste un pronóstico.
                            </p>)
                        ) : (!isFinished && <>
                            <div className="mt-4">
                                {homeTeam && awayTeam && (
                                <ScoreInput
                                    homeTeam={homeTeam}
                                    awayTeam={awayTeam} homeScore={homeScore}
                                    setHomeScore={setHomeScore} awayScore={awayScore}
                                    setAwayScore={setAwayScore} />)}

                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsPredicting(false);
                                            setHomeScore("");
                                            setAwayScore("");
                                        }}
                                        className="flex-1 rounded-2xl bg-gray-200 px-4 py-3 text-sm font-bold text-gray-700"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        disabled={!canSavePrediction}
                                        onClick={() => {
                                            const confirmed = window.confirm(
                                                "¿Confirmas tu pronóstico? Luego no podrás cambiarlo."
                                            );

                                            if (!confirmed) return;

                                            onSavePrediction(match.id, {
                                                homeScore: Number(homeScore),
                                                awayScore: Number(awayScore),
                                            });

                                            setIsPredicting(false);
                                        }}
                                        className="flex-1 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </>
                        )}
                </div>

                {isFinished && <>
                    <div className="my-6 flex justify-center gap-1 flex-col">
                        <p className="text-xl text-center ps-1 font-bold text-gray-950">Resultado oficial</p>
                        {homeTeam && awayTeam && (
                            <ScoreResultSection homeTeam={homeTeam} awayTeam={awayTeam} result={resultMatch} />
                        )}
                    </div>

                </>
                }

                {!isFinished ? (

                    !isSavingResult ? (<>
                        <div className="mt-6 rounded-2xl bg-gray-50 p-5">
                            <div className="flex items-center justify-start">
                                <div>
                                    <p className="text-sm text-center font-bold text-gray-950">Resultado oficial</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSavingResult(true)}
                                className="mt-4 w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
                            >
                                Registrar resultado
                            </button>
                        </div></>)
                        :
                        <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                            <p className="text-sm mb-3 font-semibold text-gray-900">Registrar resultado</p>
                            {homeTeam && awayTeam && (
                                <ScoreInput
                                    homeTeam={homeTeam}
                                    awayTeam={awayTeam} homeScore={realHomeScore}
                                    setHomeScore={setRealHomeScore} awayScore={realAwayScore}
                                    setAwayScore={setRealAwayScore} />
                            )}

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsSavingResult(false);
                                        setRealHomeScore("");
                                        setRealAwayScore("");
                                    }}
                                    className="flex-1 rounded-2xl bg-gray-200 px-4 py-3 text-sm font-bold text-gray-700"
                                >
                                    Cancelar
                                </button>

                                <button
                                    disabled={!canSaveResult}
                                    onClick={() => {
                                        const confirmed = window.confirm(
                                            "¿Confirmas el resultado? Luego no podrás cambiarlo."
                                        );

                                        if (!confirmed) return;

                                        onSaveResult(match.id, {
                                            homeScore: Number(realHomeScore),
                                            awayScore: Number(realAwayScore),
                                            status: "finished",
                                        });

                                        setIsSavingResult(false);
                                    }}
                                    className="flex-1 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    Registrar resultado
                                </button>
                            </div>
                        </div>) : null}

            </div>
        </div>
    );
}