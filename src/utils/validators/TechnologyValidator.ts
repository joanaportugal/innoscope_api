import { body } from "express-validator";

const TechnologyValidator = [
	body("name").isString().notEmpty().withMessage("Please enter a valid technology name."),
];

export default TechnologyValidator;