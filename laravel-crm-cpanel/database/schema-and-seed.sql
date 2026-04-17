SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS scholarships;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS university_programs;
DROP TABLE IF EXISTS universities;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS student_requests;
DROP TABLE IF EXISTS saved_views;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenants;

CREATE TABLE tenants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  country VARCHAR(80) NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_slug VARCHAR(60) NOT NULL,
  language VARCHAR(8) NOT NULL DEFAULT 'en',
  font_scale VARCHAR(8) NOT NULL DEFAULT 'sm',
  currency_preference VARCHAR(8) NOT NULL DEFAULT 'USD',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(60) NOT NULL UNIQUE,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  group_key VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE role_permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE students (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  agent_id BIGINT UNSIGNED NULL,
  sub_agent_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(140) NOT NULL,
  phone VARCHAR(50) NULL,
  nationality VARCHAR(80) NULL,
  gpa DECIMAL(3,2) NULL,
  field_of_study VARCHAR(180) NULL,
  english_level VARCHAR(80) NULL,
  target_country VARCHAR(60) NULL,
  budget_usd DECIMAL(12,2) NULL,
  passport_number VARCHAR(60) NULL,
  stage VARCHAR(40) NOT NULL DEFAULT 'lead',
  stage_temperature VARCHAR(20) NOT NULL DEFAULT 'cold',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE universities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(190) NOT NULL,
  country VARCHAR(80) NOT NULL,
  website VARCHAR(255) NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  tuition_range VARCHAR(255) NULL,
  language VARCHAR(120) NULL,
  programs_summary LONGTEXT NULL,
  deadline DATE NULL,
  visa_notes LONGTEXT NULL,
  description LONGTEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_universities_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE university_programs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  university_id BIGINT UNSIGNED NOT NULL,
  degree_level VARCHAR(50) NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  language VARCHAR(80) NULL,
  duration VARCHAR(40) NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  fee DECIMAL(12,2) NULL,
  discount_installment DECIMAL(5,2) NULL,
  discounted_fee_installment DECIMAL(12,2) NULL,
  discount_full DECIMAL(5,2) NULL,
  discounted_fee_full DECIMAL(12,2) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_uni_programs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_uni_programs_uni FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE applications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  university_id BIGINT UNSIGNED NOT NULL,
  program VARCHAR(190) NOT NULL,
  intake VARCHAR(80) NOT NULL,
  status VARCHAR(60) NOT NULL DEFAULT 'draft',
  deadline DATE NULL,
  notes TEXT NULL,
  enroll_probability INT NOT NULL DEFAULT 0,
  best_next_action VARCHAR(255) NULL,
  explainability TEXT NULL,
  last_activity_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_apps_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_apps_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_apps_uni FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE scholarships (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  university_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(190) NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sch_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_sch_uni FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(60) NOT NULL,
  currency VARCHAR(8) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) NULL,
  commission_amount DECIMAL(12,2) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_pay_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(60) NOT NULL,
  file_url VARCHAR(255) NULL,
  file_name VARCHAR(190) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'missing',
  expiry_date DATE NULL,
  ocr_json LONGTEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_docs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_docs_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NULL,
  assigned_to BIGINT UNSIGNED NOT NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'medium',
  status VARCHAR(30) NOT NULL DEFAULT 'todo',
  deadline DATETIME NULL,
  escalation_level INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(60) NOT NULL,
  title VARCHAR(190) NOT NULL,
  body TEXT NULL,
  read_at TIMESTAMP NULL,
  meta_json TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(120) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  diff_json LONGTEXT NULL,
  ip_address VARCHAR(60) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE student_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(140) NOT NULL,
  phone VARCHAR(50) NULL,
  nationality VARCHAR(80) NULL,
  target_program VARCHAR(190) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  review_note TEXT NULL,
  processed_by BIGINT UNSIGNED NULL,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_requests_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE saved_views (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  module_key VARCHAR(60) NOT NULL,
  name VARCHAR(120) NOT NULL,
  filters_json TEXT NOT NULL,
  is_shared TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_saved_views_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tenants (id, name, slug, country, currency, is_active) VALUES
(1, 'Vertue Global', 'vertue', 'Turkey', 'USD', 1);

INSERT INTO roles (id, tenant_id, name, slug, is_system) VALUES
(1, NULL, 'SuperAdmin', 'super_admin', 1),
(2, 1, 'Admin', 'admin', 1),
(3, 1, 'Agent', 'agent', 1),
(4, 1, 'SubAgent', 'sub_agent', 1),
(5, 1, 'Student', 'student', 1);

INSERT INTO permissions (id, `key`, name, group_key) VALUES
(1, 'students.view', 'View Students', 'students'),
(2, 'students.create', 'Create Students', 'students'),
(3, 'students.update', 'Update Students', 'students'),
(4, 'students.delete', 'Delete Students', 'students'),
(5, 'applications.view', 'View Applications', 'applications'),
(6, 'applications.create', 'Create Applications', 'applications'),
(7, 'applications.update', 'Update Applications', 'applications'),
(8, 'applications.delete', 'Delete Applications', 'applications'),
(9, 'universities.view', 'View Universities', 'universities'),
(10, 'universities.create', 'Create Universities', 'universities'),
(11, 'universities.update', 'Update Universities', 'universities'),
(12, 'universities.delete', 'Delete Universities', 'universities'),
(13, 'users.view', 'View Users', 'users'),
(14, 'users.create', 'Create Users', 'users'),
(15, 'users.update', 'Update Users', 'users'),
(16, 'users.delete', 'Delete Users', 'users'),
(17, 'student_requests.view', 'View Student Requests', 'student_requests'),
(18, 'student_requests.approve', 'Approve Student Requests', 'student_requests'),
(19, 'student_requests.reject', 'Reject Student Requests', 'student_requests'),
(20, 'finance.view', 'View Finance', 'finance');

INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions;
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE `key` IN ('students.view','students.create','students.update','applications.view','applications.create','applications.update','universities.view','student_requests.view');
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE `key` IN ('students.view','applications.view','student_requests.view');
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE `key` IN ('applications.view','universities.view');

INSERT INTO users (id, tenant_id, name, email, password, role_slug, language, font_scale, currency_preference, is_active) VALUES
(1, 1, 'Main Super Admin', 'admincrm@vertue.com', '$2b$10$UmYGdRGaushC6fPVyl5xBe9RuwMmcCGWUCGJ2VbY4VcaXrYORA/DO', 'super_admin', 'en', 'sm', 'USD', 1);

INSERT INTO universities (id, tenant_id, name, country, website, currency, tuition_range, language, programs_summary, deadline, visa_notes, description, is_active) VALUES
(1, 1, 'Acibadem University', 'Turkey', 'https://www.acibadem.edu.tr', 'USD', '$3,500 - $35,000', 'English/Turkish', 'Medicine, Dentistry, Pharmacy, Engineering, Health Sciences, Associate, Master, PhD', '2026-11-30', 'Student visa support required. Check scholarship slabs and pre-payment options.', 'Detailed 2025-2026 structure loaded including Medicine ($35,000), Pharmacy ($16,000), Engineering ($15,000), and vocational programs. Scholarship rates vary by faculty.', 1),
(2, 1, 'Altinbas University', 'Turkey', 'https://www.altinbas.edu.tr', 'USD', '$2,750 - $25,000', 'English/Turkish', 'Dentistry, Pharmacy, Law, Engineering, Business, Associate, Master, PhD', '2026-11-30', 'Installment and full-payment discount structures available by faculty.', 'Comprehensive fee matrix imported for undergraduate/associate/masters/phd tracks with installment and full payment discounts.', 1),
(3, 1, 'Antalya Bilim University', 'Turkey', 'https://antalya.edu.tr', 'USD', '$4,000 - $15,000', 'English/Turkish', 'Dentistry, Engineering, Law, Health Sciences, Vocational, Master, PhD', '2026-11-30', 'Scholarship windows differ by submission period (Jan-May, May-Aug, Aug-Nov).', 'International 2025 tuition table incorporated with time-window scholarship pricing.', 1),
(4, 1, 'Istanbul Atlas University', 'Turkey', 'https://www.atlas.edu.tr', 'USD', '$2,900 - $25,000', 'English/Turkish', 'Medicine, Dentistry, Engineering, Health, Vocational, Master, PhD', '2026-11-30', 'In-person registration mandatory. Deposit non-refundable. Residency processed via partner.', 'Admission and registration policies captured: discounts, deposits, language proficiency requirements, and payment timelines.', 1),
(5, 1, 'Near East University', 'Northern Cyprus', 'https://neu.edu.tr', 'EUR', 'EUR 2,705 - EUR 10,923', 'English/Turkish', 'Wide postgraduate catalog in Applied Sciences, Social Sciences, Health Sciences, Education, Criminal Sciences', '2026-10-31', 'Program language and scholarship depend on faculty and level.', 'North Cyprus annual tuition and scholarship ranges included for Medicine, Dentistry, Pharmacy, Engineering, and postgraduate tracks.', 1),
(6, 1, 'Eastern Mediterranean University (EMU)', 'Northern Cyprus', 'https://www.emu.edu.tr', 'USD', 'USD 3,820 - USD 13,548', 'English/Turkish', 'Comprehensive undergraduate and postgraduate program catalog', '2026-10-31', 'Program availability and fee may vary by faculty and language stream.', 'Large EMU program inventory ingested for advisor matching across Engineering, Business, Health, Law, and graduate programs.', 1);

INSERT INTO university_programs (tenant_id, university_id, degree_level, program_name, language, duration, currency, fee, discount_installment, discounted_fee_installment, discount_full, discounted_fee_full, notes) VALUES
(1,1,'Bachelor','Medicine','English','6 years','USD',35000,10,31500,15,29750,'Acibadem Faculty of Medicine'),
(1,1,'Bachelor','Pharmacy','English','4 years','USD',16000,10,14400,15,13600,'Acibadem Faculty of Pharmacy'),
(1,2,'Bachelor','Dentistry','Turkish/English','5 years','USD',22000,10,19800,15,18700,'Altinbas'),
(1,2,'Bachelor','Computer Engineering','English','4 years','USD',6000,15,5100,20,4800,'Altinbas Engineering'),
(1,3,'Bachelor','Computer Engineering','English','4 years','USD',8300,60,3320,55,3735,'Antalya Bilim (periodic scholarship)'),
(1,4,'Bachelor','Medicine (English)','English','6 years','USD',25000,10,22500,15,19130,'Istanbul Atlas'),
(1,5,'Bachelor','Medicine','English/Turkish','6 years','EUR',10923,NULL,NULL,NULL,NULL,'Near East annual'),
(1,6,'Bachelor','Artificial Intelligence Engineering','English','4 years','USD',4000,NULL,NULL,NULL,NULL,'EMU example catalog item');

INSERT INTO students (id, tenant_id, full_name, email, phone, nationality, gpa, field_of_study, english_level, target_country, budget_usd, passport_number, stage, stage_temperature, is_active) VALUES
(1,1,'Priya Sharma','priya@example.com','+90 555 100 1001','Indian',3.60,'Computer Science','IELTS','Turkey',12000,'P123456','enrolled','hot',1),
(2,1,'Diego Santos','diego@example.com','+90 555 100 1002','Brazilian',3.10,'Business Administration','B2','Turkey',9000,'P223456','applied','warm',1),
(3,1,'Sara Yılmaz','sara@example.com','+90 555 100 1003','Turkish',2.80,'Psychology','B1','Northern Cyprus',7000,'P323456','lead','cold',1),
(4,1,'Ahmed Al-Rashid','ahmed@example.com','+90 555 100 1004','Iraqi',3.40,'Dentistry','IELTS','Turkey',20000,'P423456','accepted','hot',1),
(5,1,'Mia Chen','mia@example.com','+90 555 100 1005','Chinese',3.00,'Software Engineering','B2','Turkey',10000,'P523456','applied','warm',1);

INSERT INTO applications (tenant_id, student_id, university_id, program, intake, status, deadline, notes, enroll_probability, best_next_action, explainability, last_activity_at) VALUES
(1,1,1,'Medicine','2026-Fall','enrolled','2026-07-31','Finalized and enrolled',95,'Prepare visa package','Offer accepted and tuition deposit paid',NOW()),
(1,2,2,'Business Administration','2026-Fall','under_review','2026-08-15','Pending language document',62,'Collect missing certificate','Good GPA and active follow-up',NOW()),
(1,4,4,'Dentistry','2026-Fall','accepted','2026-08-05','Awaiting tuition confirmation',82,'Confirm payment and registration','Accepted with high conversion chance',NOW());

INSERT INTO student_requests (tenant_id, full_name, email, phone, nationality, target_program, status) VALUES
(1,'Ali Karimi','alikarimi@example.com','+90 555 333 1234','Iranian','Computer Engineering','pending'),
(1,'Lina Haddad','linah@example.com','+90 555 333 5678','Jordanian','Medicine','pending'),
(1,'Omar Nasser','omar.nasser@example.com','+90 555 333 9911','Egyptian','Dentistry','approved');

INSERT INTO tasks (tenant_id, student_id, assigned_to, title, description, priority, status, deadline, escalation_level) VALUES
(1,2,1,'Follow up missing docs','Request IELTS report from student','high','todo',DATE_ADD(NOW(), INTERVAL 2 DAY),0),
(1,3,1,'Warm lead call','Schedule consultation call','medium','in_progress',DATE_ADD(NOW(), INTERVAL 1 DAY),0);

INSERT INTO notifications (tenant_id, user_id, type, title, body, meta_json) VALUES
(1,1,'student_request','New student request','2 new requests waiting approval','{"pending":2}'),
(1,1,'application_update','Application status updated','Student #4 moved to accepted','{"application_id":3}');

INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, diff_json, ip_address) VALUES
(1,1,'seed.init','system',1,'{"note":"Initial production seed loaded"}','127.0.0.1');

INSERT INTO saved_views (tenant_id, user_id, module_key, name, filters_json, is_shared) VALUES
(1,1,'students','High GPA Turkey','{"gpa_min":3.0,"target_country":"Turkey","stage":["lead","applied"]}',1);

COMMIT;
