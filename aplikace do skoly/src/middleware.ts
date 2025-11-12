export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!_next|public|api/auth|auth).*)",
  ],
};
