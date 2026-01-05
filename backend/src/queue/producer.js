import { Queue } from "bullmq";

const myQueue = new Queue("podcast-generate");

export async function addJobs(podcastId, blogUrl) {
  const job = await myQueue.add("podcastJob",
    { podcastId, blogUrl},
    {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    });

  console.log("job added with id", job.id);
}