import { FastifyRequest, FastifyReply } from "fastify"

/**
 * Global Error Handler Middleware.
 * 
 * Purpose:
 * Intercepts all unhandled errors thrown inside the controller/service pipeline
 * and normalizes them into structured JSON error payloads before responding to the frontend.
 * 
 * When it executes:
 * Runs automatically as the final stage of the request lifecycle when any route
 * handler throws an exception or calls reply.send(error).
 * 
 * Mappings:
 * - Prisma P2002 -> HTTP 409 Conflict (e.g., trying to register an email already in use).
 * - Prisma P2025 -> HTTP 404 Not Found (e.g., fetching a non-existent change request).
 * - General -> Matches statusCode parameter, or defaults to 500 for safety.
 */
export function errorHandler(error: any, request: FastifyRequest, reply: FastifyReply) {
  // Log the complete error trace to stdout using Fastify's logger
  request.log.error(error)

  // Handle Prisma Unique Constraint Violation (P2002)
  if (error.code === "P2002") {
    return reply.status(409).send({
      statusCode: 409,
      error: "Conflict",
      message: `A record with this ${error.meta?.target || "field"} already exists.`
    })
  }

  // Handle other Prisma specific errors (e.g., records not found - P2025)
  if (error.code === "P2025") {
    return reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: error.meta?.cause || "Record not found."
    })
  }

  // Handle validation or bad request errors (like JSON parsing issues)
  const statusCode = error.statusCode || 500
  const isServerErr = statusCode === 500

  return reply.status(statusCode).send({
    statusCode,
    error: error.name || (isServerErr ? "InternalServerError" : "BadRequest"),
    message: isServerErr ? "An internal server error occurred." : error.message
  })
}

