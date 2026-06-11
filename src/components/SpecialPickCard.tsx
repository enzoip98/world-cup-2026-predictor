import { ReactNode } from "react";

export function SpecialPickCard({
    title,
    emoji,
    points,
    emptyText,
    value,
    disabled,
    onClick,
}: {
    title: string;
    emoji: string;
    value?: ReactNode;
    points: number;
    emptyText: string;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`w-full rounded-3xl border p-4 text-left transition ${disabled
                ? "border-gray-100 bg-gray-50"
                : "border-gray-100 bg-white active:scale-[0.99]"
                }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black uppercase tracking-wide text-gray-900">
                            {emoji} {title}
                        </p>

                        <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-black text-gray-500">
                            +{points} pts
                        </span>
                    </div>

                    <div className="mt-3 text-base font-black text-gray-900">
                        {value ?? (
                            <span className="text-sm text-gray-500">{emptyText}</span>
                        )}
                    </div>
                </div>

                {value ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        Guardado
                    </span>
                ) : disabled ? (
                    <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1 text-xs font-black text-gray-500">
                        Bloqueado
                    </span>
                ) : (
                    <span className="shrink-0 text-xl text-gray-300">›</span>
                )}
            </div>
        </button>
    );
}