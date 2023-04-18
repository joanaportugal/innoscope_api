import { body } from "express-validator";

const SendIdeaValidator = [
	body("title").isString().notEmpty().withMessage("Please enter a title."),
	body("summary").isString().notEmpty().withMessage("Please enter a summary."),
	body("description")
		.isString()
		.notEmpty()
		.withMessage("Please enter a description."),
	body("category")
		.isInt({ min: 1 })
		.withMessage("Please enter a valid category."),
	body("complexity")
		.isString()
		.notEmpty()
		.withMessage("Please enter a complexity."),
	body("duration")
		.isInt({ min: 1 })
		.withMessage("Please enter a valid duration."),
	body("technologies")
		.isArray()
		.withMessage("Please enter a list of technologies."),
	body("technologies.*")
		.isInt({ min: 1 })
		.withMessage("Please enter valid technologies."),
	body("coauthors")
		.isArray()
		.withMessage("Please enter a list of coauthors.")
		.optional(),
	body("coauthors.*")
		.isInt({ min: 1 })
		.withMessage("Please enter valid coauthors.")
		.optional(),
	body("details")
		.isString()
		.notEmpty()
		.withMessage("Please enter a details.")
		.optional(),
	body("isAnon")
		.isBoolean()
		.withMessage("Please enter a valid value.")
		.optional(),
];

export default SendIdeaValidator;