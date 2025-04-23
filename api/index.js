const formidable = require('formidable');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = 'videome-recordings';
const bucket = storage.bucket(bucketName);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File parsing error' });

    const file = files.video;
    if (!file) return res.status(400).json({ error: 'No video file found' });

    const fileBuffer = fs.readFileSync(file.filepath);
    const blob = bucket.file(file.originalFilename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (error) => {
      console.error(error);
      res.status(500).json({ error: 'Upload failed' });
    });

    blobStream.on('finish', () => {
      res.status(200).json({ message: 'Video uploaded to GCS successfully!' });
    });

    blobStream.end(fileBuffer);
  });
}
