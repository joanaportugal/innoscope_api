import { body, param } from "express-validator";

export const UserIDParam = [
	param("userId")
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Please enter a valid user id.")
];

export const UserIDBody = [
	body("userId")
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Please enter a valid user id.")
];