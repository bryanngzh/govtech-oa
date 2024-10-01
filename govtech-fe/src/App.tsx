import { ChakraProvider } from "@chakra-ui/react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LeaderboardPage from "./pages/protected/Leaderboard/LeaderboardPage";
import MatchesPage from "./pages/protected/Matches/MatchesPage";
import TeamInfoPage from "./pages/protected/Teams/TeamInfoPage";
import TeamsPage from "./pages/protected/Teams/TeamsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoutes from "./ProtectedRoutes";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<LeaderboardPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/team-info/:teamId" element={<TeamInfoPage />} />
          </Route>
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
