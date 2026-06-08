import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function cacheGoogleAvatar(
    uid: string,
    photoURL: string | null
): Promise<string | null> {
    if (!photoURL) return null;

    try {
        const response = await fetch(photoURL);
        const blob = await response.blob();

        const avatarRef = ref(storage, `avatars/${uid}.jpg`);

        await uploadBytes(avatarRef, blob, {
            contentType: blob.type || "image/jpeg",
        });

        return await getDownloadURL(avatarRef);
    } catch (error) {
        console.warn("No se pudo copiar avatar de Google:", error);
        return null;
    }
}