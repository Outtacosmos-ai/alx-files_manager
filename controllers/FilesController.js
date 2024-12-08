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

  static async getShow(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const file = await dbClient.files.findOne({
      _id: ObjectId(req.params.id),
      userId: ObjectId(userId),
    });

    if (!file) return res.status(404).json({ error: 'Not found' });

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page || '0', 10);
    const pipeline = [
      { $match: { userId: ObjectId(userId), parentId: parentId === '0' ? '0' : ObjectId(parentId) } },
      { $skip: page * 20 },
      { $limit: 20 },
    ];

    const files = await dbClient.files.aggregate(pipeline).toArray();

    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;
    const file = await dbClient.files.findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

    if (!file) return res.status(404).json({ error: 'Not found' });

    await dbClient.files.updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: true } });

    const updatedFile = await dbClient.files.findOne({ _id: ObjectId(fileId) });
    return res.status(200).json(updatedFile);
  }

  static async putUnpublish(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;
    const file = await dbClient.files.findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

    if (!file) return res.status(404).json({ error: 'Not found' });

    await dbClient.files.updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: false } });

    const updatedFile = await dbClient.files.findOne({ _id: ObjectId(fileId) });
    return res.status(200).json(updatedFile);
  }

  static async getFile(req, res) {
    try {
      const fileId = req.params.id;
      const { size } = req.query;

      const file = await dbClient.files.findOne({ _id: ObjectId(fileId) });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (!file.isPublic) {
        const token = req.header('X-Token');
        if (!token) {
          return res.status(404).json({ error: 'Not found' });
        }

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId || userId !== file.userId.toString()) {
          return res.status(404).json({ error: 'Not found' });
        }
      }

      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      let filePath = file.localPath;

      if (size) {
        filePath = `${filePath}_${size}`;
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      const mimeType = mime.lookup(file.name);
      res.setHeader('Content-Type', mimeType);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      return res;
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default FilesController;
