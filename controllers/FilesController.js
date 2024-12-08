import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    // Retrieve user based on token
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Get request data
    const {
      name,
      type,
      parentId = '0',
      isPublic = false,
      data,
    } = req.body;

    // Validate inputs
    if (!name) return res.status(400).json({ error: 'Missing name' });

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parentId if provided
    if (parentId !== '0') {
      const parent = await dbClient.client
        .db()
        .collection('files')
        .findOne({ _id: ObjectId(parentId) });

      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Prepare file document
    const fileDocument = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === '0' ? '0' : ObjectId(parentId),
    };

    // Handle folder type
    if (type === 'folder') {
      const result = await dbClient.client
        .db()
        .collection('files')
        .insertOne(fileDocument);

      return res.status(201).json({
        id: result.insertedId,
        userId: fileDocument.userId,
        name: fileDocument.name,
        type: fileDocument.type,
        isPublic: fileDocument.isPublic,
        parentId: fileDocument.parentId,
      });
    }

    // Handle file and image types
    const fileUuid = uuidv4();
    const localPath = path.join(FOLDER_PATH, fileUuid);

    // Create directory if it doesn't exist
    await fs.promises.mkdir(FOLDER_PATH, { recursive: true });

    // Write file content
    await fs.promises.writeFile(localPath, Buffer.from(data, 'base64'));

    // Add localPath to document
    fileDocument.localPath = localPath;

    // Save to database
    const result = await dbClient.client
      .db()
      .collection('files')
      .insertOne(fileDocument);

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

export default FilesController;
