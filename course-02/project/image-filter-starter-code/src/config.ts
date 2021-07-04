export const config = {
  auth_verify_endpoint:
    process.env.AUTH_VERIFY_ENDPOINT ||
    "http://localhost:8080/api/v0/users/auth/verification",
};
