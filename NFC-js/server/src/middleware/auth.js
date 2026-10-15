import jwt from 'jsonwebtoken';

export function requireLogin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please login first' });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    req.user = { id: data.id };
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired, please login again' });
  }
}
