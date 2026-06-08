import { Match } from "@/types/Match";
import { MatchResult } from "@/types/MatchResult";

export type MatchStatus =
    | "scheduled"
    | "live"
    | "finished";

export function getMatchStatus(
    match: Match | null | undefined,
    result: MatchResult | undefined,
    now: number
): MatchStatus {

    if (!match) {
        return "scheduled";
    }

    if (result?.status === "finished") {
        return "finished";
    }

    if (now >= new Date(match.kickoff).getTime()) {
        return "live";
    }

    return "scheduled";
}