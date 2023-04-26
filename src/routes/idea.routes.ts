import { Router } from "express";

import AuthController from "../controllers/Auth.controller";
import IdeaController from "../controllers/Idea.controller";

import validationErrors from "../utils/validators/ValidationErrors";
import PaginationValidator from "../utils/validators/PaginationValidator";
import SearchIdeaValidator from "../utils/validators/SearchIdeaValidator";
import InteractionValidator from "../utils/validators/InteractionValidator";
import IdeaIDParam from "../utils/validators/IdeaIDParam";
import { UserIDBody } from "../utils/validators/UserIdValidator";
import MemberValidator from "../utils/validators/MemberValidator";

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

router
	.patch("/:ideaId",
		authController.verifyToken,
		IdeaIDParam,
		validationErrors,
		ideaController.updateIdeaStatus
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

router.get("/:ideaId/members",
	authController.verifyToken,
	IdeaIDParam,
	validationErrors,
	ideaController.getCommunityIdeaMembers);

router.post("/:ideaId/members",
	authController.verifyToken,
	IdeaIDParam,
	validationErrors,
	ideaController.addLoggedUserToMembers);

router.delete("/:ideaId/members",
	authController.verifyToken,
	IdeaIDParam,
	validationErrors,
	ideaController.removeLoggedUserFromMembers);

router.post("/:ideaId/invitations",
	authController.verifyToken,
	[...IdeaIDParam, ...UserIDBody],
	validationErrors,
	ideaController.addRequestUserToMembers);

router.put("/:ideaId/invitations/:userId",
	authController.verifyToken,
	MemberValidator,
	validationErrors,
	ideaController.editRequestedUserToMembers);

router.all("*", (req, res) =>
	res.status(404).json({ error: "Route not found!" })
);

export default router;
