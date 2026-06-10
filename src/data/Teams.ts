// src/data/teams.ts

export type Confederation =
    | "AFC"
    | "CAF"
    | "CONCACAF"
    | "CONMEBOL"
    | "OFC"
    | "UEFA";

export type Team = {
    id: string;
    name: string;
    nameEs: string;
    fifaCode: string;
    iso2: string;
    flag: string;
    confederation: Confederation;
    isHost?: boolean;
};

export const Teams: Team[] = [
    // AFC
    { id: "australia", name: "Australia", nameEs: "Australia", fifaCode: "AUS", iso2: "AU", flag: "🇦🇺", confederation: "AFC" },
    { id: "iran", name: "Iran", nameEs: "Irán", fifaCode: "IRN", iso2: "IR", flag: "🇮🇷", confederation: "AFC" },
    { id: "iraq", name: "Iraq", nameEs: "Irak", fifaCode: "IRQ", iso2: "IQ", flag: "🇮🇶", confederation: "AFC" },
    { id: "japan", name: "Japan", nameEs: "Japón", fifaCode: "JPN", iso2: "JP", flag: "🇯🇵", confederation: "AFC" },
    { id: "jordan", name: "Jordan", nameEs: "Jordania", fifaCode: "JOR", iso2: "JO", flag: "🇯🇴", confederation: "AFC" },
    { id: "qatar", name: "Qatar", nameEs: "Catar", fifaCode: "QAT", iso2: "QA", flag: "🇶🇦", confederation: "AFC" },
    { id: "saudi-arabia", name: "Saudi Arabia", nameEs: "Arabia Saudita", fifaCode: "KSA", iso2: "SA", flag: "🇸🇦", confederation: "AFC" },
    { id: "south-korea", name: "South Korea", nameEs: "Corea del Sur", fifaCode: "KOR", iso2: "KR", flag: "🇰🇷", confederation: "AFC" },
    { id: "uzbekistan", name: "Uzbekistan", nameEs: "Uzbekistán", fifaCode: "UZB", iso2: "UZ", flag: "🇺🇿", confederation: "AFC" },

    // CAF
    { id: "algeria", name: "Algeria", nameEs: "Argelia", fifaCode: "ALG", iso2: "DZ", flag: "🇩🇿", confederation: "CAF" },
    { id: "cape-verde", name: "Cape Verde", nameEs: "Cabo Verde", fifaCode: "CPV", iso2: "CV", flag: "🇨🇻", confederation: "CAF" },
    { id: "dr-congo", name: "DR Congo", nameEs: "RD Congo", fifaCode: "COD", iso2: "CD", flag: "🇨🇩", confederation: "CAF" },
    { id: "egypt", name: "Egypt", nameEs: "Egipto", fifaCode: "EGY", iso2: "EG", flag: "🇪🇬", confederation: "CAF" },
    { id: "ghana", name: "Ghana", nameEs: "Ghana", fifaCode: "GHA", iso2: "GH", flag: "🇬🇭", confederation: "CAF" },
    { id: "ivory-coast", name: "Ivory Coast", nameEs: "Costa de Marfil", fifaCode: "CIV", iso2: "CI", flag: "🇨🇮", confederation: "CAF" },
    { id: "morocco", name: "Morocco", nameEs: "Marruecos", fifaCode: "MAR", iso2: "MA", flag: "🇲🇦", confederation: "CAF" },
    { id: "senegal", name: "Senegal", nameEs: "Senegal", fifaCode: "SEN", iso2: "SN", flag: "🇸🇳", confederation: "CAF" },
    { id: "south-africa", name: "South Africa", nameEs: "Sudáfrica", fifaCode: "RSA", iso2: "ZA", flag: "🇿🇦", confederation: "CAF" },
    { id: "tunisia", name: "Tunisia", nameEs: "Túnez", fifaCode: "TUN", iso2: "TN", flag: "🇹🇳", confederation: "CAF" },

    // CONCACAF
    { id: "canada", name: "Canada", nameEs: "Canadá", fifaCode: "CAN", iso2: "CA", flag: "🇨🇦", confederation: "CONCACAF", isHost: true },
    { id: "curacao", name: "Curaçao", nameEs: "Curazao", fifaCode: "CUW", iso2: "CW", flag: "🇨🇼", confederation: "CONCACAF" },
    { id: "haiti", name: "Haiti", nameEs: "Haití", fifaCode: "HAI", iso2: "HT", flag: "🇭🇹", confederation: "CONCACAF" },
    { id: "mexico", name: "Mexico", nameEs: "México", fifaCode: "MEX", iso2: "MX", flag: "🇲🇽", confederation: "CONCACAF", isHost: true },
    { id: "panama", name: "Panama", nameEs: "Panamá", fifaCode: "PAN", iso2: "PA", flag: "🇵🇦", confederation: "CONCACAF" },
    { id: "united-states", name: "United States", nameEs: "Estados Unidos", fifaCode: "USA", iso2: "US", flag: "🇺🇸", confederation: "CONCACAF", isHost: true },

    // CONMEBOL
    { id: "argentina", name: "Argentina", nameEs: "Argentina", fifaCode: "ARG", iso2: "AR", flag: "🇦🇷", confederation: "CONMEBOL" },
    { id: "brazil", name: "Brazil", nameEs: "Brasil", fifaCode: "BRA", iso2: "BR", flag: "🇧🇷", confederation: "CONMEBOL" },
    { id: "colombia", name: "Colombia", nameEs: "Colombia", fifaCode: "COL", iso2: "CO", flag: "🇨🇴", confederation: "CONMEBOL" },
    { id: "ecuador", name: "Ecuador", nameEs: "Ecuador", fifaCode: "ECU", iso2: "EC", flag: "🇪🇨", confederation: "CONMEBOL" },
    { id: "paraguay", name: "Paraguay", nameEs: "Paraguay", fifaCode: "PAR", iso2: "PY", flag: "🇵🇾", confederation: "CONMEBOL" },
    { id: "uruguay", name: "Uruguay", nameEs: "Uruguay", fifaCode: "URU", iso2: "UY", flag: "🇺🇾", confederation: "CONMEBOL" },

    // OFC
    { id: "new-zealand", name: "New Zealand", nameEs: "Nueva Zelanda", fifaCode: "NZL", iso2: "NZ", flag: "🇳🇿", confederation: "OFC" },

    // UEFA
    { id: "austria", name: "Austria", nameEs: "Austria", fifaCode: "AUT", iso2: "AT", flag: "🇦🇹", confederation: "UEFA" },
    { id: "belgium", name: "Belgium", nameEs: "Bélgica", fifaCode: "BEL", iso2: "BE", flag: "🇧🇪", confederation: "UEFA" },
    { id: "bosnia-and-herzegovina", name: "Bosnia and Herzegovina", nameEs: "Bosnia y Herzegovina", fifaCode: "BIH", iso2: "BA", flag: "🇧🇦", confederation: "UEFA" },
    { id: "croatia", name: "Croatia", nameEs: "Croacia", fifaCode: "CRO", iso2: "HR", flag: "🇭🇷", confederation: "UEFA" },
    { id: "czech-republic", name: "Czech Republic", nameEs: "República Checa", fifaCode: "CZE", iso2: "CZ", flag: "🇨🇿", confederation: "UEFA" },
    { id: "england", name: "England", nameEs: "Inglaterra", fifaCode: "ENG", iso2: "GB-ENG", flag: "🏴", confederation: "UEFA" },
    { id: "france", name: "France", nameEs: "Francia", fifaCode: "FRA", iso2: "FR", flag: "🇫🇷", confederation: "UEFA" },
    { id: "germany", name: "Germany", nameEs: "Alemania", fifaCode: "GER", iso2: "DE", flag: "🇩🇪", confederation: "UEFA" },
    { id: "netherlands", name: "Netherlands", nameEs: "Países Bajos", fifaCode: "NED", iso2: "NL", flag: "🇳🇱", confederation: "UEFA" },
    { id: "norway", name: "Norway", nameEs: "Noruega", fifaCode: "NOR", iso2: "NO", flag: "🇳🇴", confederation: "UEFA" },
    { id: "portugal", name: "Portugal", nameEs: "Portugal", fifaCode: "POR", iso2: "PT", flag: "🇵🇹", confederation: "UEFA" },
    { id: "scotland", name: "Scotland", nameEs: "Escocia", fifaCode: "SCO", iso2: "GB-SCT", flag: "🏴", confederation: "UEFA" },
    { id: "spain", name: "Spain", nameEs: "España", fifaCode: "ESP", iso2: "ES", flag: "🇪🇸", confederation: "UEFA" },
    { id: "sweden", name: "Sweden", nameEs: "Suecia", fifaCode: "SWE", iso2: "SE", flag: "🇸🇪", confederation: "UEFA" },
    { id: "switzerland", name: "Switzerland", nameEs: "Suiza", fifaCode: "SUI", iso2: "CH", flag: "🇨🇭", confederation: "UEFA" },
    { id: "turkey", name: "Turkey", nameEs: "Turquía", fifaCode: "TUR", iso2: "TR", flag: "🇹🇷", confederation: "UEFA" },
];

export const teamsById = Object.fromEntries(
    Teams.map((team) => [team.id, team])
) as Record<string, Team>;

export const teamsByFifaCode = Object.fromEntries(
    Teams.map((team) => [team.fifaCode.toLowerCase(), team])
) as Record<string, Team>;


export const getFlagEmoji = (iso2: string) =>
    iso2
        .toUpperCase()
        .replace(/./g, char =>
            String.fromCodePoint(char.charCodeAt(0) + 127397)
        );