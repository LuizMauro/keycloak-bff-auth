import { Box, Button, Code, Heading, VStack, Avatar, Text } from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function HomePage() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box bg="white" p={8} rounded="xl" shadow="lg" w="full" maxW="400px" textAlign="center">
        <VStack spacing={5}>
          <Avatar size="xl" name={user.preferred_username || user.name} />
          <Heading size="md">Bem-vindo, {user.preferred_username || user.name}!</Heading>
          {user.email && <Text fontSize="sm" color="gray.500">{user.email}</Text>}
          <Code p={4} rounded="md" w="full" fontSize="xs" whiteSpace="pre">
            {JSON.stringify(user, null, 2)}
          </Code>
          <Button colorScheme="red" variant="outline" w="full" onClick={logout}>Sair</Button>
        </VStack>
      </Box>
    </Box>
  );
}
