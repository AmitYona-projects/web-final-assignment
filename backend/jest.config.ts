/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["./jest.setup.ts"],
    roots: ["<rootDir>/src/tests/"],
    testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/src/tests/utils.ts"],
};
