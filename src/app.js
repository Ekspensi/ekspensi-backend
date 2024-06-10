const Hapi = require("@hapi/hapi");
const Routes = require("./routes");
const sequelize = require("./config/database");
const hapiAuthJwt = require("hapi-auth-jwt2");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");

const User = require("./model/user");
const Ekspensi = require("./model/ekspensi");
const NLPClassification = require("./helpers/nlp");

const validate = async (decoded) => {
  if (decoded.payload) {
    return { isValid: true, credentials: decoded.payload };
  }
  return { isValid: false };
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

  server.ext("onPreResponse", onPreResponse);

  await server.register([
    hapiAuthJwt,
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: "Ekspensi API Documentation",
          version: "1.0.0",
        },
      },
    },
  ]);

  server.auth.strategy("user-access-control", "jwt", {
    key: process.env.ACCESS_TOKEN_SECRET || "access_token_secret",
    cookieKey: null,
    headerKey: true,
    validate: validate,
    errorFunc: (ctx) => {
      console.log(ctx);
      if (ctx.scheme === "Token" && ctx.errorType === "unauthorized") {
        return {
          errorType: "unauthorized",
          message: ctx.message,
        };
      }

      return ctx;
    },
    verify: {
      nbf: true,
      exp: true,
    },
    verifyOptions: { algorithms: ["HS256"] },
  });

  server.route(Routes);

  try {
    await Promise.all([
      sequelize.authenticate({ retry: { timeout: 5000 } }),
      syncDbModels(),
      loadMlModels(server),
      server.start(),
    ]);

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

const syncDbModels = async () => {
  try {
    await Promise.all([User.sync(), Ekspensi.sync()]);
  } catch (error) {
    console.log("error:", error.message);
  }
};

const loadMlModels = async (server) => {
  server.app = {
    models: {
      ml: {
        nlp: await NLPClassification,
      },
    },
  };
};

const onPreResponse = (request, h) => {
  const response = request.response;
  if (response.isBoom) {
    const error = response.output.payload;
    return h.response(error).code(response.output.statusCode);
  }
  return h.continue;
};

init();
