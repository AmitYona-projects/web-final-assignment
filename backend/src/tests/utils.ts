import { IUser } from "../express/users/interface";
import { Application } from "express";
import request from "supertest";
import { IAuthResponse } from "../express/auth/interface";

export const mockUser: IUser = {
    username: "testuser",
    email: "testuser@test.com",
    password: "testpassword",
    refreshTokens: [],
};

export const getMockLoginUser = async (app: Application): Promise<IAuthResponse> => {
    const registerResponse = await request(app).post("/auth/register").send({
        email: mockUser.email,
        password: mockUser.password,
        username: mockUser.username,
    });

    if (registerResponse.statusCode !== 201) {
        throw new Error("Failed to register user");
    }

    const loginResponse = await request(app).post("/auth/login").send({
        email: mockUser.email,
        password: mockUser.password,
    });

    return {
        accessToken: loginResponse.body.accessToken,
        refreshToken: loginResponse.body.refreshToken,
        user: loginResponse.body.user,
    };
};
