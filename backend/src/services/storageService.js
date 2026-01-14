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
    console.log("Buffer size to upload:", wavBuffer.length);

    const supabase = getSupabaseClient();
    const filePath = getPodcastFilePath(podcastId);
    console.log("Uploading to path:", filePath);

    const { data, error } = await supabase.storage
      .from("audio")
      .upload(filePath, wavBuffer, {
        contentType: "audio/wav",
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error.message);
      throw error;
    }

    console.log("Upload successful:", data);
    const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
    console.log("Public URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error("Storage service error:", err);
    throw new Error(`Upload failed: ${err.message}`);
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
