import { Worker, Job } from 'bullmq';
import { ExecutionEngine, StateTracker } from '@my8m/core';
import { NodeRegistry } from '@my8m/nodes-base';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

console.log('[Worker] Starting up...');

const executeJob = async (job: Job) => {
    console.log(`[Worker] Picked up job ${job.id} for Execution ID: ${job.data.executionId}`);

    const { nodes, connections, triggerData } = job.data;

    if (!nodes || !connections) {
        console.warn(`[Worker] Job ${job.id} has no valid DAG topology.`);
        return { status: 'NO_OP' };
    }

    try {
        const engine = new ExecutionEngine(nodes, connections, NodeRegistry);
        const state = new StateTracker();

        console.log(`[Worker] Starting core DAG Execution. Node counts: ${nodes.length}, Edges: ${connections.length}`);
        await engine.run(triggerData || {}, state);

        console.log(`[Worker] Successfully finished job ${job.id} topological execution.`);
        return { status: 'SUCCESS' };
    } catch (err: any) {
        throw new Error(`DAG Execution Failed: ${err.message}`);
    }
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
