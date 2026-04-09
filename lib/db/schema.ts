import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  teamName: text('team_name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const gameweeks = sqliteTable('gameweeks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: integer('number').notNull(),
  deadline: integer('deadline', { mode: 'timestamp' }),
  status: text('status', { enum: ['upcoming', 'active', 'completed'] }).default('upcoming').notNull(),
});

export const fines = sqliteTable('fines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  gameweekId: integer('gameweek_id').notNull().references(() => gameweeks.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // amount in NPR
  reason: text('reason').notNull(),
  status: text('status', { enum: ['unpaid', 'paid'] }).default('unpaid').notNull(),
  remarks: text('remarks'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Gameweek = typeof gameweeks.$inferSelect;
export type NewGameweek = typeof gameweeks.$inferInsert;
export type Fine = typeof fines.$inferSelect;
export type NewFine = typeof fines.$inferInsert;
