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

// Summary audio functions
function getSummaryFilePath(summaryId) {
  return `summaries/${summaryId}.wav`;
}

export async function uploadSummaryAudio(wavBuffer, summaryId) {
  try {
    console.error("StorageService: Uploading summary audio, buffer size:", wavBuffer.length);

    const supabase = getSupabaseClient();
    const filePath = getSummaryFilePath(summaryId);

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

    console.error("StorageService: Summary audio upload successful:", data);
    const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
    return urlData.publicUrl;
  } catch (err) {
    console.error("Storage service error:", err);
    throw new Error(`Summary audio upload failed: ${err.message}`);
  }
}

export async function deleteSummaryAudio(summaryId) {
  try {
    const supabase = getSupabaseClient();
    const filePath = getSummaryFilePath(summaryId);

    const { error } = await supabase.storage.from("audio").remove([filePath]);

    if (error) {
      console.error(`Error deleting summary audio ${summaryId}:`, error.message);
      return false;
    }

    console.log(`Summary audio deleted successfully: ${summaryId}`);
    return true;
  } catch (err) {
    console.error(`Error deleting summary audio ${summaryId}:`, err.message);
    return false;
  }
}

// Document upload (for PDFs)
export async function uploadDocument(buffer, fileName, contentType) {
  try {
    const supabase = getSupabaseClient();
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `documents/${crypto.randomUUID()}_${sanitized}`;

    const { data, error } = await supabase.storage
      .from("audio")
      .upload(filePath, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error("Document upload error:", error.message);
      throw error;
    }

    const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
    return urlData.publicUrl;
  } catch (err) {
    console.error("Document upload failed:", err);
    throw new Error(`Document upload failed: ${err.message}`);
  }
}