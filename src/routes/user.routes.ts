import { Router } from "express";

import AuthController from "../controllers/Auth.controller";

import validationErrors from "../utils/validators/ValidationErrors";
import LoginValidator from "../utils/validators/LoginValidator";
import UserController from "../controllers/User.controller";
import SendIdeaValidator from "../utils/validators/SendIdeaValidator";
import PaginationValidator from "../utils/validators/PaginationValidator";
import SearchIdeaValidator from "../utils/validators/SearchIdeaValidator";
import IdeaIDParam from "../utils/validators/IdeaIDParam";

const router = Router();
const authController = new AuthController();
const userController = new UserController();

router.post("/login", LoginValidator, validationErrors, authController.login);

router
	.get("/me/ideas",
		authController.verifyToken,
		PaginationValidator,
		SearchIdeaValidator,
		validationErrors,
		userController.getAllIdeas
	);

router
	.post("/me/ideas",
		authController.verifyToken,
		SendIdeaValidator,
		validationErrors,
		userController.addIdea
	);

router
	.get("/me/ideas/:ideaId",
		authController.verifyToken,
		IdeaIDParam,
		validationErrors,
		userController.getOneUserIdea
	);

router
	.put("/me/ideas/:ideaId",
		authController.verifyToken,
		[...IdeaIDParam, ...SendIdeaValidator],
		validationErrors,
		userController.editOneUserIdea
	);

router.all("*", (req, res) =>
	res.status(404).json({ error: "Route not found!" })
);

export default router;