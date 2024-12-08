import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    // Get token and authenticate user
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract file details
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    // Validate inputs
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check parent folder if specified
    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files')
        .findOne({ _id: dbClient.ObjectId(parentId), userId: dbClient.ObjectId(userId) });

      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Prepare file storage
    const storePath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(storePath)) {
      fs.mkdirSync(storePath, { recursive: true });
    }

    let localPath = null;
    if (type === 'file' || type === 'image') {
      localPath = path.join(storePath, uuidv4());
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
    }

    // Prepare file document
    const fileDoc = {
      userId: dbClient.ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? 0 : dbClient.ObjectId(parentId),
      localPath: localPath || undefined,
    };

    // Insert file document
    const result = await dbClient.db.collection('files').insertOne(fileDoc);

    // Prepare response
    const responseFile = {
      id: result.insertedId,
      ...fileDoc,
      parentId: fileDoc.parentId.toString(),
      userId: fileDoc.userId.toString(),
    };
    delete responseFile._id;

    return res.status(201).json(responseFile);
  }
}

export default FilesController;
