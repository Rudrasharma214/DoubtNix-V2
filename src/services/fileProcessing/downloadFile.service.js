import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const downloadFile = async (fileUrl) => {
  const tempPath = path.join(
    os.tmpdir(),
    `doc_${Date.now()}`
  );

  const writer = fs.createWriteStream(tempPath);

  const response = await axios({
    url: fileUrl,
    method: 'GET',
    responseType: 'stream',
    timeout: 15000
  });

  response.data.pipe(writer);

  await new Promise((res, rej) => {
    writer.on('finish', res);
    writer.on('error', rej);
  });

  return tempPath;
}
