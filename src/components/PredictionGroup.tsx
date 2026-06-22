import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { teamsByFifaCode, teamsById } from "@/data/Teams";
import { PredictionsMap, StartedMatchPredictionsMap } from "@/lib/predictions";
import { ResultsMap } from "@/lib/results";
import { AppUser } from "@/lib/users";
import { Match } from "@/types/Match";
import { calculatePredictionPoints } from "@/utils/scoring";
import { ScoreResultSection } from "./ScoreResultSection";
import { useEffect, useState } from "react";
import { getMatchStatus } from "@/utils/matchstatus";
import { MatchPredictionSummary } from "@/utils/predictionSummary";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";


export function PredictionGroup({
    title,
    matches,
    myPredictions,
    results,
    mode,
    matchPredictionSummaries,
    partyUsers,
    onSelect, now, startedMatchPredictions
}: {
    title: string;
    matches: Match[];
    matchPredictionSummaries: Record<string, MatchPredictionSummary>;
    partyUsers: AppUser[];
    myPredictions: Record<
        string,
        {
            homeScore: number;
            awayScore: number;
        }
    >;
    results: ResultsMap;
    startedMatchPredictions: StartedMatchPredictionsMap;
    mode: string;
    onSelect: (match: Match) => void;
    now: number;
}) {

    return (
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:grid-cols-3">
            <h3 className="px-1 text-base font-black text-gray-900">
                {title}
            </h3>

            {matches.map((match) => {
                const status = getMatchStatus(match, results[match.id], now);
                const matchStarted = status !== "scheduled";
                const homeTeam = match.homeTeamId ? teamsByFifaCode[match.homeTeamId] : null;
                const awayTeam = match.awayTeamId ? teamsByFifaCode[match.awayTeamId] : null;
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
                        onClick={() => onSelect(match)}
                        className={`cursor-pointer rounded-3xl p-4 shadow-lg ${mode === "finished" ? "bg-teal-50" : "bg-pink-50"
                            }`}
                    >
                        <div className="my-1 flex items-center justify-between gap-3">

                            {result?.status !== "finished" &&
                                <p className="text-xs font-bold text-gray-400">
                                    {formatMatchDate(match.kickoff)}
                                </p>
                            }

                            {points !== null && (
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-black ${points > 0
                                        ? "bg-green-600 text-white"
                                        : "bg-red-100 text-gray-600"
                                        }`}
                                >
                                    +{points} pts
                                </span>
                            )}
                        </div>

                        <div className="flex flex-row items-center justify-between">
                            <p className="text-center w-20 shrink-0 text-[9px] font-light capitalize leading-tight tracking-wide text-gray-500">
                                Tu pronóstico
                            </p>
                            <div className="w-full">
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
                            </div>
                        </div>

                        {result?.status === "finished" && (
                            <div className="flex flex-row items-center justify-between">
                                <p className="text-center w-20 shrink-0 text-[11px] font-semibold capitalize leading-tight tracking-wide text-gray-900">
                                    Resultado
                                </p>
                                <div className="w-full">
                                    <ScoreResultSection
                                        homeTeam={homeTeam}
                                        awayTeam={awayTeam}
                                        result={result}
                                    />
                                </div>

                            </div>
                        )}

                        {matchStarted && (
                            <Accordion
                                className="mt-4 rounded-2xl bg-white/70 px-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <AccordionItem value="details" className="border-none">
                                    <AccordionTrigger className="py-3 text-sm font-black text-gray-700 hover:no-underline">
                                        Ver pronósticos de todos
                                    </AccordionTrigger>

                                    <AccordionContent className="py-0.5">
                                        <div className="space-y-2">
                                            {(() => {
                                                const isFinished = result?.status === "finished";

                                                const predictionsToShow = isFinished
                                                    ? matchPredictionSummaries[match.id]?.predictions ?? []
                                                    : startedMatchPredictions[match.id] ?? [];

                                                if (predictionsToShow.length === 0) {
                                                    return (
                                                        <p className="py-2 text-center text-xs font-semibold text-gray-400">
                                                            Todavía no hay pronósticos para mostrar.
                                                        </p>
                                                    );
                                                }

                                                const predictionsByUserId = Object.fromEntries(
                                                    predictionsToShow.map((prediction) => [
                                                        prediction.userId,
                                                        prediction,
                                                    ])
                                                );

                                                return partyUsers.map((user) => {
                                                    const userPrediction = predictionsByUserId[user.uid];

                                                    if (!userPrediction) return null;

                                                    const points =
                                                        isFinished && "points" in userPrediction
                                                            ? userPrediction.points
                                                            : null;

                                                    return (
                                                        <div
                                                            key={user.uid}
                                                            className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-1 text-sm"
                                                        >
                                                            <div className="mb-0 w-1/3 flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarImage
                                                                        src={user.avatarUrl ?? user.photoURL ?? undefined}
                                                                        referrerPolicy="no-referrer"
                                                                    />
                                                                    <AvatarFallback>
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                <span className="truncate font-semibold text-gray-800 text-[11px]">
                                                                    {"userName" in userPrediction ? userPrediction.userName : user.name}
                                                                </span>
                                                            </div>

                                                            <h1 className="mb-0 text-sm text-gray-700 font-bold">
                                                                {userPrediction.homeScore}-{userPrediction.awayScore}
                                                            </h1>

                                                            {points !== null && (
                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-black ${points > 0
                                                                            ? "bg-green-100 text-green-700"
                                                                            : "bg-red-200 text-red-500"
                                                                        }`}
                                                                >
                                                                    +{points}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
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
