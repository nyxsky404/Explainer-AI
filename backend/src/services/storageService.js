import { createClient } from "@supabase/supabase-js";

// Helper function to get Supabase client
function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// Helper function to get file path for a podcast
function getPodcastFilePath(podcastId) {
  return `podcasts/${podcastId}.wav`;
}

export async function uploadAudioBuffer(wavBuffer, podcastId) {
  try {
    const supabase = getSupabaseClient();
    const filePath = getPodcastFilePath(podcastId);

    const { error } = await supabase.storage
      .from("audio")
      .upload(filePath, wavBuffer, {
        contentType: "audio/wav",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("audio").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function deleteAudioFile(podcastId) {
  try {
    const supabase = getSupabaseClient();
    const filePath = getPodcastFilePath(podcastId);

    const { error } = await supabase.storage.from("audio").remove([filePath]);

    if (error) {
      // Log error but don't throw - file might not exist
      console.error(
        `Error deleting audio file for podcast ${podcastId}:`,
        error.message
      );
      return false;
    }

    console.log(`Audio file deleted successfully for podcast ${podcastId}`);
    return true;
  } catch (err) {
    // Log error but don't throw - deletion failure shouldn't break podcast deletion
    console.error(
      `Error deleting audio file for podcast ${podcastId}:`,
      err.message
    );
    return false;
  }
}
