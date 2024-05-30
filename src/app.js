const Hapi = require("@hapi/hapi");
const Routes = require("./routes");
const sequelize = require("./config/database");
const hapiAuthJwt = require("hapi-auth-jwt2");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");

const User = require("./model/user");
const Ekspensi = require("./model/ekspensi");

const validate = async (decoded) => {
  return { isValid: true, credentials: decoded.payload };
};

const swaggerOptions = {
  info: {
    title: "Test API Documentation",
  },
};

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    hapiAuthJwt,
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  server.auth.strategy("user-access-control", "jwt", {
    key: process.env.ACCESS_TOKEN_SECRET || "access_token_secret",
    cookieKey: "access_token",
    headerKey: false,
    validate: validate,
    verify: {
      nbf: true,
      exp: true,
    },
    verifyOptions: { algorithms: ["HS256"] }, // Specify the algorithms used to verify the JWT
  });

  server.route(Routes);

  try {
    await Promise.all([sequelize.authenticate(), syncModel(), server.start()]);

    console.log("Connection has been established successfully.");
    console.log("Server running on %s", server.info.uri);
  } catch (error) {
    console.log("error:", error.message);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

const syncModel = async () => {
  try {
    await Promise.all([User.sync(), Ekspensi.sync()]);
  } catch (error) {
    console.log("error:", error.message);
  }
};

init();
