const { badRequest, internal } = require("@hapi/boom");
const { generateToken } = require("../helpers/jwt");
const { validatePassword } = require("../helpers/passwordUtility");
const User = require("../model/user");

const signInHandler = async (request, h) => {
  if (request.payload === null) {
    return badRequest("please fill the required fields");
  }

  const { username, password } = request.payload;
  if (!username || !password) {
    return badRequest("invalid username or password");
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (user === null) {
      return badRequest("invalid username or password");
    }

    const isValidPassword = validatePassword(
      password,
      user.password_hash,
      user.password
    );

    if (!isValidPassword) {
      return badRequest("invalid username or password");
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
        statusCode: 200,
        message: "user has been authenticated",
        error: null,
        data: {
          access_token: jwt,
        },
      })
      .code(200);
  } catch (error) {
    return internal(error.message);
  }
};

const signOutHandler = async (_, h) => {
  h.unstate("access_token");
  return h
    .response({
      statusCode: 200,
      message: "user has been un-authenticated",
      error: null,
      data: null,
    })
    .code(200);
};

module.exports = { signInHandler, signOutHandler };