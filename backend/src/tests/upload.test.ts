/* eslint-disable @typescript-eslint/no-unused-vars */
import request from "supertest";
import mongoose from "mongoose";
import path from "path";
import { Application } from "express";
import { UserModel } from "../express/users/model";
import { initializeMongo } from "../utils/mongo";
import { Server } from "../express/server";
import config from "../config";

let app: Application;
let server: Server;

const avatarPath = path.join(__dirname, "avatar.png");

let userCounter = 0;
const uniqueUser = () => {
    userCounter += 1;
    return {
        email: `upload-test-${userCounter}@test.com`,
        username: `uploaduser${userCounter}`,
        password: "TestPassword123!",
    };
};

beforeAll(async () => {
    await initializeMongo();
    server = new Server(config.server.port);
    await server.start();
    app = server.expressApp;

    await UserModel.deleteMany();
});

afterAll((done) => {
    mongoose.connection.close();
    server.stop();
    done();
});

describe("File Upload Tests", () => {
    test("uploads a PNG and the file is accessible via its URL", async () => {
        const user = uniqueUser();
        try {
            const response = await request(app)
                .post("/auth/register")
                .field("email", user.email)
                .field("username", user.username)
                .field("password", user.password)
                .attach("image", avatarPath);

            expect(response.statusCode).toBe(201);

            const filename = response.body.user.image;
            expect(filename).toBeDefined();

            const res = await request(app).get(`/uploads/${filename}`);
            expect(res.statusCode).toBe(200);
        } catch (error) {
            expect(1).toEqual(2);
        }
    });

    test("uploads a JPEG and the file is accessible via its URL", async () => {
        const user = uniqueUser();
        try {
            const response = await request(app)
                .post("/auth/register")
                .field("email", user.email)
                .field("username", user.username)
                .field("password", user.password)
                .attach("image", avatarPath, { filename: "avatar.jpg", contentType: "image/jpeg" });

            expect(response.statusCode).toBe(201);

            const filename = response.body.user.image;
            expect(filename).toBeDefined();

            const res = await request(app).get(`/uploads/${filename}`);
            expect(res.statusCode).toBe(200);
        } catch (error) {
            expect(1).toEqual(2);
        }
    });

    test("uploads a WebP and the file is accessible via its URL", async () => {
        const user = uniqueUser();
        try {
            const response = await request(app)
                .post("/auth/register")
                .field("email", user.email)
                .field("username", user.username)
                .field("password", user.password)
                .attach("image", avatarPath, { filename: "avatar.webp", contentType: "image/webp" });

            expect(response.statusCode).toBe(201);

            const filename = response.body.user.image;
            expect(filename).toBeDefined();

            const res = await request(app).get(`/uploads/${filename}`);
            expect(res.statusCode).toBe(200);
        } catch (error) {
            expect(1).toEqual(2);
        }
    });

    test("rejects a PDF file with a descriptive error", async () => {
        const user = uniqueUser();
        try {
            const response = await request(app)
                .post("/auth/register")
                .field("email", user.email)
                .field("username", user.username)
                .field("password", user.password)
                .attach("image", avatarPath, { filename: "document.pdf", contentType: "application/pdf" });

            expect(response.statusCode).not.toBe(201);
            expect(response.body.message).toContain("Only PNG, JPG and WebP images are allowed");
        } catch (error) {
            expect(1).toEqual(2);
        }
    });

    test("rejects a GIF file with a descriptive error", async () => {
        const user = uniqueUser();
        try {
            const response = await request(app)
                .post("/auth/register")
                .field("email", user.email)
                .field("username", user.username)
                .field("password", user.password)
                .attach("image", avatarPath, { filename: "anim.gif", contentType: "image/gif" });

            expect(response.statusCode).not.toBe(201);
            expect(response.body.message).toContain("Only PNG, JPG and WebP images are allowed");
        } catch (error) {
            expect(1).toEqual(2);
        }
    });

    test("rejects a file larger than 5 MB", async () => {
        const user = uniqueUser();
        try {
            const bigBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 0x41);

            const response = await request(app)
                .post("/auth/register")
                .field("email", user.email)
                .field("username", user.username)
                .field("password", user.password)
                .attach("image", bigBuffer, { filename: "big.png", contentType: "image/png" });

            expect(response.statusCode).not.toBe(201);
        } catch (error) {
            expect(1).toEqual(2);
        }
    });
});
