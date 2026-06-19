import { FastifyInstance } from "fastify"
import { registerHandler, loginHandler } from "./auth.controller.js"

const registerSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string" },
      password: { type: "string", minLength: 6 },
      name: { type: "string" }
    }
  }
}

const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string" },
      password: { type: "string" }
    }
  }
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", { schema: registerSchema }, registerHandler)
  fastify.post("/login", { schema: loginSchema }, loginHandler)
}

