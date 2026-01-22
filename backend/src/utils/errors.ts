/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";

export class ServerError extends Error {
    constructor(
        public code: number,
        public message: string,
        public originalError?: any,
        public meta?: any
    ) {
        super();
    }

    public get responseJson() {
        return { ...this, originalError: undefined };
    }
}
export class DocumentNotFoundError extends ServerError {
    constructor(id: string) {
        super(StatusCodes.NOT_FOUND, `No Document found with id ${id}`);
    }
}
