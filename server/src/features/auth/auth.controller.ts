import { FastifyRequest, FastifyReply } from "fastify"
import { prisma } from "../../lib/prisma.js"
import { hashPassword, verifyPassword } from "./auth.utils.js"
import { RegisterUserDto, LoginUserDto, AuthResponseDto } from "./auth.dto.js"

/**
 * registerHandler Controller.
 * 
 * Purpose:
 * Creates a new user profile in the database.
 * 
 * Triggered by:
 * - Frontend: RegisterForm widget (on clicking "Create account" button during sign-up flow).
 * 
 * Database Operations:
 * 1. Read check: Queries the `User` table to see if `email` is already registered.
 * 2. Create insert: Writes a new row to the `User` table saving `email`, hashed `password` (via auth.utils), and optional `name`.
 */
export async function registerHandler(
  request: FastifyRequest<{ Body: RegisterUserDto }>, 
  reply: FastifyReply
) {
  const { email, password, name } = request.body

  // Check if user already exists in the SQL Database
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return reply.status(400).send({ error: "User with this email already exists" })
  }

  // Create and hash user credentials
  const hashedPassword = hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  })

  // Format AuthResponse DTO back to client
  const response: AuthResponseDto = {
    message: "User registered successfully",
    user: { id: user.id, email: user.email, name: user.name }
  }

  return reply.status(201).send(response)
}

/**
 * loginHandler Controller.
 * 
 * Purpose:
 * Authenticates user credentials and checks if they already own an organization (onboarding check).
 * 
 * Triggered by:
 * - Frontend: LoginForm widget (on clicking the login submit button).
 * 
 * Database Operations:
 * 1. Read user: Queries `User` table by unique `email`.
 * 2. Read organization: Queries `Organization` table by `userId` to see if they completed onboarding setup.
 */
export async function loginHandler(
  request: FastifyRequest<{ Body: LoginUserDto }>, 
  reply: FastifyReply
) {
  const { email, password } = request.body

  // Lookup user row
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return reply.status(401).send({ error: "Invalid email or password" })
  }

  // Verify bcrypt hash comparison
  const isPasswordValid = verifyPassword(password, user.password)
  if (!isPasswordValid) {
    return reply.status(401).send({ error: "Invalid email or password" })
  }

  // Retrieve associated organization owned by the user (determines if they redirect to Org Onboarding vs Workspace Dashboard)
  const organization = await prisma.organization.findUnique({
    where: { userId: user.id }
  })

  const response = {
    message: "Logged in successfully",
    user: { id: user.id, email: user.email, name: user.name },
    organization: organization || null
  }

  return reply.send(response)
}

