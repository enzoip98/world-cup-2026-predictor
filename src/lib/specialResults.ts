// lib/specialResults.ts

import {
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type SpecialResultField =
    | "championTeamId"
    | "runnerUpTeamId"
    | "topScorerPlayerId"
    | "bestPlayerId";

export type SpecialResults = {
    championTeamId?: string;
    runnerUpTeamId?: string;
    topScorerPlayerId?: string;
    bestPlayerId?: string;
    updatedBy?: string;
    updatedAt?: unknown;
};

export function subscribeToSpecialResults(
    partyId: string,
    callback: (results: SpecialResults | null) => void
) {
    const ref = doc(db, "parties", partyId, "specialResults", "final");

    return onSnapshot(ref, (snapshot) => {
        if (!snapshot.exists()) {
            callback(null);
            return;
        }

        callback(snapshot.data() as SpecialResults);
    });
}

export async function saveSpecialResultField({
    partyId,
    adminUserId,
    field,
    value,
}: {
    partyId: string;
    adminUserId: string;
    field: SpecialResultField;
    value: string;
}) {
    const ref = doc(db, "parties", partyId, "specialResults", "final");

    await setDoc(
        ref,
        {
            [field]: value,
            updatedBy: adminUserId,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}