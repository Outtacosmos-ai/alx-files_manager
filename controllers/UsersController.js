import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email and password
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const usersCollection = dbClient.db.collection('users');

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Insert new user
      const hashedPassword = sha1(password);
      const result = await usersCollection.insertOne({
        email,
        password: hashedPassword,
      });

      // Respond with the new user's ID and email
      const userId = result.insertedId;
      return res.status(201).json({ id: userId, email });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UsersController;
