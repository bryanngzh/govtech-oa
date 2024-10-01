import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { TeamStat } from "../../../entities/TeamStat";
import GroupTable from "./GroupTable";

const fetchTeamStats = async () => {
  const response = await axios.get("http://localhost:3000/matches/team-stats");
  return response.data;
};

const useTeamStats = () => {
  const [data, setData] = useState<{ [group: string]: TeamStat[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonData = await fetchTeamStats();
        setData(jsonData);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

const LeaderboardPage = () => {
  const { data, loading, error } = useTeamStats();

  const isDataEmpty = useMemo(() => Object.keys(data).length === 0, [data]);

  return (
    <Box p={5}>
      <Heading mb={6}>Leaderboard</Heading>
      {loading && (
        <Flex justifyContent="center" alignItems="center" h="100vh">
          <Spinner size="xl" />
        </Flex>
      )}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      {!loading && !error && isDataEmpty && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          No data available at the moment.
        </Alert>
      )}
      {!loading && !isDataEmpty && (
        <VStack spacing={6} align="stretch">
          {Object.entries(data).map(([groupId, teams]) => (
            <GroupTable key={groupId} groupId={groupId} teams={teams} />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default LeaderboardPage;
