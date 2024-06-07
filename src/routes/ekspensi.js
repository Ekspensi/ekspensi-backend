const { nanoid } = require("nanoid");

const Ekspensi = require("../model/ekspensi");

module.exports = [
  {
    method: "POST",
    path: "/ekspensi",
    options: {
      tags: ["api"],
    },
    handler: async (request, h) => {
      const { data, deskripsi, nominal, klasifikasi } = request.payload;

      if (!data || !deskripsi || !nominal || !klasifikasi) {
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

        await Ekspensi.create({
          id,
          data,
          datetime: new Date().toISOString(),
          deskripsi,
          nominal,
          klasifikasi,
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
    },
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
