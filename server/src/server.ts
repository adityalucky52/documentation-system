import Fastify from "fastify"
import cors from "@fastify/cors"
import { authRoutes } from "./features/auth/auth.routes.js"
import { orgRoutes } from "./features/org/org.routes.js"
import { sitesManagementRoutes } from "./features/sites-management/sites-management.routes.js"
import { editorRoutes } from "./features/editor/editor.routes.js"
import { changeRequestsRoutes } from "./features/change-requests/change-requests.routes.js"
import { errorHandler } from "./lib/errorHandler.js"

/**
 * Fastify Server Entry Point.
 * 
 * Purpose:
 * Bootstraps the HTTP backend service using the Fastify web framework.
 * Configures global logging, cross-origin policies (CORS), error boundary mapping,
 * and splits incoming request domains across sub-feature routing plugins.
 */
const fastify = Fastify({
  logger: true // Enable structured logging to stdout for incoming requests and errors
})

// Register Global Error Handler
// Catch all unhandled exceptions thrown inside routers/controllers and normalize client responses
fastify.setErrorHandler(errorHandler)

// Enable CORS
// Allow client applications running on localhost / development ports to communicate.
// Exposes the critical 'x-user-id' header which is used to pass stateless user context.
await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-user-id", "Authorization"]
})

// Register Routes Plugins
// Binds endpoint controllers to their respective URL base prefixes.
await fastify.register(authRoutes, { prefix: "/api/auth" })
await fastify.register(orgRoutes, { prefix: "/api/org" })
await fastify.register(sitesManagementRoutes, { prefix: "/api/site" })
await fastify.register(editorRoutes, { prefix: "/api/site" })
await fastify.register(changeRequestsRoutes, { prefix: "/api/vc" }) // Version Control prefixes

// Declare a default base health check route
fastify.get("/", async (request, reply) => {
  return { hello: "world", status: "DocuSphere server running" }
})

/**
 * Server Startup Routine.
 * Starts listening on the configured process port or defaults to 5001.
 */
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 5001
    // Listen on localhost loopback
    await fastify.listen({ port, host: "127.0.0.1" })
    console.log(`Server is listening on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

