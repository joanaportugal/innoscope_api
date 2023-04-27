import { body } from "express-validator";

const TaskValidator = [
	body("description").isString().notEmpty().withMessage("Please enter a description."),
	body("dueDate")
		.notEmpty().withMessage("Please enter a due date.")
		.toDate().isISO8601().withMessage("Please enter a valid format."),
	body("user").toInt().isInt({ min: 1 }).withMessage("Please enter a user.").optional(),
	body("status").notEmpty().isIn(["To Do", "On Going", "Done"]).withMessage("Please enter a valid status.").optional()
];

export default TaskValidator;