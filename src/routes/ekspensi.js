import Ekspensi from "../model/ekspensi.js";
import * as ocr from "@paddle-js-models/ocr";

import { insertEkspensi } from "../handlers/ekspensi_handler.js";

export default [
  {
    method: "POST",
    path: "/ekspensi/ocr",
    handler: async (request, h) => {
      try {
        const { image } = request.payload;

        // await ocr.init();
        // const res = await ocr.recognize(image);

        // console.log(res);

        return h
          .response({
            message: "data retrieved successfully",
            status: "success",
            data: null,
          })
          .code(200);
      } catch (e) {
        return h
          .response({
            message: e.message,
            status: "fail",
            data: {},
          })
          .code(500);
      }
    },
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        maxBytes: 1048576,
      },
    },
  },
  {
    method: "POST",
    path: "/ekspensi",
    options: {
      tags: ["api"],
      auth: "user-access-control",
    },
    handler: insertEkspensi,
  },
  {
    method: "GET",
    path: "/ekspensi",
    options: {
      tags: ["api"],
    },
    handler: async (request, h) => {
      try {
        const ekspensi = await Ekspensi.findAll();

        if (ekspensi.length === 0) {
          return h
            .response({
              message: "data not found",
              status: "fail",
              data: {},
            })
            .code(404);
        }

        return h
          .response({
            message: "data retrieved successfully",
            status: "success",
            data: ekspensi,
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
];
