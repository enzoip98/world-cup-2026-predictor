export type MatchResult = {
    matchId: string;
    homeScore: number;
    awayScore: number;
    status: "scheduled" | "finished";
    // Knockout only:
    qualifiedTeamId?: string;
    wentToPenalties?: boolean;
    modificationWindowOpen?: boolean;
    modificationWindowClosesAt?: string; // ISO timestamp
};