import { type Page } from "../sites-management/sitesStore"

export interface MockSpace {
  id: string
  name: string
  site: {
    name: string
  }
  pages: Page[]
}

export const mockSpaceData: MockSpace = {
  id: "space_mock_docs",
  name: "Prisma Docs",
  site: {
    name: "Prisma"
  },
  pages: [
    {
      id: "intro",
      title: "Introduction to Prisma",
      content: `# Introduction to Prisma

Build, deploy, and iterate on TypeScript applications with Prisma ORM, Prisma Postgres, and Prisma Compute.

> **Prisma ORM** is an open-source database toolkit that provides fast, type-safe database access for PostgreSQL, MySQL, SQLite, and SQL Server. It replaces traditional ORMs and SQL query builders.

## Why Prisma?

Prisma helps you write database queries in a way that feels natural to your programming language, providing full TypeScript auto-completion directly in your IDE.

* **Type safety**: Queries return objects whose shapes are validated at compile time.
* **Auto-completion**: Code autocompletion in VSCode makes discovering queries intuitive.
* **Declarative Schema**: Model your tables once using a clean, readable database schema file.

### Prisma Suite Components
* **Prisma ORM**: The core query builder and database client toolkit.
* **Prisma Postgres**: Serverless PostgreSQL database built for high scalability.
* **Prisma Studio**: Graphical database editor to view and edit your table data.`,
      spaceId: "space_mock_docs",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "quickstart",
      title: "Quickstart Guide",
      content: `# Quickstart Guide

This guide helps you initialize a new TypeScript project, connect it to database storage, and perform database CRUD queries using Prisma ORM.

## 1. Project Initialization

Navigate to your workspace directory. Run the initialization script to setup a package configuration and install TypeScript dependencies:

\`\`\`bash
npm init -y
npm install typescript ts-node @types/node --save-dev
npx tsc --init
\`\`\`

Next, install the Prisma command-line tools as a development package:

\`\`\`bash
npm install prisma --save-dev
\`\`\`

## 2. Initialize Prisma Config

Configure Prisma in your project directory by running the init command. This creates a schema configuration file and sets up environment variables:

\`\`\`bash
npx prisma init
\`\`\`

This command outputs two main configuration items:
* \`prisma/schema.prisma\`: Your data modeling database configuration.
* \`.env\`: Connection environment strings for database credentials.

## 3. Database Modeling

Open the schema file and add the following User and Post schema configurations:

\`\`\`prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  authorId  Int
  author    User    @relation(fields: [authorId], references: [id])
}
\`\`\``,
      spaceId: "space_mock_docs",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "db-setup",
      title: "Database Connection",
      content: `# Database Connection

Learn how to connect Prisma to your local or hosted PostgreSQL instance.

## Connection Setup

Prisma queries databases using connection strings. The standard URL format is:

\`\`\`env
DATABASE_URL="postgresql://postgres:root@localhost:5432/mydb?schema=public"
\`\`\`

## Environment Variables

Prisma automatically loads server settings from your \`.env\` file in the root workspace. Update your connection variables to connect with your server:

\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/databasename"
\`\`\`

## Schema Verification

Once your configuration strings are set, verify that the tables synchronise with your prisma layout by pushing schema updates:

\`\`\`bash
npx prisma db push
\`\`\`

> [!NOTE]
> Database push is suitable for development and prototyping. For production database deployments, use **Prisma Migrate** migration folders instead.`,
      spaceId: "space_mock_docs",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}
