import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const getUser = async (req) => {
  const token = req.header('X-Token');
  if (!token) return null;

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) return null;

  const user = await dbClient.client.db().collection('users').findOne({ _id: ObjectId(userId) });
  return user;
};

export default async function auth(req, res, next) {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    req.user = user;
    next();
  }
}

