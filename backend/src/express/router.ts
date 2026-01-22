import express from "express";
import postsRouter from "./posts/router";
import commentsRouter from "./comments/router";
import userRouter from "./users/router";
import authRouter from "./auth/router";

const appRouter = express.Router();

appRouter.use("/auth", authRouter);
appRouter.use("/posts", postsRouter);
appRouter.use("/comments", commentsRouter);
appRouter.use("/users", userRouter);

export default appRouter;
