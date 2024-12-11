import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

export const createFile = async (fileData) => {
  const result = await dbClient.files.insertOne(fileData);
  return { id: result.insertedId, ...fileData };
};

export const findFileById = async (id) => dbClient.files.findOne({ _id: ObjectId(id) });

export const findFilesByParentId = async (userId, parentId, page, pageSize) => {
  const skip = page * pageSize;
  return dbClient.files
    .find({ userId: ObjectId(userId), parentId: parentId === '0' ? '0' : ObjectId(parentId) })
    .skip(skip)
    .limit(pageSize)
    .toArray();
};

export const updateFile = async (id, updateData) => {
  const result = await dbClient.files.findOneAndUpdate(
    { _id: ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' },
  );
  return result.value;
};
