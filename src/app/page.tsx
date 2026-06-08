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
import { getMatchesFromFirebase } from "@/lib/matches";
import { JoinPartyView } from "@/components/JoinPartyView";
import { PredictionsMap, savePredictionToFirebase, subscribeToMyPredictions, subscribeToPartyPredictions } from "@/lib/predictions";
import { ResultsMap, saveResultToFirebase, subscribeToResults } from "@/lib/results";
import { AppUser, subscribeToUsers } from "@/lib/users";
import { AttendanceByMatchMap, clearAttendanceFromFirebase, saveAttendanceToFirebase, subscribeToPartyAttendance } from "@/lib/attendance";
import { Party, promoteUserToAdmin, removeUserFromAdmin, subscribeToParty } from "@/lib/parties";
import { subscribeToWatchPartyMatches, WatchPartyMatchesMap } from "@/lib/partyMatches";
import { AdminPanel } from "@/components/AdminPanel";
import { formatPeruDate, getPeruDateKey } from "@/utils/format";

export default function Home() {

  type ActiveTab =
    | "matches"
    | "leaderboard"
    | "watching_matches"
    | "admin";

  type TabItem = {
    id: ActiveTab;
    label: string;
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>("matches");

  const [matchFilter, setMatchFilter] = useState<"all" | "today" | "scheduled" | "live" | "finished" | "missing_prediction">("all");

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const { appUser, loadingAuth, isAdmin } = useAuth();

  const primaryTabs: TabItem[] = [
    { id: "matches", label: "Partidos" },
    { id: "watching_matches", label: "En grupo" },
    { id: "leaderboard", label: "Tabla" }
  ];

  const secondaryTabs: TabItem[] = isAdmin
    ? [
      { id: "admin", label: "Admin" },
    ]
    : [];

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

  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  useEffect(() => {
    if (!appUser?.activePartyId) return;
    const usersSuscribe = subscribeToUsers(appUser?.activePartyId, setPartyUsers);
    return () => usersSuscribe();
  }, [appUser?.activePartyId]);

  useEffect(() => {
    if (!appUser?.activePartyId) return;

    const unsubscribe = subscribeToParty(appUser.activePartyId, setParty);

    return () => unsubscribe();
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

  const handlePromoteUser = async (userId: string) => {
    if (!party) return;
    if (!isAdmin) return;

    try {
      setIsSavingAdmin(true);
      await promoteUserToAdmin(party.id, userId);
    } catch (error) {
      console.error("Error promoviendo usuario:", error);
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const handleDemoteUser = async (userId: string) => {
    if (!party) return;
    if (!isAdmin) return;

    try {
      setIsSavingAdmin(true);
      await removeUserFromAdmin(party.id, userId);
    } catch (error) {
      console.error("Error quitando admin:", error);
    } finally {
      setIsSavingAdmin(false);
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

  const selectedMaybeAttendees = selectedMatch
    ? partyUsers.filter(
      user => attendance[selectedMatch.id]?.[user.uid] === "maybe"
    )
    : [];

  const selectedNotAttendees = selectedMatch
    ? partyUsers.filter(
      user => attendance[selectedMatch.id]?.[user.uid] === "not_going"
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

  const filteredMatches = matches.filter((match) => {
    const result = results[match.id];
    const status = getMatchStatus(match, result, now);
    const prediction = predictions[appUser.uid]?.[match.id];

    if (matchFilter === "today") {
      const today = new Date();
      const matchDate = new Date(match.kickoff);
      return (
        matchDate.getFullYear() === today.getFullYear() &&
        matchDate.getMonth() === today.getMonth() &&
        matchDate.getDate() === today.getDate()
      );
    }

    if (matchFilter === "scheduled") {
      return status === "scheduled";
    }

    if (matchFilter === "live") {
      return status === "live";
    }

    if (matchFilter === "finished") {
      return status === "finished";
    }

    if (matchFilter === "missing_prediction") {
      return status === "scheduled" && !prediction;
    }

    return true;
  });

  const matchesByDate = filteredMatches.reduce<
    Record<string, Match[]>
  >((acc, match) => {
    const dateKey = getPeruDateKey(match.kickoff);

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push(match);

    return acc;
  }, {});

  const groupedMatches = Object.entries(matchesByDate).sort(
    ([a], [b]) => a.localeCompare(b)
  );

  if (!appUser.activePartyId) {
    return <JoinPartyView appUser={appUser} />;
  }


  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8 relative">

      {(isSavingPrediction || isSavingResult || isSavingAttendance || isSavingWatchParty || isSavingAdmin) &&
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

        <div className="space-y-3">
          <div className="grid grid-cols-3 rounded-3xl bg-white p-1 shadow-sm">
            {primaryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl px-3 py-3 text-sm font-bold transition ${activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-500"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isAdmin && <div
            className={`grid rounded-3xl bg-white p-1 shadow-sm grid-cols-1}`}
          >
            {secondaryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl px-3 py-3 text-sm font-bold transition ${activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-500"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>}
        </div>

        {activeTab === "matches" && (
          <section className="my-4 space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-950">
                Todos los partidos
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Revisa el calendario completo y mete tus pronósticos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {[
                { key: "all", label: "Todos" },
                { key: "today", label: "Hoy" },
                { key: "scheduled", label: "Próximos" },
                { key: "live", label: "En vivo" },
                { key: "finished", label: "Terminados" },
                { key: "missing_prediction", label: "Por pronosticar" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setMatchFilter(filter.key as typeof matchFilter)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${matchFilter === filter.key
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 shadow-sm"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {Object.entries(matchesByDate).length === 0 ? (
              <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
                <p className="font-bold text-gray-900">
                  No hay partidos para este filtro.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Prueba seleccionando otra opción.
                </p>
              </div>
            ) : (
              groupedMatches.map(([date, dateMatches]) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">
                    {formatPeruDate(dateMatches[0].kickoff)}
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dateMatches.map((match) => {
                      const watchParty = watchPartyMatches[match.id];
                      const isWatchParty = !!watchParty;

                      return (
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
                          isWatchParty={isWatchParty}
                          watchParty={watchParty}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>
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

        {activeTab === "leaderboard" && (
          <LeaderboardTable leaderboard={leaderboard} />
        )}

        {activeTab === "admin" && isAdmin && (
          <AdminPanel
            party={party}
            members={partyUsers}
            appUser={appUser}
            onPromoteUser={handlePromoteUser}
            onDemoteUser={handleDemoteUser}
          />
        )}

      </section>
      <MatchModal
        key={selectedMatch?.id ?? "no-match"}
        match={selectedMatch}
        attendanceStatus={selectedAttendanceStatus}
        attendees={selectedAttendees}
        maybeAttendees = {selectedMaybeAttendees}
        notAttendees={selectedNotAttendees}
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