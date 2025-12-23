import mammoth from 'mammoth';

export const extractTextFromDocx = async (localPath) => {
  const result = await mammoth.extractRawText({
    path: localPath
  });

  return result.value;
}
