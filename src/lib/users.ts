import {
    collection, onSnapshot, doc, getDoc, setDoc,
    query, where, serverTimestamp, updateDoc
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { cacheGoogleAvatar } from "./avatar";

export type UserRole = "admin" | "player";

export type AppUser = {
    uid: string;
    name: string;
    email: string;
    photoURL: string | null;
    avatarUrl?: string | null;
    role: UserRole;
    activePartyId?: string | null;
};

export function subscribeToUsers(partyId: string,
    callback: (users: AppUser[]) => void
) {

    const usersRef = collection(db, "users");
    const q = query(
        usersRef,
        where("activePartyId", "==", partyId)
    );

    return onSnapshot(q, (snapshot) => {
        const users: AppUser[] = snapshot.docs.map((docSnap) => ({
            ...(docSnap.data() as AppUser),
            uid: docSnap.id,
        }));

        callback(users);
    });
}

export async function getOrCreateUser(firebaseUser: User): Promise<AppUser> {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();

        return {
            uid: firebaseUser.uid,
            name: data.name,
            email: data.email,
            photoURL: data.photoURL ?? null,
            avatarUrl: data.avatarUrl ?? null,
            role: data.role ?? "player",
            activePartyId: data.activePartyId ?? null,
        };
    }

    const newUser: AppUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName ?? "Usuario",
        email: firebaseUser.email ?? "",
        photoURL: firebaseUser.photoURL ?? null,
        avatarUrl: null,
        role: "player",
        activePartyId: null,
    };

    await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    cacheGoogleAvatar(firebaseUser.uid, firebaseUser.photoURL)
        .then(async (avatarUrl) => {
            if (!avatarUrl) return;

            await updateDoc(userRef, {
                avatarUrl,
                updatedAt: serverTimestamp(),
            });
        })
        .catch((error) => {
            console.warn("No se pudo copiar avatar de Google:", error);
        });

    return newUser;
}