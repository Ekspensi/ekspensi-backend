import Joi from "joi";
import {
  overviewClassification,
  overviewSummaryLastMonth,
} from "../handlers/dashboard/overview_handler.js";

export default [
  {
    method: "GET",
    path: "/dashboard/overview/summary/classification",
    options: {
      tags: ["api"],
      auth: "user-access-control",
      description:
        "This route is used to get the summary expenses by classification of the ekspensi data.",
      notes: `This route is protected by user-access-control strategy.`,
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
        query: Joi.object({
          period: Joi.string()
            .regex(/^[0-9]{6}$/)
            .optional()
            .messages({
              "string.pattern.base": "period must be in yyyymm format",
            }),
        }),
      },
    },
    handler: overviewClassification,
  },
  {
    method: "GET",
    path: "/dashboard/overview/summary/previous-month",
    options: {
      tags: ["api"],
      auth: "user-access-control",
      description:
        "This route is used to get the summary of current month and previous month expenses.",
      notes: `This route is protected by user-access-control strategy.
      This route can only be accessed by authenticated user when the token is stored in authorization header.`,
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
      },
    },
    handler: overviewSummaryLastMonth,
  },
];
