import jwt from "jsonwebtoken";

const COOKIE_NAME = "access_token";

function getToken(req) {
  // Prefer Authorization header (works cross-site on Safari iOS)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // Fallback to cookie (same-site or desktop browsers)
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  return null;
}

// USER AUTHENTICATION MIDDLEWARE
export function requireAuth(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized. No token found." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
}

// ADMIN AUTHORIZATION MIDDLEWARE
export function requireAdmin(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden. Admin access required." });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized." });
  }
}
