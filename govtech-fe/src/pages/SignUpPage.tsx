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
import axios from "axios";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);

      if (user) {
        const data = {
          name,
          email,
        };
        try {
          await axios.post("http://localhost:3000/users", data);
        } catch (error) {
          console.error("Error:", error);
        }
        navigate("/");
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error("Error signing up:", error.message);
      } else {
        console.error("Unknown error occurred during sign up.");
      }
    }
  };

  return (
    <Flex align="center" justify="center" height="100vh" bg="gray.50">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" width="400px">
        <Heading as="h2" size="xl" mb={6} textAlign="center">
          Sign Up
        </Heading>

        <form onSubmit={handleSignUp}>
          <VStack spacing={4}>
            <FormControl id="name" isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <FormControl id="confirmPassword" isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>

            <Button type="submit" colorScheme="blue" width="full">
              Sign Up
            </Button>
          </VStack>
        </form>

        <Text mt={4} textAlign="center">
          Already have an account?{" "}
          <Link color="blue.500" href="/signin">
            Login
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default SignUpPage;
