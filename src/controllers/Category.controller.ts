import { Request, Response } from "express";
import { ValidationError } from "sequelize";

import { tables as db } from "../database";

class CategoryController {
	async getAll(req: Request, res: Response) {
		try {
			const categories = await db.Category.findAll({ order: [["category_id", "ASC"]] });
			return res.status(200).json({ categories });
		} catch (err) {
			return res.status(500).json({
				error: "An error occurred. Try again!",
			});
		}
	}

	async createOne(req: Request, res: Response) {
		try {
			await db.Category.create({ category_name: req.body.name });

			return res.status(201).json({ message: "Category created." });
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

export default CategoryController;
