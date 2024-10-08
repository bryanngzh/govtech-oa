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
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Match } from "../../../entities/Match";
import { RootState } from "../../../stores/store";
import MatchHistoryTable from "./MatchHistoryTable";

const ERROR_MESSAGES = {
  invalidFormat:
    "Please enter data in the format: <teamA> <teamB> <scoreA> <scoreB>",
  invalidScores: "Please enter valid numbers for the scores.",
};

const MatchesPage = () => {
  const [input, setInput] = useState<string>("");
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.token);

  const fetchMatchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_URL}/matches`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMatchHistory(response.data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  const handleSubmit = async () => {
    const inputParts = input.split(" ");
    if (inputParts.length !== 4) {
      setError(ERROR_MESSAGES.invalidFormat);
      return;
    }
    const [teamA, teamB, scoreAString, scoreBString] = inputParts;
    const scoreA = Number(scoreAString);
    const scoreB = Number(scoreBString);

    if (isNaN(scoreA) || isNaN(scoreB)) {
      setError(ERROR_MESSAGES.invalidScores);
      return;
    }

    let newMatch: Match = { teamA, teamB, scoreA, scoreB };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_URL}/matches`,
        newMatch,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      newMatch = response.data;
      setMatchHistory((prevHistory) => [...prevHistory, newMatch]);
      setError(null);
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

      {matchHistory.length !== 0 && error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading ? (
        <Flex justifyContent="center" alignItems="center" h="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {matchHistory.length === 0 ? (
            <Alert status="info" mb={4}>
              <AlertIcon />
              No matches available at the moment.
            </Alert>
          ) : (
            <MatchHistoryTable
              matchHistory={matchHistory}
              setMatchHistory={setMatchHistory}
              setError={setError}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default MatchesPage;
