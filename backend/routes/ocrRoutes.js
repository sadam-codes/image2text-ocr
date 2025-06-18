import multer from 'multer';
import express from 'express';
import { uploadImage, fetchResults, queryText } from '../controllers/ocrController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), uploadImage);
router.get('/results', fetchResults);
router.get('/query', queryText);

export default router;
