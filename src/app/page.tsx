"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { MatchCalendar } from "@/components/MatchCalendar";
import { MatchModal } from "@/components/MatchModal";
import { Match } from "@/types/Match";
import { AttendanceStatus } from "@/types/AttendanceStatus";
import { Prediction } from "@/types/Prediction";
import { MatchResult } from "@/types/MatchResult";
import { calculateLeaderboard } from "@/utils/leaderboard";
import { LeaderboardTable } from "@/components/LeaderBoardTable";
import { getMatchStatus } from "@/utils/matchstatus";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthView } from "@/components/AuthView";
import { logout } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getMatchesFromFirebase, seedMatchesToFirebase } from "@/lib/matches";
import { JoinPartyView } from "@/components/JoinPartyView";
import { PredictionsMap, savePredictionToFirebase, subscribeToMyPredictions } from "@/lib/predictions";

export default function Home() {

  const [activeTab, setActiveTab] =
    useState<"matches" | "calendar" | "leaderboard">("matches");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const { appUser, loadingAuth, isAdmin } = useAuth();
  const [isSavingPrediction, setIsSavingPrediction] = useState(false);

  type AttendanceMap = {
    [matchId: string]: AttendanceStatus;
  };

  type ResultsMap = {
    [matchId: string]: MatchResult;
  };

  const [results, setResults] = useState<ResultsMap>({});

  const handleSaveResult = (matchId: string, result: MatchResult) => {
    setResults((previous) => ({
      ...previous,
      [matchId]: result,
    }));
  };

  const [attendance, setAttendance] = useState<AttendanceMap>({
    "mex-rsa-1106": "going",
    "usa-par-1206": "not_going",
  });

  const mockUsers = [
    {
      id: "user-1",
      name: "José",
      avatar: "J",
    },
    {
      id: "user-2",
      name: "Carlos",
      avatar: "C",
    },
    {
      id: "user-3",
      name: "Luis",
      avatar: "L",
    },
  ];

  const [predictions, setPredictions] = useState<PredictionsMap>({});

  useEffect(() => {
    if (!appUser?.activePartyId) return;

    const unsubscribe = subscribeToMyPredictions(
      appUser.activePartyId,
      appUser.uid,
      setPredictions
    );

    return () => unsubscribe();
  }, [appUser?.activePartyId, appUser?.uid]);

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

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);

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


  const handleAttendanceChange = (
    matchId: string,
    status: AttendanceStatus
  ) => {
    setAttendance((previous) => ({
      ...previous,
      [matchId]: status,
    }));
  };

  const clearAttendance = (matchId: string) => {
    setAttendance((previous) => {
      const updated = { ...previous };
      delete updated[matchId];
      return updated;
    });
  };

  const leaderboard = calculateLeaderboard(
    mockUsers,
    predictions,
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
    <main className="h-screen bg-gray-50 px-5 py-8">

      {isSavingPrediction &&
        <LoadingScreen />
      }

      <button
        onClick={async () => {
          await seedMatchesToFirebase();
          alert("Partidos cargados a Firebase");
        }}
        className="rounded-lg bg-black px-4 py-2 text-white"
      >
        Cargar partidos a Firebase
      </button>
      <div>
        <p className="font-semibold">
          Hola, {appUser.name}
        </p>
        <p className="text-sm text-gray-500">
          {appUser.email}
        </p>
      </div>
      <button onClick={logout}
        className="group flex items-center justify-start w-11 h-11 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1"
      >
        <div
          className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
            <path
              d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
            ></path>
          </svg>
        </div>
        <div
          className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        >
          Cerrar sesión
        </div>
      </button>
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600">
            Mundial 2026
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-950 md:text-5xl">
            Partidos con la mancha
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Confirmen asistencia, propongan casa y más adelante metemos
            pronósticos y ranking.
          </p>
        </div>

        <div className="mb-6 flex rounded-2xl bg-white p-1 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("matches")}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${activeTab === "matches"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Partidos
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${activeTab === "calendar"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Calendario
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${activeTab === "leaderboard"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Tabla
          </button>
        </div>

        {activeTab === "matches" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} onSelect={setSelectedMatch}
                status={getMatchStatus(match, results[match.id], now)} />
            ))}
          </div>
        )}

        {activeTab === "calendar" && <MatchCalendar matches={matches} onSelect={setSelectedMatch} />}

        {activeTab === "leaderboard" && (
          <LeaderboardTable leaderboard={leaderboard} />
        )}

      </section>
      <MatchModal
        key={selectedMatch?.id ?? "no-match"}
        match={selectedMatch}
        attendanceStatus={
          selectedMatch
            ? attendance[selectedMatch.id]
            : undefined
        }
        onSavePrediction={handleSavePrediction}
        onSaveResult={handleSaveResult}
        resultMatch={selectedMatch ? results[selectedMatch.id] : undefined}
        prediction={selectedMatch ? predictions[appUser.uid]?.[selectedMatch.id] : undefined}
        onAttendanceChange={handleAttendanceChange}
        onClearAttendance={clearAttendance}
        onClose={() => setSelectedMatch(null)}
        status={selectedStatus}
      />
    </main>
  );
}