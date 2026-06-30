import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/index.js";

/**
 * Shared Database client adapter setup.
 * Uses PostgreSQL adapter with the connectionString parsed from environment configuration.
 */
const connectionString = `${process.env.DATABASE_URL}`;

/**
 * Prisma client instance provider.
 * 
 * Purpose:
 * Exports a single, shared instance of the PrismaClient.
 * This singleton pattern prevents database socket leaks by reusing the same pool.
 */
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

