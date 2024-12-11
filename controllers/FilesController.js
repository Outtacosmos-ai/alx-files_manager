import { ObjectId } from 'mongodb';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import {
  createFile, findFileById, findFilesByParentId, updateFile,
} from '../models/file';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { id: userId } = req.user;
    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== '0') {
      const parentFile = await findFileById(parentId);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === '0' ? '0' : ObjectId(parentId),
    };

    if (type === 'folder') {
      const newFile = await createFile(fileDocument);
      return res.status(201).json(newFile);
    }
    const fileUuid = uuidv4();
    const localPath = `${FOLDER_PATH}/${fileUuid}`;

    await fs.promises.mkdir(FOLDER_PATH, { recursive: true });
    await fs.promises.writeFile(localPath, Buffer.from(data, 'base64'));

    fileDocument.localPath = localPath;
    const newFile = await createFile(fileDocument);
    return res.status(201).json(newFile);
  }

  static async getShow(req, res) {
    const { id } = req.params;
    const { id: userId } = req.user;

    const file = await findFileById(id);
    if (!file || file.userId.toString() !== userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const { id: userId } = req.user;
    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page || '0', 10);
    const pageSize = 20;

    const files = await findFilesByParentId(userId, parentId, page, pageSize);
    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const { id } = req.params;
    const { id: userId } = req.user;

    const file = await findFileById(id);
    if (!file || file.userId.toString() !== userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updatedFile = await updateFile(id, { isPublic: true });
    return res.status(200).json(updatedFile);
  }

  static async putUnpublish(req, res) {
    const { id } = req.params;
    const { id: userId } = req.user;

    const file = await findFileById(id);
    if (!file || file.userId.toString() !== userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updatedFile = await updateFile(id, { isPublic: false });
    return res.status(200).json(updatedFile);
  }

  static async getFile(req, res) {
    const { id } = req.params;
    const { id: userId } = req.user || {};

    const file = await findFileById(id);
    if (!file || (!file.isPublic && (!userId || file.userId.toString() !== userId))) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    if (!fs.existsSync(file.localPath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.lookup(file.name) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);

    const fileStream = fs.createReadStream(file.localPath);
    return fileStream.pipe(res);
  }
}

export default FilesController;
