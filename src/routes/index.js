import auth from "./auth.js";
import user from "./user.js";
import ekspensi from "./ekspensi.js";
import dashboard from "./dashboard.js";

export default [
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
  ...dashboard,
];
