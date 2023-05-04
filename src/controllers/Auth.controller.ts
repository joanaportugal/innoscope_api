import { Request, Response, NextFunction } from "express";
import { ValidationError } from "sequelize";
import jwt from "jsonwebtoken";

import { tables as db } from "../database";
require("dotenv").config();

class AuthController {
	verifyToken(req: any, res: Response, next: NextFunction) {
		const header = req.headers["x-access-token"] || req.headers.authorization;
		if (typeof header == "undefined") {
			return res.status(401).json({
				error: "You need to be authenticated to access to this route.",
			});
		}
		const bearer = header.split(" "); // Authorization: Bearer <token>
		const token = bearer[1];
		try {
			let decoded = jwt.verify(token, process.env.SECRET || "");
			req.details = decoded;
			next();
		} catch (err) {
			return res.status(401).json({
				error: "Unauthorized.",
			});
		}
	}

	async login(req: Request, res: Response) {
		try {
			const userExists = await db.User.findOne({
				where: { user_email: req.body.email },
			});
			let loggedUserId: number;

			if (!userExists) {
				const user = await db.User.create({
					user_email: req.body.email,
					user_name: req.body.name,
				});
				loggedUserId = user ? user.user_id : 0;
			} else {
				loggedUserId = userExists.user_id;
			}

			const token = jwt.sign({ loggedUserId }, process.env.SECRET || "", {});

			return res.status(200).json({ token });
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

export default AuthController;
