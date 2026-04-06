import prisma from "../lib/prisma";
import { hashPassword } from "../lib/server/password";

const SUPER_ADMIN_EMAIL = "admincrm@vertue.com";
const SUPER_ADMIN_PASSWORD = "Vertue2026";

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "vertue" },
    update: { name: "Vertue CRM" },
    create: {
      name: "Vertue CRM Tenant",
      slug: "vertue",
      domain: "crm.vertue.com",
      locale: "en",
      settings: { theme: "dark" },
    },
  });

  const roles = [
    { name: "SuperAdmin", permissions: ["*"], isDefault: false },
    {
      name: "Admin",
      permissions: [
        "students:*",
        "applications:*",
        "universities:*",
        "documents:*",
        "tasks:*",
        "payments:*",
        "scholarships:*",
        "users:*",
        "roles:*",
      ],
      isDefault: true,
    },
    {
      name: "Agent",
      permissions: ["students:create", "students:view", "students:update", "applications:create", "applications:view", "applications:update", "tasks:view", "tasks:create"],
      isDefault: false,
    },
    { name: "SubAgent", permissions: ["students:view", "applications:view", "documents:upload", "tasks:view"], isDefault: false },
    { name: "Student", permissions: ["portal:read"], isDefault: false },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: role.name } },
      update: { permissions: role.permissions, isDefault: role.isDefault },
      create: {
        tenantId: tenant.id,
        name: role.name,
        permissions: role.permissions,
        isDefault: role.isDefault,
      },
    });
  }

  const superRole = await prisma.role.findFirst({ where: { tenantId: tenant.id, name: "SuperAdmin" } });
  if (!superRole) {
    throw new Error("Failed to create SuperAdmin role");
  }

  const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: SUPER_ADMIN_EMAIL } },
    update: {
      tenantId: tenant.id,
      roleId: superRole.id,
      name: "Vertue Super Admin",
      passwordHash,
      status: "ACTIVE",
    },
    create: {
      tenantId: tenant.id,
      roleId: superRole.id,
      name: "Vertue Super Admin",
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      status: "ACTIVE",
    },
  });

  console.log("Seeded default tenant and SuperAdmin user", { tenant: tenant.slug, superAdmin: SUPER_ADMIN_EMAIL });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
