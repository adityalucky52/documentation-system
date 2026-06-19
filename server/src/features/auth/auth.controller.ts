import { FastifyRequest, FastifyReply } from "fastify"
import { prisma } from "../../lib/prisma.js"
import { hashPassword, verifyPassword } from "./auth.utils.js"
import { RegisterUserDto, LoginUserDto, AuthResponseDto } from "./auth.dto.js"

export async function registerHandler(
  request: FastifyRequest<{ Body: RegisterUserDto }>, 
  reply: FastifyReply
) {
  const { email, password, name } = request.body

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return reply.status(400).send({ error: "User with this email already exists" })
  }

  // Create user
  const hashedPassword = hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  })

  const response: AuthResponseDto = {
    message: "User registered successfully",
    user: { id: user.id, email: user.email, name: user.name }
  }

  return reply.status(201).send(response)
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginUserDto }>, 
  reply: FastifyReply
) {
  const { email, password } = request.body

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return reply.status(401).send({ error: "Invalid email or password" })
  }

  const isPasswordValid = verifyPassword(password, user.password)
  if (!isPasswordValid) {
    return reply.status(401).send({ error: "Invalid email or password" })
  }

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
