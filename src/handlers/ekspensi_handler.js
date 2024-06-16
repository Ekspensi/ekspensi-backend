// Import modules
import { nanoid } from "nanoid";
import Ekspensi from "../model/ekspensi.js";

const insertEkspensi = async (request, h) => {
  const { data } = request.payload;
  const { username } = request.auth.credentials;

  if (!data) {
    return h
      .response({
        message: "please fill the data",
        status: "fail",
        data: {},
      })
      .code(400);
  }

  try {
    const id = nanoid(8);

    const predict = request.server.app.models.ml.nlp.predict(data);

    //   console.log(predict)

    await Ekspensi.create({
      id,
      username,
      data,
      datetime: new Date().toISOString(),
      deskripsi: predict.text,
      nominal: predict.price,
      klasifikasi: predict.label,
      created_at: new Date().toISOString(),
      updated_at: null,
    });

    return h
      .response({
        message: "data created successfully",
        status: "success",
        data: {
          data,
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

export { insertEkspensi };
