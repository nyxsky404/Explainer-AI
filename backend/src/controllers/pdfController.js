import multer from 'multer';
import { summarizePdf } from '../services/pdfService.js';
import { extractConcepts } from '../services/conceptService.js';
import prisma from '../config/db.js';
// import redis from '../config/redis.js';
import { CREDIT_COSTS } from '../config/credits.js';
import { checkCredits } from '../services/creditService.js';

// // Invalidate credit cache - non-throwing
// async function invalidateCreditCache(userId) {
//   try {
//     await redis.del(`user:${userId}:credits`);
//   } catch (err) {
//     console.error('pdfController::invalidateCreditCache error for userId:', userId, err.message);
//   }
// }

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
}).single('file');

// Wrapper for multer to handle errors gracefully
export const uploadPdfMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large (max 10MB)' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

export const summarizePdfController = async (req, res) => {
  const userId = req.userID;
  const file = req.file;
  const { depth, tone, readingLevel } = req.body;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    // Check credits
    const creditCheck = await checkCredits(userId, CREDIT_COSTS.PDF_SUMMARY);
    if (!creditCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: creditCheck.message || 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
      });
    }

    // Process PDF


    const result = await summarizePdf(file.buffer, file.originalname, {
      depth,
      tone,
      readingLevel,
    });

    const { summary: summaryContent, rawContent, pdfUrl } = result;

    // Extract concepts (non-blocking)
    const concepts = await extractConcepts(rawContent || summaryContent);

    // Store summary and deduct credits
    const [summary] = await prisma.$transaction([
      prisma.summary.create({
        data: {
          userId,
          sourceUrl: pdfUrl,
          type: 'pdf',
          content: summaryContent,
          rawContent: rawContent || null,
          concepts: concepts.length > 0 ? concepts : undefined,
          creditsUsed: CREDIT_COSTS.PDF_SUMMARY,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: CREDIT_COSTS.PDF_SUMMARY } },
      }),
    ]);

    // // Invalidate credit cache
    // await invalidateCreditCache(userId);

    res.status(200).json({
      success: true,
      data: summary,
      message: 'PDF summarized successfully',
    });
  } catch (err) {
    console.error('PDF controller error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to process PDF',
    });
  }
};
