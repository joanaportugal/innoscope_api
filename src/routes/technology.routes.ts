import { Router } from "express";

import AuthController from "../controllers/Auth.controller";
import TechnologyController from "../controllers/Technology.controller";

import validationErrors from "../utils/validators/ValidationErrors";
import TechnologyValidator from "../utils/validators/TechnologyValidator";

const router = Router();

const authController = new AuthController();
const technologyController = new TechnologyController();

router.get("/", authController.verifyToken, technologyController.getAll);

router.post(
  "/",
  authController.verifyToken,
  TechnologyValidator,
  validationErrors,
  technologyController.createOne
);

router.all("*", (req, res) =>
  res.status(404).json({ error: "Route not found!" })
);

export default router;
