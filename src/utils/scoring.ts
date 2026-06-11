import { SpecialPrediction } from "@/lib/predictions";
import { SpecialResults } from "@/lib/specialResults";
import { MatchResult } from "@/types/MatchResult";
import { Prediction, ScoreResult } from "@/types/Prediction";

function getOutcome(homeScore: number, awayScore: number) {
    if (homeScore > awayScore) return "home";
    if (homeScore < awayScore) return "away";
    return "draw";
}

export function calculatePredictionPoints(
    prediction: Prediction,
    result: MatchResult
): ScoreResult {
    const exactScore =
        prediction.homeScore === result.homeScore && prediction.awayScore === result.awayScore;
    const predictedOutcome = getOutcome(prediction.homeScore, prediction.awayScore);
    const realOutcome = getOutcome(result.homeScore, result.awayScore);
    const correctResult = predictedOutcome === realOutcome;

    if (exactScore) {
        return {
            points: 5,
            reason: "exact_score",
            exactScore: true,
            correctResult: true,
        };
    }

    if (correctResult) {
        return {
            points: 3,
            reason: "correct_result",
            exactScore: false,
            correctResult: true,
        };
    }

    return {
        points: 0,
        reason: "failed",
        exactScore: false,
        correctResult: false,
    };
}

export function calculateSpecialPredictionPoints(
    userSpecialPrediction: SpecialPrediction | null,
    specialResults: SpecialResults | null
) {
    let points = 0;

    if (!userSpecialPrediction || !specialResults) return points;

    if (
        userSpecialPrediction.championTeamId &&
        userSpecialPrediction.championTeamId === specialResults.championTeamId
    ) {
        points += 20;
    }

    if (
        userSpecialPrediction.runnerUpTeamId &&
        userSpecialPrediction.runnerUpTeamId === specialResults.runnerUpTeamId
    ) {
        points += 10;
    }

    if (
        userSpecialPrediction.topScorerPlayerId &&
        userSpecialPrediction.topScorerPlayerId === specialResults.topScorerPlayerId
    ) {
        points += 10;
    }

    if (
        userSpecialPrediction.bestPlayerId &&
        userSpecialPrediction.bestPlayerId === specialResults.bestPlayerId
    ) {
        points += 10;
    }

    return points;
}