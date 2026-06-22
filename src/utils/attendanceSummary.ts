import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    serverTimestamp,
    where,
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
