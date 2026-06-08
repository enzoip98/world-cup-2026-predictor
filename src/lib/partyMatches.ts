import {
    collection,
    doc,
    onSnapshot,
    serverTimestamp, updateDoc,
    setDoc,
    deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type WatchPartyMatch = {
    matchId: string;
    houseName: string;
    hostUserId: string;
    hostName: string;
    createdAt?: unknown;
    updatedAt?: unknown;
};

type UpdateWatchPartyParams = {
    partyId: string;
    matchId: string;
    hostUserId: string;
    hostName: string;
    houseName: string;
};

export type WatchPartyMatchesMap = Record<string, WatchPartyMatch>;

export function subscribeToWatchPartyMatches(
    partyId: string,
    callback: (watchPartyMatches: WatchPartyMatchesMap) => void
) {
    const ref = collection(db, "parties", partyId, "watchPartyMatches");

    return onSnapshot(ref, (snapshot) => {
        const map: WatchPartyMatchesMap = {};

        snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data() as Omit<WatchPartyMatch, "matchId">;

            map[docSnap.id] = {
                matchId: docSnap.id,
                ...data,
            };
        });

        callback(map);
    });
}

type PromoteMatchParams = {
    partyId: string;
    matchId: string;
    houseName: string;
    hostUserId: string;
    hostName: string;
};

export async function promoteMatchToWatchParty({
    partyId,
    matchId,
    houseName,
    hostUserId,
    hostName,
}: PromoteMatchParams) {
    const ref = doc(db, "parties", partyId, "watchPartyMatches", matchId);

    await setDoc(
        ref,
        {
            matchId,
            houseName,
            hostUserId,
            hostName,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
        },
        { merge: true }
    );
}

export async function removeMatchFromWatchParty(
    partyId: string,
    matchId: string
) {
    const ref = doc(db, "parties", partyId, "watchPartyMatches", matchId);
    await deleteDoc(ref);
}

export async function updateWatchPartyHost({
    partyId,
    matchId,
    hostUserId,
    hostName,
    houseName,
}: UpdateWatchPartyParams) {
    const ref = doc(
        db,
        "parties",
        partyId,
        "watchPartyMatches",
        matchId
    );

    await updateDoc(ref, {
        hostUserId,
        hostName,
        houseName,
        updatedAt: serverTimestamp(),
    });
}