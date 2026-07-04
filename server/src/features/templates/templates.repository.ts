import { prisma } from "../../lib/prisma.js"

/**
 * TemplatesRepository.
 * 
 * Purpose:
 * Handles CRUD operations in the database for the `Template` and `TemplatePage` tables.
 */
export class TemplatesRepository {
  /**
   * Fetches all templates from the database along with their associated template pages.
   */
  async findAllTemplates() {
    return prisma.template.findMany({
      include: {
        pages: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })
  }

  /**
   * Fetches a specific template by ID, including its pages.
   */
  async findTemplateById(templateId: string) {
    return prisma.template.findUnique({
      where: { id: templateId },
      include: {
        pages: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })
  }

  /**
   * Seed templates into the database.
   * If a template with the same name already exists, skips it to prevent duplicates.
   */
  async createTemplateWithPages(name: string, description: string, pages: Array<{ title: string; content: string; order: number }>) {
    const existing = await prisma.template.findFirst({
      where: { name }
    })
    
    if (existing) {
      return existing
    }

    return prisma.template.create({
      data: {
        name,
        description,
        pages: {
          create: pages
        }
      },
      include: {
        pages: true
      }
    })
  }
}
