import { SitesManagementRepository } from "./sites-management.repository.js"

/**
 * SitesManagementService.
 * 
 * Purpose:
 * Coordinates the business rules for managing sites. Encapsulates logic for
 * authorization (ensuring users own an organization before creating sites) and
 * content generation (seeding new spaces and pages with templates or imports).
 */
export class SitesManagementService {
  private repository = new SitesManagementRepository()

  /**
   * createSite Business logic.
   * 
   * Verifies the user has a registered organization.
   * If yes, generates a random 7-character site ID and creates the record.
   */
  async createSite(name: string, userId: string) {
    const organization = await this.repository.findUserOrganization(userId)
    if (!organization) {
      throw new Error("User does not have an organization")
    }

    const siteId = Math.random().toString(36).substring(2, 9)
    return this.repository.createSite(siteId, name, organization.id)
  }

  /**
   * getSites Business logic.
   * 
   * Fetches the user's organization and returns all nested sites.
   */
  async getSites(userId: string) {
    const organization = await this.repository.findUserOrganization(userId)
    if (!organization) {
      return []
    }
    return this.repository.findSitesByOrganizationId(organization.id)
  }

  /**
   * setupSite Business logic.
   * 
   * Seeds a newly created site with a default Space and a starter welcome Page.
   * Handles both blank setups (using placeholder markdown) and custom uploads
   * (parsing raw HTML/Markdown content passed from the client drag-and-drop modal).
   */
  async setupSite(siteId: string, type: string, title?: string, content?: string) {
    try {
      const site = await this.repository.findSiteById(siteId)
      if (!site) {
        throw new Error("Site not found")
      }

      // 1. Create a default workspace Space for the site
      const spaceId = `space_${Math.random().toString(36).substring(2, 7)}`
      await this.repository.createSpace(spaceId, "Space", site.id)

      // 2. Determine initial welcome content (template placeholders vs parsed file imports)
      if (type === "template") {
        const templatePages = [
          {
            title: "Introduction to Prisma",
            content: `# Introduction to Prisma\n\nBuild, deploy, and iterate on TypeScript applications with Prisma ORM, Prisma Postgres, and Prisma Compute.\n\n> **Prisma ORM** is an open-source database toolkit that provides fast, type-safe database access for PostgreSQL, MySQL, SQLite, and SQL Server. It replaces traditional ORMs and SQL query builders.\n\n## Why Prisma?\n\nPrisma helps you write database queries in a way that feels natural to your programming language, providing full TypeScript auto-completion directly in your IDE.\n\n* **Type safety**: Queries return objects whose shapes are validated at compile time.\n* **Auto-completion**: Code autocompletion in VSCode makes discovering queries intuitive.\n* **Declarative Schema**: Model your tables once using a clean, readable database schema file.\n\n### Prisma Suite Components\n* **Prisma ORM**: The core query builder and database client toolkit.\n* **Prisma Postgres**: Serverless PostgreSQL database built for high scalability.\n* **Prisma Studio**: Graphical database editor to view and edit your table data.`
          },
          {
            title: "Quickstart Guide",
            content: `# Quickstart Guide\n\nThis guide helps you initialize a new TypeScript project, connect it to database storage, and perform database CRUD queries using Prisma ORM.\n\n## 1. Project Initialization\n\nNavigate to your workspace directory. Run the initialization script to setup a package configuration and install TypeScript dependencies:\n\n\`\`\`bash\nnpm init -y\nnpm install typescript ts-node @types/node --save-dev\nnpx tsc --init\n\`\`\`\n\nNext, install the Prisma command-line tools as a development dependency:\n\n\`\`\`bash\nnpm install prisma --save-dev\n\`\`\`\n\n## 2. Initialize Prisma Config\n\nConfigure Prisma in your project directory by running the init command. This creates a schema configuration file and sets up environment variables:\n\n\`\`\`bash\nnpx prisma init\n\`\`\`\n\nThis command outputs two main configuration items:\n* \`prisma/schema.prisma\`: Your data modeling database configuration.\n* \`.env\`: Connection environment strings for database credentials.\n\n## 3. Database Modeling\n\nOpen the schema file and add the following User and Post schema configurations:\n\n\`\`\`prisma\nmodel User {\n  id    Int     @id @default(autoincrement())\n  email String  @unique\n  name  String?\n  posts Post[]\n}\n\nmodel Post {\n  id        Int     @id @default(autoincrement())\n  title     String\n  content   String?\n  published Boolean @default(false)\n  authorId  Int\n  author    User    @relation(fields: [authorId], references: [id])\n}\n\`\`\``
          },
          {
            title: "Database Connection",
            content: `# Database Connection\n\nLearn how to connect Prisma to your local or hosted PostgreSQL instance.\n\n## Connection Setup\n\nPrisma queries databases using connection strings. The standard URL format is:\n\n\`\`\`env\nDATABASE_URL="postgresql://postgres:root@localhost:5432/mydb?schema=public"\n\`\`\`\n\n## Environment Variables\n\nPrisma automatically loads server settings from your \`.env\` file in the root workspace. Update your connection variables to connect with your server:\n\n\`\`\`env\nDATABASE_URL="postgresql://username:password@localhost:5432/databasename"\n\`\`\`\n\n## Schema Verification\n\nOnce your configuration strings are set, verify that the tables synchronise with your prisma layout by pushing schema updates:\n\n\`\`\`bash\nnpx prisma db push\n\`\`\`\n\n> [!NOTE]\n> Database push is suitable for development and prototyping. For production database deployments, use **Prisma Migrate** migration folders instead.`
          }
        ]

        for (const p of templatePages) {
          const pageId = `page_${Math.random().toString(36).substring(2, 9)}`
          await this.repository.createPage(pageId, p.title, p.content, spaceId)
        }
      } else {
        const pageId = `page_${Math.random().toString(36).substring(2, 7)}`
        const defaultTitle = type === "import" && title ? title : "Welcome"
        const defaultContent = type === "import" && content ? content : "# Welcome to your new space\nStart editing here..."
        await this.repository.createPage(pageId, defaultTitle, defaultContent, spaceId)
      }

      // 4. Update the site onboarding flag so the UI renders the workspace editor instead of options cards
      return await this.repository.updateSiteSetup(site.id, true)
    } catch (err: any) {
      console.error("Error in setupSite service method:", err)
      throw err
    }
  }

  /**
   * deleteSite Business logic.
   * 
   * Deletes a site after validating it exists.
   */
  async deleteSite(siteId: string) {
    const site = await this.repository.findSiteById(siteId)
    if (!site) {
      throw new Error("Site not found")
    }
    await this.repository.deleteSite(siteId)
    return { message: "Site deleted successfully" }
  }

  /**
   * publishSite Business logic.
   * 
   * Marks a site as published.
   */
  async publishSite(siteId: string) {
    const site = await this.repository.findSiteById(siteId)
    if (!site) {
      throw new Error("Site not found")
    }
    return this.repository.updateSitePublishStatus(siteId, true)
  }
}

