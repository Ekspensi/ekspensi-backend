const Hapi = require("@hapi/hapi");
const Routes = require("./routes");
const sequelize = require("./config/database");
// const User = require("./model/User");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
  });

  server.route(Routes);

  try {
    await Promise.all([sequelize.validate({ logging: false }), server.start()]);

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

init();
