import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import router from "./routes";
import db from "./database";
const swaggerDocument = require("../swagger.json");

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "127.0.0.1";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { explorer: true })
);

app.use("/api/v1", router);

app.all("*", (req, res) => res.status(404).json({ error: "Route not found!" }));

(async () => {
    await db.sync();
    app.listen(port, host, () =>
        console.log(`App listening at http://${host}:${port}/`)
    );
})();
