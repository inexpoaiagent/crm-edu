import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.SCREENSHOT_BASE_URL || "http://localhost:3000";
const outputDir = path.resolve(process.cwd(), "screenshots");

const pages = [
  { path: "/dashboard", file: "01-dashboard.png" },
  { path: "/students", file: "02-students.png" },
  { path: "/applications", file: "03-applications.png" },
  { path: "/universities", file: "04-universities.png" },
  { path: "/pipeline", file: "05-pipeline.png" },
  { path: "/settings", file: "06-settings.png" },
];

async function ensureLogin(page) {
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });

  if (page.url().includes("/dashboard")) return;

  const signInButton = page.getByRole("button", { name: "Sign in to CRM" });
  await signInButton.waitFor({ state: "visible", timeout: 15000 });
  await signInButton.click();
  await page.waitForURL("**/dashboard", { timeout: 20000 });
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  try {
    await ensureLogin(page);

    for (const item of pages) {
      await page.goto(`${baseUrl}${item.path}`, { waitUntil: "networkidle" });
      const outputPath = path.join(outputDir, item.file);
      await page.screenshot({ path: outputPath, fullPage: true });
      console.log(`Saved: ${outputPath}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
