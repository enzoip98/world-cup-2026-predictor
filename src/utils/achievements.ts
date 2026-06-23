import { LeaderboardRow } from "./leaderboard";

export type AchievementTier = "bronze" | "silver" | "gold";

export type Achievement = {
    id: string;
    emoji: string;
    title: string;
    description: string;
    tier: AchievementTier;
    condition: (stats: LeaderboardRow) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
    // Exactos
    {
        id: "sharp_shooter",
        emoji: "🎯",
        title: "Francotirador",
        description: "5 marcadores exactos",
        tier: "bronze",
        condition: (s) => s.exactScores >= 5,
    },
    {
        id: "sniper",
        emoji: "🔫",
        title: "Sniper élite",
        description: "10 marcadores exactos",
        tier: "silver",
        condition: (s) => s.exactScores >= 10,
    },
    {
        id: "perfectionist",
        emoji: "💎",
        title: "Perfeccionista",
        description: "15 marcadores exactos",
        tier: "gold",
        condition: (s) => s.exactScores >= 15,
    },
    // Rachas
    {
        id: "on_fire",
        emoji: "🔥",
        title: "En llamas",
        description: "Racha de 5 aciertos consecutivos",
        tier: "bronze",
        condition: (s) => s.bestStreak >= 5,
    },
    {
        id: "unstoppable",
        emoji: "💥",
        title: "Imparable",
        description: "Racha de 10 aciertos consecutivos",
        tier: "silver",
        condition: (s) => s.bestStreak >= 10,
    },
    {
        id: "legend",
        emoji: "⚡",
        title: "Leyenda",
        description: "Racha de 15 aciertos consecutivos",
        tier: "gold",
        condition: (s) => s.bestStreak >= 15,
    },
    // Precisión
    {
        id: "consistent",
        emoji: "📈",
        title: "Consistente",
        description: "50% de precisión con al menos 10 partidos",
        tier: "bronze",
        condition: (s) => s.predictionsMade >= 10 && s.accuracy >= 50,
    },
    {
        id: "analyst",
        emoji: "🧠",
        title: "Analista",
        description: "70% de precisión con al menos 10 partidos",
        tier: "silver",
        condition: (s) => s.predictionsMade >= 10 && s.accuracy >= 70,
    },
    {
        id: "oracle",
        emoji: "🔮",
        title: "Oráculo",
        description: "85% de precisión con al menos 10 partidos",
        tier: "gold",
        condition: (s) => s.predictionsMade >= 10 && s.accuracy >= 85,
    },
    // Puntos
    {
        id: "centenario",
        emoji: "💯",
        title: "Centenario",
        description: "100 puntos acumulados",
        tier: "silver",
        condition: (s) => s.points >= 100,
    },
    {
        id: "world_class",
        emoji: "🏆",
        title: "World Class",
        description: "200 puntos acumulados",
        tier: "gold",
        condition: (s) => s.points >= 200,
    },
    // Participación
    {
        id: "pronosticador",
        emoji: "⚽",
        title: "Pronosticador",
        description: "20 partidos pronosticados",
        tier: "bronze",
        condition: (s) => s.predictionsMade >= 20,
    },
    {
        id: "mundialista",
        emoji: "🌍",
        title: "Mundialista",
        description: "50 partidos pronosticados",
        tier: "silver",
        condition: (s) => s.predictionsMade >= 50,
    },
];

export type EvaluatedAchievement = Achievement & { unlocked: boolean };

export function evaluateAchievements(stats: LeaderboardRow): EvaluatedAchievement[] {
    return ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        unlocked: achievement.condition(stats),
    }));
}

export const TIER_STYLES: Record<AchievementTier, { bg: string; border: string; text: string; label: string }> = {
    bronze: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        label: "Bronce",
    },
    silver: {
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-600",
        label: "Plata",
    },
    gold: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        label: "Oro",
    },
};
