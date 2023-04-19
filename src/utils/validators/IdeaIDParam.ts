import { param } from "express-validator";

const IdeaIDParam = [
	param("ideaId")
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Please enter a valid idea id.")
];

export default IdeaIDParam;