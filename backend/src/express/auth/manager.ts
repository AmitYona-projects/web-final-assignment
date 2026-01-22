import { StatusCodes } from "http-status-codes";
import { ServerError } from "../../utils/errors";
import { UserModel } from "../users/model";
import { ILoginData, IRegisterData, IAuthResponse, ITokenInfo } from "./interface";
import { comparePasswords, encryptPassword, generateTokens } from "../../utils/auth";

export class AuthManager {
    static register = async (registerData: IRegisterData): Promise<IAuthResponse> => {
        const { email, password, username } = registerData;
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            throw new ServerError(StatusCodes.BAD_REQUEST, "User already registered");
        }

        const encryptedPassword = await encryptPassword(password);
        const newUser = await UserModel.create({
            email,
            username,
            password: encryptedPassword,
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

    static refreshToken = async (refreshToken: string, userFromToken: ITokenInfo): Promise<IAuthResponse> => {
        const user = await UserModel.findById(userFromToken._id);

        if (!user) throw new ServerError(StatusCodes.NOT_FOUND, "User not found");

        if (!user.refreshTokens.includes(refreshToken)) {
            user.refreshTokens = [];
            await user.save();

            throw new ServerError(StatusCodes.UNAUTHORIZED, "Refresh token has been revoked");
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
    };
}
