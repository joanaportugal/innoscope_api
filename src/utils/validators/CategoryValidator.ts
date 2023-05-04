import { body } from "express-validator";

const CategoryValidator = [
	body("name").notEmpty().withMessage("Please enter a category name."),
];

export default CategoryValidator;