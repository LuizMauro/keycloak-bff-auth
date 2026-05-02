import { FormEvent, useState } from "react";
import { Box, Button, Heading, Input, Text, VStack, HStack, PinInput, PinInputField, Link as ChakraLink } from "@chakra-ui/react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const username = (location.state as any)?.username as string;
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (!username) return <Navigate to="/forgot-password" />;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const newPass = fd.get("newPassword") as string;
    if (newPass !== fd.get("confirmPassword")) return setError("Senhas não conferem");

    const data = await resetPassword(code, newPass);
    if (!data.ok) setError("Código inválido ou expirado");
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box bg="white" p={8} rounded="xl" shadow="lg" w="full" maxW="400px">
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Heading size="lg">Redefinir Senha</Heading>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Código enviado para <b>{username}</b>.<br />
            (Verifique o console do BFF)
          </Text>
          <HStack justify="center">
            <PinInput size="lg" otp value={code} onChange={setCode}>
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
          <Input name="newPassword" type="password" placeholder="Nova senha" size="lg" required />
          <Input name="confirmPassword" type="password" placeholder="Confirmar nova senha" size="lg" required />
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}
          <Button type="submit" colorScheme="blue" size="lg" w="full" isDisabled={code.length < 6}>
            Redefinir Senha
          </Button>
          <ChakraLink as={Link} to="/login" color="blue.500" fontSize="sm">Voltar ao login</ChakraLink>
        </VStack>
      </Box>
    </Box>
  );
}
