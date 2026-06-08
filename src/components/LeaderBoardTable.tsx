import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";

import { LeaderboardRow } from "@/utils/leaderboard";

type Props = {
    leaderboard: LeaderboardRow[];
};

export function LeaderboardTable({ leaderboard }: Props) {
    return (
        <div className="rounded-xl border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-14">#</TableHead>
                        <TableHead>Jugador</TableHead>
                        <TableHead className="text-center">Pts</TableHead>
                        <TableHead className="text-center">Exactos</TableHead>
                        <TableHead className="text-center">Aciertos</TableHead>
                        <TableHead className="text-center">Fallos</TableHead>
                        <TableHead className="text-center">Pronósticos</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {leaderboard.map((row, index) => (
                        <TableRow key={row.userId}>
                            <TableCell className="font-bold">
                                {index + 1}
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                                        {row.avatar ?? row.name.charAt(0)}
                                    </div>

                                    <span className="font-medium">
                                        {row.name}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="text-center font-bold">
                                {row.points}
                            </TableCell>

                            <TableCell className="text-center">
                                {row.exactScores}
                            </TableCell>

                            <TableCell className="text-center">
                                {row.correctResults}
                            </TableCell>

                            <TableCell className="text-center">
                                {row.failed}
                            </TableCell>

                            <TableCell className="text-center">
                                {row.predictionsMade}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}