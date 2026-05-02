import { FormEvent, useState } from "react";
import { Box, Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const location = useLocation();
  const username = (location.state as any)?.username as string;
  const [error, setError] = useState("");

  if (!username) return <Navigate to="/login" />;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const newPass = fd.get("newPassword") as string;
    if (newPass !== fd.get("confirmPassword")) return setError("Senhas não conferem");

    const data = await changePassword(username, fd.get("oldPassword") as string, newPass);
    if (!data.ok) setError(data.error === "Invalid old password" ? "Senha atual incorreta" : "Erro ao trocar senha");
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box bg="white" p={8} rounded="xl" shadow="lg" w="full" maxW="400px">
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Heading size="lg">Trocar Senha</Heading>
          <Text fontSize="sm" color="gray.500">Primeiro acesso — defina uma nova senha.</Text>
          <Input name="oldPassword" type="password" placeholder="Senha atual" size="lg" required />
          <Input name="newPassword" type="password" placeholder="Nova senha" size="lg" required />
          <Input name="confirmPassword" type="password" placeholder="Confirmar nova senha" size="lg" required />
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}
          <Button type="submit" colorScheme="blue" size="lg" w="full">Alterar Senha</Button>
        </VStack>
      </Box>
    </Box>
  );
}
