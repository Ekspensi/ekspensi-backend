import { badRequest, internal } from "@hapi/boom";
import { generateToken } from "../helpers/jwt.js";
import { validatePassword } from "../helpers/passwordUtility.js";
import User from "../model/user.js";

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
      phonenum: user.phonenum,
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

export { signInHandler, signOutHandler };
