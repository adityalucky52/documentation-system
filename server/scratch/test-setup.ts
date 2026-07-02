import { SitesManagementService } from "../src/features/sites-management/sites-management.service.js";
import { prisma } from "../src/lib/prisma.js";

async function run() {
  try {
    console.log("Starting test setup...");
    const service = new SitesManagementService();
    // find a user organization
    const org = await prisma.organization.findFirst();
    if (!org) {
      console.log("No organization found!");
      return;
    }
    
    // Create a mock site
    const siteId = "test_" + Math.random().toString(36).substring(2, 7);
    const site = await prisma.site.create({
      data: {
        id: siteId,
        name: "Test Site",
        organizationId: org.id,
        isSetup: false
      }
    });
    console.log("Created site:", site.id);
    
    // Setup using template
    const res = await service.setupSite(site.id, "template");
    console.log("Setup complete:", res);
  } catch (err) {
    console.error("SETUP ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
