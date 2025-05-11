// This file re-exports the handler from our auth configuration
// Next.js App Router expects named exports for API route handlers

import { GET, POST } from "@/app/auth";

// Export the GET and POST handlers for Next.js App Router
export { GET, POST };

