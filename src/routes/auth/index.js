const User = require("../../model/user");

const { validatePassword } = require("../../helpers/passwordUtility");
const { generateToken } = require("../../helpers/jwt");

module.exports = [
  {
    method: "POST",
    path: "/auth/signin",
    handler: async (request, h) => {
      if (request.payload === null) {
        return h
          .response({
            message: "Invalid username or password",
            status: "fail",
            data: {},
          })
          .code(400);
      }

      const { username, password } = request.payload;
      if (!username || !password) {
        return h
          .response({
            message: "Invalid username or password",
            status: "fail",
            data: {},
          })
          .code(400);
      }

      try {
        const user = await User.findOne({ where: { username } });

        if (user === null) {
          return h
            .response({
              message: "Invalid username or password",
              status: "fail",
              data: {},
            })
            .code(400);
        }

        const isValidPassword = validatePassword(
          password,
          user.password_hash,
          user.password
        );

        if (!isValidPassword) {
          return h
            .response({
              message: "Invalid username or password",
              status: "fail",
              data: {},
            })
            .code(400);
        }

        const jwt = generateToken({
          username: user.username,
          email: user.email,
          phonenum: user.phonenum,
        });

        // set http cookie
        h.state("access_token", jwt, {
          path: "/",
          isSecure: process.env.NODE_ENV === "production",
          isHttpOnly: true,
          isSameSite: "Lax",
          ttl: 1000 * 60 * 60 * 24,
        });

        return h
          .response({
            message: "Login successful",
            status: "success",
            data: {
              access_token: jwt,
            },
          })
          .code(200);
      } catch (error) {
        return h
          .response({
            message: error.message,
            status: "fail",
            data: {},
          })
          .code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/auth/signout",
    handler: async (request, h) => {
      h.unstate("access_token");

      return h
        .response({
          message: "Logout successful",
          status: "success",
          data: {},
        })
        .code(200);
    },
  },
];
