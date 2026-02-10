/**
 * Job Queue Management
 * Handles batch audits, retries, and scheduled re-audits using Bull
 */

import Bull, { Queue, Job, JobOptions } from 'bull';
import { ComplianceAuditor } from './auditor.js';
import {
  TokenData,
  AuditJobData,
  AuditJobResult,
  QueueConfig,
  ScheduledAuditConfig,
  AuditReport
} from './types.js';

export class AuditQueue {
  private queue: Queue<AuditJobData>;
  private auditor: ComplianceAuditor;
  private config: QueueConfig;
  private scheduledAudits: Map<string, ScheduledAuditConfig> = new Map();

  constructor(
    auditor: ComplianceAuditor,
    config?: Partial<QueueConfig>
  ) {
    this.auditor = auditor;
    
    // Default configuration
    this.config = {
      redis: {
        host: config?.redis?.host || 'localhost',
        port: config?.redis?.port || 6379
      },
      retryAttempts: config?.retryAttempts || 3,
      retryDelay: config?.retryDelay || 5000,
      backoff: config?.backoff || {
        type: 'exponential',
        delay: 5000
      }
    };

    // Initialize Bull queue
    this.queue = new Bull<AuditJobData>('compliance-audits', {
      redis: this.config.redis,
      defaultJobOptions: {
        attempts: this.config.retryAttempts,
        backoff: this.config.backoff,
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: false // Keep failed jobs for analysis
      }
    });

    this.setupProcessors();
    this.setupEventHandlers();
  }

  /**
   * Setup job processors
   */
  private setupProcessors(): void {
    // Process audit jobs
    this.queue.process('audit', async (job: Job<AuditJobData>) => {
      console.log(`📋 Processing audit job ${job.id} for token ${job.data.tokenAddress}`);
      
      // In a real implementation, you would fetch token data here
      // For now, this expects the token data to be fetched externally
      throw new Error('Token data fetching not implemented - integrate with Solana RPC');
    });
  }

  /**
   * Setup event handlers for monitoring
   */
  private setupEventHandlers(): void {
    this.queue.on('completed', (job: Job, result: AuditJobResult) => {
      if (result.success && result.report) {
        console.log(`✅ Job ${job.id} completed successfully`);
        console.log(`   Token: ${result.report.tokenAddress}`);
        console.log(`   Risk: ${result.report.riskLevel} (${result.report.overallRiskScore}/100)`);
        
        // Schedule next audit if applicable
        this.scheduleNextAudit(result.report);
      }
    });

    this.queue.on('failed', (job: Job, err: Error) => {
      console.error(`❌ Job ${job.id} failed:`, err.message);
      console.error(`   Token: ${job.data.tokenAddress}`);
      console.error(`   Attempt: ${job.attemptsMade}/${this.config.retryAttempts}`);
    });

    this.queue.on('retrying', (job: Job) => {
      console.log(`🔄 Retrying job ${job.id} (attempt ${job.attemptsMade + 1}/${this.config.retryAttempts})`);
    });

    this.queue.on('error', (error: Error) => {
      console.error('⚠️ Queue error:', error);
    });
  }

  /**
   * Add a token audit to the queue
   */
  public async addAudit(
    tokenAddress: string,
    priority: number = 0,
    options?: Partial<JobOptions>
  ): Promise<Job<AuditJobData>> {
    const jobData: AuditJobData = {
      tokenAddress,
      priority,
      retryCount: 0
    };

    const job = await this.queue.add('audit', jobData, {
      priority,
      ...options
    });

    console.log(`➕ Added audit job ${job.id} for token ${tokenAddress}`);
    return job;
  }

  /**
   * Add multiple audits in batch
   */
  public async addBatchAudits(
    tokenAddresses: string[],
    priority: number = 0
  ): Promise<Job<AuditJobData>[]> {
    console.log(`📦 Adding batch of ${tokenAddresses.length} audits`);
    
    const jobs = await Promise.all(
      tokenAddresses.map(address => this.addAudit(address, priority))
    );

    return jobs;
  }

  /**
   * Schedule recurring audits for a token
   */
  public scheduleRecurringAudit(config: ScheduledAuditConfig): void {
    this.scheduledAudits.set(config.tokenAddress, config);
    
    // Calculate delay based on frequency
    let delay: number;
    switch (config.frequency) {
      case 'daily':
        delay = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case 'weekly':
        delay = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case 'monthly':
        delay = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
    }

    // Add repeatable job
    this.queue.add(
      'audit',
      {
        tokenAddress: config.tokenAddress,
        priority: config.priority || 0,
        scheduledAudit: true
      },
      {
        repeat: {
          every: delay
        },
        jobId: `scheduled-${config.tokenAddress}`
      }
    );

    console.log(`⏰ Scheduled ${config.frequency} audit for ${config.tokenAddress}`);
  }

  /**
   * Cancel scheduled audit
   */
  public async cancelScheduledAudit(tokenAddress: string): Promise<void> {
    const jobId = `scheduled-${tokenAddress}`;
    await this.queue.removeRepeatable('audit', {
      every: 0, // This is a placeholder, Bull will find the actual repeat config
      jobId
    });
    
    this.scheduledAudits.delete(tokenAddress);
    console.log(`🛑 Cancelled scheduled audit for ${tokenAddress}`);
  }

  /**
   * Schedule next audit based on report risk level
   */
  private async scheduleNextAudit(report: AuditReport): Promise<void> {
    if (!report.nextAuditSchedule) return;

    const delay = report.nextAuditSchedule - Date.now();
    if (delay <= 0) return;

    // Determine frequency based on risk level
    let frequency: 'daily' | 'weekly' | 'monthly';
    switch (report.riskLevel) {
      case 'CRITICAL':
      case 'HIGH':
        frequency = 'daily';
        break;
      case 'MEDIUM':
        frequency = 'weekly';
        break;
      case 'LOW':
      default:
        frequency = 'monthly';
        break;
    }

    // Check if already scheduled
    const existing = this.scheduledAudits.get(report.tokenAddress);
    if (existing && existing.frequency === frequency) {
      return; // Already scheduled at correct frequency
    }

    // Schedule new audit
    this.scheduleRecurringAudit({
      tokenAddress: report.tokenAddress,
      frequency,
      priority: report.riskLevel === 'CRITICAL' ? 10 : 5,
      enabled: true
    });
  }

  /**
   * Get queue statistics
   */
  public async getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
      this.queue.getPausedCount()
    ]);

    return { waiting, active, completed, failed, delayed, paused };
  }

  /**
   * Get failed jobs for analysis
   */
  public async getFailedJobs(limit: number = 10): Promise<Job<AuditJobData>[]> {
    return this.queue.getFailed(0, limit);
  }

  /**
   * Retry a failed job
   */
  public async retryFailedJob(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    await job.retry();
    console.log(`🔄 Retrying job ${jobId}`);
  }

  /**
   * Clear all jobs (use with caution)
   */
  public async clear(): Promise<void> {
    await this.queue.empty();
    console.log('🧹 Queue cleared');
  }

  /**
   * Pause queue processing
   */
  public async pause(): Promise<void> {
    await this.queue.pause();
    console.log('⏸️ Queue paused');
  }

  /**
   * Resume queue processing
   */
  public async resume(): Promise<void> {
    await this.queue.resume();
    console.log('▶️ Queue resumed');
  }

  /**
   * Close queue connection
   */
  public async close(): Promise<void> {
    await this.queue.close();
    console.log('👋 Queue closed');
  }

  /**
   * Process a token audit directly (bypass queue for testing)
   */
  public async processAuditDirect(tokenData: TokenData): Promise<AuditJobResult> {
    return this.auditor.auditToken(tokenData);
  }
}

/**
 * Factory function to create and initialize queue
 */
export async function createAuditQueue(
  toriiApiUrl?: string,
  queueConfig?: Partial<QueueConfig>
): Promise<AuditQueue> {
  const auditor = new ComplianceAuditor(toriiApiUrl);
  const queue = new AuditQueue(auditor, queueConfig);
  
  console.log('🚀 Audit queue initialized');
  console.log(`   Redis: ${queueConfig?.redis?.host || 'localhost'}:${queueConfig?.redis?.port || 6379}`);
  console.log(`   Retry attempts: ${queueConfig?.retryAttempts || 3}`);
  
  return queue;
}
