import Joi from "joi";
import { signInHandler, signOutHandler } from "../handlers/auth_handler.js";
import { defaultResponseSchema } from "../helpers/responseSchema.js";

export default [
  {
    method: "POST",
    path: "/auth/signin",
    handler: signInHandler,
    options: {
      tags: ["api"],
      description: `This route is used to authenticate the client by sign-in. `,
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required(),
        }).label("sign-in request"),
      },
      response: {
        status: {
          200: defaultResponseSchema
            .append({
              data: Joi.object()
                .keys({
                  access_token: Joi.string().required(),
                })
                .label("sign-in data schema"),
            })
            .label("sign-in response"),
        },
      },
    },
  },
  {
    method: "POST",
    path: "/auth/signout",
    handler: signOutHandler,
    options: {
      tags: ["api"],
      description: `This route is used to un-authenticate the client by sign-out. `,
      validate: {
        payload: null,
      },
      response: {
        status: {
          200: defaultResponseSchema,
        },
      },
    },
  },
];
