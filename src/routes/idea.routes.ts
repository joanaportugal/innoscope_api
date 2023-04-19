import { Router } from "express";

import AuthController from "../controllers/Auth.controller";
import IdeaController from "../controllers/Idea.controller";

import validationErrors from "../utils/validators/ValidationErrors";
import PaginationValidator from "../utils/validators/PaginationValidator";
import SearchIdeaValidator from "../utils/validators/SearchIdeaValidator";
import IdeaIDParam from "../utils/validators/IdeaIDParam";
import InteractionValidator from "../utils/validators/InteractionValidator";

const router = Router();

const authController = new AuthController();
const ideaController = new IdeaController();

router
	.get("/",
		authController.verifyToken,
		[...PaginationValidator, ...SearchIdeaValidator],
		validationErrors,
		ideaController.getAllCommunityIdeas
	);

router
	.get("/:ideaId",
		authController.verifyToken,
		IdeaIDParam,
		validationErrors,
		ideaController.getCommunityIdeaDetails
	);

router.get("/:ideaId/interactions",
	authController.verifyToken,
	IdeaIDParam,
	validationErrors,
	ideaController.getIdeaInteractions);

router.post("/:ideaId/interactions",
	authController.verifyToken,
	[...IdeaIDParam, ...InteractionValidator],
	validationErrors,
	ideaController.addIdeaInteraction);

router.all("*", (req, res) =>
	res.status(404).json({ error: "Route not found!" })
);

export default router;
