import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import cron from "node-cron";

import router from "./routes";
import db from "./database";
import IdeaController from "./controllers/Idea.controller";
const swaggerDocument = require("../swagger.json");

const port = Number(process.env.PORT) || 3000;

const app = express();

app.use(cors());
app.use(express.json());

/*
cron is a task scheduler that executes a function
cron expression: minute hour day(number) month day(weekday)
 */
const ideaController = new IdeaController();
// At 00:00 on every Monday
cron.schedule("0 0 * * 1", ideaController.updateIdeasStatusCron);

app.all("/", (req, res) => res.status(400).send("API documentation on /docs"));

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { explorer: true })
);

app.use("/api", router);

app.all("*", (req, res) => res.status(404).json({ error: "Route not found!" }));

(async () => {
    await db.sync();
    app.listen(port, () =>
        console.log(`App listening on port ${port}`)
    );
})();
