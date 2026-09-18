/**
 * Prisma generate with a safe dummy DATABASE_URL so Vercel install/build
 * works even when no env vars are set in the import UI.
 */
const { execSync } = require("child_process");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://user:pass@127.0.0.1:5432/viralme?schema=public";
}

execSync("npx prisma generate", { stdio: "inherit", env: process.env });
