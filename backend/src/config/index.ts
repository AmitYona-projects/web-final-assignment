import env from "env-var";
import "./dotenv";

const config = {
    server: {
        port: env.get("SERVER_PORT").default(3000).asPortNumber(),
        swaggerUrl: env.get("SWAGGER_URL").default("/api-docs").asString(),
    },
    mongo: {
        url: env.get("MONGO_URL").default("mongodb://localhost:27017/").asUrlString(),
        postsCollectionName: env.get("POSTS_COLLECTION_NAME").default("posts").required().asString(),
        usersCollectionName: env.get("USERS_COLLECTION_NAME").default("users").required().asString(),
    },
    auth: {
        saltRounds: env.get("GEN_SALT_ROUNDS").default(10).asIntPositive(),
        jwtSecret: env.get("JWT_SECRET").default("yona-amit-secret-key").required().asString(),
        jwtRefreshSecret: env.get("JWT_REFRESH_SECRET").default("yona-amit-refresh-secret-key").required().asString(),
        accessTokenExpiration: env.get("ACCESS_TOKEN_EXPIRATION").default("15m").asString(),
        refreshTokenExpiration: env.get("REFRESH_TOKEN_EXPIRATION").default("7d").asString(),
        bearerPrefix: env.get("BEARER_PREFIX").default("Bearer ").asString(),
    },
    google: {
        clientId: env.get("GOOGLE_CLIENT_ID").required().asString(),
        clientSecret: env.get("GOOGLE_CLIENT_SECRET").asString(),
    },
    test: {
        posts: {
            route: "/posts",
        },
        users: {
            route: "/users",
        },
    },
};

export default config;
