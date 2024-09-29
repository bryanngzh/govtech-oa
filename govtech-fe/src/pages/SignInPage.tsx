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
} from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);
      if (user) {
        navigate("/");
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error("Error signing in:", error.message);
      } else {
        console.error("Unknown error occurred during sign in.");
      }
    }
  };

  return (
    <Flex align="center" justify="center" height="100vh" bg="gray.50">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" width="400px">
        <Heading as="h2" size="xl" mb={6} textAlign="center">
          Govtech Login
        </Heading>

        <form onSubmit={(e) => handleSignIn(e)}>
          <VStack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>

            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>

            <Button type="submit" colorScheme="blue" width="full">
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
