import { body } from "express-validator";

const SendIdeaValidator = [
	body("title").notEmpty().withMessage("Please enter a title."),
	body("summary").notEmpty().withMessage("Please enter a summary."),
	body("description").notEmpty().withMessage("Please enter a description."),
	body("category")
		.isInt({ min: 1 })
		.withMessage("Please enter a valid category."),
	body("complexity")
		.notEmpty()
		.withMessage("Please enter a complexity.")
		.isIn(["Easy", "Medium", "Hard"]).withMessage("Please enter a valid complexity."),
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
		.notEmpty()
		.withMessage("Please enter details.")
		.optional(),
	body("isAnon")
		.isBoolean()
		.withMessage("Please enter a valid value.")
		.optional(),
];

export default SendIdeaValidator;