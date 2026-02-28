CREATE TABLE `puppy_hearts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`puppyId` int NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `puppy_hearts_id` PRIMARY KEY(`id`)
);
