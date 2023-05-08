import { body } from "express-validator";

const InteractionValidator = [
	body("vote")
		.toInt()
		.isInt({ min: 1, max: 5 })
		.withMessage("Please enter a valid vote between 1 and 5.").optional(),
	body("comment").notEmpty().withMessage("Please enter a comment.").optional()
];

export default InteractionValidator;