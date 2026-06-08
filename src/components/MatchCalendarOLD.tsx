import { Match } from "@/types/Match";

type Props = {
    matches: Match[];
};

export function MatchCalendar({ matches }: Props) {
    const grouped = matches.reduce<Record<string, Match[]>>((acc, match) => {
        acc[match.date] = acc[match.date] || [];
        acc[match.date].push(match);
        return acc;
    }, {});

    return (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(grouped).map(([date, dayMatches]) => {
                const formattedDate = new Date(`${date}T00:00`).toLocaleDateString(
                    "es-PE",
                    {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                    }
                );

                return (
                    <div key={date} className="rounded-2xl border bg-white p-4 shadow-sm">
                        <h3 className="mb-3 font-bold capitalize text-gray-900">
                            {formattedDate}
                        </h3>

                        <div className="space-y-2">
                            {dayMatches.map((match) => (
                                <div
                                    key={match.id}
                                    className="rounded-xl bg-gray-100 p-3 text-sm"
                                >
                                    <p className="font-semibold">
                                        {match.home} vs {match.away}
                                    </p>
                                    <p className="text-gray-500">{match.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}