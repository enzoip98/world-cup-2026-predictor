export type MatchResult = {
    matchId: string;
    homeScore: number;
    awayScore: number;
    status: "scheduled" | "finished";
};