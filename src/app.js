const Hapi = require("@hapi/hapi");
const Routes = require("./routes");
const sequelize = require('../config/database');
const User = require('../model/User');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  server.route(Routes);

  await server.start();
  console.log("Server running on %s", server.info.uri);

  sequelize.authenticate().then(()=>{
    server.listen(3000,()=> console.log(`Database connected successfully and app listening on port ${3000}`))
  })
  .catch((error)=>{
    console.log(error.message)
  });
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
