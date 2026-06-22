import { AttendanceStatus } from "@/types/AttendanceStatus";

export function EditableAttendanceSelector({
    matchId,
    attendanceStatus,
    onAttendanceChange,
    onClearAttendance,
}: {
    matchId: string;
    attendanceStatus?: AttendanceStatus;
    onAttendanceChange: (matchId: string, status: AttendanceStatus) => void;
    onClearAttendance: (matchId: string) => void;
}) {

    type AttendanceOption = {
        value: AttendanceStatus;
        label: string;
        emoji: string;
    };

    const attendanceOptions: AttendanceOption[] = [
        { value: "going", label: "Voy", emoji: "✅" },
        { value: "not_going", label: "No iré", emoji: "❌" },
    ];

    const selectedStyles: Record<AttendanceStatus, string> = {
        going: "bg-green-600 text-white shadow-sm",
        not_going: "bg-red-600 text-white shadow-sm",
    };

    return (
        <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Tu asistencia</p>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {attendanceStatus
                        ? attendanceOptions.find((option) => option.value === attendanceStatus)?.label
                        : "Sin confirmar"}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
                {attendanceOptions.map((option) => {
                    const isSelected = attendanceStatus === option.value;

                    return (
                        <button
                            key={option.value}
                            onClick={() => onAttendanceChange(matchId, option.value)}
                            className={`rounded-xl px-3 py-3 text-sm font-semibold transition-all ${isSelected
                                ? selectedStyles[option.value]
                                : "text-gray-500 hover:bg-white/70 hover:text-gray-900"
                                }`}
                        >
                            <span className="block text-lg">{option.emoji}</span>
                            <span>{option.label}</span>
                        </button>
                    );
                })}
            </div>

            {attendanceStatus && (
                <button
                    onClick={() => onClearAttendance(matchId)}
                    className="mt-3 text-sm text-gray-500 hover:text-red-600"
                >
                    Eliminar respuesta
                </button>
            )}
        </div>
    );
}