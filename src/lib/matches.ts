import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { matches } from "@/data/matches";
import { Match } from "@/types/Match";
import { Teams } from "@/data/Teams";

export const teamsByFifaCode = Object.fromEntries(
    Teams.map((team) => [team.fifaCode, team])
);

function getTeamIdByFifaCode(fifaCode: string | null): string | null {
    if (!fifaCode) return null;

    const team = teamsByFifaCode[fifaCode.toUpperCase()];

    if (!team) {
        console.warn(`No existe equipo con fifaCode: ${fifaCode}`);
        return null;
    }

    return team.id;
}

export async function seedMatchesToFirebase() {
    const batch = writeBatch(db);

    matches.forEach((match) => {
        const matchRef = doc(db, "matches", match.id);

        const matchToSave: Match = {
            ...match,

            homeTeamId: getTeamIdByFifaCode(match.homeTeamId),
            awayTeamId: getTeamIdByFifaCode(match.awayTeamId),
            kickoff: match.kickoff,
            isWatchParty: false,
            hostUserId: null,
            hostName: null,
            locationName: null,
            notes: null,
        };

        batch.set(
            matchRef,
            {
                ...matchToSave,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    });

    await batch.commit();
}

export async function getMatchesFromFirebase(): Promise<Match[]> {
    const matchesRef = collection(db, "matches");
    const q = query(matchesRef, orderBy("kickoff", "asc"));

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Match),
        id: docSnap.id,
    }));
}