import { createClient } from "@supabase/supabase-js";

export async function uploadAudioBuffer(wavBuffer, podcastId) {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
            );
    
      const filePath = `podcasts/${podcastId}.wav`;
    
      const { error } = await supabase.storage
        .from("audio")
        .upload(filePath, wavBuffer, {
          contentType: "audio/wav",
          upsert: true,
        });
    
      if (error) throw error;
    
      const { data } = supabase.storage
        .from("audio")
        .getPublicUrl(filePath);
    
      return data.publicUrl;
    }catch(err){
        throw new Error(err.message)
    }
}
