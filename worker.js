import Bull from 'bull';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');

async function generateThumbnail(width, localPath) {
  const thumbnail = await imageThumbnail(localPath, { width });
  const thumbnailPath = `${localPath}_${width}`;
  await fs.promises.writeFile(thumbnailPath, thumbnail);
}

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.client.db().collection('files')
    .findOne({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];

  const thumbnailPromises = sizes.map((size) => generateThumbnail(size, file.localPath));
  await Promise.all(thumbnailPromises);
});

export default fileQueue;
