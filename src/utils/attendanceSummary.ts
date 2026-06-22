import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    serverTimestamp,
    where,
    writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type AttendanceSummary = {
    matchId: string;
    goingCount: number;
    updatedAt?: unknown;
};

export type AttendanceSummaryMap = {
    [matchId: string]: AttendanceSummary;
};

type FirestoreAttendance = {
    userId: string;
    matchId: string;
    status: "going" | "not_going";
};

export async function generateAttendanceSummary({
    partyId,
    matchId,
}: {
    partyId: string;
    matchId: string;
}) {
    const attendanceRef = collection(db, "parties", partyId, "attendance");

    const q = query(
        attendanceRef,
        where("matchId", "==", matchId),
        where("status", "==", "going")
    );
    const snapshot = await getDocs(q);

    const goingCount = snapshot.size;

    await setDoc(
        doc(db, "parties", partyId, "attendanceSummaries", matchId),
        {
            matchId,
            goingCount,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}

export async function backfillAttendanceSummaries({
    partyId,
}: {
    partyId: string;
}) {
    const attendanceRef = collection(db, "parties", partyId, "attendance");
    const snapshot = await getDocs(attendanceRef);

    const countByMatch: Record<string, number> = {};

    snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreAttendance;
        if (data.status === "going") {
            countByMatch[data.matchId] = (countByMatch[data.matchId] ?? 0) + 1;
        } else if (!(data.matchId in countByMatch)) {
            countByMatch[data.matchId] = 0;
        }
    });

    const batch = writeBatch(db);

    Object.entries(countByMatch).forEach(([matchId, goingCount]) => {
        const summaryRef = doc(db, "parties", partyId, "attendanceSummaries", matchId);
        batch.set(summaryRef, { matchId, goingCount, updatedAt: serverTimestamp() }, { merge: true });
    });

    await batch.commit();
}

export function subscribeToAttendanceSummaries(
    partyId: string,
    callback: (summaries: AttendanceSummaryMap) => void
) {
    return onSnapshot(
        collection(db, "parties", partyId, "attendanceSummaries"),
        (snapshot) => {
            const summaries: AttendanceSummaryMap = {};

            snapshot.forEach((doc) => {
                summaries[doc.id] = doc.data() as AttendanceSummary;
            });

            callback(summaries);
        }
    );
}
