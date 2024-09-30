import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Match } from "../../../entities/Match";
import EditMatchesModal from "./EditMatchesModal";

const MatchesPage = () => {
  const [input, setInput] = useState<string>("");
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchMatchHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/matches");
        setMatchHistory(response.data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchHistory();
  }, []);

  const handleSubmit = async () => {
    const inputParts = input.split(" ");
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

    const newMatch: Match = {
      teamA,
      teamB,
      scoreA,
      scoreB,
    };

    try {
      await axios.post("http://localhost:3000/matches", newMatch);
      setMatchHistory((prevHistory) => [...prevHistory, newMatch]);
      setInput("");
    } catch (error) {
      setError((error as Error).message);
    }
  };

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

  return (
    <Box p={5}>
      <Heading mb={6}>Matches</Heading>

      <VStack spacing={4} align="stretch" mb={8}>
        <FormControl>
          <FormLabel>Enter Match Details</FormLabel>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Format: <teamA> <teamB> <scoreA> <scoreB>"
          />
        </FormControl>

        <Button colorScheme="blue" onClick={handleSubmit}>
          Submit Match
        </Button>
      </VStack>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading && (
        <Flex justifyContent="center" alignItems="center" h="100vh">
          <Spinner size="xl" />
        </Flex>
      )}

      {!loading && (
        <Box>
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
  );
};

export default MatchesPage;
