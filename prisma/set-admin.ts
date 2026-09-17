// Creates the admin account, or updates it if one already exists (V1 has a
// single admin). Changing the password signs out every existing session.
//
// Run with: npm run admin:set
// It prompts for the details. For non-interactive use (e.g. CI), set
// ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD in the environment instead.
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { hashPassword } from "../lib/auth/password";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const MIN_PASSWORD_LENGTH = 12;

const adminSchema = z.object({
  email: z.email("Enter a valid email.").trim().toLowerCase(),
  name: z.string().trim().min(1, "Enter a name."),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
    .max(200),
});

async function prompt() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const email = await rl.question("Admin email: ");
    const name = await rl.question("Admin name: ");
    // Hide the password while it is typed.
    const output = rl as unknown as { _writeToOutput: (text: string) => void };
    const write = output._writeToOutput.bind(rl);
    const question = `Password (at least ${MIN_PASSWORD_LENGTH} characters): `;
    output._writeToOutput = (text) => write(text.startsWith(question) ? question : "");
    const password = await rl.question(question);
    output._writeToOutput = write;
    process.stdout.write("\n");
    return { email, name, password };
  } finally {
    rl.close();
  }
}

async function main() {
  const { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = process.env;
  const input =
    ADMIN_EMAIL && ADMIN_NAME && ADMIN_PASSWORD
      ? { email: ADMIN_EMAIL, name: ADMIN_NAME, password: ADMIN_PASSWORD }
      : await prompt();

  const parsed = adminSchema.safeParse(input);
  if (!parsed.success) {
    console.error(z.prettifyError(parsed.error));
    process.exitCode = 1;
    return;
  }
  const { email, name, password } = parsed.data;
  const passwordHash = await hashPassword(password);

  const existing = await db.adminUser.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) {
    await db.adminUser.update({
      where: { id: existing.id },
      data: {
        email,
        name,
        passwordHash,
        isActive: true,
        sessionVersion: { increment: 1 },
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
    console.log(`Updated admin ${email}. Existing sessions are signed out.`);
  } else {
    await db.adminUser.create({ data: { email, name, passwordHash } });
    console.log(`Created admin ${email}.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
