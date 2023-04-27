import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

function validationErrors(req: Request, res: Response, next: NextFunction) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({
			errors: errors.array(),
		});
	} else {
		next();
	}
}

export default validationErrors;