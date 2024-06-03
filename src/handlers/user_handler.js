const { nanoid } = require("nanoid");
const { hashPassword } = require("../helpers/passwordUtility");

const User = require("../model/user");

const createNewUser = async (request, h) => {
  const { username, password, phonenum, email } = request.payload;

  if (!username || !password || !phonenum || !email) {
    return h
      .response({
        message: "please fill all required fields",
        status: "fail",
        data: {},
      })
      .code(400);
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
        return h
          .response({
            message: error.errors[0].message,
            status: "fail",
            data: {},
          })
          .code(400);
      default:
        return h
          .response({
            message: error.message,
            status: "fail",
            data: {},
          })
          .code(500);
    }
  }
};

const getCurrentUser = async (request, h) => {
  try {
    const user = await User.findOne({
      where: { username: request.auth.credentials.username },
    });

    if (user === null) {
      return h
        .response({
          message: "user not found",
          status: "fail",
          data: {},
        })
        .code(404);
    }

    return h
      .response({
        message: "users retrieved successfully",
        status: "success",
        data: {
          username: user.username,
          phonenum: user.phonenum,
          email: user.email,
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
};

module.exports = { createNewUser, getCurrentUser };
