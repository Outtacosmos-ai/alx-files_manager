import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import mime from 'mime-types';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
const fileQueue = new Queue('fileQueue');

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

    if (parentId !== '0') {
      const parentFile = await dbClient.files.findOne({ _id: ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const fileDocument = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === '0' ? '0' : ObjectId(parentId),
    };

    if (type === 'folder') {
      const result = await dbClient.files.insertOne(fileDocument);
      return res.status(201).json({
        id: result.insertedId,
        userId: fileDocument.userId,
        name: fileDocument.name,
        type: fileDocument.type,
        isPublic: fileDocument.isPublic,
        parentId: fileDocument.parentId,
      });
    }

    const fileUuid = uuidv4();
    const localPath = `${FOLDER_PATH}/${fileUuid}`;

    await fs.promises.mkdir(FOLDER_PATH, { recursive: true });
    await fs.promises.writeFile(localPath, Buffer.from(data, 'base64'));

    fileDocument.localPath = localPath;

    const result = await dbClient.files.insertOne(fileDocument);

    if (type === 'image') {
      fileQueue.add({
        userId: fileDocument.userId.toString(),
        fileId: result.insertedId.toString(),
      });
    }

    return res.status(201).json({
      id: result.insertedId,
      userId: fileDocument.userId,
      name: fileDocument.name,
      type: fileDocument.type,
      isPublic: fileDocument.isPublic,
      parentId: fileDocument.parentId,
    });
  }
}

export { FilesController };

describe('dbClient', () => {
  it('should connect to MongoDB', async () => {
    expect.assertions(1); // Ensure 1 assertion in this test
    expect(await dbClient.isAlive()).toBe(true); // Replaced with Jest assertion
  });

  it('should return the number of users', async () => {
    expect.assertions(1); // Ensure 1 assertion in this test
    const nbUsers = await dbClient.nbUsers();
    expect(nbUsers).toBeGreaterThan(0); // Ensuring the value is a number greater than 0
  });

  it('should return the number of files', async () => {
    expect.assertions(1); // Ensure 1 assertion in this test
    const nbFiles = await dbClient.nbFiles();
    expect(nbFiles).toBeGreaterThan(0); // Ensuring the value is a number greater than 0
  });
});

import express from 'express';
import { FilesController } from '../controllers/FilesController';

const router = express.Router();

router.post('/files', FilesController.postUpload);

export default router;
