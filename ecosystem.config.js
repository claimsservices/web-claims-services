module.exports = {
  apps: [
    {
      name: "server",
      script: "./backend/server.js",
      env: {
        NODE_ENV: "development",
        DB_HOST: "localhost",
        DB_USER: "root",
        DB_PASS: "X2RNcUFE7z6mC8J",
        DB_NAME: "admin_portal",
        DB_PORT: "3306",
        PORT: "5400",
        JWT_SECRET: "your_jwt_secret"
      }
    }
  ]
};
