import redisClient from '../utils/redis';
import { findUserById } from '../models/user';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = { userId: user._id.toString(), email: user.email };
    req.token = token;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authMiddleware;
