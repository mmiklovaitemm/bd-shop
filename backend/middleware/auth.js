import jwt from "jsonwebtoken";

const COOKIE_NAME = "access_token";

// USER check
export function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized." });
  }
}

// ADMIN check
export function requireAdmin(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden." });
    }

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized." });
  }
}
