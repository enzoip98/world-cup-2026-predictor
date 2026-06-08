import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AttendanceStatus } from "@/types/AttendanceStatus";

export type MyAttendanceMap = {
    [matchId: string]: AttendanceStatus;
};

export type AttendanceByMatchMap = {
    [matchId: string]: {
        [userId: string]: AttendanceStatus;
    };
};

type FirestoreAttendance = {
    userId: string;
    matchId: string;
    status: AttendanceStatus;
};

export function subscribeToPartyAttendance(
    partyId: string,
    callback: (attendance: AttendanceByMatchMap) => void
) {
    const attendanceRef = collection(db, "parties", partyId, "attendance");

    return onSnapshot(attendanceRef, (snapshot) => {
        const map: AttendanceByMatchMap = {};

        snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data() as FirestoreAttendance;

            if (!map[data.matchId]) {
                map[data.matchId] = {};
            }

            map[data.matchId][data.userId] = data.status;
        });

        callback(map);
    });
}

export async function saveAttendanceToFirebase({
    partyId,
    userId,
    matchId,
    status,
}: {
    partyId: string;
    userId: string;
    matchId: string;
    status: AttendanceStatus;
}) {
    const attendanceId = `${userId}_${matchId}`;

    await setDoc(
        doc(db, "parties", partyId, "attendance", attendanceId),
        {
            userId,
            matchId,
            status,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}

export async function clearAttendanceFromFirebase({
    partyId,
    userId,
    matchId,
}: {
    partyId: string;
    userId: string;
    matchId: string;
}) {
    const attendanceId = `${userId}_${matchId}`;

    await deleteDoc(
        doc(db, "parties", partyId, "attendance", attendanceId)
    );
}