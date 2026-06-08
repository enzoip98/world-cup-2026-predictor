export function formatDate(date: string) {
    const [year, month, day] = date.split("-");

    const months: Record<string, string> = {
        "01": "ene",
        "02": "feb",
        "03": "mar",
        "04": "abr",
        "05": "may",
        "06": "jun",
        "07": "jul",
        "08": "ago",
        "09": "sep",
        "10": "oct",
        "11": "nov",
        "12": "dic",
    };

    return `${day} ${months[month]} ${year}`;
}

export function formatTime(time: string) {
    const [hourRaw, minute] = time.split(":");
    let hour = Number(hourRaw);

    const period = hour >= 12 ? "p. m." : "a. m.";

    if (hour === 0) hour = 12;
    if (hour > 12) hour -= 12;

    return `${hour.toString().padStart(2, "0")}:${minute} ${period}`;
}

export function formatPeruTime(kickoff: string) {
    return new Intl.DateTimeFormat("es-PE", {
        timeZone: "America/Lima",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(kickoff));
}

export function formatPeruDate(kickoff: string) {
    return new Intl.DateTimeFormat("es-PE", {
        timeZone: "America/Lima",
        weekday: "long",
        day: "2-digit",
        month: "long",
    }).format(new Date(kickoff));
}

export function getPeruDateKey(kickoff: string) {
    const date = new Date(kickoff);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}