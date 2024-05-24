const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

const generateToken = (
  payload,
  { expired = 3600 * 24, algorithm = "HS256" } = {}
) => {
  return jwt.sign(
    { payload },
    process.env.ACCESS_TOKEN_SECRET || "access_token_secret",
    {
      expiresIn: expired,
      algorithm: algorithm,
      jwtid: nanoid(10),
      encoding: "utf-8",
      notBefore: 0,
    }
  );
};

module.exports = { generateToken };
