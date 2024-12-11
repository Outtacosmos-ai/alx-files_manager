import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

export const createUser = async (email, password) => {
  const result = await dbClient.users.insertOne({ email, password });
  return { id: result.insertedId, email };
};

export const findUserByEmail = async (email) => dbClient.users.findOne({ email });

export const findUserById = async (id) => dbClient.users.findOne({ _id: ObjectId(id) });
