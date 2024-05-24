const auth = require("./auth");
const user = require("./user");

module.exports = [
  {
    method: "GET",
    path: "/",
    handler: () => {
      return "Server is up and running!";
    },
  },
  ...auth,
  ...user,
];
