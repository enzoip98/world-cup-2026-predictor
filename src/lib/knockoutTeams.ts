import {
    collection,
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type KnockoutTeamAssignment = {
    matchId: string;
    homeTeamId: string;
    awayTeamId: string;
    updatedBy: string;
    updatedAt?: unknown;
};

export type KnockoutTeamsMap = {
    [matchId: string]: KnockoutTeamAssignment;
};

export function subscribeToKnockoutTeams(
    callback: (teams: KnockoutTeamsMap) => void
) {
    const ref = collection(db, "knockoutTeams");

    return onSnapshot(ref, (snapshot) => {
        const map: KnockoutTeamsMap = {};

        snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data() as KnockoutTeamAssignment;
            map[data.matchId] = data;
        });

        callback(map);
    });
}

export async function saveKnockoutTeamAssignment({
    matchId,
    homeTeamId,
    awayTeamId,
    updatedBy,
}: {
    matchId: string;
    homeTeamId: string;
    awayTeamId: string;
    updatedBy: string;
}) {
    const ref = doc(db, "knockoutTeams", matchId);

    await setDoc(
        ref,
        {
            matchId,
            homeTeamId,
            awayTeamId,
            updatedBy,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}
