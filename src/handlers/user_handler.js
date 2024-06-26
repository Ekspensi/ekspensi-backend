import { nanoid } from "nanoid";
import { hashPassword } from "../helpers/passwordUtility.js";
import User from "../model/user.js";
import { badRequest, internal } from "@hapi/boom";

const createNewUser = async (request, h) => {
  const { username, password, phonenum } = request.payload;

  if (!username || !password || !phonenum) {
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
      created_at: new Date().toISOString(),
      updated_at: null,
    });

    return h
      .response({
        statusCode: 201,
        message: "user created successfully",
        error: null,
        data: {
          username,
          phonenum,
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
        },
      })
      .code(200);
  } catch (error) {
    return internal(error.message);
  }
};

export { createNewUser, getCurrentUser };
