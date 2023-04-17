import { body } from "express-validator";

const LoginValidator = [
	body("email")
		.notEmpty()
		.isEmail()
		.withMessage("Please enter a valid email address."),
	body("name").isString().notEmpty().withMessage("Please enter a valid name."),
];

export default LoginValidator;