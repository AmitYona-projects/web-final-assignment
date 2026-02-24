import express from "express";
import postsRouter from "./posts/router";
import userRouter from "./users/router";
import authRouter from "./auth/router";
import geminiRouter from "./gemini/router";

const appRouter = express.Router();

appRouter.use("/auth", authRouter);
appRouter.use("/posts", postsRouter);
appRouter.use("/users", userRouter);
appRouter.use("/gemini", geminiRouter);

export default appRouter;
