import bcrypt from "bcrypt";
import { DocumentNotFoundError, ServerError } from "../../utils/errors";
import { logger } from "../../utils/logger";
import { IMongoUser, IUser } from "./interface";
import { UserModel } from "./model";
import config from "../../config";
import { StatusCodes } from "http-status-codes";

export class UserManager {
    static getAllUsers = async (): Promise<IMongoUser[]> => {
        return UserModel.find().lean().exec();
    };

    static getUserById = async (id: string): Promise<IMongoUser> => {
        return UserModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    };

    static generateEncryptedPassword = async (password: string): Promise<string> => {
        try {
            const salt = await bcrypt.genSalt(config.auth.saltRounds);
            const encryptedPassword = await bcrypt.hash(password, salt);

            return encryptedPassword;
        } catch (error) {
            throw new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, "Error when trying to encrypt password", error);
        }
    };

    static createUser = async (user: IUser): Promise<IMongoUser | null> => {
        try {
            const encryptedPassword = await this.generateEncryptedPassword(user.password);

            return UserModel.create({
                ...user,
                password: encryptedPassword,
            });
        } catch (error) {
            logger.error("Error on create user: ", error);
            return null;
        }
    };

    static updateUserById = async (id: string, updateData: Partial<IUser>): Promise<IMongoUser | null> => {
        try {
            const userToUpdate = updateData;

            if (updateData.password) {
                const encryptedPassword = await this.generateEncryptedPassword(updateData.password);
                userToUpdate.password = encryptedPassword;
            }

            return UserModel.findByIdAndUpdate(id, userToUpdate, { new: true })
                .orFail(new DocumentNotFoundError(id))
                .lean()
                .exec();
        } catch (error) {
            logger.error("Error on updating user: ", error);
            return null;
        }
    };

    static deleteUserById = async (id: string): Promise<string> => {
        await UserModel.findByIdAndDelete(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        return `User ${id} deleted succesfully`;
    };
}
