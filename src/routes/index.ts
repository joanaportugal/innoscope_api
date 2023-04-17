import { Router } from "express";

import userRouter from "./user.routes";
import categoryRouter from "./category.routes";
//import technologyRouter from "./technology.routes";
//import ideaRouter from "./idea.routes";

const router = Router();

router.use("/users", userRouter);
router.use("/categories", categoryRouter);
//router.use("/technologies", technologyRouter);
//router.use("/ideas", ideaRouter);

router.all("*", (req, res) =>
	res.status(404).json({ error: "Route not found!" })
);

export default router;