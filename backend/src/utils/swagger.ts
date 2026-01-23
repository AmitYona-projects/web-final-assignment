import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import { Express } from "express";
import config from "../config";

const { server } = config;

const swaggerOptions: swaggerJSDoc.OAS3Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API",
            version: "1.0.0",
            description: "API for the Web Assignment 2",
            contact: [
                {
                    name: "Amit Etrogy",
                    email: "amitetrogy@gmail",
                },
                {
                    name: "Yonatan Bardin",
                    email: "yonatanbardin5@gmail.com",
                },
            ],
        },
        servers: [{ url: `http://localhost:${server.port}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    required: ["_id", "username", "email"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "Unique ID of the user (MongoDB ObjectId)",
                            example: "67a1d205c689f9a4e5476a1b",
                        },
                        username: {
                            type: "string",
                            description: "Username of the user",
                            example: "yonaamit",
                        },
                        email: {
                            type: "string",
                            description: "Email of the user",
                            example: "yona.amit@gmail.com",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp of when the user was created",
                            example: "2026-01-01T00:00:00.000Z",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp of when the user was last updated",
                            example: "2026-01-01T00:00:00.000Z",
                        },
                    },
                },
                Post: {
                    type: "object",
                    required: ["_id", "title", "description", "senderId"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "Unique ID of the post (MongoDB ObjectId)",
                            example: "67a1d205c689f9a4e5476a1b",
                        },
                        drinkName: {
                            type: "string",
                            description: "Name of the drink",
                            example: "My first drink name",
                        },
                        instructions: {
                            type: "string",
                            description: "Instructions of the drink",
                            example: "Having a great day!",
                        },
                        drinkImage: {
                            type: "string",
                            description: "Image of the drink",
                            example: "drink.png",
                        },
                        owner: {
                            type: "string",
                            description: "User ID of the owner (User MongoDB ObjectId)",
                            example: "67a1d205c689f9a4e5476a1b",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp of when the drink was created",
                            example: "2026-01-01T00:00:00.000Z",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp of when the drink was last updated",
                            example: "2026-01-01T00:00:00.000Z",
                        },
                    },
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            description: "Email of the user",
                            example: "yona.amit@gmail.com",
                        },
                        password: { type: "string", description: "Password of the user", example: "yonyon123!" },
                    },
                },
                RegisterRequest: {
                    type: "object",
                    required: ["email", "password", "username"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            description: "Email of the user",
                            example: "yona.amit@gmail.com",
                        },
                        password: { type: "string", description: "Password of the user", example: "yonyon123!" },
                        username: { type: "string", description: "Username of the user", example: "yonaamit" },
                    },
                },
                LogoutRequest: {
                    type: "object",
                    required: ["refreshToken"],
                    properties: {
                        refreshToken: {
                            type: "string",
                            description: "Refresh token of the user",
                            example:
                                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTFkMjA1YzY4OWY5YTRlNTQ3NmExYiIsImlhdCI6MTcyODI4NzYyMiwiZXhwIjoxNzI4ODkyNDIyfQ.4JvO53r6T_P7q-5bJvFOMOJh7VbQd57o4L9Oq_DQwE",
                        },
                    },
                },
                RefreshTokenRequest: {
                    type: "object",
                    required: ["refreshToken"],
                    properties: {
                        refreshToken: {
                            type: "string",
                            description: "Refresh token of the user",
                            example:
                                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTFkMjA1YzY4OWY5YTRlNTQ3NmExYiIsImlhdCI6MTcyODI4NzYyMiwiZXhwIjoxNzI4ODkyNDIyfQ.4JvO53r6T_P7q-5bJvFOMOJh7VbQd57o4L9Oq_DQwE",
                        },
                    },
                },
                AuthResponse: {
                    type: "object",
                    properties: {
                        accessToken: {
                            type: "string",
                            description: "Access token of the user",
                            example:
                                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTFkMjA1YzY4OWY5YTRlNTQ3NmExYiIsImlhdCI6MTcyODI4NzYyMiwiZXhwIjoxNzI4ODkyNDIyfQ.4JvO53r6T_P7q-5bJvFOMOJh7VbQd57o4L9Oq_DQwE",
                        },
                        refreshToken: {
                            type: "string",
                            description: "Refresh token of the user",
                            example:
                                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTFkMjA1YzY4OWY5YTRlNTQ3NmExYiIsImlhdCI6MTcyODI4NzYyMiwiZXhwIjoxNzI4ODkyNDIyfQ.4JvO53r6T_P7q-5bJvFOMOJh7VbQd57o4L9Oq_DQwE",
                        },
                    },
                },
                CreatePostRequest: {
                    type: "object",
                    required: ["drinkName", "instructions", "owner"],
                    properties: {
                        drinkName: { type: "string", description: "Name of the drink", example: "My first drink name" },
                        instructions: {
                            type: "string",
                            description: "Instructions of the drink",
                            example: "Having a great day!",
                        },
                        drinkImage: {
                            type: "string",
                            description: "Image of the drink",
                            example: "drink.png",
                        },
                        owner: {
                            type: "string",
                            description: "User ID of the sender (User MongoDB ObjectId)",
                            example: "67a1d205c689f9a4e5476a1b",
                        },
                    },
                },
                UpdatePostRequest: {
                    type: "object",
                    properties: {
                        drinkName: { type: "string", description: "Name of the drink", example: "My first drink name" },
                        instructions: {
                            type: "string",
                            description: "Instructions of the drink",
                            example: "Having a great day!",
                        },
                        drinkImage: {
                            type: "string",
                            description: "Image of the drink",
                            example: "drink.png",
                        },
                        owner: {
                            type: "string",
                            description: "User ID of the sender (User MongoDB ObjectId)",
                            example: "67a1d205c689f9a4e5476a1b",
                        },
                    },
                },
                CreateUserRequest: {
                    type: "object",
                    required: ["email", "password", "username"],
                    properties: {
                        email: { type: "string", description: "Email of the user", example: "yona.amit@gmail.com" },
                        password: { type: "string", description: "Password of the user", example: "yonyon123!" },
                        username: { type: "string", description: "Username of the user", example: "yonaamit" },
                    },
                },
                UpdateUserRequest: {
                    type: "object",
                    properties: {
                        email: { type: "string", description: "Email of the user", example: "yona.amit@gmail.com" },
                        password: { type: "string", description: "Password of the user", example: "yonyon123!" },
                        username: { type: "string", description: "Username of the user", example: "yonaamit" },
                    },
                },
                InternalServerError: {
                    type: "object",
                    properties: {
                        message: { type: "string", description: "Error message", example: "Internal server error" },
                    },
                },
                BadRequestError: {
                    type: "object",
                    properties: {
                        message: { type: "string", description: "Error message", example: "Bad request" },
                    },
                },
                InvalidIdError: {
                    type: "object",
                    properties: {
                        message: { type: "string", description: "Error message", example: "Invalid ID" },
                    },
                },
                NotFoundError: {
                    type: "object",
                    properties: {
                        message: { type: "string", description: "Error message", example: "Not found" },
                    },
                },
                UnauthorizedError: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "Error message",
                            example: "Authentication token is required",
                        },
                    },
                },
                ForbiddenError: {
                    type: "object",
                    properties: {
                        message: { type: "string", description: "Error message", example: "Forbidden" },
                    },
                },
            },
            responses: {
                InternalServerError: {
                    description: "Internal server error",
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/InternalServerError" } },
                    },
                },
                BadRequestError: {
                    description: "Bad request",
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/BadRequestError" } },
                    },
                },
                InvalidIdError: {
                    description: "Invalid ID",
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/InvalidIdError" } },
                    },
                },
                NotFoundError: {
                    description: "Not found",
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/NotFoundError" } },
                    },
                },
                UnauthorizedError: {
                    description: "Unauthorized",
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/UnauthorizedError" } },
                    },
                },
                ForbiddenError: {
                    description: "Forbidden",
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/ForbiddenError" } },
                    },
                },
            },
        },
    },
    apis: ["./src/express/**/*.ts"],
};

export const initializeSwagger = (app: Express) => {
    const swaggerSpec = swaggerJSDoc(swaggerOptions);

    app.use(server.swaggerUrl, swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};
