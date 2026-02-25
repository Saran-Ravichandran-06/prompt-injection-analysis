/**
 * Express Server
 * Main backend API for LLM Security Demo
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { processQuery } = require('./llm');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.txt', '.pdf'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .pdf files are allowed'));
    }
  },
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

/**
 * Extract text from uploaded file
 * @param {Object} file - Multer file object
 * @returns {Promise<string>}
 */
async function extractTextFromFile(file) {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  try {
    if (ext === '.txt') {
      // Read text file
      const text = fs.readFileSync(filePath, 'utf-8');
      fs.unlinkSync(filePath);
      return text;
    } else if (ext === '.pdf') {
      // Extract text from PDF
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      fs.unlinkSync(filePath);
      return data.text;
    }
  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}

/**
 * POST /api/chat
 * Main endpoint for chat/query processing
 */
app.post('/api/chat', upload.single('file'), async (req, res) => {
  try {
    const { textContent, query, mode = 'v2' } = req.body;

    // Validate mode
    if (!['v1', 'v2'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mode. Must be "v1" or "v2"',
      });
    }

    // Get document text from file or textContent
    let documentText = '';

    if (req.file) {
      try {
        documentText = await extractTextFromFile(req.file);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: `File processing error: ${error.message}`,
        });
      }
    } else if (textContent) {
      documentText = textContent;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either file or textContent must be provided',
      });
    }

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a non-empty string',
      });
    }

    // Process query
    const result = await processQuery(documentText, query.trim(), mode);

    // Return JSON response
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Serve frontend from public directory
 */
app.use(express.static(path.join(__dirname, '../frontend')));

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 LLM Security Demo Server running at http://localhost:${PORT}`);
  console.log(`📁 Frontend: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/chat`);
  console.log(`\n⚠️  Note: Make sure OPENROUTER_API_KEY is set in backend/.env\n`);
});
