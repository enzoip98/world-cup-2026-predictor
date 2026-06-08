"use client";

import { useState } from "react";
import { AppUser } from "@/lib/users";
import { joinPartyByCode } from "@/lib/parties";
import { LoadingScreen } from "@/components/LoadingScreen";

type Props = {
    appUser: AppUser;
};

export function JoinPartyView({ appUser }: Props) {
    const [code, setCode] = useState("");
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoinParty = async () => {
        if (!code.trim()) {
            setError("Ingresa un código de party.");
            return;
        }

        try {
            setJoining(true);
            setError(null);

            await joinPartyByCode(code, appUser);

            window.location.reload();
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo unir a la party."
            );
            setJoining(false);
        }
    };

    if (joining) {
        return <LoadingScreen />;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">
                    Únete a una party
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Hola, {appUser.name}. Para continuar, necesitas unirte a una mancha mundialista.
                </p>

                <div className="mt-6">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Código de party
                    </label>

                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Ej: MUNDIAL26"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                    />
                </div>

                {error && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleJoinParty}
                    disabled={joining}
                    className="mt-5 w-full rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                    Unirme
                </button>
            </div>
        </main>
    );
}