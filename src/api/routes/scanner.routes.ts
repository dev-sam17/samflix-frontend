import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../app';
import { scannerService } from '../../services/scanner/scanner.service';

type AsyncRouteHandler<P = any, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void>;

interface MediaFolder {
  id: string;
  type: string;
  path: string;
  active: boolean;
}

interface FolderBody {
  path: string;
  type: 'movies' | 'series';
}

interface UpdateFolderParams {
  id: string;
}

interface UpdateFolderBody {
  active: boolean;
}

interface ResolveConflictParams {
  id: string;
}

interface ResolveConflictBody {
  selectedId: number;
}

// Start a manual scan
const router = Router();

const scanHandler: AsyncRouteHandler = async (_req, res) => {
  try {
    const folders = await prisma.mediaFolder.findMany({
      select: { id: true, path: true, type: true, active: true },
      where: { active: true }
    });

    const config = {
      moviePaths: folders
        .filter((f: MediaFolder) => f.type === 'movies')
        .map((f: MediaFolder) => f.path),
      seriesPaths: folders
        .filter((f: MediaFolder) => f.type === 'series')
        .map((f: MediaFolder) => f.path),
      fileExtensions: ['.mp4', '.mkv', '.avi']
    };

    // Start scanning in the background
    scannerService.scanAll(config).catch(console.error);
    
    res.json({ message: 'Scan started successfully' });
  } catch (error) {
    console.error('Error starting scan:', error);
    res.status(500).json({ error: 'Failed to start scan' });
  }
};

// Add a new media folder
const addFolderHandler: AsyncRouteHandler<{}, any, FolderBody> = async (req, res) => {
  try {
    const { path, type } = req.body;
    
    if (!path || !type || !['movies', 'series'].includes(type)) {
      res.status(400).json({ error: 'Invalid folder configuration' });
      return;
    }

    const folder = await prisma.mediaFolder.create({
      data: { path, type }
    });

    res.json(folder);
  } catch (error) {
    console.error('Error adding folder:', error);
    res.status(500).json({ error: 'Failed to add folder' });
  }
};

// Get all media folders
const getFoldersHandler: AsyncRouteHandler = async (_req, res) => {
  try {
    const folders = await prisma.mediaFolder.findMany();
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
};

// Update media folder status
const updateFolderHandler: AsyncRouteHandler<UpdateFolderParams, any, UpdateFolderBody> = async (req, res) => {
  try {
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const folder = await prisma.mediaFolder.update({
      where: { id: req.params.id },
      data: { active }
    });

    res.json(folder);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
};

// Delete media folder
const deleteFolderHandler: AsyncRouteHandler<{ id: string }> = async (req, res) => {
  try {
    await prisma.mediaFolder.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};

// Get scanning conflicts
const getConflictsHandler: AsyncRouteHandler = async (_req, res) => {
  try {
    const conflicts = await prisma.scanningConflict.findMany({
      where: { resolved: false }
    });
    res.json(conflicts);
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    res.status(500).json({ error: 'Failed to fetch conflicts' });
  }
};

// Resolve scanning conflict
const resolveConflictHandler: AsyncRouteHandler<ResolveConflictParams, any, ResolveConflictBody> = async (req, res) => {
  try {
    const { selectedId } = req.body;
    
    if (!selectedId) {
      res.status(400).json({ error: 'Selected ID is required' });
      return;
    }

    // Use the scanner service to resolve the conflict
    const conflict = await scannerService.resolveConflict(req.params.id, selectedId);
    res.json(conflict);
  } catch (error) {
    console.error('Error resolving conflict:', error);
    if (error.message === 'Conflict not found') {
      res.status(404).json({ error: 'Conflict not found' });
    } else {
      res.status(500).json({ error: 'Failed to resolve conflict' });
    }
  }
};

router.post('/scan', scanHandler);
router.post('/folders', addFolderHandler);
router.get('/folders', getFoldersHandler);
router.patch('/folders/:id', updateFolderHandler);
router.delete('/folders/:id', deleteFolderHandler);
router.get('/conflicts', getConflictsHandler);
router.post('/conflicts/:id/resolve', resolveConflictHandler);

export default router;
