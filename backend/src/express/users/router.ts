import { Router } from "express";
import ValidateRequest from "../../utils/express/joi";
import { createUserSchema, getUserByIdSchema, updateUserSchema } from "./validator";
import { UserController } from "./controller";
import { wrapAuthMiddleware, wrapController } from "../../utils/express/middlewares";
import { authMiddleware } from "../auth/middleware";

const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for users
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       '200':
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 */
userRouter.get("/", wrapController(UserController.getAllUsers));

/**
 * @swagger
 * /users/:id:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
 *         example: "67a1d205c689f9a4e5476a1b"
 *     responses:
 *       '200':
 *         description: A user by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
userRouter.get("/:id", ValidateRequest(getUserByIdSchema), wrapController(UserController.getUserById));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 */
userRouter.post("/", ValidateRequest(createUserSchema), wrapController(UserController.createUser));

/**
 * @swagger
 * /users/:id:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
 *         example: "67a1d205c689f9a4e5476a1b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
userRouter.put(
    "/:id",
    authMiddleware,
    ValidateRequest(updateUserSchema),
    wrapAuthMiddleware(UserController.updateUser)
);

/**
 * @swagger
 * /users/:id:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
 *         example: "67a1d205c689f9a4e5476a1b"
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "User <id> deleted successfully"
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 */
userRouter.delete("/:id", authMiddleware, wrapAuthMiddleware(UserController.deleteUserById));

export default userRouter;
