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
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Match } from "../entities/Match";

const MatchesPage = () => {
  const [input, setInput] = useState<string>("");
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
              </Tr>
            </Thead>
            <Tbody>
              {matchHistory.map((match, index) => (
                <Tr key={index}>
                  <Td>{match.teamA}</Td>
                  <Td>{match.teamB}</Td>
                  <Td>{match.scoreA}</Td>
                  <Td>{match.scoreB}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default MatchesPage;
