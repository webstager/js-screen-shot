module.exports = {
  // 使用ts-jest来处理ts代码
  preset: "ts-jest",
  // 输出每个测试用例执行的结果
  verbose: true,
  setupFiles: ["<rootDir>/tests/lib/application/setupDom.ts"],
  // 是否显示覆盖率报告
  collectCoverage: true,
  // 告诉 jest 哪些文件需要经过单元测试
  collectCoverageFrom: ["src/**/*.ts", "!src/lib/type/**/*.ts"],
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  coverageThreshold: {
    global: {
      statements: 0,
      functions: 0,
      branches: 0,
      lines: 0
    },
    "./src/lib/shared/canvas/CanvasElementHitTest.ts": {
      statements: 50,
      functions: 90,
      branches: 35,
      lines: 50
    },
    "./src/lib/shared/canvas/CanvasElementTransform.ts": {
      statements: 70,
      functions: 90,
      branches: 35,
      lines: 70
    },
    "./src/lib/shared/canvas/CanvasElementSelection.ts": {
      statements: 45,
      functions: 90,
      branches: 20,
      lines: 45
    },
    "./src/lib/shared/canvas/CanvasElementToolbarSync.ts": {
      statements: 85,
      functions: 90,
      branches: 40,
      lines: 85
    },
    "./src/store/dom/domDisposers.ts": {
      statements: 80,
      functions: 80,
      branches: 80,
      lines: 80
    }
  },
  // 需要忽略的目录
  testPathIgnorePatterns: ["/node_modules/", "/.rollup.cache/", "/tests/e2e/"],
  // 处理别名
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/tests/styleMock.ts",
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  // 运行时的环境
  testEnvironment: "jest-environment-jsdom"
};
