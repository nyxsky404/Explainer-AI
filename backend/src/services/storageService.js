import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

/**
 * Validate and normalize an ID for file path construction.
 * @param {string} id - The ID to validate
 * @param {string} context - Context for error message (e.g., 'gossipId', 'podcastId')
 * @returns {string} - The normalized ID
 * @throws {Error} - If ID is invalid
 */
function validateAndNormalizeId(id, context = 'id') {
  if (id == null) {
    throw new Error(`${context} is required but was ${id}`);
  }
  
  const normalizedId = String(id).trim();
  
  if (normalizedId === '') {
    throw new Error(`${context} cannot be empty or whitespace`);
  }
  
  return normalizedId;
}

function getPodcastFilePath(podcastId) {
  const validatedId = validateAndNormalizeId(podcastId, 'podcastId');
  return `podcasts/${validatedId}.wav`;
}

export async function uploadAudioBuffer(wavBuffer, podcastId) {
  const supabase = getSupabaseClient();
  const filePath = getPodcastFilePath(podcastId);

  const { error } = await supabase.storage
    .from("audio")
    .upload(filePath, wavBuffer, {
      contentType: "audio/wav",
      upsert: true,
    });

  if (error) {
    console.error("Supabase upload error:", error.message);
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
  return urlData.publicUrl;
}

export async function deleteAudioFile(podcastId) {
  try {
    const supabase = getSupabaseClient();
    const filePath = getPodcastFilePath(podcastId);

    const { error } = await supabase.storage.from("audio").remove([filePath]);

    if (error) {
      console.error(`Error deleting audio for podcast ${podcastId}:`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error deleting audio for podcast ${podcastId}:`, err.message);
    return false;
  }
}

function getSummaryFilePath(summaryId) {
  const validatedId = validateAndNormalizeId(summaryId, 'summaryId');
  return `summaries/${validatedId}.wav`;
}

export async function uploadSummaryAudio(wavBuffer, summaryId) {
  const supabase = getSupabaseClient();
  const filePath = getSummaryFilePath(summaryId);

  const { error } = await supabase.storage
    .from("audio")
    .upload(filePath, wavBuffer, {
      contentType: "audio/wav",
      upsert: true,
    });

  if (error) {
    console.error("Supabase summary audio upload error:", error.message);
    throw new Error(`Summary audio upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
  return urlData.publicUrl;
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

    return true;
  } catch (err) {
    console.error(`Error deleting summary audio ${summaryId}:`, err.message);
    return false;
  }
}

export async function uploadDocument(buffer, fileName, contentType) {
  const supabase = getSupabaseClient();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `documents/${crypto.randomUUID()}_${sanitized}`;

  const { error } = await supabase.storage
    .from("audio")
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("Document upload error:", error.message);
    throw new Error(`Document upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
  return urlData.publicUrl;
}

// ============== GOSSIP AUDIO STORAGE ==============

function getGossipFilePath(gossipId) {
  const validatedId = validateAndNormalizeId(gossipId, 'gossipId');
  return `gossips/${validatedId}.wav`;
}

export async function uploadGossipAudioBuffer(wavBuffer, gossipId) {
  const supabase = getSupabaseClient();
  const filePath = getGossipFilePath(gossipId);

  const { error } = await supabase.storage
    .from("audio")
    .upload(filePath, wavBuffer, {
      contentType: "audio/wav",
      upsert: true,
    });

  if (error) {
    console.error("Supabase gossip audio upload error:", error.message);
    throw new Error(`Gossip audio upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
  return urlData.publicUrl;
}

export async function deleteGossipAudio(gossipId) {
  try {
    const supabase = getSupabaseClient();
    const filePath = getGossipFilePath(gossipId);

    const { error } = await supabase.storage.from("audio").remove([filePath]);

    if (error) {
      console.error(`Error deleting gossip audio for ${gossipId}:`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error deleting gossip audio for ${gossipId}:`, err.message);
    return false;
  }
}
