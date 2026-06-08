export type Prediction = {
    homeScore: number;
    awayScore: number;
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
};