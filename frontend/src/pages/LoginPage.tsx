import { FormEvent, useState } from "react";
import { Box, Button, Heading, Input, Text, VStack, Link as ChakraLink } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const username = fd.get("username") as string;
    const password = fd.get("password") as string;

    const data = await login(username, password);
    if (data.error === "password_change_required") {
      navigate("/change-password", { state: { username } });
    } else if (!data.ok) {
      setError("Credenciais inválidas");
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box bg="white" p={8} rounded="xl" shadow="lg" w="full" maxW="400px">
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Heading size="lg">Entrar</Heading>
          <Input name="username" placeholder="Usuário" size="lg" required />
          <Input name="password" type="password" placeholder="Senha" size="lg" required />
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}
          <Button type="submit" colorScheme="blue" size="lg" w="full">Entrar</Button>
          <ChakraLink as={Link} to="/forgot-password" color="blue.500" fontSize="sm">
            Esqueci minha senha
          </ChakraLink>
        </VStack>
      </Box>
    </Box>
  );
}
