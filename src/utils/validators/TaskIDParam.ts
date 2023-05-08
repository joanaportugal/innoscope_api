import { param } from "express-validator";

const TaskIDParam = [
	param("taskId")
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Please enter a valid task id.")
];

export default TaskIDParam;