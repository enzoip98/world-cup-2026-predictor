import { Party } from "@/lib/parties";
import { AppUser } from "@/lib/users";
import { useState } from "react";

type Props = {
    party: Party | null;
    members: AppUser[];
    appUser: AppUser;
    onPromoteUser: (userId: string) => Promise<void>;
    onDemoteUser: (userId: string) => Promise<void>;
};

type AdminAction =
    | {
        type: "promote";
        user: AppUser;
    }
    | {
        type: "demote";
        user: AppUser;
    }
    | null;

export function AdminPanel({
    party,
    members,
    appUser,
    onPromoteUser,
    onDemoteUser,
}: Props) {

    const [pendingAction, setPendingAction] = useState<AdminAction>(null);

    if (!party) return null;

    const closeModal = () => {
        setPendingAction(null);
    };

    const handleConfirm = async () => {
        if (!pendingAction) return;

        if (pendingAction.type === "promote") {
            await onPromoteUser(pendingAction.user.uid);
        }

        if (pendingAction.type === "demote") {
            await onDemoteUser(pendingAction.user.uid);
        }

        closeModal();
    };

    return (
        <section className="space-y-5">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-widest text-green-600">
                    Administración
                </p>

                <h2 className="mt-2 text-2xl font-black text-gray-950">
                    Ajustes de la party
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Gestiona miembros y permisos generales de esta party.
                </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black text-gray-950">
                    👥 Miembros
                </h3>

                <div className="mt-4 space-y-3">
                    {members.map((member) => {
                        const isOwner = party.ownerUserId === member.uid;
                        const memberIsAdmin =
                            isOwner || party.adminUserIds?.includes(member.uid);

                        return (
                            <div
                                key={member.uid}
                                className="flex items-center justify-between rounded-2xl border border-gray-100 p-4"
                            >
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {member.name}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        {isOwner
                                            ? "Owner"
                                            : memberIsAdmin
                                                ? "Admin"
                                                : "Miembro"}
                                    </p>
                                </div>

                                {!isOwner && member.uid !== appUser.uid && (
                                    <>
                                        {memberIsAdmin ? (
                                            <button
                                                onClick={() =>
                                                    setPendingAction({
                                                        type: "demote",
                                                        user: member,
                                                    })
                                                }
                                                className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600"
                                            >
                                                Quitar admin
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    setPendingAction({
                                                        type: "promote",
                                                        user: member,
                                                    })
                                                }
                                                className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white"
                                            >
                                                Hacer admin
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black text-gray-950">
                    🔐 Código de party
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                    Comparte este código para que otros se unan.
                </p>

                <div className="mt-4 rounded-2xl bg-gray-100 px-4 py-3 text-center text-xl font-black tracking-widest">
                    {party.code}
                </div>
            </div>

            {pendingAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-black text-gray-950">
                            {pendingAction.type === "promote"
                                ? "Hacer administrador"
                                : "Quitar administrador"}
                        </h2>

                        {pendingAction.type === "promote" ? (
                            <div className="mt-4 space-y-3 text-sm text-gray-600">
                                <p>
                                    ¿Deseas convertir a{" "}
                                    <span className="font-bold text-gray-900">
                                        {pendingAction.user.name}
                                    </span>{" "}
                                    en administrador?
                                </p>

                                <div className="rounded-2xl bg-gray-50 p-4">
                                    <p className="font-bold text-gray-900">
                                        Este usuario podrá:
                                    </p>

                                    <ul className="mt-2 space-y-1">
                                        <li>✓ Registrar resultados</li>
                                        <li>✓ Crear y editar watch parties</li>
                                        <li>✓ Cambiar la casa de partidos en grupo</li>
                                        <li>✓ Promover o quitar administradores</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3 text-sm text-gray-600">
                                <p>
                                    ¿Deseas quitarle permisos de administrador a{" "}
                                    <span className="font-bold text-gray-900">
                                        {pendingAction.user.name}
                                    </span>
                                    ?
                                </p>

                                <div className="rounded-2xl bg-red-50 p-4 text-red-700">
                                    Ya no podrá registrar resultados ni gestionar watch parties.
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 rounded-2xl bg-gray-100 py-3 text-sm font-black text-gray-700"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleConfirm}
                                className={`flex-1 rounded-2xl py-3 text-sm font-black text-white ${pendingAction.type === "promote"
                                        ? "bg-green-600"
                                        : "bg-red-600"
                                    }`}
                            >
                                {pendingAction.type === "promote"
                                    ? "Hacer admin"
                                    : "Quitar admin"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}