import { Router } from "express";

import AuthController from "../controllers/Auth.controller";

import validationErrors from "../utils/validators/ValidationErrors";
import LoginValidator from "../utils/validators/LoginValidator";

const router = Router();
const authController = new AuthController();

router.post("/login", LoginValidator, validationErrors, authController.login);

router.all("*", (req, res) =>
	res.status(404).json({ error: "Route not found!" })
);

export default router;