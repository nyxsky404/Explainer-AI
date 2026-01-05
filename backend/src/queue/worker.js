import { Worker, UnrecoverableError } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../config/db.js';
import { scrapeUrl } from "../services/scrapeService.js";
import { generateScript } from "../services/scriptService.js";
import { generateAudio } from "../services/audioService.js";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'podcast-generate',
  async job => {
    const { podcastId, blogUrl } = job.data;

    let podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
    });

    if (!podcast) {
      throw new UnrecoverableError("Podcast not found");
    }

    let scrapedText = podcast.scrapedText;
    let script = podcast.script;
    let audioUrl = podcast.audioUrl;

    // STEP 1: Scrape
    if (!scrapedText) {
      scrapedText = await scrapeUrl(blogUrl);
      await prisma.podcast.update({
        where: { id: podcastId },
        data: { scrapedText, status: "scraped" },
      });
    }

    // STEP 2: Script
    if (!script) {
      script = await generateScript(scrapedText);
      await prisma.podcast.update({
        where: { id: podcastId },
        data: { script, status: "script_generated" },
      });
    }

    if (!script) {
      throw new Error("Script missing before audio generation");
    }

    // STEP 3: Audio
    if (!audioUrl) {
      audioUrl = await generateAudio(script, podcastId);
      await prisma.podcast.update({
        where: { id: podcastId },
        data: { audioUrl, status: "completed" },
      });
    }
  },
  { connection }
);

worker.on('completed', job => {
  console.log(`Work with job id ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Work with job id ${job.id} has failed with ${err.message}`);
});