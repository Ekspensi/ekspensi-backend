import { internal } from "@hapi/boom";
import sequelize from "../../config/database.js";
import Ekspensi from "../../model/ekspensi.js";
import EkspensiClassification from "../../model/ekspensi_classification.js";

const overviewClassification = async (request, h) => {
  try {
    const { username } = request.auth.credentials;
    let { period } = request.query;

    if (!period) {
      const currentDate = new Date();
      period = parseInt(
        currentDate.getFullYear().toString() +
          (currentDate.getMonth() + 1).toString().padStart(2, "0")
      );
    }

    const [data] = await sequelize.query(`
    SELECT 
    a.id,
    coalesce(a.klasifikasi, 'tidak teridentifikasi') as klasifikasi,
    count(distinct b.id)::integer freq_trx,
    coalesce(sum(nominal), 0)::decimal(32,2) vol_trx
    FROM ${EkspensiClassification.tableName} a
    FULL OUTER JOIN (
        select id, klasifikasi, nominal from ${Ekspensi.tableName}
        where username = '${username}'
        and to_char(created_at, 'yyyymm') = '${period}'
    ) b ON a.klasifikasi = b.klasifikasi
    group by a.id, a.klasifikasi
    `);

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

const overviewSummaryLastMonth = async (request, h) => {
  try {
    const { username } = request.auth.credentials;

    const currentDate = new Date();
    const dateStart = parseInt(
      currentDate.getFullYear().toString() +
        (currentDate.getMonth() + 1).toString().padStart(2, "0")
    );
    const previousDate = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1)
    );
    const dateEnd = parseInt(
      previousDate.getFullYear().toString() +
        (previousDate.getMonth() + 1).toString().padStart(2, "0")
    );

    const [data] = await sequelize.query(`
      with overview as (
        select username,
        '${dateStart}' as "current_month",
        count(case when to_char(created_at, 'yyyymm') = '${dateStart}' then 1 end)::integer as "freq_trx_current_month",
        sum(case when to_char(created_at, 'yyyymm') = '${dateStart}' then nominal else 0 end)::decimal(32,2) as "vol_trx_current_month",
        '${dateEnd}' as "prev_month",
        count(case when to_char(created_at, 'yyyymm') = '${dateEnd}' then 1 end)::integer as "freq_trx_prev_month",
        sum(case when to_char(created_at, 'yyyymm') = '${dateEnd}' then nominal else 0 end)::decimal(32,2) as "vol_trx_prev_month"
        from ${Ekspensi.tableName}
        where username = '${username}'
        and to_char(created_at, 'yyyymm') <= '${dateStart}'
        and to_char(created_at, 'yyyymm') >= '${dateEnd}'
        group by username
      )

      select *,
      vol_trx_current_month - vol_trx_prev_month as "expenses_growth",
      case 
        when vol_trx_prev_month <> 0 then ROUND((vol_trx_current_month/vol_trx_prev_month)*100, 2)
        else 100 
      end as "expenses_growth_%"
      from overview
    `);

    return h.response({
      statusCode: 200,
      message: "data retrieved successfully",
      error: null,
      data: data[0],
    });
  } catch (e) {
    return internal(e.message);
  }
};

export { overviewClassification, overviewSummaryLastMonth };
