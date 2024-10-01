import {
  Box,
  Button,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Team } from "../../../entities/Team";
import EditTeamsModal from "./EditTeamsModal";

interface TeamsTableProps {
  teamHistory: Team[];
  setTeamHistory: React.Dispatch<React.SetStateAction<Team[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const TeamsTable = ({
  teamHistory,
  setTeamHistory,
  setError,
}: TeamsTableProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const navigate = useNavigate();

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    onOpen();
  };

  const goToTeamInfoPage = (teamId: string) => {
    navigate(`/team-info/${teamId}`);
  };

  const handleDelete = async (teamId: string) => {
    try {
      await axios.delete(`http://localhost:3000/teams?id=${teamId}`);
      setTeamHistory((prevHistory) =>
        prevHistory.filter((team) => team.id !== teamId)
      );
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleUpdate = async (updatedInput: string) => {
    if (!selectedTeam) return;

    const inputParts = updatedInput.split(" ");
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

    if (isNaN(groupNumber)) {
      setError("Please enter a valid number for the group.");
      return;
    }

    const [day, month] = regDate.split("/").map(Number);
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, month - 1, day);
    const isoDateString = date.toISOString();

    const updatedTeam: Team = {
      id: teamName,
      regDate: isoDateString,
      group: groupNumberString,
    };

    try {
      await axios.post("http://localhost:3000/teams", updatedTeam);
      setTeamHistory((prevHistory) =>
        prevHistory.map((team) =>
          team.id === selectedTeam.id ? updatedTeam : team
        )
      );
      setSelectedTeam(null);
      onClose();
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
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
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {teamHistory.map((team, index) => (
            <Tr key={index}>
              <Td>{team.id}</Td>
              <Td>{new Date(team.regDate).toLocaleDateString()}</Td>
              <Td>{team.group}</Td>
              <Td>
                <Button onClick={() => openEditModal(team)}>Edit</Button>
                <Button ml={2} onClick={() => goToTeamInfoPage(team.id)}>
                  Info
                </Button>
                <Button
                  ml={2}
                  colorScheme="red"
                  onClick={() => handleDelete(team.id)}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {selectedTeam && (
        <EditTeamsModal
          isOpen={isOpen}
          onClose={onClose}
          selectedTeam={selectedTeam}
          handleUpdate={handleUpdate}
        />
      )}
    </Box>
  );
};

export default TeamsTable;
