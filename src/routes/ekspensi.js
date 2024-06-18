import Joi from "joi";

import {
  getEkspensi,
  getEkspensiById,
  insertEkspensi,
} from "../handlers/ekspensi_handler.js";
import { badRequest } from "@hapi/boom";

export default [
  {
    method: "PUT",
    path: "/ekspensi/{id}",
    options: {
      tags: ["api"],
      auth: "user-access-control",
      description: `This route is used to update a record a.k.a ekspensi.`,
      notes: `This route is protected by user-access-control strategy.
      This route can only be accessed by authenticated user when the token is stored in authorization header.`,
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          data: Joi.string().required(),
        }),
      },
      handler: async (request, h) => {
        return h.response({
          statusCode: 501,
          message: "not implemented",
          error: "not implemented",
        });
      },
    },
  },
  {
    method: "POST",
    path: "/ekspensi",
    options: {
      tags: ["api"],
      auth: "user-access-control",
      description: `This route is used to create new record a.k.a ekspensi.`,
      notes: `This route is protected by user-access-control strategy.
      This route can only be accessed by authenticated user when the token is stored in authorization header.`,
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      response: {
        status: {
          201: Joi.object({
            statusCode: Joi.number().required(),
            message: Joi.string().required(),
            error: Joi.string().allow(null),
            data: Joi.object({
              id: Joi.string().required(),
              data: Joi.string().required(),
              datetime: Joi.string().required(),
              deskripsi: Joi.string().required(),
              nominal: Joi.number().required(),
              klasifikasi: Joi.string().required(),
              created_at: Joi.string().required(),
              updated_at: Joi.allow(null),
            }).label("ekspensi data response"),
          }).label("create ekspensi response"),
          400: Joi.object({
            statusCode: Joi.number().required(),
            error: Joi.string().required(),
            message: Joi.string().required(),
          }).label("bad request response"),
          401: Joi.object({
            statusCode: Joi.number().required(),
            error: Joi.string().required(),
            message: Joi.string().required(),
          }).label("unauthorized response"),
          500: Joi.object({
            statusCode: Joi.number().required(),
            error: Joi.string().required(),
            message: Joi.string().required(),
          }).label("internal server error response"),
        },
      },
    },
    handler: insertEkspensi,
  },
  {
    method: "GET",
    path: "/ekspensi/{id}",
    options: {
      tags: ["api"],
      auth: "user-access-control",
      description: `This route is used to get a record of the user.`,
      notes: `This route is protected by user-access-control strategy.
      This route can only be accessed by authenticated user when the token is stored in authorization header.`,
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
    handler: getEkspensiById,
  },
  {
    method: "GET",
    path: "/ekspensi",
    options: {
      tags: ["api"],
      auth: "user-access-control",
      description: `This route is used to get records of the user.`,
      notes: `This route is protected by user-access-control strategy.
      This route can only be accessed by authenticated user when the token is stored in authorization header.`,
      validate: {
        failAction: (request, h, err) => {
          throw badRequest(err.message);
        },
        headers: Joi.object({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
        query: Joi.object({
          limit: Joi.number().integer().min(1).max(25).default(10).messages({
            "number.base": "limit must be a number",
            "number.min": "limit must be at least 1",
            "number.max": "limit must be at most 25",
          }),
          page: Joi.number().integer().min(1).default(1).messages({
            "number.base": "page must be a number",
            "number.min": "page must be at least 1",
          }),
          startDate: Joi.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional()
            .messages({
              "string.pattern.base": "startDate must be in YYYY-MM-DD format",
            }),
          endDate: Joi.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional()
            .messages({
              "string.pattern.base": "endDate must be in YYYY-MM-DD format",
            }),
        }).options({ stripUnknown: true }),
      },
      response: {
        status: {
          400: Joi.object({
            statusCode: Joi.number().required(),
            message: Joi.string().required(),
            error: Joi.string().required(),
          }).label("bad request response"),
          401: Joi.object({
            statusCode: Joi.number().required(),
            message: Joi.string().required(),
            error: Joi.string().required(),
          }).label("bad request response"),
          200: Joi.object({
            statusCode: Joi.number().required(),
            message: Joi.string().required(),
            error: Joi.string().allow(null),
            data: Joi.object({
              page: Joi.number().required(),
              limit: Joi.number().required(),
              count_data: Joi.number().required(),
              total_data: Joi.number().required(),
              data: Joi.array()
                .items(
                  Joi.object({
                    no: Joi.number().required(),
                    id: Joi.string().required(),
                    data: Joi.string().required(),
                    deskripsi: Joi.string().required(),
                    nominal: Joi.number().required(),
                    klasifikasi: Joi.string().required(),
                    created_at: Joi.string().required(),
                    updated_at: Joi.allow(null),
                  })
                )
                .label("ekspensi data response"),
            }).label("ekspensi datas response"),
          }).label("get ekspensi response"),
        },
      },
    },
    handler: getEkspensi,
  },
];
