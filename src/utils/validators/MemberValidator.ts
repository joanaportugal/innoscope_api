import { body } from "express-validator";
import { UserIDParam } from "./UserIdValidator";

const MemberValidator = [
	...UserIDParam,
	body("accepted")
		.isBoolean()
		.withMessage("Please enter a valid value for accepted.")
];

export default MemberValidator;