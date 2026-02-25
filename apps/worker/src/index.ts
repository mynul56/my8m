import { Worker, Job } from 'bullmq';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

console.log('[Worker] Starting up...');

const executeJob = async (job: Job) => {
    console.log(`[Worker] Picked up job ${job.id} for Execution ID: ${job.data.executionId}`);

    // Fake delay mimicking engine DAG execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(`[Worker] Successfully finished job ${job.id} - DAG Executed Topological steps.`);
    return { status: 'SUCCESS' };
};

const worker = new Worker('global_executions', executeJob, {
    connection,
    concurrency: 5,
    lockDuration: 60000
});

worker.on('completed', job => {
    console.log(`[Worker] Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} has failed with ${err.message}`);
});

process.on('SIGINT', async () => {
    console.log('[Worker] Shutting down gracefully...');
    await worker.close();
    process.exit(0);
});
