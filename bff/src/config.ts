export const {
  KEYCLOAK_URL = "http://localhost:8080",
  KEYCLOAK_REALM = "myrealm",
  KEYCLOAK_CLIENT_ID = "myclient",
  KEYCLOAK_CLIENT_SECRET = "change-me",
  SESSION_SECRET = "super-secret",
  FRONTEND_URL = "http://localhost:5173",
  PORT = "3001",
  REDIS_URL = "redis://localhost:6379",
} = process.env;

export const TOKEN_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
export const USERINFO_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
export const ADMIN_TOKEN_URL = `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`;
export const ADMIN_USERS_URL = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`;
