import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebase";

const provider = new GoogleAuthProvider();

export async function loginWithGoogle() {
    return signInWithPopup(auth, provider);
}

export async function logout() {
    return signOut(auth);
}