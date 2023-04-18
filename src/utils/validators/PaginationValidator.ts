import { query } from "express-validator";

const PaginationValidator = [
	query("per_page")
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Please enter a valid per_page quantity.")
		.optional(),
	query("curr_page")
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Please enter a valid page number.")
		.optional(),
];

export default PaginationValidator;