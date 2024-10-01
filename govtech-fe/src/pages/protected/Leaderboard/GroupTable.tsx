import {
  Box,
  Heading,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { TeamStat } from "../../../entities/TeamStat";

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

interface GroupTableProps {
  groupId: string;
  teams: TeamStat[];
}

const GroupTable = ({ groupId, teams }: GroupTableProps) => {
  const sortedTeams = useMemo(() => sortTeams(teams), [teams]);

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
            <Tr key={team.id} bg={index < 3 ? "green.100" : "transparent"}>
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
};

export default GroupTable;
