import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Spinner,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Team } from "../entities/Team";
import { TeamStat } from "../entities/TeamStat";

const LeaderboardPage = () => {
  const [data, setData] = useState<TeamStat[]>([]);
  const [teamDetails, setTeamDetails] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/matches/team-stats"
        );
        const jsonData: TeamStat[] = response.data;
        setData(jsonData);

        const teamDetailsPromises = jsonData.map((teamStat) =>
          axios
            .get(`http://localhost:3000/teams?id=${teamStat.id}`)
            .then((res) => res.data)
        );
        const teamsData = await Promise.all(teamDetailsPromises);

        setTeamDetails(teamsData);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupByGroup = (teams: Team[]): Record<string, Team[]> => {
    return teams.reduce((acc, team) => {
      const groupId = team.group;
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(team);
      return acc;
    }, {} as Record<string, Team[]>);
  };

  const groupedData = groupByGroup(teamDetails);

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
      <VStack spacing={6} align="stretch">
        {Object.entries(groupedData).map(([groupId, teams]) => (
          <Box key={groupId} borderWidth={1} borderRadius="lg" p={4}>
            <Table variant="simple">
              <TableCaption>Group ID: {groupId}</TableCaption>
              <Thead>
                <Tr>
                  <Th>Team Name</Th>
                  <Th>Total Matches</Th>
                  <Th>Wins</Th>
                  <Th>Losses</Th>
                  <Th>Draws</Th>
                </Tr>
              </Thead>
              <Tbody>
                {teams.map((team) => {
                  const teamStat = data.find((stat) => stat.id === team.id);
                  return (
                    <Tr key={team.id}>
                      <Td>{team.id}</Td>
                      <Td>{teamStat?.totalMatches}</Td>
                      <Td>{teamStat?.wins}</Td>
                      <Td>{teamStat?.losses}</Td>
                      <Td>{teamStat?.draws}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default LeaderboardPage;
