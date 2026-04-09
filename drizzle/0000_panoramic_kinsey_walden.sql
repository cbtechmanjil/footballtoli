CREATE TABLE `fines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`player_id` integer NOT NULL,
	`gameweek_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'unpaid' NOT NULL,
	`remarks` text,
	`updated_at` integer,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gameweek_id`) REFERENCES `gameweeks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `gameweeks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` integer NOT NULL,
	`deadline` integer,
	`status` text DEFAULT 'upcoming' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`team_name` text NOT NULL,
	`created_at` integer
);
