import { StatusCodes } from "http-status-codes";
import { ServerError } from "../../utils/errors";
import { UserModel } from "../users/model";
import { ILoginData, IRegisterData, IAuthResponse, ITokenInfo } from "./interface";
import { comparePasswords, encryptPassword, generateTokens, verifyRefreshToken } from "../../utils/auth";
import { OAuth2Client } from "google-auth-library";
import config from "../../config";
import { Request } from "express";
import { IMongoUser } from "../users/interface";

const client = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    undefined // redirect URI not needed for token exchange
);

export class AuthManager {
    static register = async (registerData: IRegisterData): Promise<IAuthResponse> => {
        const { email, password, username, image } = registerData;
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            throw new ServerError(StatusCodes.BAD_REQUEST, "User already registered");
        }

        const encryptedPassword = await encryptPassword(password);
        const newUser = await UserModel.create({
            email,
            username,
            password: encryptedPassword,
            ...(image && { image }),
            refreshTokens: [],
        });
        const { accessToken, refreshToken } = generateTokens(newUser._id.toString());
        newUser.refreshTokens.push(refreshToken);
        await newUser.save();

        return { accessToken, refreshToken, user: newUser };
    };

    static login = async (loginData: ILoginData): Promise<IAuthResponse> => {
        const { email, password } = loginData;
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw new ServerError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
        }

        await comparePasswords(password, user.password);

        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        user.refreshTokens.push(refreshToken);
        await user.save();

        return { accessToken, refreshToken, user };
    };

    static logout = async (refreshToken: string, userFromToken: ITokenInfo): Promise<{ message: string }> => {
        const user = await UserModel.findById(userFromToken._id);

        if (!user) {
            throw new ServerError(StatusCodes.NOT_FOUND, "User not found");
        }

        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);

        await user.save();

        return { message: "Logout successful" };
    };

    static refreshToken = async (refreshToken: string): Promise<IAuthResponse> => {
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch {
            throw new ServerError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
        }

        const user = await UserModel.findById(decoded._id);

        if (!user) throw new ServerError(StatusCodes.NOT_FOUND, "User not found");

        if (!user.refreshTokens.includes(refreshToken)) {
            await UserModel.updateOne({ _id: user._id }, { $set: { refreshTokens: [] } });

            throw new ServerError(StatusCodes.UNAUTHORIZED, "Refresh token has been revoked");
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());
        const newTokens = user.refreshTokens.filter((token: string) => token !== refreshToken);
        newTokens.push(newRefreshToken);
        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            { $set: { refreshTokens: newTokens } },
            { new: true }
        )
            .lean()
            .exec();

        return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: updatedUser! };
    };

    static loginGoogle = async (req: Request): Promise<IAuthResponse> => {
        const { code } = req.body;

        if (!code) {
            throw new ServerError(StatusCodes.BAD_REQUEST, "Authorization code is required");
        }

        try {
            const ticket = await client.verifyIdToken({
                idToken: code,
                audience: config.google.clientId,
            });
            const payload = ticket.getPayload();
            const email = payload?.email;

            if (!payload || !email) {
                throw new ServerError(StatusCodes.BAD_REQUEST, "Invalid token payload: email not found");
            }

            let user: IMongoUser | null = await UserModel.findOne({ email });

            if (!user) {
                const username = payload.name || email.split("@")[0];
                user = await UserModel.create({
                    email,
                    username,
                    password: await encryptPassword(new Date().toISOString()),
                    refreshTokens: [],
                });
            }

            const { accessToken, refreshToken } = generateTokens(user._id.toString());
            user.refreshTokens.push(refreshToken);
            await user.save();

            return { accessToken, refreshToken, user };
        } catch (error) {
            if (error instanceof ServerError) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : "Invalid authorization code";
            throw new ServerError(StatusCodes.UNAUTHORIZED, `Google authentication failed: ${errorMessage}`);
        }
    };
}
