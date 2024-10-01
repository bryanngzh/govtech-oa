import cors from "cors";
import express from "express";
import morgan from "morgan";
import { RegisterRoutes } from "../build/routes";
import authenticateFirebase from "./middlewares/authenticateFirebase";
import logMiddleware from "./middlewares/logMiddleware";

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
app.use("/teams", authenticateFirebase);
app.use("/matches", authenticateFirebase);
app.use(logMiddleware);

// routes
RegisterRoutes(app);

// start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
