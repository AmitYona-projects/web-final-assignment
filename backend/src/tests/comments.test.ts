import request from "supertest";
import mongoose from "mongoose";
import { Application } from "express";
import { CommentModel } from "../express/comments/model";
import { UserModel } from "../express/users/model";
import commentsTests from "./comments_tests.json";
import { initializeMongo } from "../utils/mongo";
import { Server } from "../express/server";
import config from "../config";
import { logger } from "../utils/logger";
import { IAuthResponse } from "../express/auth/interface";
import { getMockLoginUser } from "./utils";

let app: Application;
let server: Server;
let loginedUserData: IAuthResponse;

beforeAll(async () => {
    logger.info("beforeAll");
    await initializeMongo();
    server = new Server(config.server.port);
    await server.start();
    app = server.expressApp;

    await CommentModel.deleteMany();
    await UserModel.deleteMany();
    loginedUserData = await getMockLoginUser(app);
});

afterAll((done) => {
    logger.info("afterAll");
    mongoose.connection.close();
    server.stop();
    done();
});

const baseUrl = config.test.comments.route;

let newCommentId = "";
let user2AccessToken = "";

describe("comments tests", () => {
    test("get all comments", async () => {
        const response = await request(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });

    test("create new comment", async () => {
        const response = await request(app)
            .post(baseUrl)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`)
            .send(commentsTests[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body.senderId).toBe(loginedUserData.user._id);
        expect(response.body.postId).toBe(commentsTests[0].postId);
        expect(response.body.commentText).toBe(commentsTests[0].commentText);
        newCommentId = response.body._id;
    });

    test("get comment by id", async () => {
        const response = await request(app).get(`${baseUrl}/${newCommentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.senderId).toBe(loginedUserData.user._id);
        expect(response.body.postId).toBe(commentsTests[0].postId);
        expect(response.body.commentText).toBe(commentsTests[0].commentText);
    });
    test("get comment by id that does not exist", async () => {
        const response = await request(app).get(`${baseUrl}/6961063225cff8afd58a093c`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("No Document found with id 6961063225cff8afd58a093c");
    });

    test("get comment by userId", async () => {
        const response = await request(app).get(`${baseUrl}?senderId=${loginedUserData.user._id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].postId).toBe(commentsTests[0].postId);
        expect(response.body[0].commentText).toBe(commentsTests[0].commentText);
    });

    test("get comments by postId", async () => {
        const response = await request(app).get(`${baseUrl}?postId=${commentsTests[0].postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].senderId).toBe(loginedUserData.user._id);
        expect(response.body[0].postId).toBe(commentsTests[0].postId);
        expect(response.body[0].commentText).toBe(commentsTests[0].commentText);
    });

    test("update comment", async () => {
        const response = await request(app)
            .put(`${baseUrl}/${newCommentId}`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`)
            .send({ commentText: "updated comment" });
        expect(response.statusCode).toBe(200);
        expect(response.body.commentText).toBe("updated comment");
    });

    test("fails to update comment because it is not the user's own", async () => {
        const user2Data = await request(app).post("/auth/register").send({
            email: "user2@test.com",
            password: "user2password",
            username: "user2",
        });
        user2AccessToken = user2Data.body.accessToken;
        const response = await request(app)
            .put(`${baseUrl}/${newCommentId}`)
            .set("Authorization", `Bearer ${user2AccessToken}`);
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("You are not allowed to update this comment");
    });

    test("fails to delete comment because it is not the user's own", async () => {
        const response = await request(app)
            .delete(`${baseUrl}/${newCommentId}`)
            .set("Authorization", `Bearer ${user2AccessToken}`);
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("You are not allowed to delete this comment");
    });

    test("delete comment", async () => {
        const response = await request(app)
            .delete(`${baseUrl}/${newCommentId}`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`);
        expect(response.statusCode).toBe(200);
        const response2 = await request(app).get(`${baseUrl}/${newCommentId}`);
        expect(response2.statusCode).toBe(404);
    });

    test("fails to delete comment because invalid token", async () => {
        const response = await request(app)
            .delete(`${baseUrl}/${newCommentId}`)
            .set("Authorization", "Bearer invalidToken");
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid authentication token");
    });
});
