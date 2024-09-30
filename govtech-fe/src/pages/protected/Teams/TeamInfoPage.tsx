import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Team } from "../../../entities/Team";

const TeamInfoPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchTeamInfo();
  }, [teamId]);

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
  );
};

export default TeamInfoPage;
