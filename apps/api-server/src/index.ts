import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Queue } from 'bullmq';
import jwt from 'jsonwebtoken';
import { getAvailableNodes } from '@my8m/nodes-base';

const app = express();
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err: jwt.VerifyErrors | null, user: any) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        (req as any).user = user;
        next();
    });
};

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

const executionQueue = new Queue('global_executions', { connection });

// Secure all /api routes except public endpoints
app.use('/api', authenticateToken);

// 1. Get Available Nodes for Frontend Builder
app.get('/api/nodes', (req, res) => {
    const nodes = getAvailableNodes();
    res.json({ data: nodes });
});

// 2. Trigger Workflow Execution
app.post('/api/workflows/:id/execute', async (req, res) => {
    const { id } = req.params;
    const triggerData = req.body;

    const executionId = `exec_${Date.now()}`;

    // Note: In real setup, fetch workflow from DB, but here we just push the job payload
    const job = await executionQueue.add('execute-workflow', {
        executionId,
        workflowId: id,
        triggerData,
    });

    console.log(`[API] Enqueued Execution Job: ${job.id}`);

    res.status(202).json({
        message: 'Execution accepted',
        executionId,
        jobId: job.id
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Server listening on port ${PORT}`);
});
