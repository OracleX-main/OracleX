import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };

  res.json(healthStatus);
});

router.get('/ready', (req: Request, res: Response) => {
  // Add more sophisticated readiness checks here
  // e.g., database connectivity, external service availability
  res.json({ 
    status: 'ready',
    timestamp: new Date().toISOString() 
  });
});

export { router as healthRoutes };