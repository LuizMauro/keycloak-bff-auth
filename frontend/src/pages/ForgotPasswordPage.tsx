import { FormEvent, useState } from "react";
import { Box, Button, Heading, Input, Text, VStack, Link as ChakraLink } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const username = fd.get("username") as string;
    await forgotPassword(username);
    navigate("/reset-password", { state: { username } });
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box bg="white" p={8} rounded="xl" shadow="lg" w="full" maxW="400px">
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Heading size="lg">Esqueci minha senha</Heading>
          <Text fontSize="sm" color="gray.500">Informe seu usuário para receber o código.</Text>
          <Input name="username" placeholder="Usuário" size="lg" required />
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}
          <Button type="submit" colorScheme="blue" size="lg" w="full">Enviar código</Button>
          <ChakraLink as={Link} to="/login" color="blue.500" fontSize="sm">Voltar ao login</ChakraLink>
        </VStack>
      </Box>
    </Box>
  );
}
