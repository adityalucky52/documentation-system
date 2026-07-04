import { TemplatesRepository } from "./templates.repository.js"

/**
 * TemplatesService.
 * 
 * Purpose:
 * Coordinates the business rules for managing templates. Handles self-seeding on demand.
 */
export class TemplatesService {
  private repository = new TemplatesRepository()

  /**
   * Retrieves all templates. If no templates exist in the database, seeds
   * the default "Prisma Docs" template.
   */
  async getTemplates() {
    let templates = await this.repository.findAllTemplates()

    if (templates.length === 0) {
      // Seed default Prisma Docs template
      await this.repository.createTemplateWithPages(
        "Prisma Docs",
        "A premium documentation layout with Introduction, Quickstart, and Connection guides for Prisma.",
        [
          {
            title: "Introduction to Prisma",
            content: `# Introduction to Prisma\n\nBuild, deploy, and iterate on TypeScript applications with Prisma ORM, Prisma Postgres, and Prisma Compute.\n\n> **Prisma ORM** is an open-source database toolkit that provides fast, type-safe database access for PostgreSQL, MySQL, SQLite, and SQL Server. It replaces traditional ORMs and SQL query builders.\n\n## Why Prisma?\n\nPrisma helps you write database queries in a way that feels natural to your programming language, providing full TypeScript auto-completion directly in your IDE.\n\n* **Type safety**: Queries return objects whose shapes are validated at compile time.\n* **Auto-completion**: Code autocompletion in VSCode makes discovering queries intuitive.\n* **Declarative Schema**: Model your tables once using a clean, readable database schema file.\n\n### Prisma Suite Components\n* **Prisma ORM**: The core query builder and database client toolkit.\n* **Prisma Postgres**: Serverless PostgreSQL database built for high scalability.\n* **Prisma Studio**: Graphical database editor to view and edit your table data.`,
            order: 0
          },
          {
            title: "Quickstart Guide",
            content: `# Quickstart Guide\n\nThis guide helps you initialize a new TypeScript project, connect it to database storage, and perform database CRUD queries using Prisma ORM.\n\n## 1. Project Initialization\n\nNavigate to your workspace directory. Run the initialization script to setup a package configuration and install TypeScript dependencies:\n\n\`\`\`bash\nnpm init -y\nnpm install typescript ts-node @types/node --save-dev\nnpx tsc --init\n\`\`\`\n\nNext, install the Prisma command-line tools as a development dependency:\n\n\`\`\`bash\nnpm install prisma --save-dev\n\`\`\`\n\n## 2. Initialize Prisma Config\n\nConfigure Prisma in your project directory by running the init command. This creates a schema configuration file and sets up environment variables:\n\n\`\`\`bash\nnpx prisma init\n\`\`\`\n\nThis command outputs two main configuration items:\n* \`prisma/schema.prisma\`: Your data modeling database configuration.\n* \`.env\`: Connection environment strings for database credentials.\n\n## 3. Database Modeling\n\nOpen the schema file and add the following User and Post schema configurations:\n\n\`\`\`prisma\nmodel User {\n  id    Int     @id @default(autoincrement())\n  email String  @unique\n  name  String?\n  posts Post[]\n}\n\nmodel Post {\n  id        Int     @id @default(autoincrement())\n  title     String\n  content   String?\n  published Boolean @default(false)\n  authorId  Int\n  author    User    @relation(fields: [authorId], references: [id])\n}\n\`\`\``,
            order: 1
          },
          {
            title: "Database Connection",
            content: `# Database Connection\n\nLearn how to connect Prisma to your local or hosted PostgreSQL instance.\n\n## Connection Setup\n\nPrisma queries databases using connection strings. The standard URL format is:\n\n\`\`\`env\nDATABASE_URL="postgresql://postgres:root@localhost:5432/mydb?schema=public"\n\`\`\`\n\n## Environment Variables\n\nPrisma automatically loads server settings from your \`.env\` file in the root workspace. Update your connection variables to connect with your server:\n\n\`\`\`env\nDATABASE_URL="postgresql://username:password@localhost:5432/databasename"\n\`\`\`\n\n## Schema Verification\n\nOnce your configuration strings are set, verify that the tables synchronise with your prisma layout by pushing schema updates:\n\n\`\`\`bash\nnpx prisma db push\n\`\`\`\n\n> [!NOTE]\n> Database push is suitable for development and prototyping. For production database deployments, use **Prisma Migrate** migration folders instead.`,
            order: 2
          }
        ]
      )
      
      // Fetch seeded records
      templates = await this.repository.findAllTemplates()
    }

    return templates
  }

  /**
   * Retrieves a template by its ID.
   */
  async getTemplateById(templateId: string) {
    return this.repository.findTemplateById(templateId)
  }
}
