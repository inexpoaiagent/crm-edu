import "dotenv/config";
import prisma from "../lib/prisma";
import { hashPassword } from "../lib/server/password";

const SUPER_ADMIN_EMAIL = "admincrm@vertue.com";
const SUPER_ADMIN_PASSWORD = "Vertue2026";

type ProgramFee = {
  level: string;
  programName: string;
  language?: string;
  durationYears?: number;
  currency: "USD" | "EUR" | "TRY" | "GBP";
  baseFee?: number;
  installmentDiscountPct?: number;
  installmentFee?: number;
  fullPaymentDiscountPct?: number;
  fullPaymentFee?: number;
  scholarshipPct?: number;
  scholarshipFee?: number;
  prepaymentFee?: number;
  notes?: string;
};

const universities = [
  {
    name: "Acibadem University",
    country: "Turkey",
    website: "https://www.acibadem.edu.tr",
    tuitionRange: "USD 3,500 - 35,000 per year",
    language: "English/Turkish",
    programs: [
      "Medicine",
      "Pharmacy",
      "Computer Science",
      "Molecular Biology and Genetics",
      "Psychology",
      "Sociology",
      "Physiotherapy",
      "Nursing",
      "Nutrition and Dietetics",
      "Healthcare Management",
      "Anesthesia",
      "Medical Imaging",
      "Medical Laboratory Techniques",
      "Oral and Dental Health",
      "Computer Programming",
      "Culinary Arts",
    ],
    description:
      "Includes undergraduate and associate programs. Typical scholarship bands: 10%, 25%, 35%, and 50%. Pre-payment options available by faculty.",
  },
  {
    name: "Altinbas University",
    country: "Turkey",
    website: "https://www.altinbas.edu.tr",
    tuitionRange: "USD 2,750 - 25,000 per year",
    language: "English/Turkish",
    programs: [
      "Dentistry",
      "Pharmacy",
      "Law",
      "Economics",
      "Psychology",
      "International Relations",
      "Business Administration",
      "Marketing",
      "Computer Engineering",
      "Software Engineering",
      "Architecture",
      "Civil Engineering",
      "Mechanical Engineering",
      "Gastronomy and Culinary Arts",
      "Health Management",
      "MBA",
      "Data Analytics",
      "Clinical Psychology",
    ],
    description:
      "Detailed fee structure supports installment and full-payment discounts. Broad portfolio across bachelor, associate, master, and PhD programs.",
  },
  {
    name: "Antalya Bilim University",
    country: "Turkey",
    website: "https://antalya.edu.tr",
    tuitionRange: "USD 4,000 - 15,000 (graduate), USD 5,200 - 14,000 (undergraduate)",
    language: "English/Turkish",
    programs: [
      "Dentistry",
      "Computer Engineering",
      "Electrical and Electronics Engineering",
      "Industrial Engineering",
      "Civil Engineering",
      "Architecture",
      "Psychology",
      "Law",
      "Nursing",
      "Physiotherapy and Rehabilitation",
      "Anesthesia",
      "Medical Laboratory Techniques",
      "Medical Imaging Techniques",
      "MBA",
      "Cyber Security",
      "Data Science",
      "Public Law",
    ],
    description:
      "International tuition table includes seasonal scholarship windows with varying discounted amounts.",
  },
  {
    name: "Istanbul Atlas University",
    country: "Turkey",
    website: "https://www.atlas.edu.tr",
    tuitionRange: "USD 2,900 - 25,000 per year",
    language: "English/Turkish",
    programs: [
      "Medicine",
      "Dentistry",
      "Computer Engineering",
      "Software Engineering",
      "Biomedical Engineering",
      "Data Science and Analytics",
      "Psychology",
      "Business Administration",
      "International Trade and Finance",
      "Nursing",
      "Physiotherapy and Rehabilitation",
      "Nutrition and Dietetics",
      "Anesthesia",
      "Oral and Dental Health",
      "Medical Imaging Techniques",
      "Computer Programming",
    ],
    description:
      "Updated 2025-2026 fee sheet with installment/full-payment rules, deposit tiers, and preparatory language requirements.",
  },
  {
    name: "Near East University",
    country: "Northern Cyprus",
    website: "https://neu.edu.tr",
    tuitionRange: "EUR 2,705 - 10,923 per year (program dependent)",
    language: "English/Turkish",
    programs: [
      "Architecture",
      "Artificial Intelligence Engineering",
      "Biomedical Engineering",
      "Civil Engineering",
      "Computer Engineering",
      "Software Engineering",
      "Business Administration",
      "Economics",
      "International Relations",
      "Private Law",
      "Public Law",
      "Clinical Psychology",
      "Nutrition and Dietetics",
      "Physiotherapy and Rehabilitation",
      "Pharmacy",
      "Dentistry",
      "Medicine",
    ],
    description:
      "Large postgraduate catalog with thesis/non-thesis and PhD tracks. Annual tuition and scholarship outcomes vary by department and profile.",
  },
  {
    name: "Eastern Mediterranean University",
    country: "Northern Cyprus",
    website: "https://www.emu.edu.tr",
    tuitionRange: "USD 4,770 - 13,548 per year/program package",
    language: "English/Turkish",
    programs: [
      "Accounting and Financial Management",
      "Actuarial Science",
      "Architecture",
      "Artificial Intelligence Engineering",
      "Business Administration",
      "Computer Engineering",
      "Software Engineering",
      "Civil Engineering",
      "Electrical and Electronic Engineering",
      "Information Technology",
      "Law",
      "Medicine",
      "Dentistry",
      "Pharmacy",
      "Nursing",
      "Psychology",
      "Tourism Management",
    ],
    description:
      "Comprehensive associate, bachelor, master, and PhD offerings with extensive double-major options.",
  },
];

const feeCatalog: Record<string, ProgramFee[]> = {
  "Acibadem University": [
    { level: "Bachelor", programName: "Medicine", language: "English", durationYears: 6, currency: "USD", baseFee: 35000, scholarshipPct: 10, scholarshipFee: 31500, prepaymentFee: 15750 },
    { level: "Bachelor", programName: "Pharmacy", language: "English", durationYears: 4, currency: "USD", baseFee: 16000, scholarshipPct: 10, scholarshipFee: 14400, prepaymentFee: 7200 },
    { level: "Bachelor", programName: "Computer Science", language: "English", durationYears: 4, currency: "USD", baseFee: 15000, scholarshipPct: 50, scholarshipFee: 7500, prepaymentFee: 3750 },
    { level: "Bachelor", programName: "Psychology", language: "English/Turkish", durationYears: 4, currency: "USD", baseFee: 8000, scholarshipPct: 35, scholarshipFee: 5200, prepaymentFee: 2600 },
    { level: "Associate", programName: "Computer Programming", language: "Turkish", durationYears: 2, currency: "USD", baseFee: 3500, scholarshipPct: 25, scholarshipFee: 2625, prepaymentFee: 2000 },
  ],
  "Altinbas University": [
    { level: "Bachelor", programName: "Dentistry", language: "Turkish/English", durationYears: 5, currency: "USD", baseFee: 22000, installmentDiscountPct: 10, installmentFee: 19800, fullPaymentDiscountPct: 15, fullPaymentFee: 18700 },
    { level: "Bachelor", programName: "Medicine", language: "English", durationYears: 6, currency: "USD", baseFee: 25000, installmentDiscountPct: 10, installmentFee: 22500, fullPaymentDiscountPct: 15, fullPaymentFee: 21250 },
    { level: "Bachelor", programName: "Computer Engineering", language: "English", durationYears: 4, currency: "USD", baseFee: 6000, installmentDiscountPct: 15, installmentFee: 5100, fullPaymentDiscountPct: 20, fullPaymentFee: 4800 },
    { level: "Bachelor", programName: "Law", language: "Turkish", durationYears: 4, currency: "USD", baseFee: 6500, installmentDiscountPct: 15, installmentFee: 5525, fullPaymentDiscountPct: 20, fullPaymentFee: 5200 },
    { level: "Associate", programName: "Anesthesia", language: "Turkish", durationYears: 2, currency: "USD", baseFee: 2750, installmentDiscountPct: 10, installmentFee: 2500, fullPaymentDiscountPct: 15, fullPaymentFee: 2350 },
    { level: "Master", programName: "MBA", language: "English/Turkish", durationYears: 2, currency: "USD", baseFee: 6900, installmentDiscountPct: 15, installmentFee: 5865, fullPaymentDiscountPct: 20, fullPaymentFee: 5520 },
    { level: "PhD", programName: "Business Administration", language: "English/Turkish", durationYears: 4, currency: "USD", baseFee: 19800, installmentDiscountPct: 50, installmentFee: 9900, fullPaymentDiscountPct: 55, fullPaymentFee: 8910 },
  ],
  "Antalya Bilim University": [
    { level: "Bachelor", programName: "Dentistry", language: "Turkish", durationYears: 5, currency: "USD", baseFee: 14000, scholarshipFee: 11900, notes: "Early window scholarship amount" },
    { level: "Bachelor", programName: "Computer Engineering", language: "English", durationYears: 4, currency: "USD", baseFee: 8300, scholarshipFee: 3320 },
    { level: "Bachelor", programName: "Law", language: "English", durationYears: 4, currency: "USD", baseFee: 8300, scholarshipFee: 3735 },
    { level: "Associate", programName: "Anesthesia", language: "Turkish", durationYears: 2, currency: "USD", baseFee: 5200, scholarshipFee: 2340 },
    { level: "Master", programName: "Cyber Security (Thesis)", language: "English", durationYears: 2, currency: "USD", baseFee: 5400, scholarshipFee: 4590 },
    { level: "PhD", programName: "Business Administration", language: "Turkish", durationYears: 4, currency: "USD", baseFee: 9000, scholarshipFee: 7650 },
  ],
  "Istanbul Atlas University": [
    { level: "Bachelor", programName: "Medicine (English)", language: "English", durationYears: 6, currency: "USD", baseFee: 25000, installmentDiscountPct: 10, installmentFee: 22500, fullPaymentDiscountPct: 15, fullPaymentFee: 19130, prepaymentFee: 5000 },
    { level: "Bachelor", programName: "Dentistry (English)", language: "English", durationYears: 5, currency: "USD", baseFee: 23560, installmentDiscountPct: 10, installmentFee: 21204, fullPaymentDiscountPct: 15, fullPaymentFee: 18030, prepaymentFee: 5000 },
    { level: "Bachelor", programName: "Computer Engineering (English)", language: "English", durationYears: 4, currency: "USD", baseFee: 6300, installmentDiscountPct: 10, installmentFee: 5670, fullPaymentDiscountPct: 15, fullPaymentFee: 4820, prepaymentFee: 1000 },
    { level: "Bachelor", programName: "Psychology (English)", language: "English", durationYears: 4, currency: "USD", baseFee: 5510, installmentDiscountPct: 10, installmentFee: 4959, fullPaymentDiscountPct: 15, fullPaymentFee: 4220, prepaymentFee: 1000 },
    { level: "Associate", programName: "Oral and Dental Health", language: "Turkish", durationYears: 2, currency: "USD", baseFee: 2900, installmentDiscountPct: 10, installmentFee: 2610, fullPaymentDiscountPct: 15, fullPaymentFee: 2220, prepaymentFee: 1000 },
    { level: "Master", programName: "Computer Engineering (Thesis)", language: "English", durationYears: 2, currency: "USD", baseFee: 7415, installmentDiscountPct: 10, installmentFee: 6674, fullPaymentDiscountPct: 15, fullPaymentFee: 5680 },
    { level: "PhD", programName: "Computer Engineering", language: "English", durationYears: 4, currency: "USD", baseFee: 16500, installmentDiscountPct: 10, installmentFee: 14850, fullPaymentDiscountPct: 15, fullPaymentFee: 12625 },
  ],
  "Near East University": [
    { level: "Bachelor", programName: "Medicine", language: "English/Turkish", durationYears: 6, currency: "EUR", baseFee: 10923 },
    { level: "Bachelor", programName: "Dentistry", language: "English/Turkish", durationYears: 5, currency: "EUR", baseFee: 10135 },
    { level: "Bachelor", programName: "Pharmacy", language: "English", durationYears: 5, currency: "EUR", baseFee: 4100 },
    { level: "Bachelor", programName: "Engineering Programs", language: "English/Turkish", durationYears: 4, currency: "EUR", baseFee: 2705 },
    { level: "Master", programName: "General Master Programs", language: "English/Turkish", durationYears: 2, currency: "EUR", baseFee: 5016 },
    { level: "PhD", programName: "General PhD Programs", language: "English/Turkish", durationYears: 4, currency: "EUR", baseFee: 12080 },
  ],
  "Eastern Mediterranean University": [
    { level: "Bachelor", programName: "Medicine", language: "English", durationYears: 6, currency: "USD", baseFee: 13548 },
    { level: "Bachelor", programName: "Dentistry", language: "English", durationYears: 5, currency: "USD", baseFee: 9800 },
    { level: "Bachelor", programName: "Pharmacy", language: "English", durationYears: 5, currency: "USD", baseFee: 4860 },
    { level: "Bachelor", programName: "Engineering Programs", language: "English/Turkish", durationYears: 4, currency: "USD", baseFee: 4000 },
    { level: "Master", programName: "Master Programs (Total)", language: "English/Turkish", durationYears: 2, currency: "USD", baseFee: 4770 },
    { level: "PhD", programName: "PhD Programs (Total)", language: "English/Turkish", durationYears: 4, currency: "USD", baseFee: 5700 },
  ],
};

async function resetDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.studentScholarship.deleteMany();
  await prisma.scholarship.deleteMany();
  await prisma.document.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.studentRequest.deleteMany();
  await prisma.student.deleteMany();
  await prisma.universityProgram.deleteMany();
  await prisma.university.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.tenant.deleteMany();
}

async function main() {
  await resetDatabase();

  const tenant = await prisma.tenant.create({
    data: {
      name: "Vertue CRM Tenant",
      slug: "vertue",
      domain: "crm.vertue.com",
      locale: "en",
      settings: {
        theme: "dark",
        mode: "production",
      },
    },
  });

  const roleData = [
    { name: "SuperAdmin", permissions: ["*"], isDefault: false },
    {
      name: "Admin",
      permissions: ["students:*", "applications:*", "universities:*", "documents:*", "tasks:*", "payments:*", "scholarships:*", "users:*", "roles:*"],
      isDefault: true,
    },
    { name: "Agent", permissions: ["students:view", "students:create", "students:update", "applications:view", "applications:create", "applications:update"], isDefault: false },
    { name: "SubAgent", permissions: ["students:view", "applications:view", "documents:upload"], isDefault: false },
    { name: "Student", permissions: ["portal:read"], isDefault: false },
  ];

  for (const role of roleData) {
    await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: role.name,
        permissions: role.permissions,
        isDefault: role.isDefault,
      },
    });
  }

  const superAdminRole = await prisma.role.findFirst({
    where: { tenantId: tenant.id, name: "SuperAdmin" },
  });
  const adminRole = await prisma.role.findFirst({
    where: { tenantId: tenant.id, name: "Admin" },
  });
  const agentRole = await prisma.role.findFirst({
    where: { tenantId: tenant.id, name: "Agent" },
  });
  const subAgentRole = await prisma.role.findFirst({
    where: { tenantId: tenant.id, name: "SubAgent" },
  });
  if (!superAdminRole) {
    throw new Error("SuperAdmin role was not created.");
  }
  if (!adminRole || !agentRole || !subAgentRole) {
    throw new Error("Base roles were not created.");
  }

  const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      roleId: superAdminRole.id,
      name: "Vertue Super Admin",
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      status: "ACTIVE",
      language: "en",
      profile: {
        fontScale: "md",
        preferredCurrency: "USD",
      },
    },
  });

  const operationsAdmin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      roleId: adminRole.id,
      name: "Operations Admin",
      email: "opsadmin@vertue.com",
      passwordHash,
      status: "ACTIVE",
      language: "en",
      profile: { fontScale: "md", preferredCurrency: "USD" },
    },
  });

  const mainAgent = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      roleId: agentRole.id,
      name: "Main Agent",
      email: "agent1@vertue.com",
      passwordHash,
      status: "ACTIVE",
      language: "en",
    },
  });

  const supportSubAgent = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      roleId: subAgentRole.id,
      name: "Support SubAgent",
      email: "subagent1@vertue.com",
      passwordHash,
      status: "ACTIVE",
      language: "en",
    },
  });

  for (const university of universities) {
    await prisma.university.create({
      data: {
        tenantId: tenant.id,
        name: university.name,
        country: university.country,
        website: university.website,
        tuitionRange: university.tuitionRange,
        language: university.language,
        programs: university.programs,
        description: university.description,
      },
    });
  }

  const createdUniversities = await prisma.university.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, name: true },
  });

  for (const uni of createdUniversities) {
    await prisma.scholarship.create({
      data: {
        tenantId: tenant.id,
        universityId: uni.id,
        title: `${uni.name} Early Payment Scholarship`,
        discountPercentage: 15,
        description: "Standard full-payment scholarship baseline from official fee sheet.",
      },
    });

    const catalog = feeCatalog[uni.name] ?? [];
    for (const entry of catalog) {
      await prisma.universityProgram.create({
        data: {
          tenantId: tenant.id,
          universityId: uni.id,
          ...entry,
        },
      });
    }
  }

  const studentRows = [
    { fullName: "Ali Hassan", email: "student1@vertue.com", nationality: "Iraqi", fieldOfStudy: "Computer Science", stage: "LEAD", gpa: 3.1, budget: 9000, username: "ali.hassan" },
    { fullName: "Sara Yilmaz", email: "student2@vertue.com", nationality: "Turkish", fieldOfStudy: "Psychology", stage: "APPLIED", gpa: 3.4, budget: 8000, username: "sara.yilmaz" },
    { fullName: "Mina Rahimi", email: "student3@vertue.com", nationality: "Iranian", fieldOfStudy: "Business Administration", stage: "OFFERED", gpa: 3.3, budget: 7000, username: "mina.rahimi" },
    { fullName: "Omar Adel", email: "student4@vertue.com", nationality: "Egyptian", fieldOfStudy: "Medicine", stage: "ENROLLED", gpa: 3.6, budget: 25000, username: "omar.adel" },
    { fullName: "Zahra Noor", email: "student5@vertue.com", nationality: "Pakistani", fieldOfStudy: "Architecture", stage: "LEAD", gpa: 3.0, budget: 10000, username: "zahra.noor" },
  ] as const;

  const students = [];
  for (const row of studentRows) {
    const student = await prisma.student.create({
      data: {
        tenantId: tenant.id,
        fullName: row.fullName,
        email: row.email,
        phone: "+90 555 000 0000",
        nationality: row.nationality,
        gpa: row.gpa,
        budget: row.budget,
        fieldOfStudy: row.fieldOfStudy,
        englishLevel: "B2",
        stage: row.stage,
        assignedAgentId: mainAgent.id,
        assignedSubAgentId: supportSubAgent.id,
        username: row.username,
        passwordHash,
      },
    });
    students.push(student);
  }

  for (let i = 0; i < 5; i += 1) {
    const student = students[i];
    const uni = createdUniversities[i % createdUniversities.length];
    const application = await prisma.application.create({
      data: {
        tenantId: tenant.id,
        studentId: student.id,
        universityId: uni.id,
        program: student.fieldOfStudy,
        intake: "Fall 2026",
        status: i % 2 === 0 ? "SUBMITTED" : "DRAFT",
        notes: "Seeded production application record.",
        createdById: operationsAdmin.id,
        assignedSubAgentId: supportSubAgent.id,
      },
    });

    await prisma.document.create({
      data: {
        tenantId: tenant.id,
        studentId: student.id,
        applicationId: application.id,
        type: "PASSPORT",
        fileName: `passport-${student.username}.pdf`,
        fileUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/uploads/documents/passport-${student.username}.pdf`,
        status: i % 2 === 0 ? "VERIFIED" : "UPLOADED",
        uploadedById: supportSubAgent.id,
      },
    });

    await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        studentId: student.id,
        type: "Tuition",
        amount: 5000 + i * 1200,
        currency: i % 3 === 0 ? "USD" : i % 3 === 1 ? "EUR" : "TRY",
        description: "Seeded production tuition payment",
        commission: 300 + i * 50,
      },
    });

    await prisma.task.create({
      data: {
        tenantId: tenant.id,
        title: `Follow up ${student.fullName}`,
        description: "Call student and update application progress.",
        assignedToId: mainAgent.id,
        relatedStudentId: student.id,
        priority: i % 2 === 0 ? "HIGH" : "MEDIUM",
        status: i % 3 === 0 ? "IN_PROGRESS" : "TODO",
      },
    });
  }

  for (let i = 0; i < 5; i += 1) {
    await prisma.studentRequest.create({
      data: {
        tenantId: tenant.id,
        fullName: `Portal Applicant ${i + 1}`,
        email: `request${i + 1}@vertue.com`,
        phone: `+90 530 100 00${i}`,
        intake: "Fall 2026",
        notes: "Seeded request from portal flow.",
        status: i < 2 ? "PENDING" : "APPROVED",
      },
    });

    await prisma.notification.create({
      data: {
        tenantId: tenant.id,
        userId: operationsAdmin.id,
        title: "New student event",
        message: `Seeded notification ${i + 1}`,
        type: "new_student",
        read: i % 2 === 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: operationsAdmin.id,
        description: `Seeded audit log ${i + 1}`,
        category: "SYSTEM",
        resourceType: "Seed",
        resourceId: `${i + 1}`,
      },
    });
  }

  console.log("Production seed completed.");
  console.log(`Tenant: ${tenant.slug}`);
  console.log(`SuperAdmin: ${SUPER_ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
