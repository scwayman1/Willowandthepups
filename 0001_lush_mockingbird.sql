CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`puppyId` int,
	`puppyPreference` varchar(200),
	`notes` text,
	`status` enum('new','reviewed','contacted','approved','rejected') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `puppies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`nickname` varchar(100),
	`sex` enum('M','F') NOT NULL,
	`coat` varchar(200) NOT NULL,
	`birthWeightGrams` int NOT NULL,
	`currentWeightGrams` int NOT NULL,
	`status` enum('available','reserved','adopted') NOT NULL DEFAULT 'available',
	`notes` text,
	`birthOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `puppies_id` PRIMARY KEY(`id`),
	CONSTRAINT `puppies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `puppy_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`puppyId` int NOT NULL,
	`url` text NOT NULL,
	`caption` varchar(500),
	`takenAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `puppy_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weight_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`puppyId` int NOT NULL,
	`weightGrams` int NOT NULL,
	`measuredAt` timestamp NOT NULL,
	`note` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weight_logs_id` PRIMARY KEY(`id`)
);
