import { Worker, UnrecoverableError } from "bullmq";
import IORedis from "ioredis";
import prisma from "../config/db.js";
import { scrapeUrl } from "../services/scrapeService.js";
import { generateScript } from "../services/scriptService.js";
import { generateAudio } from "../services/audioService.js";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "podcast-generate",
  async (job) => {
    const { podcastId, blogUrl } = job.data;

    let podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
    });

    if (!podcast) {
      throw new UnrecoverableError("Podcast not found");
    }

    // Clear previous errors when retrying
    await prisma.podcast.update({
      where: { id: podcastId },
      data: {
        errorMessage: null,
        failedAt: null,
        status: "processing",
        progress: 0,
      },
    });

    let scrapedText = podcast.scrapedText;
    let script = podcast.script;
    let audioUrl = podcast.audioUrl;

    try {
      // STEP 1: Scrape (0-33%)
      if (!scrapedText) {
        await job.updateProgress(10);
        await prisma.podcast.update({
          where: { id: podcastId },
          data: { progress: 10, status: "scraping" },
        });

        scrapedText = await scrapeUrl(blogUrl);

        await job.updateProgress(33);
        await prisma.podcast.update({
          where: { id: podcastId },
          data: { scrapedText, status: "scraped", progress: 33 },
        });
      } else {
        await job.updateProgress(33);
      }

      // STEP 2: Script (33-66%)
      if (!script) {
        await job.updateProgress(40);
        await prisma.podcast.update({
          where: { id: podcastId },
          data: { progress: 40, status: "generating_script" },
        });

        script = await generateScript(scrapedText);

        await job.updateProgress(66);
        await prisma.podcast.update({
          where: { id: podcastId },
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
        await prisma.podcast.update({
          where: { id: podcastId },
          data: { progress: 70, status: "generating_audio" },
        });

        const { audioUrl, audioDuration } = await generateAudio(
          script,
          podcastId
        );

        await job.updateProgress(100);
        await prisma.podcast.update({
          where: { id: podcastId },
          data: { audioUrl, audioDuration, status: "completed", progress: 100 },
        });
      } else {
        await job.updateProgress(100);
        await prisma.podcast.update({
          where: { id: podcastId },
          data: { status: "completed", progress: 100 },
        });
      }
    } catch (error) {
      // Update podcast with error information
      await prisma.podcast.update({
        where: { id: podcastId },
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

worker.on("completed", (job) => {
  console.log(`Work with job id ${job.id} has completed!`);
});

worker.on("failed", async (job, err) => {
  console.log(`Work with job id ${job.id} has failed with ${err.message}`);

  // Update podcast status if job is permanently failed (after all retries)
  if (job && job.data && job.data.podcastId) {
    try {
      const podcast = await prisma.podcast.findUnique({
        where: { id: job.data.podcastId },
      });

      if (podcast && podcast.status !== "failed") {
        await prisma.podcast.update({
          where: { id: job.data.podcastId },
          data: {
            status: "failed",
            errorMessage: err.message,
            failedAt: new Date(),
          },
        });
      }
    } catch (updateError) {
      console.error("Error updating podcast status on failure:", updateError);
    }
  }
});
