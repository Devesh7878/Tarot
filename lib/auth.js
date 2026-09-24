import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "trao-interview-kit-dev-secret";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getSessionUser(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((entry) => {
      const [name, ...rest] = entry.trim().split("=");
      return [name, rest.join("=")];
    }),
  );

  const token = cookies.session;
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  };
}
