import Fastify from "fastify"
import cors from "@fastify/cors"
import { authRoutes } from "./features/auth/auth.routes.js"
import { orgRoutes } from "./features/org/org.routes.js"
import { errorHandler } from "./lib/errorHandler.js"

const fastify = Fastify({
  logger: true
})

// Register Global Error Handler
fastify.setErrorHandler(errorHandler)

// Enable CORS
await fastify.register(cors, {
  origin: "*" // In production, replace with specific origins
})

// Register Routes
await fastify.register(authRoutes, { prefix: "/api/auth" })
await fastify.register(orgRoutes, { prefix: "/api/org" })

// Declare a default base route
fastify.get("/", async (request, reply) => {
  return { hello: "world", status: "DocuSphere server running" }
})

// Run the server!
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 5001
    await fastify.listen({ port, host: "127.0.0.1" })
    console.log(`Server is listening on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
