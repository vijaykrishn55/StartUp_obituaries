const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = file.fieldname === 'avatar' ? 'avatars' : 
                   file.fieldname === 'resume' ? 'resumes' : 'documents';
    const dir = path.join(uploadDir, subDir);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const imageTypes = /jpeg|jpg|png|webp/;
  // Allowed document types
  const documentTypes = /pdf|doc|docx|ppt|pptx/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  
  if (file.fieldname === 'avatar' || file.fieldname === 'coverImage') {
    if (imageTypes.test(extname) && mimetype.startsWith('image/')) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
  }
  
  if (file.fieldname === 'resume' || file.fieldname === 'document') {
    if (documentTypes.test(extname.slice(1))) {
      return cb(null, true);
    } else {
      return cb(new Error('Only document files are allowed (pdf, doc, docx, ppt, pptx)'));
    }
  }
  
  cb(null, true);
};

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Delete file utility
const deleteFileUtil = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file URL
const getFileUrl = (req, filename, subfolder = '') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${subfolder}${subfolder ? '/' : ''}${filename}`;
};

// Handle file upload and save to database
const handleUpload = async (file, userId, type) => {
  const fileUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;
  
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    url: fileUrl,
    type: type || 'document'
  };
};

// Delete uploaded file
const deleteFile = async (fileId, userId) => {
  // Implementation for deleting file from storage
  return { success: true };
};

// Export upload middleware and functions
module.exports = {
  upload,
  deleteFileUtil,
  getFileUrl,
  handleUpload,
  deleteFile
};
