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
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Team } from "../../../entities/Team";

const TeamsPage = () => {
  const [input, setInput] = useState<string>("");
  const [teamHistory, setTeamHistory] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/teams");
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
        "Please enter data in the format: <Team A name> <Team A registration date (DD/MM)> <Team A group number>"
      );
      return;
    }

    const [teamName, regDate, groupNumberString] = inputParts;

    const groupNumber = Number(groupNumberString);

    // Validate registration date format DD/MM
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

    const newTeam: Team = {
      id: teamName,
      regDate: isoDateString,
      group: groupNumberString,
    };

    try {
      await axios.post("http://localhost:3000/teams", newTeam);
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
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <Box p={5}>
      <Heading mb={6}>Teams</Heading>

      <VStack spacing={4} align="stretch" mb={8}>
        <FormControl>
          <FormLabel>Add or Update Team Details</FormLabel>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Format: <Team A name> <Team A registration date (DD/MM)> <Team A group number>"
          />
        </FormControl>

        <Button colorScheme="blue" onClick={handleSubmit}>
          Submit Team
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
            Registered Teams
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Team Name</Th>
                <Th>Registration Date</Th>
                <Th>Group Number</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teamHistory.map((team, index) => (
                <Tr key={index}>
                  <Td>{team.id}</Td>
                  <Td>{new Date(team.regDate).toLocaleString()}</Td>
                  <Td>{team.group}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default TeamsPage;
