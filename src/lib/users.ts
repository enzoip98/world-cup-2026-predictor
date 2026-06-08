import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";

export type UserRole = "admin" | "player";

export type AppUser = {
    uid: string;
    name: string;
    email: string;
    photoURL: string | null;
    role: UserRole;
    activePartyId?: string | null;
};

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
            role: data.role ?? "player",
            activePartyId: data.activePartyId ?? null,
        };
    }

    const newUser: AppUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName ?? "Usuario",
        email: firebaseUser.email ?? "",
        photoURL: firebaseUser.photoURL ?? null,
        role: "player",
        activePartyId: null
    };

    await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return newUser;
}