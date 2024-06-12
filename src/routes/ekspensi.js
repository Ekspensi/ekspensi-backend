const Ekspensi = require("../model/ekspensi");

const { insertEkspensi } = require("../handlers/ekspensi_handler");

module.exports = [
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
