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
    qualifiedTeamId,
    wentToPenalties,
    openModificationWindowMinutes,
}: {
    matchId: string;
    homeScore: number;
    awayScore: number;
    updatedBy: string;
    qualifiedTeamId?: string;
    wentToPenalties?: boolean;
    openModificationWindowMinutes?: number;
}) {
    const resultRef = doc(db, "results", matchId);

    const isDraw = homeScore === awayScore;
    const shouldOpenWindow = isDraw && openModificationWindowMinutes && openModificationWindowMinutes > 0;

    const data: Record<string, unknown> = {
        matchId,
        homeScore,
        awayScore,
        status: "finished",
        updatedBy,
        updatedAt: serverTimestamp(),
    };

    if (qualifiedTeamId !== undefined) data.qualifiedTeamId = qualifiedTeamId;
    if (wentToPenalties !== undefined) data.wentToPenalties = wentToPenalties;

    if (shouldOpenWindow) {
        const closesAt = new Date(Date.now() + openModificationWindowMinutes * 60 * 1000);
        data.modificationWindowOpen = true;
        data.modificationWindowClosesAt = closesAt.toISOString();
    }

    await setDoc(resultRef, data, { merge: true });
}

export async function closeModificationWindow(matchId: string) {
    const resultRef = doc(db, "results", matchId);
    await setDoc(resultRef, { modificationWindowOpen: false }, { merge: true });
}