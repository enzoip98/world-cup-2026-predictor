export type Match = {
    id: string;
    matchNumber: number;
    stage: "group" | "round_of_32" | "round_of_16" | "quarter_final" | "semi_final" | "third_place" | "final";
    group?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";
    date: string;
    time: string;
    homeTeamId: string | null;
    awayTeamId: string | null;
    homeLabel?: string;
    awayLabel?: string;
    venue: string;
    city: string;
    country: "Mexico" | "USA" | "Canada";
    host?: string;
    kickoff: string;
};