import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Match } from "../../../entities/Match";
import { Team } from "../../../entities/Team";
import { TeamStat } from "../../../entities/TeamStat";
import { RootState } from "../../../stores/store";
import MatchHistoryTable from "../Matches/MatchHistoryTable";

const TeamInfoPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [teamStat, setTeamStat] = useState<TeamStat | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/teams?id=${teamId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setTeam(response.data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    const fetchMatchHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/matches/by-team?teamId=${teamId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setMatchHistory(response.data);
      } catch (error) {
        console.log((error as Error).message);
      }
    };

    const fetchTeamStats = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/matches/team-stats?teamId=${teamId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setTeamStat(response.data);
      } catch (error) {
        console.log((error as Error).message);
      }
    };

    fetchTeamInfo();
    fetchMatchHistory();
    fetchTeamStats();
  }, [teamId]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <>
      <Box p={5}>
        <Box p={5}>
          <Heading mb={4}>Team Information</Heading>
          {team ? (
            <Box>
              <Text fontSize="lg">
                <strong>Team Name:</strong> {team.id}
              </Text>
              <Text fontSize="lg">
                <strong>Registration Date:</strong>{" "}
                {new Date(team.regDate).toLocaleDateString()}
              </Text>
              <Text fontSize="lg">
                <strong>Group Number:</strong> {team.group}
              </Text>
            </Box>
          ) : (
            <Text>No team data found.</Text>
          )}
          {teamStat && (
            <Box>
              <Text fontSize="lg">
                <strong>Wins:</strong> {teamStat.wins}
              </Text>
              <Text fontSize="lg">
                <strong>Loss:</strong> {teamStat.losses}
              </Text>
              <Text fontSize="lg">
                <strong>Draw:</strong> {teamStat.draws}
              </Text>
              <Text fontSize="lg">
                <strong>Points:</strong> {teamStat.points}
              </Text>
              <Text fontSize="lg">
                <strong>Alternative Points:</strong> {teamStat.altPoints}
              </Text>
            </Box>
          )}
        </Box>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {matchHistory && (
          <Box p={5}>
            <MatchHistoryTable
              matchHistory={matchHistory}
              setMatchHistory={setMatchHistory}
              setError={setError}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default TeamInfoPage;
