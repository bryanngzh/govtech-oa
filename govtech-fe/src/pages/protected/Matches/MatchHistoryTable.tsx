import {
  Box,
  Button,
  Heading,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Match } from "../../../entities/Match";
import { RootState } from "../../../stores/store";
import EditMatchModal from "./EditMatchModal";

interface MatchHistoryTableProps {
  matchHistory: Match[];
  setMatchHistory: React.Dispatch<React.SetStateAction<Match[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const MatchHistoryTable = ({
  matchHistory,
  setMatchHistory,
  setError,
}: MatchHistoryTableProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const accessToken = useSelector((state: RootState) => state.auth.token);

  const handleDelete = async (matchId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND_URL}/matches?id=${matchId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMatchHistory((prevHistory) =>
        prevHistory.filter((match) => match.id !== matchId)
      );
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleUpdate = async (updatedInput: string) => {
    if (!selectedMatch) return;

    const [teamA, teamB, scoreA, scoreB] = updatedInput.split(" ");
    const updatedMatch: Match = {
      ...selectedMatch,
      teamA,
      teamB,
      scoreA: Number(scoreA),
      scoreB: Number(scoreB),
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND_URL}/matches?id=${
          selectedMatch.id
        }`,
        updatedMatch,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const updated = response.data;
      setMatchHistory((prevHistory) =>
        prevHistory.map((match) => (match.id === updated.id ? updated : match))
      );
      onClose();
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const openEditModal = (match: Match) => {
    setSelectedMatch(match);
    onOpen();
  };

  return (
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
                <Button
                  ml={2}
                  colorScheme="red"
                  onClick={() => handleDelete(match.id as string)}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <EditMatchModal
        isOpen={isOpen}
        onClose={onClose}
        selectedMatch={selectedMatch}
        handleUpdate={handleUpdate}
      />
    </Box>
  );
};

export default MatchHistoryTable;
