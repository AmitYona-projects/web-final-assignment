module.exports = {
    apps: [
        {
            name: "cocktail-generator-backend",
            cwd: "/home/node08/finalProject/web-final-assignment/backend",
            script: "dist/index.js",
            interpreter: "/usr/bin/node",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            max_restarts: 10,
            env_file: ".env",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};