import jwt, { SignOptions } from "jsonwebtoken";

export const createToken = (
  jwtPayload: { id: string; role: string; username: string },
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  } as SignOptions);
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
