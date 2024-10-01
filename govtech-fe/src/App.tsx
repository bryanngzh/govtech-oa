import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LeaderboardPage from "./pages/protected/Leaderboard/LeaderboardPage";
import LogsPage from "./pages/protected/Logging/LogsPage";
import MatchesPage from "./pages/protected/Matches/MatchesPage";
import TeamInfoPage from "./pages/protected/Teams/TeamInfoPage";
import TeamsPage from "./pages/protected/Teams/TeamsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoutes from "./ProtectedRoutes";
import store from "./stores/store";

function App() {
  return (
    <Provider store={store}>
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
              <Route path="/logs" element={<LogsPage />} />
            </Route>
          </Routes>
        </Router>
      </ChakraProvider>
    </Provider>
  );
}

export default App;
