import { Match } from "@/types/Match";
import { formatDate, formatTime } from "@/utils/format";
import { teamsById } from "@/data/Teams";
import { useState } from "react";
import { WatchPartyMatch } from "@/lib/partyMatches";


type Props = {
    match: Match;
    onSelect: (match: Match) => void;
    status: "scheduled" | "live" | "finished";
    attendanceCount: number;
    isWatchParty: boolean;
    watchParty: WatchPartyMatch;
};

export function MatchCard({ match, onSelect, status, attendanceCount, isWatchParty, watchParty }: Props) {

    const homeTeam = match.homeTeamId ? teamsById[match.homeTeamId] : null;
    const awayTeam = match.awayTeamId ? teamsById[match.awayTeamId] : null;


    return (
        <div
            onClick={() => {
                if (homeTeam && awayTeam) {
                    return onSelect(match)
                }
                else {
                    return null
                }
            }}
            className="cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(match.date)}</span>
                <span>{formatTime(match.time)}</span>
            </div>

            <h3 className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-lg font-bold text-gray-900">
                <div className="flex items-center justify-end gap-2 overflow-hidden">
                    {homeTeam && (
                        <>
                            <img
                                src={`https://flagcdn.com/w40/${homeTeam.iso2.toLowerCase()}.png`}
                                alt={homeTeam.nameEs}
                                className="h-5 w-7 rounded-sm object-cover shadow-sm"
                            />
                            <span className="text-center">{homeTeam.nameEs}</span>
                        </>
                    )}
                </div>

                <span className="px-2 font-medium text-gray-500">
                    VS
                </span>

                <div className="flex items-center justify-start gap-2">
                    {awayTeam && (
                        <>
                            <img
                                src={`https://flagcdn.com/w40/${awayTeam.iso2.toLowerCase()}.png`}
                                alt={awayTeam.nameEs}
                                className="h-5 w-7 rounded-sm object-cover shadow-sm"
                            />
                            <span className="text-center">{awayTeam.nameEs}</span>
                        </>
                    )}
                </div>
            </h3>

            {isWatchParty && <>
                <p className="mt-2 text-sm text-gray-500">
                    {watchParty.houseName}
                </p>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm">
                    <span className="text-gray-500">Asisten</span>
                    <span className="font-bold text-gray-900">{attendanceCount}</span>
                </div>
            </>
            }


        </div>
    );

}