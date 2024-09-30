import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Match } from "../../../entities/Match";
import { Team } from "../../../entities/Team";
import EditMatchesModal from "../Matches/EditMatchesModal";

const TeamInfoPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/teams?id=${teamId}`
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
          `http://localhost:3000/matches/by-team/?teamId=${teamId}`
        );
        setMatchHistory(response.data);
      } catch (error) {
        console.log((error as Error).message);
      }
    };

    fetchTeamInfo();
    fetchMatchHistory();
  }, [teamId]);

  const openEditModal = (match: Match) => {
    setSelectedMatch(match);
    onOpen();
  };

  const handleUpdate = async (updatedInput: string) => {
    if (!selectedMatch) return;

    const inputParts = updatedInput.split(" ");
    if (inputParts.length !== 4) {
      setError(
        "Please enter data in the format: <teamA> <teamB> <scoreA> <scoreB>"
      );
      return;
    }

    const [teamA, teamB, scoreAString, scoreBString] = inputParts;

    const scoreA = Number(scoreAString);
    const scoreB = Number(scoreBString);

    if (isNaN(scoreA) || isNaN(scoreB)) {
      setError("Please enter valid numbers for the scores.");
      return;
    }

    const updatedMatch: Match = {
      teamA,
      teamB,
      scoreA,
      scoreB,
    };

    try {
      await axios.put(
        `http://localhost:3000/matches?id=${selectedMatch.id as string}`,
        updatedMatch
      );
      setMatchHistory((prevHistory) =>
        prevHistory.map((match) =>
          match.id === selectedMatch.id ? updatedMatch : match
        )
      );
      onClose();
      setSelectedMatch(null);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
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
        </Box>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {matchHistory && (
          <Box p={5}>
            <Heading size="md" mb={4}>
              Match History
            </Heading>
            <Table variant="simple">
              <TableCaption>Previous Matches</TableCaption>
              <Thead>
                <Tr>
                  <Th>Team A</Th>
                  <Th>Team B</Th>
                  <Th>Score A</Th>
                  <Th>Score B</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {matchHistory.map((match, index) => (
                  <Tr key={index}>
                    <Td>{match.teamA}</Td>
                    <Td>{match.teamB}</Td>
                    <Td>{match.scoreA}</Td>
                    <Td>{match.scoreB}</Td>
                    <Td>
                      <Button onClick={() => openEditModal(match)}>Edit</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
        <EditMatchesModal
          isOpen={isOpen}
          onClose={onClose}
          selectedMatch={selectedMatch}
          handleUpdate={handleUpdate}
        />
      </Box>
    </>
  );
};

export default TeamInfoPage;
