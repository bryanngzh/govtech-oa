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
import { TeamStat } from "../../entities/TeamStat";

const LeaderboardPage = () => {
  const [data, setData] = useState<{ [group: string]: TeamStat[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/matches/team-stats"
        );
        const jsonData: { [group: string]: TeamStat[] } = response.data;
        setData(jsonData);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortTeams = (teams: TeamStat[]) => {
    return teams.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.altPoints !== a.altPoints) {
        return b.altPoints - a.altPoints;
      }
      return new Date(a.regDate).getTime() - new Date(b.regDate).getTime();
    });
  };

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
        {Object.entries(data).map(([groupId, teams]) => {
          const sortedTeams = sortTeams(teams);

          return (
            <Box key={groupId} borderWidth={1} borderRadius="lg" p={4}>
              <Heading size="md" mb={6}>
                Group {groupId}
              </Heading>
              <Table variant="simple">
                <TableCaption>Group ID: {groupId}</TableCaption>
                <Thead>
                  <Tr bg={"gray.200"}>
                    <Th>Team Name</Th>
                    <Th>Total Matches</Th>
                    <Th>Wins</Th>
                    <Th>Losses</Th>
                    <Th>Draws</Th>
                    <Th>Points</Th>
                    <Th>Alternative Points</Th>
                    <Th>Registration Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedTeams.map((team, index) => (
                    <Tr
                      key={team.id}
                      bg={index < 3 ? "green.100" : "transparent"}
                    >
                      <Td>{team.id}</Td>
                      <Td>{team.totalMatches}</Td>
                      <Td>{team.wins}</Td>
                      <Td>{team.losses}</Td>
                      <Td>{team.draws}</Td>
                      <Td>{team.points}</Td>
                      <Td>{team.altPoints}</Td>
                      <Td>{new Date(team.regDate).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default LeaderboardPage;
