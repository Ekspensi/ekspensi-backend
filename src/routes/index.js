const auth = require("./auth");
const user = require("./user");
const ekspensi = require("./ekspensi");

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
  ...ekspensi,
];
