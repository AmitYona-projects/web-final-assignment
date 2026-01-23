import request from "supertest";
import mongoose from "mongoose";
import { Application } from "express";
import { UserModel } from "../express/users/model";
import { initializeMongo } from "../utils/mongo";
import { Server } from "../express/server";
import config from "../config";
import { logger } from "../utils/logger";
import { generateAccessToken } from "../utils/auth";

let app: Application;
let server: Server;

beforeAll(async () => {
    logger.info("beforeAll - Auth Tests");
    await initializeMongo();
    server = new Server(config.server.port);
    await server.start();
    app = server.expressApp;

    await UserModel.deleteMany();
});

afterAll((done) => {
    logger.info("afterAll - Auth Tests");
    mongoose.connection.close();
    server.stop();
    done();
});

const testUser = {
    email: "auth-test@test.com",
    username: "authtestuser",
    password: "TestPassword123!",
};

const authBaseUrl = "/auth";

describe("Authentication API Tests", () => {
    let accessToken = "";
    let refreshToken = "";

    describe("User Registration", () => {
        test("registers a new user successfully", async () => {
            const response = await request(app).post(`${authBaseUrl}/register`).send(testUser);

            expect(response.statusCode).toBe(201);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.user.username).toBe(testUser.username);

            accessToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
        });

        test("fails to register with existing email", async () => {
            const response = await request(app).post(`${authBaseUrl}/register`).send(testUser);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toContain("already registered");
        });

        test("fails to register without email", async () => {
            const response = await request(app).post(`${authBaseUrl}/register`).send({
                username: "newuser",
                password: "password123",
            });

            expect(response.statusCode).toBe(400);
        });

        test("fails to register without password", async () => {
            const response = await request(app).post(`${authBaseUrl}/register`).send({
                email: "newuser@test.com",
                username: "newuser",
            });

            expect(response.statusCode).toBe(400);
        });

        test("fails to register without username", async () => {
            const response = await request(app).post(`${authBaseUrl}/register`).send({
                email: "newuser@test.com",
                password: "password123",
            });

            expect(response.statusCode).toBe(400);
        });

        test("fails to register with invalid email format", async () => {
            const response = await request(app).post(`${authBaseUrl}/register`).send({
                email: "invalid-email",
                username: "newuser",
                password: "password123",
            });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("User Login", () => {
        test("logs in successfully with correct credentials", async () => {
            const response = await request(app).post(`${authBaseUrl}/login`).send({
                email: testUser.email,
                password: testUser.password,
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(testUser.email);

            accessToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
        });

        test("fails to login with incorrect password", async () => {
            const response = await request(app).post(`${authBaseUrl}/login`).send({
                email: testUser.email,
                password: "wrongpassword",
            });

            expect(response.statusCode).toBe(401);
            expect(response.body.message).toContain("Invalid email or password");
        });

        test("fails to login with non-existent email", async () => {
            const response = await request(app).post(`${authBaseUrl}/login`).send({
                email: "nonexistent@test.com",
                password: "password123",
            });

            expect(response.statusCode).toBe(401);
            expect(response.body.message).toContain("Invalid email or password");
        });

        test("fails to login without email", async () => {
            const response = await request(app).post(`${authBaseUrl}/login`).send({
                password: "password123",
            });

            expect(response.statusCode).toBe(400);
        });

        test("fails to login without password", async () => {
            const response = await request(app).post(`${authBaseUrl}/login`).send({
                email: testUser.email,
            });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("Token Refresh", () => {
        test("refreshes tokens successfully", async () => {
            const response = await request(app)
                .post(`${authBaseUrl}/refresh-token`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    refreshToken: refreshToken,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
        });
        test("fails to refresh with invalid refresh token", async () => {
            const response = await request(app).post(`${authBaseUrl}/refresh-token`).send({
                refreshToken: "invalid_refresh_token",
            });

            expect(response.statusCode).toBe(401);
        });

        test("fails to refresh without refresh token", async () => {
            const response = await request(app)
                .post(`${authBaseUrl}/refresh-token`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({});

            expect(response.statusCode).toBe(400);
        });

        test("fails to refresh with revoked refresh token", async () => {
            await request(app).post(`${authBaseUrl}/logout`).send({
                refreshToken: refreshToken,
            });
            const response = await request(app).post(`${authBaseUrl}/refresh-token`).send({
                refreshToken: refreshToken,
            });

            expect(response.statusCode).toBe(401);
        });

        test("refreshes tokens and old refresh token becomes invalid", async () => {
            const loginResponse = await request(app).post(`${authBaseUrl}/login`).send({
                email: testUser.email,
                password: testUser.password,
            });

            const oldRefreshToken = loginResponse.body.refreshToken;
            const refreshResponse = await request(app)
                .post(`${authBaseUrl}/refresh-token`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    refreshToken: oldRefreshToken,
                });
            expect(refreshResponse.statusCode).toBe(200);

            const response = await request(app).post(`${authBaseUrl}/refresh-token`).send({
                refreshToken: oldRefreshToken,
            });
            expect(response.statusCode).toBe(401);
        });

        test("fails to refresh token by non existing user in token", async () => {
            const nonExistingUserToken = generateAccessToken("6963689b3eefc42e308714bc");
            const response = await request(app)
                .post(`${authBaseUrl}/refresh-token`)
                .set("Authorization", `Bearer ${nonExistingUserToken}`)
                .send({ refreshToken: refreshToken });
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("User not found");
        });

        test("fails to refresh token by revoked refresh token", async () => {
            await request(app).post(`${authBaseUrl}/logout`).set("Authorization", `Bearer ${accessToken}`).send({
                refreshToken: refreshToken,
            });
            const response = await request(app)
                .post(`${authBaseUrl}/refresh-token`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    refreshToken: refreshToken,
                });

            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe("Refresh token has been revoked");
        });
    });

    describe("User Logout", () => {
        let logoutRefreshToken = "";

        beforeAll(async () => {
            const loginResponse = await request(app).post(`${authBaseUrl}/login`).send({
                email: testUser.email,
                password: testUser.password,
            });

            logoutRefreshToken = loginResponse.body.refreshToken;
        });

        test("logs out successfully with valid refresh token", async () => {
            const response = await request(app)
                .post(`${authBaseUrl}/logout`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    refreshToken: logoutRefreshToken,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toContain("Logout successful");
        });

        test("fails to logout without refresh token", async () => {
            const response = await request(app)
                .post(`${authBaseUrl}/logout`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({});

            expect(response.statusCode).toBe(400);
        });

        test("fails to use refresh token after logout", async () => {
            const response = await request(app).post(`${authBaseUrl}/refresh-token`).send({
                refreshToken: logoutRefreshToken,
            });
            expect(response.statusCode).toBe(401);
        });

        test("can login again after logout", async () => {
            const response = await request(app).post(`${authBaseUrl}/login`).send({
                email: testUser.email,
                password: testUser.password,
            });
            expect(response.statusCode).toBe(200);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
        });

        test("fails to logout by non existing user in token", async () => {
            const nonExistingUserToken = generateAccessToken("6963689b3eefc42e308714bc");
            const response = await request(app)
                .post(`${authBaseUrl}/logout`)
                .set("Authorization", `Bearer ${nonExistingUserToken}`)
                .send({
                    refreshToken: logoutRefreshToken,
                });
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("User not found");
        });
    });
});
