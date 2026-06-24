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
        bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-900/30",
        border: "border-orange-200 dark:border-orange-700/50 shadow-md shadow-orange-100 dark:shadow-orange-950/40",
        text: "text-orange-700 dark:text-orange-400",
        label: "Bronce",
    },
    silver: {
        bg: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/70 dark:to-slate-600/50",
        border: "border-slate-300 dark:border-slate-400/50 shadow-md shadow-slate-200/80 dark:shadow-slate-900/60",
        text: "text-slate-700 dark:text-slate-200",
        label: "Plata",
    },
    gold: {
        bg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-900/30",
        border: "border-yellow-300 dark:border-yellow-600/50 shadow-md shadow-yellow-100 dark:shadow-yellow-950/40",
        text: "text-yellow-700 dark:text-yellow-400",
        label: "Oro",
    },
};
