import { Match } from "@/types/Match";
import { formatDate, formatTime } from "@/utils/format";
import { teamsById } from "@/data/Teams";
import { useState } from "react";


type Props = {
    match: Match;
    onSelect: (match: Match) => void;
    status: "scheduled" | "live" | "finished";
};

export function MatchCard({ match, onSelect, status }: Props) {

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

            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                {homeTeam && <><img
                    src={`https://flagcdn.com/w40/${homeTeam.iso2.toLowerCase()}.png`}
                    alt={homeTeam.nameEs}
                    className="h-5 w-7 rounded-sm object-cover shadow-sm"
                />

                    <span>{homeTeam.nameEs}</span></>}

                <span className="text-gray-500 font-medium">vs</span>

                {awayTeam && <><img
                    src={`https://flagcdn.com/w40/${awayTeam.iso2.toLowerCase()}.png`}
                    alt={awayTeam.nameEs}
                    className="h-5 w-7 rounded-sm object-cover shadow-sm"
                />

                    <span>{awayTeam.nameEs}</span></>}


            </h3>

            <p className="mt-2 text-sm text-gray-500">
                Casa: {match.host ?? "Por definir"}
            </p>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-500">Asisten</span>
                <span className="font-bold text-gray-900">0</span>
            </div>
            <div><p>{status}</p></div>
        </div>
    );

}