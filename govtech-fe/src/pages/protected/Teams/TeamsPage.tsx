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
import { Team } from "../../../entities/Team";
import { RootState } from "../../../stores/store";
import TeamsTable from "./TeamsTable";

const TeamsPage = () => {
  const [input, setInput] = useState<string>("");
  const [teamHistory, setTeamHistory] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchTeamHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND_URL}/teams`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setTeamHistory(response.data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamHistory();
  }, []);

  const handleSubmit = async () => {
    const inputParts = input.split(" ");
    if (inputParts.length !== 3) {
      setError(
        "Please enter data in the format: <Team Name> <Registration Date (DD/MM)> <Group Number>"
      );
      return;
    }

    const [teamName, regDate, groupNumberString] = inputParts;
    const groupNumber = Number(groupNumberString);
    const datePattern = /^\d{2}\/\d{2}$/;

    if (!regDate.includes("/") || !datePattern.test(regDate)) {
      setError("Please enter a valid registration date in DD/MM format.");
      return;
    }

    const [day, month] = regDate.split("/").map(Number);
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, month - 1, day);
    const isoDateString = date.toISOString();

    if (isNaN(groupNumber)) {
      setError("Please enter a valid number for the group.");
      return;
    }

    let newTeam: Team = {
      regDate: isoDateString,
      group: groupNumberString,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_URL}/teams?id=${teamName}`,
        newTeam,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      newTeam = response.data;
      setTeamHistory((prevHistory) => {
        const teamIndex = prevHistory.findIndex((team) => team.id === teamName);

        if (teamIndex !== -1) {
          const updatedHistory = [...prevHistory];
          updatedHistory[teamIndex] = newTeam;
          return updatedHistory;
        } else {
          return [...prevHistory, newTeam];
        }
      });
      setInput("");
      setError("");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const isTeamHistoryEmpty = teamHistory.length === 0;

  return (
    <Box p={5}>
      <Heading mb={6}>Teams</Heading>

      <VStack spacing={4} align="stretch" mb={8}>
        <FormControl>
          <FormLabel>Add Team Details</FormLabel>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Format: <Team Name> <Registration Date (DD/MM)> <Group Number>"
          />
        </FormControl>

        <Button colorScheme="blue" onClick={handleSubmit}>
          Submit Team
        </Button>
      </VStack>

      {!isTeamHistoryEmpty && error && (
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

      {!loading && isTeamHistoryEmpty && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          No teams registered yet.
        </Alert>
      )}

      {!loading && !isTeamHistoryEmpty && (
        <TeamsTable
          teamHistory={teamHistory}
          setTeamHistory={setTeamHistory}
          setError={setError}
        />
      )}
    </Box>
  );
};

export default TeamsPage;
