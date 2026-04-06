/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,username]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,studentId,scholarshipId]` on the table `StudentScholarship` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `StudentScholarship` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Student_email_key";

-- DropIndex
DROP INDEX "Student_username_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "budget" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "StudentScholarship" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Application_tenantId_studentId_idx" ON "Application"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Application_tenantId_universityId_idx" ON "Application"("tenantId", "universityId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_tenantId_studentId_idx" ON "Document"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_userId_read_idx" ON "Notification"("tenantId", "userId", "read");

-- CreateIndex
CREATE INDEX "Payment_tenantId_studentId_idx" ON "Payment"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_name_key" ON "Role"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Scholarship_tenantId_universityId_idx" ON "Scholarship"("tenantId", "universityId");

-- CreateIndex
CREATE INDEX "Student_tenantId_assignedAgentId_idx" ON "Student"("tenantId", "assignedAgentId");

-- CreateIndex
CREATE INDEX "Student_tenantId_assignedSubAgentId_idx" ON "Student"("tenantId", "assignedSubAgentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_tenantId_email_key" ON "Student"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_tenantId_username_key" ON "Student"("tenantId", "username");

-- CreateIndex
CREATE INDEX "StudentRequest_tenantId_status_idx" ON "StudentRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "StudentScholarship_tenantId_studentId_idx" ON "StudentScholarship"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentScholarship_tenantId_studentId_scholarshipId_key" ON "StudentScholarship"("tenantId", "studentId", "scholarshipId");

-- CreateIndex
CREATE INDEX "Task_tenantId_assignedToId_idx" ON "Task"("tenantId", "assignedToId");

-- CreateIndex
CREATE INDEX "Task_tenantId_relatedStudentId_idx" ON "Task"("tenantId", "relatedStudentId");

-- CreateIndex
CREATE INDEX "University_tenantId_country_idx" ON "University"("tenantId", "country");

-- CreateIndex
CREATE INDEX "User_tenantId_roleId_idx" ON "User"("tenantId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- AddForeignKey
ALTER TABLE "StudentScholarship" ADD CONSTRAINT "StudentScholarship_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
