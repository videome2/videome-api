const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = 'videome-recordings';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fileName = req.query.fileName || `video-${Date.now()}.webm`;

  try {
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      contentType: 'video/webm', // You can change this if you want mp4, etc.
    };

    const [url] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl(options);

    res.status(200).json({ uploadUrl: url, fileName });
  } catch (error) {
    console.error('Failed to create signed URL', error);
    res.status(500).json({ error: 'Failed to create signed URL' });
  }
}
