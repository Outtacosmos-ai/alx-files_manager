import sha1 from 'sha1';
import { createUser, findUserByEmail, findUserById } from '../models/user';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = await createUser(email, hashedPassword);

    return res.status(201).json({ id: newUser.insertedId, email });
  }

  static async getMe(req, res) {
    const { userId } = req.user;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
