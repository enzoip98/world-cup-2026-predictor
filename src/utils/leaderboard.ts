import { AppUser } from "@/lib/users";
import { calculateSpecialPredictionPoints } from "./scoring";
import { SpecialPredictionsMap } from "@/lib/predictions";
import { SpecialResults } from "@/lib/specialResults";
import { MatchPredictionSummary } from "./predictionSummary";

type MatchPredictionSummariesMap = {
    [matchId: string]: MatchPredictionSummary;
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
    matchPredictionSummaries: MatchPredictionSummariesMap,
    specialPredictions: SpecialPredictionsMap,
    specialResults: SpecialResults | null
): LeaderboardRow[] {
    const leaderboard = users.map((user) => {
        const userSpecialPrediction = specialPredictions[user.uid] ?? null;

        let matchPoints = 0;
        let exactScores = 0;
        let correctResults = 0;
        let failed = 0;
        let predictionsMade = 0;

        Object.values(matchPredictionSummaries).forEach((summary) => {
            const prediction = summary.predictions.find(
                (p) => p.userId === user.uid
            );

            if (!prediction) return;

            predictionsMade++;
            matchPoints += prediction.points;

            if (prediction.points === 5) exactScores++;
            else if (prediction.points === 3) correctResults++;
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
            points: matchPoints + specialPoints,
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