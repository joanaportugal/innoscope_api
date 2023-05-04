import { body } from "express-validator";

const TechnologyValidator = [
	body("name").notEmpty().withMessage("Please enter a technology name."),
];

export default TechnologyValidator;