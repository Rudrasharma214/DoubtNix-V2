import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import logger from '../../config/logger.js';

export const downloadFile = async (fileUrl) => {
  const tempPath = path.join(
    os.tmpdir(),
    `doc_${Date.now()}`
  );

  const writer = fs.createWriteStream(tempPath);

  try {
    logger.info(`Attempting to download file from: ${fileUrl}`);

    const response = await axios({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'DoubtNix-Backend/1.0'
      },
      // Allow redirects
      maxRedirects: 10
    });

    logger.info(`Download response status: ${response.status}`);

    response.data.pipe(writer);

    await new Promise((res, rej) => {
      const timeout = setTimeout(() => {
        writer.destroy();
        rej(new Error('File write operation timed out after 120 seconds'));
      }, 120000);

      writer.on('finish', () => {
        clearTimeout(timeout);
        logger.info(`File downloaded successfully to ${tempPath}`);
        res();
      });
      writer.on('error', (err) => {
        clearTimeout(timeout);
        logger.error(`Write stream error: ${err.message}`);
        rej(err);
      });
      
      response.data.on('error', (err) => {
        clearTimeout(timeout);
        logger.error(`Response stream error: ${err.message}`);
        rej(err);
      });
    });

    return tempPath;
  } catch (error) {
    writer.destroy();
    logger.error(`Download error: ${error.message}, URL: ${fileUrl}`);
    throw error;
  }
}
