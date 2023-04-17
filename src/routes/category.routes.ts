import { Router } from "express";

import AuthController from "../controllers/Auth.controller";
import CategoryController from "../controllers/Category.controller";

import validationErrors from "../utils/validators/ValidationErrors";
import CategoryValidator from "../utils/validators/CategoryValidator";

const router = Router();

const authController = new AuthController();
const categoryController = new CategoryController();

router.get("/", authController.verifyToken, categoryController.getAll);

router.post(
	"/",
	authController.verifyToken,
	CategoryValidator,
	validationErrors,
	categoryController.createOne
);

router.all("*", (req, res) =>
	res.status(404).json({ error: "Route not found!" })
);

export default router;
