import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

function getPodcastFilePath(podcastId) {
  return `podcasts/${podcastId}.wav`;
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
  return `summaries/${summaryId}.wav`;
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
  return `gossips/${gossipId}.wav`;
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
