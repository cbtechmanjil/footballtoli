import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: '42d95466-b02f-41d0-989a-9a782f9266f7',
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
