import { Router } from "express";
import ValidateRequest from "../../utils/express/joi";
import {
    createPostSchema,
    deletePostByIdSchema,
    getPostByIdSchema,
    getPostsBySenderIdSchema,
    updatePostSchema,
} from "./validator";
import { PostController } from "./controller";
import { wrapAuthMiddleware, wrapController } from "../../utils/express/middlewares";
import { authMiddleware } from "../auth/middleware";

const postRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API endpoints for posts
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       '200':
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 */
postRouter.get("/", wrapController(PostController.getAllPosts));

/**
 * @swagger
 * /posts/sender:
 *   get:
 *     summary: Get posts by sender ID
 *     tags: [Posts]
 *     parameters:
 *       - name: senderId
 *         in: query
 *         required: true
 *         description: ID of the sender
 *         example: "67a1d205c689f9a4e5476a1b"
 *     responses:
 *       '200':
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
postRouter.get("/sender", ValidateRequest(getPostsBySenderIdSchema), wrapController(PostController.getPostsBySenderId));

/**
 * @swagger
 * /posts/:id:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the post
 *         example: "67a1d205c689f9a4e5476a1b"
 *     responses:
 *       '200':
 *         description: A post by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
postRouter.get("/:id", ValidateRequest(getPostByIdSchema), wrapController(PostController.getPostById));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       '201':
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
postRouter.post("/", authMiddleware, ValidateRequest(createPostSchema), wrapAuthMiddleware(PostController.createPost));

/**
 * @swagger
 * /posts/:id:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the post
 *         example: "67a1d205c689f9a4e5476a1b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostRequest'
 *     responses:
 *       '200':
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
postRouter.put(
    "/:id",
    authMiddleware,
    ValidateRequest(updatePostSchema),
    wrapAuthMiddleware(PostController.updatePost)
);

/**
 * @swagger
 * /posts/:id:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the post
 *         example: "67a1d205c689f9a4e5476a1b"
 *     responses:
 *       '200':
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Post <id> deleted successfully"
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
postRouter.delete(
    "/:id",
    authMiddleware,
    ValidateRequest(deletePostByIdSchema),
    wrapAuthMiddleware(PostController.deletePostById)
);

export default postRouter;
