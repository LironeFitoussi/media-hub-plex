import { Router } from "express";
import { 
    createDownload, 
    getAllDownloads, 
    getDownloadById, 
    deleteDownload,
    getDiskSpace
} from "../controllers/downloads.controllers.js";
import { asyncHandler } from "../utils/errorHandler.js";

const router = Router();

// Wrap all controller methods with asyncHandler
router.post("/", asyncHandler(createDownload));
router.get("/", asyncHandler(getAllDownloads));
router.get("/disk-space", asyncHandler(getDiskSpace)); // Must be before /:id route
router.get("/:id", asyncHandler(getDownloadById));
router.delete("/:id", asyncHandler(deleteDownload));

export default router;

