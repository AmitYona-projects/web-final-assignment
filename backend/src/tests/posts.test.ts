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
import { buildFilter, buildSort } from "../express/posts/manager";
import { GeminiManager } from "../express/gemini/manager";

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

// ── buildSort unit tests ───────────────────────────────────────────────────

describe("buildSort", () => {
    test("returns newest-first sort when no argument is given", () => {
        expect(buildSort()).toEqual({ createdAt: -1 });
    });

    test("returns newest-first sort for unknown/unsupported sort string", () => {
        expect(buildSort("random")).toEqual({ createdAt: -1 });
    });

    test("returns oldest-first sort for 'oldest'", () => {
        expect(buildSort("oldest")).toEqual({ createdAt: 1 });
    });

    test("returns likes-desc sort for 'most-liked'", () => {
        expect(buildSort("most-liked")).toEqual({ likesCount: -1, createdAt: -1 });
    });

    test("returns comments-desc sort for 'most-commented'", () => {
        expect(buildSort("most-commented")).toEqual({ commentsCount: -1, createdAt: -1 });
    });
});

// ── buildFilter unit tests ─────────────────────────────────────────────────

describe("buildFilter", () => {
    let searchCategoriesSpy: jest.SpyInstance;

    beforeEach(() => {
        searchCategoriesSpy = jest.spyOn(GeminiManager, "searchCategories").mockResolvedValue([]);
    });

    afterEach(() => {
        searchCategoriesSpy.mockRestore();
    });

    test("returns empty filter and no aiCategories for empty params", async () => {
        const { filter, aiCategories } = await buildFilter({});
        expect(filter).toEqual({});
        expect(aiCategories).toBeUndefined();
    });

    test("merges baseFilter into the result", async () => {
        const { filter } = await buildFilter({}, { owner: "user123" });
        expect(filter).toMatchObject({ owner: "user123" });
    });

    test("adds case-insensitive drinkName regex for 'search' param", async () => {
        const { filter } = await buildFilter({ search: "mojito" });
        expect(filter.drinkName).toEqual({ $regex: "mojito", $options: "i" });
    });

    test("adds $in categories filter for 'categories' param", async () => {
        const { filter } = await buildFilter({ categories: ["sweet", "fruity"] });
        expect(filter.categories).toEqual({ $in: ["sweet", "fruity"] });
    });

    test("does NOT add categories filter when categories array is empty", async () => {
        const { filter } = await buildFilter({ categories: [] });
        expect(filter.categories).toBeUndefined();
    });

    test("adds likes existence filter for 'hasLikes: true'", async () => {
        const { filter } = await buildFilter({ hasLikes: true });
        expect(filter["likes.0"]).toEqual({ $exists: true });
    });

    test("does NOT add likes filter when 'hasLikes' is false", async () => {
        const { filter } = await buildFilter({ hasLikes: false });
        expect(filter["likes.0"]).toBeUndefined();
    });

    test("adds comments existence filter for 'hasComments: true'", async () => {
        const { filter } = await buildFilter({ hasComments: true });
        expect(filter["comments.0"]).toEqual({ $exists: true });
    });

    test("does NOT add comments filter when 'hasComments' is false", async () => {
        const { filter } = await buildFilter({ hasComments: false });
        expect(filter["comments.0"]).toBeUndefined();
    });

    test("combines multiple filter params in a single filter object", async () => {
        const { filter } = await buildFilter({
            search: "lemon",
            categories: ["sour"],
            hasLikes: true,
            hasComments: true,
        });
        expect(filter.drinkName).toEqual({ $regex: "lemon", $options: "i" });
        expect(filter.categories).toEqual({ $in: ["sour"] });
        expect(filter["likes.0"]).toEqual({ $exists: true });
        expect(filter["comments.0"]).toEqual({ $exists: true });
    });

    test("calls GeminiManager.searchCategories when aiPrompt is provided", async () => {
        searchCategoriesSpy.mockResolvedValue(["tropical", "sweet"]);

        await buildFilter({ aiPrompt: "something tropical" });

        expect(searchCategoriesSpy).toHaveBeenCalledTimes(1);
        expect(searchCategoriesSpy).toHaveBeenCalledWith("something tropical");
    });

    test("sets categories $in filter from AI results when aiPrompt matches categories", async () => {
        searchCategoriesSpy.mockResolvedValue(["tropical", "sweet"]);

        const { filter, aiCategories } = await buildFilter({ aiPrompt: "tropical vibes" });

        expect(filter.categories).toEqual({ $in: ["tropical", "sweet"] });
        expect(aiCategories).toEqual(["tropical", "sweet"]);
    });

    test("does NOT set categories filter when AI returns empty array for aiPrompt", async () => {
        searchCategoriesSpy.mockResolvedValue([]);

        const { filter, aiCategories } = await buildFilter({ aiPrompt: "something obscure" });

        expect(filter.categories).toBeUndefined();
        expect(aiCategories).toEqual([]);
    });

    test("aiPrompt takes precedence over manual categories param", async () => {
        searchCategoriesSpy.mockResolvedValue(["herbal"]);

        const { filter } = await buildFilter({
            aiPrompt: "herby drink",
            categories: ["sweet", "sour"],
        });

        expect(filter.categories).toEqual({ $in: ["herbal"] });
        expect(searchCategoriesSpy).toHaveBeenCalledTimes(1);
    });

    test("does NOT call GeminiManager when only manual categories are provided", async () => {
        await buildFilter({ categories: ["bitter"] });
        expect(searchCategoriesSpy).not.toHaveBeenCalled();
    });

    test("baseFilter is preserved alongside all built conditions", async () => {
        const { filter } = await buildFilter({ search: "rum", hasLikes: true }, { owner: "abc123" });
        expect(filter.owner).toBe("abc123");
        expect(filter.drinkName).toBeDefined();
        expect(filter["likes.0"]).toBeDefined();
    });
});

// ── integration tests ──────────────────────────────────────────────────────

describe("posts tests", () => {
    test("get all posts", async () => {
        const response = await request(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.posts.length).toBe(0);
        expect(response.body.total).toBe(0);
    });

    test("create new post", async () => {
        const response = await request(app)
            .post(baseUrl)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`)
            .send(postsTests[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body.drinkName).toBe(postsTests[0].drinkName);
        expect(response.body.owner).toBe(loginedUserData.user._id);
        expect(response.body.instructions).toBe(postsTests[0].instructions);
        newPostId = response.body._id;
    });

    test("get post by id", async () => {
        const response = await request(app).get(`${baseUrl}/${newPostId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.drinkName).toBe(postsTests[0].drinkName);
        expect(response.body.owner).toBe(loginedUserData.user._id);
        expect(response.body.instructions).toBe(postsTests[0].instructions);
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
        expect(response.body.posts.length).toBe(1);
        expect(response.body.posts[0].drinkName).toBe(postsTests[0].drinkName);
        expect(response.body.posts[0].instructions).toBe(postsTests[0].instructions);
    });

    test("returns empty array for get post by userId that does not exist", async () => {
        const response = await request(app).get(`${baseUrl}/sender?senderId=6961063565cff8afd58a093d`);
        expect(response.statusCode).toBe(200);
        expect(response.body.posts.length).toBe(0);
    });

    test("update post", async () => {
        const response = await request(app)
            .put(`${baseUrl}/${newPostId}`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`)
            .send({ drinkName: "updated drinkName", instructions: "updated instructions" });
        expect(response.statusCode).toBe(200);
        expect(response.body.drinkName).toBe("updated drinkName");
        expect(response.body.instructions).toBe("updated instructions");
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

    test("toggle like on a post", async () => {
        const response = await request(app)
            .post(`${baseUrl}/${newPostId}/like`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.likes).toContain(loginedUserData.user._id);
    });

    test("toggle like off a post", async () => {
        const response = await request(app)
            .post(`${baseUrl}/${newPostId}/like`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.likes).not.toContain(loginedUserData.user._id);
    });

    test("fails to toggle like without auth", async () => {
        const response = await request(app).post(`${baseUrl}/${newPostId}/like`);
        expect(response.statusCode).toBe(401);
    });

    test("add a comment to a post", async () => {
        const response = await request(app)
            .post(`${baseUrl}/${newPostId}/comments`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`)
            .send({ commentText: "Great cocktail!" });
        expect(response.statusCode).toBe(201);
        expect(response.body.comments.length).toBe(1);
        expect(response.body.comments[0].commentText).toBe("Great cocktail!");
    });

    test("fails to add comment without auth", async () => {
        const response = await request(app)
            .post(`${baseUrl}/${newPostId}/comments`)
            .send({ commentText: "No auth comment" });
        expect(response.statusCode).toBe(401);
    });

    test("fails to add comment without commentText", async () => {
        const response = await request(app)
            .post(`${baseUrl}/${newPostId}/comments`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`)
            .send({});
        expect(response.statusCode).toBe(400);
    });

    test("delete a comment from a post", async () => {
        const postResponse = await request(app).get(`${baseUrl}/${newPostId}`);
        const commentId = postResponse.body.comments[0]._id;

        const response = await request(app)
            .delete(`${baseUrl}/${newPostId}/comments/${commentId}`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.comments.length).toBe(0);
    });

    test("fails to delete comment without auth", async () => {
        await request(app)
            .post(`${baseUrl}/${newPostId}/comments`)
            .set("Authorization", `Bearer ${loginedUserData.accessToken}`)
            .send({ commentText: "Temp comment" });

        const postResponse = await request(app).get(`${baseUrl}/${newPostId}`);
        const commentId = postResponse.body.comments[0]._id;

        const response = await request(app).delete(`${baseUrl}/${newPostId}/comments/${commentId}`);
        expect(response.statusCode).toBe(401);
    });

    test("fails to delete comment by non-owner", async () => {
        const postResponse = await request(app).get(`${baseUrl}/${newPostId}`);
        const commentId = postResponse.body.comments[0]._id;

        const response = await request(app)
            .delete(`${baseUrl}/${newPostId}/comments/${commentId}`)
            .set("Authorization", `Bearer ${user2AccessToken}`);
        expect(response.statusCode).toBe(403);
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
