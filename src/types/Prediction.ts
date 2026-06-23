export type Prediction = {
    homeScore: number;
    awayScore: number;
    // Knockout only:
    qualifiedTeamId?: string;
    penaltiesIfDraw?: boolean;
    modifiedDuringWindow?: boolean;
};

export type ScoreReason =
    | "exact_score"
    | "correct_result"
    | "failed";

export type ScoreResult = {
    points: number;
    reason: ScoreReason;
    exactScore: boolean;
    correctResult: boolean;
    // Knockout breakdown:
    basePoints?: number;
    qualifierPoints?: number;
    penaltiesPoints?: number;
    convictionBonus?: number;
};