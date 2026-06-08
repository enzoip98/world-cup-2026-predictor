import {
    collection,
    onSnapshot,
    query,
    where,doc,setDoc,serverTimestamp
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