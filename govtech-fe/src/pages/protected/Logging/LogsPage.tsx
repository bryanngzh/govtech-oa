import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { LogEntry } from "../../../entities/LogEntry";
import { RootState } from "../../../stores/store";

const useLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextDoc, setNextDoc] = useState<string | undefined>(undefined);
  const accessToken = useSelector((state: RootState) => state.auth.token);
  const limit = 10;

  const fetchLogs = useCallback(
    async (lastDoc?: string) => {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_URL}/logs`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            limit,
            lastDoc,
          },
        }
      );
      return response.data;
    },
    [accessToken]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonData = await fetchLogs();
        setLogs(jsonData.logs);
        setNextDoc(jsonData.nextDoc);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchLogs]);

  const loadMoreLogs = async () => {
    if (nextDoc) {
      try {
        const jsonData = await fetchLogs(nextDoc);
        setLogs((prevLogs) => [...prevLogs, ...jsonData.logs]);
        setNextDoc(jsonData.nextDoc);
      } catch (error) {
        setError((error as Error).message);
      }
    }
  };

  return { logs, loading, error, loadMoreLogs, nextDoc };
};

const LogsPage = () => {
  const { logs, loading, error, loadMoreLogs, nextDoc } = useLogs();

  const isDataEmpty = useMemo(() => logs.length === 0, [logs]);

  return (
    <Box p={5}>
      <Heading mb={6}>Logs</Heading>
      {loading && (
        <Flex justifyContent="center" alignItems="center" h="100vh">
          <Spinner size="xl" />
        </Flex>
      )}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      {!loading && !error && isDataEmpty && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          No logs available at the moment.
        </Alert>
      )}
      {!loading && !isDataEmpty && (
        <VStack spacing={6} align="stretch">
          {logs.map((log) => (
            <Box
              key={log.id}
              p={6}
              shadow="md"
              borderWidth="1px"
              borderRadius="md"
              bg="gray.50"
            >
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                {new Date(log.timestamp).toLocaleString()}{" "}
              </Text>
              <Text mb={1}>
                <strong>User:</strong> {log.user}
              </Text>
              <Text mb={1}>
                <strong>Request:</strong> {log.method} {log.url}
              </Text>
              <Text mb={1}>
                <strong>Status:</strong> {log.responseStatus}
              </Text>

              {log.requestBody && (
                <Box
                  mt={2}
                  p={4}
                  bg="gray.100"
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <Text mb={2} fontWeight="bold">
                    Request Body:
                  </Text>
                  <Text fontFamily="mono" whiteSpace="pre-wrap">
                    {JSON.stringify(log.requestBody, null, 2)}
                  </Text>
                </Box>
              )}
            </Box>
          ))}
          {nextDoc && (
            <Button
              onClick={loadMoreLogs}
              isLoading={loading}
              colorScheme="teal"
              mt={4}
            >
              Load More
            </Button>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default LogsPage;
