import {
    collection,
    onSnapshot,
    query,
    where, doc, setDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Prediction } from "@/types/Prediction";

export type PredictionsMap = {
    [userId: string]: {
        [matchId: string]: Prediction;
    };
};

type FirestorePrediction = Prediction & {
    userId: string;
    matchId: string;
};

export function subscribeToMyPredictions(
    partyId: string,
    userId: string,
    callback: (predictions: PredictionsMap) => void
) {
    const predictionsRef = collection(db, "parties", partyId, "predictions");

    const q = query(
        predictionsRef,
        where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
        const predictionsMap: PredictionsMap = {
            [userId]: {},
        };

        snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data() as FirestorePrediction;

            predictionsMap[userId][data.matchId] = {
                homeScore: data.homeScore,
                awayScore: data.awayScore,
            };
        });

        callback(predictionsMap);
    });
}

export function subscribeToPartyPredictions(
    partyId: string,
    callback: (predictions: PredictionsMap) => void
) {
    const predictionsRef = collection(db, "parties", partyId, "predictions");

    return onSnapshot(predictionsRef, (snapshot) => {
        const predictionsMap: PredictionsMap = {};

        snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data() as FirestorePrediction;

            if (!predictionsMap[data.userId]) {
                predictionsMap[data.userId] = {};
            }

            predictionsMap[data.userId][data.matchId] = {
                homeScore: data.homeScore,
                awayScore: data.awayScore,
            };
        });

        callback(predictionsMap);
    });
}

export async function savePredictionToFirebase({
    partyId,
    userId,
    matchId,
    prediction,
}: {
    partyId: string;
    userId: string;
    matchId: string;
    prediction: Prediction;
}) {
    const predictionId = `${userId}_${matchId}`;

    const predictionRef = doc(
        db,
        "parties",
        partyId,
        "predictions",
        predictionId
    );

    await setDoc(
        predictionRef,
        {
            userId,
            matchId,
            homeScore: prediction.homeScore,
            awayScore: prediction.awayScore,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        { merge: false }
    );
}

export type SpecialPrediction = {
    userId: string;
    championTeamId?: string;
    runnerUpTeamId?: string;
    topScorerPlayerId?: string;
    bestPlayerId?: string;
    createdAt?: unknown;
    updatedAt?: unknown;
};

export function subscribeToMySpecialPrediction(
    partyId: string,
    userId: string,
    callback: (prediction: SpecialPrediction | null) => void
) {
    const predictionRef = doc(
        db,
        "parties",
        partyId,
        "specialPredictions",
        userId
    );

    return onSnapshot(predictionRef, (snapshot) => {
        if (!snapshot.exists()) {
            callback(null);
            return;
        }

        callback(snapshot.data() as SpecialPrediction);
    });
}

export async function saveSpecialPredictionField({
    partyId,
    userId,
    field,
    value,
    hasWorldCupStarted,
}: {
    partyId: string | null | undefined;
    userId: string;
    field:
    | "championTeamId"
    | "runnerUpTeamId"
    | "topScorerPlayerId"
    | "bestPlayerId";
    value: string;
    hasWorldCupStarted: boolean;
}) {

    if(!partyId) return;

    if (hasWorldCupStarted) {
        throw new Error("Los pronósticos especiales ya están bloqueados.");
    }

    const predictionRef = doc(
        db,
        "parties",
        partyId,
        "specialPredictions",
        userId
    );

    await setDoc(
        predictionRef,
        {
            userId,
            [field]: value,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
        },
        { merge: true }
    );
}