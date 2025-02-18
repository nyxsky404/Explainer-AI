import express from 'express';
import {
  generateVisualizationController,
  listVisualizations,
  getVisualization,
  deleteVisualizationController,
} from '../controllers/visualizerController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Protected routes
router.use(verifyToken);

router.post('/generate', generateVisualizationController);
router.get('/list', listVisualizations);
router.get('/:id', getVisualization);
router.delete('/:id', deleteVisualizationController);

export default router;
