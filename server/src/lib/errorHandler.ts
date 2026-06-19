import { FastifyRequest, FastifyReply } from "fastify"

export function errorHandler(error: any, request: FastifyRequest, reply: FastifyReply) {
  // Log the complete error
  request.log.error(error)

  // Handle Prisma Unique Constraint Violation (P2002)
  if (error.code === "P2002") {
    return reply.status(409).send({
      statusCode: 409,
      error: "Conflict",
      message: `A record with this ${error.meta?.target || "field"} already exists.`
    })
  }

  // Handle other Prisma specific errors (e.g., records not found)
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
