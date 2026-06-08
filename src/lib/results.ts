import {
    collection,
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MatchResult } from "@/types/MatchResult";

export type ResultsMap = {
    [matchId: string]: MatchResult;
};

export function subscribeToResults(
    callback: (results: ResultsMap) => void
) {
    const resultsRef = collection(db, "results");

    return onSnapshot(resultsRef, (snapshot) => {
        const resultsMap: ResultsMap = {};

        snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data() as MatchResult;
            resultsMap[data.matchId] = data;
        });

        callback(resultsMap);
    });
}

export async function saveResultToFirebase({
    matchId,
    homeScore,
    awayScore,
    updatedBy,
}: {
    matchId: string;
    homeScore: number;
    awayScore: number;
    updatedBy: string;
}) {
    const resultRef = doc(db, "results", matchId);

    await setDoc(
        resultRef,
        {
            matchId,
            homeScore,
            awayScore,
            status: "finished",
            updatedBy,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}