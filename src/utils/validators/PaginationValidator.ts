import { query } from "express-validator";

const PaginationValidator = [
	query("per_page")
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Please enter a valid per page quantity.")
		.optional(),
	query("curr_page")
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Please enter a valid current page number.")
		.optional(),
];

export default PaginationValidator;