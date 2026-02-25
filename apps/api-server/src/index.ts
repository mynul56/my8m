import express from 'express';
import cors from 'cors';
import { Queue } from 'bullmq';

const app = express();
app.use(cors());
app.use(express.json());

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

const executionQueue = new Queue('global_executions', { connection });

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
