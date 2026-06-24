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
            className={`min-h-37.5 shadow-lg rounded-4xl border p-3 text-left transition ${disabled
                ? "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                : "border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-700 active:scale-[0.98]"
                }`}
        >
            <div className="flex h-full flex-col justify-evenly gap-3">
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-light capitalize leading-tight tracking-wide text-gray-900 dark:text-gray-200">
                            <span className="mr-1">{emoji}</span>
                            {title}
                        </p>

                        <span className="shrink-0 rounded-full bg-green-100 text-xs px-0.5 py-0.5 text-[10px] font-black text-gray-500">
                            +{points}
                        </span>
                    </div>

                    <div className="text-sm font-black leading-snug text-gray-900 dark:text-gray-50">
                        {value ?? (
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                {emptyText}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    {value ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-black text-green-700">
                            Guardado
                        </span>
                    ) : disabled ? (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-[11px] font-black text-gray-500">
                            Bloqueado
                        </span>
                    ) : (
                        <span className="text-xs font-black text-cyan-600">
                            Elegir
                        </span>
                    )}

                    {!value && !disabled && (
                        <span className="text-lg text-gray-300">›</span>
                    )}
                </div>
            </div>
        </button>
    );
}