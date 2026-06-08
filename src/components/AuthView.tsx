"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { loginWithGoogle } from "@/lib/auth";
import { useState } from "react";
import { LoadingScreen } from "./LoadingScreen";

export function AuthView() {
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setIsSigningIn(true);
            await loginWithGoogle();
        } catch (error) {
            console.error("Error iniciando sesión:", error);
            setIsSigningIn(false);
        }
    };

    if (isSigningIn) {
        return <LoadingScreen />;
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
                <h1 className="mb-2 text-2xl font-bold">Mundial 2026</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Inicia sesión para registrar tus pronósticos y asistencia.
                </p>

                <button
                    onClick={handleGoogleLogin}
                    disabled={isSigningIn}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 shadow-sm"
                >
                    {isSigningIn
                        ? "Iniciando sesión..."
                        : "Continuar con Google"}
                </button>
            </div>
        </main>
    );
}