import { AppUser } from "@/lib/users";
import { calculatePredictionPoints, calculateSpecialPredictionPoints } from "./scoring";
import { MatchResult } from "@/types/MatchResult";
import { Prediction } from "@/types/Prediction";
import { SpecialPrediction, SpecialPredictionsMap } from "@/lib/predictions";
import { SpecialResults } from "@/lib/specialResults";

type ResultsMap = {
    [matchId: string]: MatchResult;
};

type PredictionsMap = {
    [userId: string]: {
        [matchId: string]: Prediction;
    };
};

export type LeaderboardRow = {
    userId: string;
    name: string;
    photoURL?: string;
    avatarUrl?: string;
    points: number;
    exactScores: number;
    correctResults: number;
    failed: number;
    predictionsMade: number;
};

export function calculateLeaderboard(
    users: AppUser[],
    predictions: PredictionsMap,
    results: ResultsMap,
    specialPredictions: SpecialPredictionsMap,
    specialResults: SpecialResults | null
): LeaderboardRow[] {
    const leaderboard = users.map(user => {
        const userPredictions = predictions[user.uid] ?? {};
        const userSpecialPrediction = specialPredictions[user.uid] ?? null;

        let matchPoints = 0;
        let exactScores = 0;
        let correctResults = 0;
        let failed = 0;
        let predictionsMade = 0;

        Object.entries(userPredictions).forEach(([matchId, prediction]) => {

            predictionsMade++;

            const result = results[matchId];

            if (!result || result.status !== "finished") {
                return;
            }

            const score = calculatePredictionPoints(prediction, result);

            matchPoints += score.points;

            if (score.exactScore) exactScores++;
            else if (score.correctResult) correctResults++;
            else failed++;
        });

        const specialPoints = calculateSpecialPredictionPoints(
            userSpecialPrediction,
            specialResults
        );

        return {
            userId: user.uid,
            name: user.name.split(" ")[0],
            avatarUrl: user.avatarUrl ?? undefined,
            points: (matchPoints + specialPoints),
            matchPoints,
            specialPoints,
            exactScores,
            correctResults,
            failed,
            predictionsMade,
        };
    });

    return leaderboard.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
        if (b.correctResults !== a.correctResults) return b.correctResults - a.correctResults;
        return a.name.localeCompare(b.name);
    });
}