import { nanoid } from "nanoid";
import sequelize from "../config/database.js";

import Ekspensi from "../model/ekspensi.js";
import { badRequest, internal } from "@hapi/boom";

const getEkspensiById = async (request, h) => {
  try {
    const data = await Ekspensi.findOne({
      where: {
        id: request.params.id,
        username: request.auth.credentials.username,
      },
    });

    if (!data) {
      return notFound("make sure the id is correct or the data is exist");
    }

    return h.response({
      statusCode: 200,
      message: "data retrieved successfully",
      error: null,
      data,
    });
  } catch (e) {
    return internal(e.message);
  }
};

const getEkspensi = async (request, h) => {
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
        select
        row_number() over(partition by username order by created_at desc) no,
        *
        from ${Ekspensi.tableName} 
        where username = '${request.auth.credentials.username}'
        ${startDate ? `and created_at >= '${startDate}'` : ""}
        ${endDate ? `and created_at <= '${endDate}'` : ""}
        order by created_at desc
        offset ${(page - 1) * limit}
        limit ${limit}
      ),
      final as (
        select a.total_data, b.* from data_count a
        left join cte b on 1 = 1
      )

      select ${page} page, ${limit} "limit", 
      case 
        when total_data < ${(page - 1) * limit} then 0 
        when total_data - ${(page - 1) * limit} > ${limit} then ${limit}
        else (total_data - ${(page - 1) * limit}) end as count_data,
       total_data,
      json_agg(json_build_object(
        'no', no,
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
};

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

export { insertEkspensi, getEkspensi, getEkspensiById };
