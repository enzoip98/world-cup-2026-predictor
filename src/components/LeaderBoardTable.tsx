"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeaderboardRow } from "@/utils/leaderboard";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PlayerProfileModal } from "./PlayerProfileModal";
import { evaluateAchievements } from "@/utils/achievements";

type Props = {
    leaderboard: LeaderboardRow[];
};

const MEDALS: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

function getMedal(leaderboard: LeaderboardRow[], index: number): string | null {
    const pts = leaderboard[index].points;
    if (pts === 0) return null;
    if (leaderboard[index + 1]?.points === pts) return null; // tied with next
    if (index > 0 && leaderboard[index - 1]?.points === pts) return null; // tied with prev
    return MEDALS[index] ?? null;
}

export function LeaderboardTable({ leaderboard }: Props) {
    const [selectedRow, setSelectedRow] = useState<{ row: LeaderboardRow; rank: number } | null>(null);

    return (
        <>
            <div className="rounded-xl border bg-white my-4 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">#</TableHead>
                            <TableHead>Jugador</TableHead>
                            <TableHead className="text-center">Pts</TableHead>
                            <TableHead className="text-center">🎯</TableHead>
                            <TableHead className="text-center">✅</TableHead>
                            <TableHead className="text-center">❌</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {leaderboard.map((row, index) => {
                            const rank = index + 1;
                            const medal = getMedal(leaderboard, index);
                            const unlockedCount = evaluateAchievements(row).filter((a) => a.unlocked).length;
                            const hasStreak = row.currentStreak >= 3;

                            return (
                                <TableRow
                                    key={row.userId}
                                    className="cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                    onClick={() => setSelectedRow({ row, rank })}
                                >
                                    <TableCell className="font-bold text-gray-500">
                                        {medal ?? rank}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarImage
                                                    src={row.avatarUrl ?? row.photoURL ?? undefined}
                                                    referrerPolicy="no-referrer"
                                                />
                                                <AvatarFallback className="text-xs font-black">
                                                    {row.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-gray-900 truncate">
                                                        {row.name}
                                                    </span>
                                                    {hasStreak && (
                                                        <span className="text-xs">🔥</span>
                                                    )}
                                                </div>
                                                {unlockedCount > 0 && (
                                                    <p className="text-xs text-gray-400">
                                                        {unlockedCount} distintivo{unlockedCount !== 1 ? "s" : ""}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-center font-black text-gray-950">
                                        {row.points}
                                    </TableCell>

                                    <TableCell className="text-center text-sm font-semibold text-gray-700">
                                        {row.exactScores}
                                    </TableCell>

                                    <TableCell className="text-center text-sm font-semibold text-gray-700">
                                        {row.correctResults}
                                    </TableCell>

                                    <TableCell className="text-center text-sm font-semibold text-gray-400">
                                        {row.failed}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <p className="text-center text-xs text-gray-400 -mt-2">
                Toca un jugador para ver su perfil completo
            </p>

            {selectedRow && (
                <PlayerProfileModal
                    row={selectedRow.row}
                    rank={selectedRow.rank}
                    onClose={() => setSelectedRow(null)}
                />
            )}
        </>
    );
}
