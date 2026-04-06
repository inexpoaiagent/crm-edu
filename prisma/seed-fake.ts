import "dotenv/config";
import prisma from "../lib/prisma";
import { hashPassword } from "../lib/server/password";

const tenantSlug = "vertue";
const defaultPassword = "Test12345!";

const firstNames = [
  "Ahmet",
  "Mehmet",
  "Ayse",
  "Fatma",
  "Elif",
  "Omar",
  "Sara",
  "Ali",
  "Mina",
  "Deniz",
  "Zehra",
  "Yusuf",
];

const lastNames = [
  "Yilmaz",
  "Kaya",
  "Demir",
  "Celik",
  "Arslan",
  "Kurt",
  "Aslan",
  "Aydin",
  "Rahimi",
  "Hosseini",
  "Bayrak",
  "Kilic",
];

const fields = ["Computer Science", "Business", "Engineering", "Medicine", "Architecture", "Law"];
const englishLevels = ["A2", "B1", "B2", "C1"];
const countries = ["Turkey", "Northern Cyprus"];
const nationalities = ["Turkish", "Iranian", "Nigerian", "Pakistani", "Egyptian", "Iraqi", "Syrian"];
const appStatuses = ["DRAFT", "SUBMITTED", "OFFERED", "ENROLLED", "REJECTED"] as const;
const studentStages = ["LEAD", "APPLIED", "OFFERED", "ENROLLED"] as const;
const documentTypes = ["PASSPORT", "DIPLOMA", "TRANSCRIPT", "ENGLISH_CERTIFICATE", "PHOTO"] as const;
const paymentTypes = ["Tuition", "Service Fee", "Commission"];

function pick<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function fullName() {
  return `${pick(firstNames)} ${pick(lastNames)}`;
}

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function ensureRole(tenantId: string, name: string) {
  const role = await prisma.role.findFirst({ where: { tenantId, name } });
  if (!role) throw new Error(`Role not found: ${name}`);
  return role;
}

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    throw new Error(`Tenant '${tenantSlug}' not found. Run npm run prisma:seed first.`);
  }

  const [adminRole, agentRole, subAgentRole] = await Promise.all([
    ensureRole(tenant.id, "Admin"),
    ensureRole(tenant.id, "Agent"),
    ensureRole(tenant.id, "SubAgent"),
  ]);

  const passwordHash = await hashPassword(defaultPassword);

  const adminsToCreate = 2;
  const agentsToCreate = 6;
  const subAgentsToCreate = 10;
  const universitiesToCreate = 30;
  const studentsToCreate = 120;
  const tasksToCreate = 90;
  const requestsToCreate = 20;

  const existingAdmins = await prisma.user.count({ where: { tenantId: tenant.id, roleId: adminRole.id, isDeleted: false } });
  const existingAgents = await prisma.user.count({ where: { tenantId: tenant.id, roleId: agentRole.id, isDeleted: false } });
  const existingSubAgents = await prisma.user.count({ where: { tenantId: tenant.id, roleId: subAgentRole.id, isDeleted: false } });

  for (let i = existingAdmins; i < adminsToCreate; i += 1) {
    const name = fullName();
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        roleId: adminRole.id,
        name,
        email: `admin${i + 1}@${tenant.slug}.local`,
        passwordHash,
        status: "ACTIVE",
      },
    });
  }

  for (let i = existingAgents; i < agentsToCreate; i += 1) {
    const name = fullName();
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        roleId: agentRole.id,
        name,
        email: `agent${i + 1}@${tenant.slug}.local`,
        passwordHash,
        status: "ACTIVE",
      },
    });
  }

  for (let i = existingSubAgents; i < subAgentsToCreate; i += 1) {
    const name = fullName();
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        roleId: subAgentRole.id,
        name,
        email: `subagent${i + 1}@${tenant.slug}.local`,
        passwordHash,
        status: "ACTIVE",
      },
    });
  }

  const agents = await prisma.user.findMany({
    where: { tenantId: tenant.id, roleId: agentRole.id, isDeleted: false, status: "ACTIVE" },
    select: { id: true },
  });
  const subAgents = await prisma.user.findMany({
    where: { tenantId: tenant.id, roleId: subAgentRole.id, isDeleted: false, status: "ACTIVE" },
    select: { id: true },
  });
  const admins = await prisma.user.findMany({
    where: { tenantId: tenant.id, roleId: adminRole.id, isDeleted: false, status: "ACTIVE" },
    select: { id: true },
  });

  const universityCount = await prisma.university.count({ where: { tenantId: tenant.id } });
  for (let i = universityCount; i < universitiesToCreate; i += 1) {
    const uniName = `${pick(["Anatolia", "Mediterranean", "Near East", "Bosphorus", "Cyprus", "Istanbul", "Izmir", "Aegean"])} University ${i + 1}`;
    await prisma.university.create({
      data: {
        tenantId: tenant.id,
        name: uniName,
        country: pick(countries),
        website: `https://${slugify(uniName)}.edu`,
        tuitionRange: `${3000 + i * 100}-${6000 + i * 120} USD`,
        language: pick(["English", "Turkish", "English/Turkish"]),
        programs: [pick(fields), pick(fields)],
        deadline: new Date(Date.now() + (30 + i) * 24 * 60 * 60 * 1000),
        description: "Auto-generated fake data",
      },
    });
  }

  const universities = await prisma.university.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, name: true },
  });

  const studentCount = await prisma.student.count({ where: { tenantId: tenant.id, isDeleted: false } });
  for (let i = studentCount; i < studentsToCreate; i += 1) {
    const name = fullName();
    const agentId = pick(agents).id;
    const subAgentId = pick(subAgents).id;
    const student = await prisma.student.create({
      data: {
        tenantId: tenant.id,
        fullName: name,
        email: `student${i + 1}@${tenant.slug}.local`,
        phone: `+90 555 ${String(1000000 + i).slice(-7)}`,
        nationality: pick(nationalities),
        gpa: Number((2 + Math.random() * 2).toFixed(2)),
        budget: Number((2500 + Math.random() * 8000).toFixed(0)),
        fieldOfStudy: pick(fields),
        englishLevel: pick(englishLevels),
        stage: pick(studentStages),
        assignedAgentId: agentId,
        assignedSubAgentId: subAgentId,
        username: `student${i + 1}`,
        passwordHash,
      },
    });

    const uni = pick(universities);
    const app = await prisma.application.create({
      data: {
        tenantId: tenant.id,
        studentId: student.id,
        universityId: uni.id,
        program: pick(fields),
        intake: pick(["Fall 2026", "Spring 2027", "Summer 2026"]),
        status: pick(appStatuses),
        deadline: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
        notes: "Generated by fake seed",
        createdById: pick(admins).id,
        assignedSubAgentId: subAgentId,
      },
    });

    for (const type of documentTypes) {
      await prisma.document.create({
        data: {
          tenantId: tenant.id,
          studentId: student.id,
          applicationId: app.id,
          type,
          fileName: `${type.toLowerCase()}-${student.id}.pdf`,
          fileUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/uploads/documents/${type.toLowerCase()}-${student.id}.pdf`,
          status: pick(["MISSING", "UPLOADED", "VERIFIED"] as const),
          uploadedById: pick([agentId, subAgentId]),
        },
      });
    }

    await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        studentId: student.id,
        type: pick(paymentTypes),
        amount: Number((1000 + Math.random() * 25000).toFixed(2)),
        currency: "TRY",
        description: "Generated by fake seed",
        commission: Number((100 + Math.random() * 3000).toFixed(2)),
      },
    });
  }

  const students = await prisma.student.findMany({
    where: { tenantId: tenant.id, isDeleted: false },
    select: { id: true, fullName: true, assignedAgentId: true },
  });

  const taskCount = await prisma.task.count({ where: { tenantId: tenant.id } });
  for (let i = taskCount; i < tasksToCreate; i += 1) {
    const student = pick(students);
    await prisma.task.create({
      data: {
        tenantId: tenant.id,
        title: `Follow up: ${student.fullName}`,
        description: "Generated reminder task",
        assignedToId: student.assignedAgentId ?? pick(agents).id,
        relatedStudentId: student.id,
        deadline: new Date(Date.now() + Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
        priority: pick(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const),
        status: pick(["TODO", "IN_PROGRESS", "DONE", "OVERDUE"] as const),
      },
    });
  }

  const scholarshipCount = await prisma.scholarship.count({ where: { tenantId: tenant.id } });
  for (let i = scholarshipCount; i < 25; i += 1) {
    const university = pick(universities);
    await prisma.scholarship.create({
      data: {
        tenantId: tenant.id,
        title: `${university.name} Merit ${10 + i}%`,
        universityId: university.id,
        discountPercentage: Math.min(70, 10 + i),
        description: "Generated scholarship",
      },
    });
  }

  const scholarships = await prisma.scholarship.findMany({
    where: { tenantId: tenant.id },
    select: { id: true },
  });

  for (let i = 0; i < Math.min(students.length, 60); i += 1) {
    const student = students[i];
    const scholarship = pick(scholarships);
    await prisma.studentScholarship.upsert({
      where: {
        tenantId_studentId_scholarshipId: {
          tenantId: tenant.id,
          studentId: student.id,
          scholarshipId: scholarship.id,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        studentId: student.id,
        scholarshipId: scholarship.id,
      },
    });
  }

  const requestsCount = await prisma.studentRequest.count({ where: { tenantId: tenant.id } });
  for (let i = requestsCount; i < requestsToCreate; i += 1) {
    const name = fullName();
    await prisma.studentRequest.create({
      data: {
        tenantId: tenant.id,
        fullName: name,
        email: `request${i + 1}@${tenant.slug}.local`,
        phone: `+90 544 ${String(1000000 + i).slice(-7)}`,
        intake: pick(["Fall 2026", "Spring 2027"]),
        notes: "Generated lead request",
        status: pick(["PENDING", "APPROVED", "REJECTED"]),
      },
    });
  }

  const allUsers = await prisma.user.findMany({
    where: { tenantId: tenant.id, isDeleted: false, status: "ACTIVE" },
    select: { id: true },
  });

  for (let i = 0; i < 120; i += 1) {
    const user = pick(allUsers);
    await prisma.notification.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        title: pick(["New student", "Application updated", "Task reminder", "Document uploaded"]),
        message: "Generated notification",
        type: pick(["new_student", "application_update", "task_reminder", "document"]),
        read: Math.random() > 0.6,
      },
    });
  }

  for (let i = 0; i < 150; i += 1) {
    const user = pick(allUsers);
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        description: pick(["Created student", "Updated application", "Verified document", "Assigned task"]),
        category: pick(["STUDENT", "APPLICATION", "DOCUMENT", "TASK"]),
        resourceId: `${i + 1}`,
        resourceType: pick(["Student", "Application", "Document", "Task"]),
      },
    });
  }

  console.log("Fake data inserted successfully.");
  console.log("Shared fake login password for generated users:", defaultPassword);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
