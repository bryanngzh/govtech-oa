import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FIREBASE_AUTH } from "../configs/firebase";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      if (userCredential.user) {
        navigate("/");
      }
    } catch (error) {
      let message = "An unknown error occurred. Please try again.";

      if (error instanceof FirebaseError) {
        message = error.message;
      }

      toast({
        title: "Sign In Failed",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" height="100vh" bg="gray.50">
      <Box
        bg="white"
        p={8}
        rounded="lg"
        boxShadow="lg"
        width={{ base: "90%", sm: "400px" }}
      >
        <Heading as="h2" size="xl" mb={6} textAlign="center">
          Govtech Login
        </Heading>

        <form onSubmit={handleSignIn}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={loading}
            >
              Login
            </Button>
          </VStack>
        </form>

        <Text mt={4} textAlign="center">
          Don't have an account?{" "}
          <Link color="blue.500" href="/signup">
            Sign up
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default SignInPage;
