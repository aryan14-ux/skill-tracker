const path = require('path');
const os = require('os');

const uploadsRoot = process.env.VERCEL
  ? path.join(os.tmpdir(), 'skilltrack-uploads')
  : path.resolve(__dirname, '../../uploads');

module.exports = { uploadsRoot, resumeUploadDir: path.join(uploadsRoot, 'resumes') };
