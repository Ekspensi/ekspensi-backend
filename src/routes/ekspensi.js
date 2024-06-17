import Joi from "joi";

import Ekspensi from "../model/ekspensi.js";
import { insertEkspensi } from "../handlers/ekspensi_handler.js";
import { max } from "@tensorflow/tfjs-node";
import sequelize from "../config/database.js";
import { badRequest } from "@hapi/boom";

export default [
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
    path: "/ekspensi",
    options: {
      tags: ["api"],
      auth: "user-access-control",
      validate: {
        failAction: (request, h, err) => {
          throw badRequest(err.message);
        },
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
    },
    handler: async (request, h) => {
      try {
        const {
          limit = 10,
          page = 1,
          startDate = null,
          endDate = null,
        } = request.query;

        const [data] = await sequelize.query(`
          with data_count as (
            select count(*)::integer total_data from ${Ekspensi.tableName}
              where username = '${request.auth.credentials.username}'
              ${startDate ? `and created_at >= '${startDate}'` : ""}
              ${endDate ? `and created_at <= '${endDate}'` : ""}
          ),
          cte as (
            select *
            from ${Ekspensi.tableName} 
            where username = '${request.auth.credentials.username}'
            ${startDate ? `and created_at >= '${startDate}'` : ""}
            ${endDate ? `and created_at <= '${endDate}'` : ""}
            offset ${(page - 1) * limit}
            limit ${limit}
          ),
          final as (
            select a.total_data, b.* from data_count a
            left join cte b on 1 = 1
          )

          select ${page} page, ${limit} "limit", 
          case when total_data < ${
            (page - 1) * limit
          } then 0 else (total_data - ${(page - 1) * limit}) end as count_data,
           total_data,
          json_agg(json_build_object(
            'id', id,
            'data', data,
            'deskripsi', deskripsi,
            'nominal', nominal,
            'klasifikasi', klasifikasi,
            'created_at', created_at,
            'updated_at', updated_at
          )) data
          from final
          group by total_data
          `);

        return h
          .response({
            statusCode: 200,
            message: "data retrieved successfully",
            error: null,
            data: {
              page: parseInt(page),
              limit,
              count_data: data[0]?.count_data || 0,
              total_data: data[0]?.total_data || 0,
              data:
                data[0]?.data &&
                data[0]?.data.length > 0 &&
                data[0]?.data[0].id !== null
                  ? data[0]?.data
                  : [],
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
    },
  },
];
