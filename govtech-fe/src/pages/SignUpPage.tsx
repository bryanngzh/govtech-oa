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
import axios from "axios";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FIREBASE_AUTH } from "../configs/firebase";

const SignUpPage = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match!",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        const data = { name, email };

        try {
          await axios.post(
            `${import.meta.env.VITE_APP_BACKEND_URL}/users`,
            data
          );
          toast({
            title: "Account created.",
            description: "You have successfully signed up.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          navigate("/");
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to create user profile.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          console.error("Error:", error);
        }
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        toast({
          title: "Error signing up",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Unknown error occurred during sign up.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.error("Error during sign up:", error);
      }
    } finally {
      setLoading(false);
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

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={loading}
            >
              Sign Up
            </Button>
          </VStack>
        </form>

        <Text mt={4} textAlign="center">
          Already have an account?{" "}
          <Link color="blue.500" href="/login">
            Login
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default SignUpPage;
