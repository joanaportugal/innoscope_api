import { body } from "express-validator";

const CategoryValidator = [
	body("name").isString().notEmpty().withMessage("Please enter a valid category name."),
];

export default CategoryValidator;