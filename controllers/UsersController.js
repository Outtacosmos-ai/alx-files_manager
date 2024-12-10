/* eslint-disable no-unused-vars */
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if user already exists
    const existingUser = await dbClient.client.db().collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash password and create new user
    const hashedPassword = sha1(password);
    const result = await dbClient.client.db().collection('users').insertOne({
      email,
      password: hashedPassword,
    });

    // Return only email and id
    return res.status(201).json({
      id: result.insertedId,
      email,
    });
  }
}

export default UsersController;

