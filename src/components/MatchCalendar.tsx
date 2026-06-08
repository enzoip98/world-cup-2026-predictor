"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { teamsById } from "@/data/Teams";

import { Match } from "@/types/Match";
import { match } from "assert/strict";

type Props = {
    matches: Match[];
    onSelect: (match: Match) => void;
};

export function MatchCalendar({ matches, onSelect }: Props) {

    const events = matches.map((match) => {
        if (match.homeTeamId && match.awayTeamId) {
            return {
                id: match.id,
                title: `${teamsById[match.homeTeamId].nameEs} vs ${teamsById[match.awayTeamId].nameEs}`,
                start: `${match.date}T${match.time}`
            };
        } else {
            return {
                id: match.id,
                title: `Partido ${match.matchNumber}`,
                start: `${match.date}T${match.time}`
            };
        }
    });

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={esLocale}
                events={events}
                eventClick={(info) => {
                    const match = matches.find((m) => m.id === info.event.id);
                    if (match) {
                        onSelect(match);
                    }
                }}
            />
        </div>
    );
}