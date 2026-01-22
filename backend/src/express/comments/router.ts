import { Router } from "express";
import ValidateRequest from "../../utils/express/joi";
import {
    createCommentSchema,
    deleteCommentByIdSchema,
    getCommentByIdSchema,
    getCommentsByPostIdSchema,
    updateCommentSchema,
} from "./validator";
import { CommentController } from "./controller";
import { wrapAuthMiddleware, wrapController } from "../../utils/express/middlewares";
import { authMiddleware } from "../auth/middleware";

const commentRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API endpoints for comments
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       '200':
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
commentRouter.get("/", wrapController(CommentController.getAllComments));

/**
 * @swagger
 * /comments/:id:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the comment
 *         example: "67a1d205c689f9a4e5476a1b"
 *     responses:
 *       '200':
 *         description: A comment by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
commentRouter.get("/:id", ValidateRequest(getCommentByIdSchema), wrapController(CommentController.getCommentById));

/**
 * @swagger
 * /comments/post/:postId:
 *   get:
 *     summary: Get comments by post ID
 *     tags: [Comments]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID of the post
 *         example: "67a1d205c689f9a4e5476a1a"
 *     responses:
 *       '200':
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
commentRouter.get(
    "/post/:postId",
    ValidateRequest(getCommentsByPostIdSchema),
    wrapController(CommentController.getCommentsByPostId)
);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentRequest'
 *     responses:
 *       '201':
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
commentRouter.post(
    "/",
    authMiddleware,
    ValidateRequest(createCommentSchema),
    wrapAuthMiddleware(CommentController.createComment)
);

/**
 * @swagger
 * /comments/:id:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the comment
 *         example: "67a1d205c689f9a4e5476a1b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *     responses:
 *       '200':
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
commentRouter.put(
    "/:id",
    authMiddleware,
    ValidateRequest(updateCommentSchema),
    wrapAuthMiddleware(CommentController.updateCommentById)
);

/**
 * @swagger
 * /comments/:id:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the comment
 *         example: "67a1d205c689f9a4e5476a1b"
 *     responses:
 *       '200':
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Comment <id> deleted successfully"
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
commentRouter.delete(
    "/:id",
    authMiddleware,
    ValidateRequest(deleteCommentByIdSchema),
    wrapAuthMiddleware(CommentController.deleteCommentById)
);

export default commentRouter;
