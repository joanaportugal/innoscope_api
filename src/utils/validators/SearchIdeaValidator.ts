import { query } from "express-validator";

const SearchIdeaValidator = [
	query("title")
		.notEmpty()
		.withMessage("Please enter a valid title.")
		.optional(),
	query("category")
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Please enter a valid category.")
		.optional(),
	query("status")
		.isIn(["New", "On Voting", "Rejected", "Approved", "Waiting", "On Going", "Finished"])
		.withMessage("Please enter a valid status.").optional(),
	query("sort")
		.isIn(["Name (A-Z)", "Name (Z-A)", "Creation (New-Old)", "Creation (Old-New)"])
		.withMessage("Please enter a sort param.").optional(),
];

export default SearchIdeaValidator;