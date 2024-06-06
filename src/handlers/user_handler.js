const { nanoid } = require("nanoid");
const { hashPassword } = require("../helpers/passwordUtility");

const User = require("../model/user");
const { badRequest, internal } = require("@hapi/boom");

const createNewUser = async (request, h) => {
  const { username, password, phonenum, email } = request.payload;

  if (!username || !password || !phonenum || !email) {
    return badRequest("please fill all required fields");
  }

  try {
    const id = nanoid(8);
    const { hashedPassword, salt } = hashPassword(password);

    await User.create({
      id,
      username,
      password: hashedPassword,
      password_hash: salt,
      phonenum,
      email,
      created_at: new Date().toISOString(),
      updated_at: null,
    });

    return h
      .response({
        message: "user created successfully",
        status: "success",
        data: {
          username,
        },
      })
      .code(201);
  } catch (error) {
    switch (error.name) {
      case "SequelizeUniqueConstraintError":
        return badRequest(error.errors[0].message);
      default:
        return internal(error.message);
    }
  }
};

const getCurrentUser = async (request, h) => {
  try {
    const user = await User.findOne({
      where: { username: request.auth.credentials.username },
    });

    if (user === null) {
      return badRequest("user not found");
    }

    return h
      .response({
        statusCode: 200,
        message: "users retrieved successfully",
        error: null,
        data: {
          username: user.username,
          phonenum: user.phonenum,
          email: user.email,
        },
      })
      .code(200);
  } catch (error) {
    return internal(error.message);
  }
};

module.exports = { createNewUser, getCurrentUser };
