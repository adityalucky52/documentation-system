import { FastifyInstance } from "fastify"
import { registerHandler, loginHandler } from "./auth.controller.js"

/**
 * Register JSON Schema.
 * Used by Fastify to compile ajv validation rules on request payloads.
 * Requires: email and password (minimum 6 chars). Optional: name.
 */
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

/**
 * Login JSON Schema.
 * Requires: email and password.
 */
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

/**
 * Authentication Routes Plugin.
 * 
 * Purpose:
 * Exposes API routes for user onboarding and session authentication.
 * 
 * Prefix: `/api/auth`
 * 
 * Endpoints:
 * 1. POST `/register` -> Registers a new author profile.
 * 2. POST `/login` -> Verifies credentials and returns user details.
 * 
 * Request Lifecycle:
 * Frontend UI (RegisterForm/LoginForm submit) 
 *   --> POST /api/auth/register (or /login) 
 *   --> Fastify Schema Validator (Ajv check parameters) 
 *   --> auth.controller.ts (registerHandler/loginHandler)
 *   --> Database Lookup/Create (prisma.user)
 *   --> Response payload (HTTP 200/201 or 409/401)
 *   --> Frontend State (AuthStore cache details)
 */
export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", { schema: registerSchema }, registerHandler)
  fastify.post("/login", { schema: loginSchema }, loginHandler)
}


