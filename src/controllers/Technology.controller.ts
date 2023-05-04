import { Request, Response } from "express";
import { ValidationError } from "sequelize";

import { tables as db } from "../database";

class TechnologyController {
	async getAll(req: Request, res: Response) {
		try {
			const technologies = await db.Technology.findAll({ order: [["technology_id", "ASC"]] });
			return res.status(200).json({ technologies });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async createOne(req: Request, res: Response) {
		try {
			await db.Technology.create({ technology_name: req.body.name });

			return res.status(200).json({ message: "Technology created." });
		} catch (err) {
			if (err instanceof ValidationError) {
				return res.status(422).json({
					errors: err.errors.map((e) => e.message),
				});
			}
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}
}

export default TechnologyController;
