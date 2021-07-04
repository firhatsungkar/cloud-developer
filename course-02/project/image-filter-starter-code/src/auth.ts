import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./util/util";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: "No authorization headers." });
  }

  const token_bearer = req.headers.authorization.split(" ");
  if (token_bearer.length != 2) {
    return res.status(401).send({ message: "Malformed token." });
  }

  const token = token_bearer[1];

  verifyToken(token)
    .then(() => next())
    .catch(() => {
      return res.status(401).send({ message: "Malformed token." });
    });
}
