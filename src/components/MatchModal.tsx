import { AttendanceStatus } from "@/types/AttendanceStatus";
import { Match } from "@/types/Match";
import { formatDate, formatTime } from "@/utils/format";
import { teamsByFifaCode, teamsById } from "@/data/Teams";
import { Prediction } from "@/types/Prediction";
import { useState } from "react";
import { calculatePredictionPoints } from "@/utils/scoring";
import { MatchModalHeader } from "./MatchModalHeader";
import { EditableAttendanceSelector } from "./EditableAttendanceSelector";
import { ScoreInput } from "./ScoreInput";
import { MatchResult } from "@/types/MatchResult";
import { ScoreResultSection } from "./ScoreResultSection";
import { MatchStatus } from "@/utils/matchstatus";
import { AppUser } from "@/lib/users";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { promoteMatchToWatchParty, removeMatchFromWatchParty, updateWatchPartyHost, WatchPartyMatch } from "@/lib/partyMatches";
import { deleteAttendanceByMatch } from "@/lib/attendance";

type Props = {
    match: Match | null;
    onClose: () => void;
    attendanceStatus: AttendanceStatus | undefined;
    onAttendanceChange: (matchId: string, status: AttendanceStatus) => void;
    onClearAttendance: (matchId: string) => void;
    onSavePrediction: (matchId: string, prediction: Prediction) => void;
    prediction?: Prediction;
    resultMatch?: MatchResult;
    onSaveResult: (matchId: string, result: {
        homeScore: number;
        awayScore: number;
    }) => void;
    status: MatchStatus;
    attendees: AppUser[];
    notAttendees: AppUser[];
    appUser: AppUser;
    isWatchParty: boolean;
    watchParty: WatchPartyMatch | undefined;
    members: AppUser[];
    onSavingWatchPartyChange?: (isSaving: boolean) => void;
};

type AttendanceOption = {
    value: AttendanceStatus;
    label: string;
    emoji: string;
};

const finishedAttendanceOptions: AttendanceOption[] = [
    { value: "going", label: "Asististe", emoji: "✅" },
    { value: "not_going", label: "No fuiste", emoji: "❌" },
];

export function MatchModal({ match, onClose, attendanceStatus, onClearAttendance, onAttendanceChange,
    onSavePrediction, prediction, onSaveResult, resultMatch, status, attendees, notAttendees,
    appUser, isWatchParty, watchParty, members, onSavingWatchPartyChange }: Props) {

    const [isPredicting, setIsPredicting] = useState(false);
    const [isSavingResult, setIsSavingResult] = useState(false);
    const [homeScore, setHomeScore] = useState("");
    const [realHomeScore, setRealHomeScore] = useState(resultMatch ? String(resultMatch.homeScore) : "");
    const [realAwayScore, setRealAwayScore] = useState(resultMatch ? String(resultMatch.awayScore) : "");
    const [awayScore, setAwayScore] = useState("");
    const [isPromotingWatchParty, setIsPromotingWatchParty] = useState(false);
    const [selectedHostUserId, setSelectedHostUserId] = useState(watchParty?.hostUserId ?? "");
    const [isSavingWatchParty, setIsSavingWatchParty] = useState(false);
    const [isEditingWatchParty, setIsEditingWatchParty] = useState(false);

    if (!match) return null;

    const isFinished = resultMatch?.status === "finished";
    const scoreResult = prediction && isFinished ? calculatePredictionPoints(prediction, resultMatch) : null;

    const homeTeam = match.homeTeamId ? teamsByFifaCode[match.homeTeamId] : null;
    const awayTeam = match.awayTeamId ? teamsByFifaCode[match.awayTeamId] : null;

    const canPredict = status === "scheduled";

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

    const isAdmin = appUser.role === "admin";
    const activePartyId = appUser.activePartyId;
    const selectedHost = members.find(
        (member) => member.uid === selectedHostUserId
    );

    const selectedHouseName = selectedHost
        ? `Casa de ${selectedHost.name.split(" ")[0]}`
        : "";

    const handleUpdateWatchParty = async () => {
        if (!match) return;
        if (!activePartyId) return;
        if (!selectedHost) return;

        try {
            onSavingWatchPartyChange?.(true);

            await updateWatchPartyHost({
                partyId: activePartyId,
                matchId: match.id,
                hostUserId: selectedHost.uid,
                hostName: selectedHost.name,
                houseName: selectedHouseName,
            });

            setIsEditingWatchParty(false);
        } catch (error) {
            console.error(error);
        } finally {
            onSavingWatchPartyChange?.(false);
        }
    };

    const handlePromoteToWatchParty = async () => {
        if (!match) return;
        if (!activePartyId) return;
        if (!selectedHost) return;

        try {
            setIsSavingWatchParty(true);
            onSavingWatchPartyChange?.(true);

            await promoteMatchToWatchParty({
                partyId: activePartyId,
                matchId: match.id,
                houseName: selectedHouseName,
                hostUserId: selectedHost.uid,
                hostName: selectedHost.name,
            });

            setIsPromotingWatchParty(false);
            setSelectedHostUserId("");
        } catch (error) {
            console.error("Error promoviendo partido:", error);
        } finally {
            setIsSavingWatchParty(false);
            onSavingWatchPartyChange?.(false);
        }
    };

    const handleRemoveWatchParty = async () => {
        if (!match) return;
        if (!activePartyId) return;

        try {
            onSavingWatchPartyChange?.(true);

            await deleteAttendanceByMatch(activePartyId, match.id);
            await removeMatchFromWatchParty(activePartyId, match.id);
        } catch (error) {
            console.error("Error quitando watch party:", error);
        } finally {
            onSavingWatchPartyChange?.(false);
        }
    };

    //TODO: cuando termino el partido, mejorar lista de asistentes

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}>
            <div
                className="relative w-full max-w-md max-h-[80vh] 
                overflow-y-auto rounded-3xl bg-white px-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}>

                <div className="bg-white my-4 flex flex-col items-center justify-center gap-2">
                    <button
                        onClick={onClose}
                        className="absolute right-1 top-1 rounded-full bg-gray-200 px-3 m-1 py-1 text-md font-bold text-gray-600 hover:bg-gray-200">
                        ×
                    </button>
                    {homeTeam && awayTeam && (
                        <MatchModalHeader homeTeam={homeTeam} awayTeam={awayTeam} />
                    )}
                </div>

                <div>
                    <div className="mt-6 rounded-3xl bg-gray-50 p-5 space-y-3">
                        <p className="flex items-center gap-3 text-base text-gray-700">
                            <span>📅</span>
                            <span><strong>Fecha:</strong> {formatDate(match.date)}</span>
                        </p>

                        <p className="flex items-center gap-3 text-base text-gray-700">
                            <span>🕗</span>
                            <span><strong>Hora:</strong> {formatTime(match.time)}</span>
                        </p>

                        {isWatchParty && (
                            <p className="flex items-center gap-3 text-base text-gray-700">
                                <span>🏠</span>
                                <span><strong>Se verá en:</strong> {`Casa de ${watchParty?.hostName.split(" ")[0]}`}</span>
                            </p>
                        )}
                    </div>

                    {!isFinished && isAdmin && isWatchParty && (
                        <details className="mt-4 rounded-3xl bg-gray-50 p-5">
                            <summary className="cursor-pointer font-black text-gray-900">
                                Opciones de administrador
                            </summary>

                            <div className="mt-4 space-y-4">
                                {!isEditingWatchParty && (
                                    <section className="my-2 rounded-3xl bg-blue-50 px-6 py-2">

                                        <button
                                            onClick={() => setIsEditingWatchParty(true)}
                                            className="mt-5 w-full rounded-2xl bg-blue-600 py-4 text-base font-black text-white"
                                        >
                                            Cambiar casa
                                        </button>

                                        <p className="my-2 text-xs text-center font-medium text-gray-600">
                                            Actualmente se verá en {watchParty?.houseName}
                                        </p>

                                    </section>
                                )}
                                {isEditingWatchParty && (
                                    <section className="my-2 rounded-3xl bg-blue-50 p-6">

                                        <p className="text-lg font-black text-gray-950">
                                            Cambiar casa
                                        </p>

                                        <select
                                            value={selectedHostUserId}
                                            onChange={(e) => setSelectedHostUserId(e.target.value)}
                                            className="mt-4 w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 font-bold"
                                        >
                                            {members.map(member => (
                                                <option
                                                    key={member.uid}
                                                    value={member.uid}
                                                >
                                                    Casa de {member.name.split(" ")[0]}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="mt-4 flex gap-3">

                                            <button
                                                onClick={() => {
                                                    setIsEditingWatchParty(false);
                                                    setSelectedHostUserId(
                                                        watchParty?.hostUserId ?? ""
                                                    );
                                                }}
                                                className="flex-1 rounded-2xl bg-white py-4 font-black"
                                            >
                                                Cancelar
                                            </button>

                                            <button
                                                onClick={handleUpdateWatchParty}
                                                className="flex-1 rounded-2xl bg-blue-600 py-4 font-black text-white"
                                            >
                                                Guardar
                                            </button>

                                        </div>

                                    </section>
                                )}
                                <section className="my-2 rounded-3xl bg-red-50 px-6 py-2">
                                    <button
                                        onClick={() => {
                                            const confirmed = window.confirm(
                                                "¿Seguro que deseas quitar este watch party?"
                                            );
                                            if (!confirmed) return;
                                            handleRemoveWatchParty();
                                        }}
                                        className="mt-5 w-full rounded-2xl bg-red-600 py-4 text-base font-black text-white"
                                    >
                                        No se verá en grupo
                                    </button>

                                    <p className="my-2 text-xs text-center font-medium text-gray-600">
                                        Este partido dejará de aparecer en Veremos juntos y se ocultará la asistencia.
                                    </p>
                                </section>
                            </div>
                        </details>
                    )}

                    {isWatchParty && (<>
                        {!isFinished && <EditableAttendanceSelector
                            matchId={match.id}
                            attendanceStatus={attendanceStatus}
                            onAttendanceChange={onAttendanceChange}
                            onClearAttendance={onClearAttendance}
                        />}

                        {isFinished && <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">Tu asistencia</p>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                {attendanceStatus
                                    ? finishedAttendanceOptions.find((option) => option.value === attendanceStatus)?.label
                                    : "Sin confirmar"}
                            </span>
                        </div>}

                        <div className="mt-6 rounded-2xl bg-gray-50 p-4">

                            {((attendees.length === 0 && notAttendees.length === 0) && !isFinished) ? (
                                <p className="mt-1 text-sm text-gray-500">
                                    Todavía no hay asistentes registrados.
                                </p>
                            ) : (<>
                                {attendees.length != 0 && <div className="my-3 space-y-2">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {!isFinished ? `Asistentes (${attendees.length})` : `Asistieron (${attendees.length})`}
                                    </p>
                                    {attendees.map((user) => (
                                        <div
                                            key={user.uid}
                                            className="flex items-center gap-3 rounded-xl bg-white px-3 py-2"
                                        >
                                            <Avatar>
                                                <AvatarImage
                                                    src={user.avatarUrl ?? user.photoURL ?? undefined}
                                                    referrerPolicy="no-referrer"
                                                />
                                                <AvatarFallback>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {user.name.trim().split(/\s+/).slice(0, 2).join(" ")}
                                                    {user.uid === appUser?.uid && (
                                                        <span className="ml-2 text-xs text-blue-600">(Tú)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>}

                                {notAttendees.length != 0 && <div className="my-3 space-y-2">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {!isFinished ? `No irán (${notAttendees.length})` : `No fueron (${notAttendees.length})`}
                                    </p>
                                    {notAttendees.map((user) => (
                                        <div
                                            key={user.uid}
                                            className="flex items-center gap-3 rounded-xl bg-white px-3 py-2"
                                        >
                                            <Avatar>
                                                <AvatarImage
                                                    src={user.avatarUrl ?? user.photoURL ?? undefined}
                                                    referrerPolicy="no-referrer"
                                                />
                                                <AvatarFallback>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {user.name.trim().split(/\s+/).slice(0, 2).join(" ")}
                                                    {user.uid === appUser?.uid && (
                                                        <span className="ml-2 text-xs text-blue-600">(Tú)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>}
                            </>
                            )}
                        </div>
                    </>
                    )}

                    {!isFinished && isAdmin && !isWatchParty && !isPromotingWatchParty && (
                        <section className="mt-6 rounded-3xl bg-emerald-50 p-6">
                            <p className="text-lg font-black text-gray-950">
                                ¿Veremos este partido juntos?
                            </p>

                            <p className="mt-2 text-sm font-medium text-gray-600">
                                Elige una casa y activa la asistencia para este partido.
                            </p>

                            <button
                                onClick={() => setIsPromotingWatchParty(true)}
                                className="mt-5 w-full rounded-2xl bg-emerald-600 py-4 text-base font-black text-white"
                            >
                                Proponer junte
                            </button>
                        </section>
                    )}

                    {!isFinished && isAdmin && !isWatchParty && isPromotingWatchParty && (
                        <section className="mt-6 rounded-3xl bg-emerald-50 p-6">
                            <p className="text-lg font-black text-gray-950">
                                Proponer junte
                            </p>

                            <p className="mt-2 text-sm font-medium text-gray-600">
                                Selecciona en qué casa se verá este partido.
                            </p>

                            <select
                                value={selectedHostUserId}
                                onChange={(e) => setSelectedHostUserId(e.target.value)}
                                className="mt-5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base font-bold text-gray-900 outline-none"
                            >
                                <option value="">Seleccionar casa</option>

                                {members.map((member) => (
                                    <option key={member.uid} value={member.uid}>
                                        Casa de {member.name.split(" ")[0]}
                                    </option>
                                ))}
                            </select>

                            {selectedHost && (
                                <div className="mt-4 rounded-2xl bg-white p-4">
                                    <p className="text-sm font-semibold text-gray-500">
                                        Casa seleccionada
                                    </p>
                                    <p className="mt-1 text-base font-black text-gray-950">
                                        {selectedHouseName}
                                    </p>
                                </div>
                            )}

                            <div className="mt-5 flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsPromotingWatchParty(false);
                                        setSelectedHostUserId("");
                                    }}
                                    className="flex-1 rounded-2xl bg-white py-4 text-base font-black text-gray-700"
                                >
                                    Cancelar
                                </button>

                                <button
                                    disabled={!selectedHost || isSavingWatchParty}
                                    onClick={handlePromoteToWatchParty}
                                    className="flex-1 rounded-2xl bg-emerald-600 py-4 text-base font-black text-white disabled:opacity-50"
                                >
                                    {isSavingWatchParty ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </section>
                    )}

                    <div className="mt-6 rounded-2xl bg-gray-50 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-950">Pronóstico</p>
                                {/*{!prediction && !isFinished && canPredict && (<p className="mt-1 text-sm text-gray-500">
                                    Una vez guardado, no podrás cambiarlo.
                                </p>)}*/}
                            </div>

                            {/*{prediction && !isFinished && (
                                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                                    Bloqueado
                                </span>
                            )}*/}
                        </div>

                        {prediction && !isPredicting ? (<>
                            <div className="my-2 rounded-2xl bg-white p-4 text-center shadow-sm">
                                <p className="text-sm text-gray-500">Tu pronóstico</p>

                                {homeTeam && awayTeam && (
                                    <ScoreResultSection
                                        homeTeam={homeTeam}
                                        awayTeam={awayTeam}
                                        result={{ matchId: match.id, ...prediction, status: "scheduled" }}
                                    />
                                )}

                                {canPredict && !isFinished && (
                                    <button
                                        onClick={() => {
                                            setHomeScore(String(prediction.homeScore));
                                            setAwayScore(String(prediction.awayScore));
                                            setIsPredicting(true);
                                        }}
                                        className="mt-4 w-full rounded-2xl bg-yellow-200 px-4 py-3 text-sm font-bold text-black transition
                                        hover:bg-yellow-400"
                                    >
                                        Cambiar pronóstico
                                    </button>
                                )}

                                {!canPredict && !isFinished && (
                                    <span className="text-center text-sm text-red-400 font-semibold">El partido ya empezó.</span>
                                )}

                                {scoreResult && (<><div className="my-3 rounded-2xl">
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
                                                    "¿Confirmas tu pronóstico?"
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
                            <div className="my-6 rounded-2xl bg-gray-50 p-5">
                                <div className="flex items-center justify-start">
                                    <div>
                                        <p className="text-sm text-center font-bold text-gray-950">Resultado oficial</p>
                                    </div>
                                </div>

                                {appUser.role === "admin" ? <>
                                    <button
                                        onClick={() => setIsSavingResult(true)}
                                        className="mt-4 w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
                                    >
                                        Registrar resultado
                                    </button>
                                </> : <>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Aún no se ha registrado el resultado oficial.
                                    </p>
                                </>}
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
                                                awayScore: Number(realAwayScore)
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
        </div>
    );
}