import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import type { AdapterAccount } from '@auth/core/adapters';

// --- AUTH.JS TABLES ---

export const users = sqliteTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  password: text('password'), // For credentials provider
  role: text('role', { enum: ['admin', 'player'] }).default('player').notNull(),
  playerId: integer('player_id').references(() => players.id),
});

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// --- APPLICATION TABLES ---

export const seasons = sqliteTable('seasons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  status: text('status', { enum: ['active', 'archived'] }).default('active').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // Real name
  fantasyName: text('fantasy_name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const gameweeks = sqliteTable('gameweeks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  seasonId: integer('season_id').references(() => seasons.id),
  number: integer('number').notNull(),
  deadline: integer('deadline', { mode: 'timestamp' }),
  status: text('status', { enum: ['upcoming', 'active', 'completed'] }).default('upcoming').notNull(),
  globalNotes: text('global_notes'),
});

export const priceList = sqliteTable('price_list', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  seasonId: integer('season_id').references(() => seasons.id),
  position: integer('position').notNull(),
  amount: integer('amount').notNull(), // NPR
});

export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  gameweekId: integer('gameweek_id').notNull().references(() => gameweeks.id, { onDelete: 'cascade' }),
  points: integer('points').default(0),
  rank: integer('rank'),
  amountDue: integer('amount_due').notNull(),
  status: text('status', { enum: ['unpaid', 'paid', 'partial'] }).default('unpaid').notNull(),
  remarks: text('remarks'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const evidence = sqliteTable('evidence', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').references(() => entries.id, { onDelete: 'cascade' }),
  playerId: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['payment', 'result'] }).notNull(),
  fileUrl: text('file_url').notNull(),
  notes: text('notes'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending').notNull(),
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Types
export type User = typeof users.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type PriceSetting = typeof priceList.$inferSelect;
