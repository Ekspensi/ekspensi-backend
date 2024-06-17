import { nanoid } from "nanoid";
import Ekspensi from "../model/ekspensi.js";
import { badRequest, internal } from "@hapi/boom";

const getEkspensi = async (request, h) => {};

const insertEkspensi = async (request, h) => {
  try {
    const payload = request.payload;
    if (!payload) {
      return badRequest("please provide the data");
    }

    const { username } = request.auth.credentials;
    const { data } = payload;

    if (!data) {
      return badRequest("please provide the data");
    }

    const id = nanoid(8);
    const predict = request.server.app.models.ml.nlp.predict(data);

    if (predict.label === "error") {
      return badRequest(predict.text);
    }

    const ekspensi = {
      id,
      username,
      data,
      datetime: new Date().toISOString(),
      deskripsi: predict.text,
      nominal: predict.price,
      klasifikasi: predict.label,
      created_at: new Date().toISOString(),
      updated_at: null,
    };

    await Ekspensi.create(ekspensi);

    delete ekspensi.username;

    return h
      .response({
        statusCode: 201,
        message: "data created successfully",
        error: null,
        data: ekspensi,
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

export { insertEkspensi, getEkspensi };
