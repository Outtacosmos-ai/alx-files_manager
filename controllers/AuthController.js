import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import { findUserByEmail } from '../models/user';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credentials = Buffer.from(authHeader.slice(6), 'base64').toString().split(':');
    if (credentials.length !== 2) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [email, password] = credentials;
    const user = await findUserByEmail(email);

    if (!user || sha1(password) !== user.password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const { token } = req.user;
    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

export default AuthController;
