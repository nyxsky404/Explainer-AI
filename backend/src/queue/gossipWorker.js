import { Worker, UnrecoverableError } from "bullmq";
import IORedis from "ioredis";
import prisma from "../config/db.js";
import { scrapeUrl } from "../services/scrapeService.js";
import { generateGossipScript } from "../services/gossipScriptService.js";
import { generateGossipAudio } from "../services/gossipAudioService.js";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const gossipWorker = new Worker(
  "gossip-generate",
  async (job) => {
    const { gossipId, blogUrl, options = {} } = job.data;

    let gossip = await prisma.gossip.findUnique({
      where: { id: gossipId },
    });

    if (!gossip) {
      throw new UnrecoverableError("Gossip not found");
    }

    // Clear previous errors when retrying
    await prisma.gossip.update({
      where: { id: gossipId },
      data: {
        errorMessage: null,
        failedAt: null,
        status: "processing",
        progress: 0,
      },
    });

    let scrapedText = gossip.scrapedText;
    let script = gossip.script;
    let audioUrl = gossip.audioUrl;

    try {
      // STEP 1: Scrape (0-33%)
      if (!scrapedText) {
        await job.updateProgress(10);
        await prisma.gossip.update({
          where: { id: gossipId },
          data: { progress: 10, status: "scraping" },
        });

        scrapedText = await scrapeUrl(blogUrl);

        await job.updateProgress(33);
        await prisma.gossip.update({
          where: { id: gossipId },
          data: { scrapedText, status: "scraped", progress: 33 },
        });
      } else {
        await job.updateProgress(33);
      }

      // STEP 2: Script (33-66%)
      if (!script) {
        await job.updateProgress(40);
        await prisma.gossip.update({
          where: { id: gossipId },
          data: { progress: 40, status: "generating_script" },
        });

        script = await generateGossipScript(scrapedText, options);

        await job.updateProgress(66);
        await prisma.gossip.update({
          where: { id: gossipId },
          data: { script, status: "script_generated", progress: 66 },
        });
      } else {
        await job.updateProgress(66);
      }

      if (!script) {
        throw new Error("Script missing before audio generation");
      }

      // STEP 3: Audio (66-100%)
      if (!audioUrl) {
        await job.updateProgress(70);
        await prisma.gossip.update({
          where: { id: gossipId },
          data: { progress: 70, status: "generating_audio" },
        });

        const { audioUrl, audioDuration } = await generateGossipAudio(
          script,
          gossipId
        );

        await job.updateProgress(100);
        await prisma.gossip.update({
          where: { id: gossipId },
          data: { audioUrl, audioDuration, status: "completed", progress: 100 },
        });
      } else {
        await job.updateProgress(100);
        await prisma.gossip.update({
          where: { id: gossipId },
          data: { status: "completed", progress: 100 },
        });
      }
    } catch (error) {
      // Update gossip with error information
      await prisma.gossip.update({
        where: { id: gossipId },
        data: {
          status: "failed",
          errorMessage: error.message,
          failedAt: new Date(),
        },
      });

      // Re-throw to let BullMQ handle retries
      throw error;
    }
  },
  {
    connection,
    concurrency: 3, // Process up to 3 jobs simultaneously
  }
);

gossipWorker.on("completed", (job) => {
  console.log(`Gossip worker job ${job.id} has completed!`);
});

gossipWorker.on("failed", async (job, err) => {
  console.log(`Gossip worker job ${job.id} has failed with ${err.message}`);

  // Update gossip status if job is permanently failed (after all retries)
  if (job && job.data && job.data.gossipId) {
    try {
      const gossip = await prisma.gossip.findUnique({
        where: { id: job.data.gossipId },
      });

      if (gossip && gossip.status !== "failed") {
        await prisma.gossip.update({
          where: { id: job.data.gossipId },
          data: {
            status: "failed",
            errorMessage: err.message,
            failedAt: new Date(),
          },
        });
      }
    } catch (updateError) {
      console.error("Error updating gossip status on failure:", updateError);
    }
  }
});