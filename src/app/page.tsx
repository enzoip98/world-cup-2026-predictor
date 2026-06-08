"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { MatchCalendar } from "@/components/MatchCalendar";
import { MatchModal } from "@/components/MatchModal";
import { Match } from "@/types/Match";
import { AttendanceStatus } from "@/types/AttendanceStatus";
import { Prediction } from "@/types/Prediction";
import { calculateLeaderboard } from "@/utils/leaderboard";
import { LeaderboardTable } from "@/components/LeaderBoardTable";
import { getMatchStatus } from "@/utils/matchstatus";
import { AuthView } from "@/components/AuthView";
import { logout } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getMatchesFromFirebase, seedMatchesToFirebase } from "@/lib/matches";
import { JoinPartyView } from "@/components/JoinPartyView";
import { PredictionsMap, savePredictionToFirebase, subscribeToMyPredictions, subscribeToPartyPredictions } from "@/lib/predictions";
import { ResultsMap, saveResultToFirebase, subscribeToResults } from "@/lib/results";
import { AppUser, subscribeToUsers } from "@/lib/users";
import { AttendanceByMatchMap, clearAttendanceFromFirebase, saveAttendanceToFirebase, subscribeToPartyAttendance } from "@/lib/attendance";
import { getPartyById, Party } from "@/lib/parties";
import { subscribeToWatchPartyMatches, WatchPartyMatchesMap } from "@/lib/partyMatches";

export default function Home() {

  const [activeTab, setActiveTab] = useState<"matches" | "calendar" | "leaderboard" | "watching_matches">("matches");

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const { appUser, loadingAuth, isAdmin } = useAuth();
  const [partyUsers, setPartyUsers] = useState<AppUser[]>([]);
  const [party, setParty] = useState<Party | null>(null);
  const [watchPartyMatches, setWatchPartyMatches] = useState<WatchPartyMatchesMap>({});
  const [isSavingWatchParty, setIsSavingWatchParty] = useState(false);

  const [predictions, setPredictions] = useState<PredictionsMap>({});
  const [partyPredictions, setPartyPredictions] = useState<PredictionsMap>({});
  const [isSavingPrediction, setIsSavingPrediction] = useState(false);

  const [results, setResults] = useState<ResultsMap>({});
  const [isSavingResult, setIsSavingResult] = useState(false);

  const [attendance, setAttendance] = useState<AttendanceByMatchMap>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  useEffect(() => {
    if (!appUser?.activePartyId) return;
    const usersSuscribe = subscribeToUsers(appUser?.activePartyId, setPartyUsers);
    return () => usersSuscribe();
  }, [appUser?.activePartyId]);

  useEffect(() => {
    if (!appUser?.activePartyId) return;

    getPartyById(appUser.activePartyId).then(setParty);
  }, [appUser?.activePartyId]);

  useEffect(() => {
    if (!appUser?.activePartyId) return;

    const unsubscribe = subscribeToMyPredictions(
      appUser.activePartyId,
      appUser.uid,
      setPredictions
    );

    return () => unsubscribe();
  }, [appUser?.activePartyId, appUser?.uid]);

  useEffect(() => {
    if (!appUser?.activePartyId) return;

    const unsubscribe = subscribeToPartyPredictions(
      appUser.activePartyId,
      setPartyPredictions
    );

    return () => unsubscribe();
  }, [appUser?.activePartyId]);

  useEffect(() => {
    const unsubscribe = subscribeToResults(setResults);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!appUser?.activePartyId) return;

    const unsubscribe = subscribeToWatchPartyMatches(
      appUser?.activePartyId,
      setWatchPartyMatches
    );

    return () => unsubscribe();
  }, [appUser?.activePartyId]);

  useEffect(() => {
    if (!appUser?.activePartyId) return;

    const unsubscribe = subscribeToPartyAttendance(
      appUser.activePartyId,
      setAttendance
    );

    return () => unsubscribe();
  }, [appUser?.activePartyId]);

  const handleSavePrediction = async (
    matchId: string,
    prediction: Prediction
  ) => {
    if (!appUser?.activePartyId) return;

    if (predictions[appUser.uid]?.[matchId]) return;

    try {
      setIsSavingPrediction(true);
      await savePredictionToFirebase({
        partyId: appUser.activePartyId,
        userId: appUser.uid,
        matchId,
        prediction,
      });
    } catch (error) {
      console.error("Error guardando predicción:", error);
    } finally {
      setIsSavingPrediction(false);
    }
  };

  const handleSaveResult = async (
    matchId: string,
    result: {
      homeScore: number;
      awayScore: number;
    }
  ) => {
    if (!appUser) return;
    if (!isAdmin) return;

    try {
      setIsSavingResult(true);

      await saveResultToFirebase({
        matchId,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        updatedBy: appUser.uid,
      });
    } catch (error) {
      console.error("Error guardando resultado:", error);
    } finally {
      setIsSavingResult(false);
    }
  };

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadMatches() {
      const firebaseMatches = await getMatchesFromFirebase();
      if (firebaseMatches.length === 0) {
        setMatches([]);
        return;
      }
      setMatches(firebaseMatches);
    }

    loadMatches();
  }, []);


  const handleAttendanceChange = async (
    matchId: string,
    status: AttendanceStatus
  ) => {
    if (!appUser?.activePartyId) return;

    try {
      setIsSavingAttendance(true);

      await saveAttendanceToFirebase({
        partyId: appUser.activePartyId,
        userId: appUser.uid,
        matchId,
        status,
      });
    } catch (error) {
      console.error("Error guardando asistencia:", error);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const clearAttendance = async (matchId: string) => {
    if (!appUser?.activePartyId) return;

    try {
      setIsSavingAttendance(true);

      await clearAttendanceFromFirebase({
        partyId: appUser.activePartyId,
        userId: appUser.uid,
        matchId,
      });
    } catch (error) {
      console.error("Error limpiando asistencia:", error);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const leaderboard = calculateLeaderboard(
    partyUsers,
    partyPredictions,
    results
  );

  const selectedResult = selectedMatch
    ? results[selectedMatch.id]
    : undefined;

  const selectedStatus = getMatchStatus(
    selectedMatch,
    selectedResult,
    now
  );

  const selectedAttendanceStatus = selectedMatch && appUser
    ? attendance[selectedMatch.id]?.[appUser.uid]
    : undefined;

  const selectedAttendees = selectedMatch
    ? partyUsers.filter(
      user => attendance[selectedMatch.id]?.[user.uid] === "going"
    )
    : [];

  const watchPartyOnlyMatches = matches.filter(
    (match) => !!watchPartyMatches[match.id]
  );

  const selectedWatchParty = selectedMatch
    ? watchPartyMatches[selectedMatch.id]
    : undefined;

  const selectedIsWatchParty = !!selectedWatchParty;

  const upcomingWatchPartyMatches = watchPartyOnlyMatches.filter(
    (match) =>
      getMatchStatus(match, results[match.id], now) !== "finished"
  );

  const finishedWatchPartyMatches = watchPartyOnlyMatches.filter(
    (match) =>
      getMatchStatus(match, results[match.id], now) === "finished"
  );

  if (loadingAuth) {
    return <LoadingScreen />;
  }

  if (!appUser) {
    return <AuthView />;
  }

  if (!appUser.activePartyId) {
    return <JoinPartyView appUser={appUser} />;
  }


  return (
    <main className="h-screen bg-gray-50 px-5 py-8 relative">

      {(isSavingPrediction || isSavingResult || isSavingAttendance || isSavingWatchParty) &&
        <LoadingScreen />
      }

      <div className="absolute top-5 left-0 right-0 px-4">
        <div className="relative flex h-11 items-center justify-center">
          <p className="text-center font-semibold">
            Hola, {appUser.name}
          </p>

          <button
            onClick={logout}
            className="group absolute right-0 flex h-11 w-11 items-center justify-start overflow-hidden rounded-full bg-red-600 shadow-lg transition-all duration-200 hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1"
          >
            <div className="flex w-full items-center justify-center transition-all duration-300 group-hover:justify-start group-hover:px-3">
              <svg className="h-4 w-4" viewBox="0 0 512 512" fill="white">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
              </svg>
            </div>

            <div className="absolute right-5 translate-x-full text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              Cerrar sesión
            </div>
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-6xl my-10 lg:my-2">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600">
            Mundial 2026
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-950 md:text-5xl">
            {party?.name}
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Confirmen asistencia, propongan casa y vayan metiendo sus pronósticos ⚽
          </p>
        </div>

        <div className="mb-6 flex rounded-2xl bg-white p-1 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("matches")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "matches"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Partidos
          </button>
          <button
            onClick={() => setActiveTab("watching_matches")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "watching_matches"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            En grupo
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "calendar"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Calendario
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "leaderboard"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Tabla
          </button>
        </div>

        {activeTab === "matches" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => {

              const watchParty = watchPartyMatches[match.id];
              const isWatchParty = !!watchParty;

              return <MatchCard key={match.id} match={match} onSelect={setSelectedMatch}
                attendanceCount={
                  Object.values(attendance[match.id] ?? {}).filter(
                    status => status === "going"
                  ).length
                }
                status={getMatchStatus(match, results[match.id], now)}
                isWatchParty={isWatchParty}
                watchParty={watchParty} />
            })}
          </div>
        )}

        {activeTab === "watching_matches" && (
          <>
            <p className="text-lg font-bold my-5">Veremos juntos</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingWatchPartyMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelect={setSelectedMatch}
                  attendanceCount={
                    Object.values(attendance[match.id] ?? {}).filter(
                      (status) => status === "going"
                    ).length
                  }
                  status={getMatchStatus(match, results[match.id], now)}
                  isWatchParty={true}
                  watchParty={watchPartyMatches[match.id]}
                />
              ))}
            </div>
            <p className="text-lg font-bold my-5">Vimos juntos</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {finishedWatchPartyMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelect={setSelectedMatch}
                  attendanceCount={
                    Object.values(attendance[match.id] ?? {}).filter(
                      (status) => status === "going"
                    ).length
                  }
                  status={getMatchStatus(match, results[match.id], now)}
                  isWatchParty={true}
                  watchParty={watchPartyMatches[match.id]}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === "calendar" && <MatchCalendar matches={matches} onSelect={setSelectedMatch} />}

        {activeTab === "leaderboard" && (
          <LeaderboardTable leaderboard={leaderboard} />
        )}

      </section>
      <MatchModal
        key={selectedMatch?.id ?? "no-match"}
        match={selectedMatch}
        attendanceStatus={selectedAttendanceStatus}
        attendees={selectedAttendees}
        onSavePrediction={handleSavePrediction}
        onSaveResult={handleSaveResult}
        resultMatch={selectedMatch ? results[selectedMatch.id] : undefined}
        prediction={selectedMatch ? predictions[appUser.uid]?.[selectedMatch.id] : undefined}
        onAttendanceChange={handleAttendanceChange}
        onClearAttendance={clearAttendance}
        onClose={() => setSelectedMatch(null)}
        status={selectedStatus}
        appUser={appUser}
        isWatchParty={selectedIsWatchParty}
        watchParty={selectedWatchParty}
        members={partyUsers}
        onSavingWatchPartyChange={setIsSavingWatchParty}
      />
    </main>
  );
}