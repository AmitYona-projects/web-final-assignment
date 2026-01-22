import request from "supertest";
import mongoose from "mongoose";
import { Application } from "express";
import { UserModel } from "../express/users/model";
import { PostModel } from "../express/posts/model";
import postsTests from "./posts_tests.json";
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

    await PostModel.deleteMany();
    await UserModel.deleteMany();
    loginedUserData = await getMockLoginUser(app);
});

afterAll((done) => {
    logger.info("afterAll");
    mongoose.connection.close();
    server.stop();
    done();
});

const baseUrl = config.test.posts.route;

let newPostId = "";
let user2AccessToken = "";

describe("posts tests", () => {
    test("get all posts", async () => {
        const response = await request(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });

    test("create new post", async () => {
        const response = await request(app)
            .post(baseUrl)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`)
            .send(postsTests[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(postsTests[0].title);
        expect(response.body.senderId).toBe(loginedUserData.user._id);
        expect(response.body.description).toBe(postsTests[0].description);
        newPostId = response.body._id;
    });

    test("get post by id", async () => {
        const response = await request(app).get(`${baseUrl}/${newPostId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(postsTests[0].title);
        expect(response.body.senderId).toBe(loginedUserData.user._id);
        expect(response.body.description).toBe(postsTests[0].description);
    });

    test("fails to get post by id that does not exist", async () => {
        const response = await request(app).get(`${baseUrl}/6961063225cff8afd58a093d`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("No Document found with id 6961063225cff8afd58a093d");
    });

    test("get post by userId", async () => {
        const response = await request(app)
            .get(`${baseUrl}/sender?senderId=${loginedUserData.user._id}`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe(postsTests[0].title);
        expect(response.body[0].description).toBe(postsTests[0].description);
    });

    test("fails to get post by userId that does not exist", async () => {
        const response = await request(app).get(`${baseUrl}/sender?senderId=6961063565cff8afd58a093d`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("No Document found with id 6961063565cff8afd58a093d");
    });

    test("update post", async () => {
        const response = await request(app)
            .put(`${baseUrl}/${newPostId}`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`)
            .send({ title: "updated title", description: "updated description" });
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe("updated title");
        expect(response.body.description).toBe("updated description");
    });

    test("fails to update post because it is not the user's own", async () => {
        const user2Data = await request(app).post("/auth/register").send({
            email: "user2@test.com",
            password: "user2password",
            username: "user2",
        });
        user2AccessToken = user2Data.body.accessToken;
        const response = await request(app)
            .put(`${baseUrl}/${newPostId}`)
            .set("Authorization", `Bearer ${user2AccessToken}`);
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("You are not allowed to update this post");
    });

    test("fails to delete post because it is not the user's own", async () => {
        const response = await request(app)
            .delete(`${baseUrl}/${newPostId}`)
            .set("Authorization", `Bearer ${user2AccessToken}`);
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("You are not allowed to delete this post");
    });

    test("delete post", async () => {
        const response = await request(app)
            .delete(`${baseUrl}/${newPostId}`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`);
        expect(response.statusCode).toBe(200);
        const response2 = await request(app)
            .get(`${baseUrl}/${newPostId}`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`);
        expect(response2.statusCode).toBe(404);
    });
});
