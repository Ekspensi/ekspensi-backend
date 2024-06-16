import crypto from "crypto";

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto
    .createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  return { hashedPassword, salt };
};

const validatePassword = (password, salt, hashedPassword) => {
  const validateHash = crypto
    .createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  return hashedPassword === validateHash;
};

export { hashPassword, validatePassword };
