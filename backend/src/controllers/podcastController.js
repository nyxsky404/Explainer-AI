import { generatePodcast } from "../services/podcastService.js";

export const podcastGenerate = async(req, res) => {
    console.log(req.body)
    const {blogURL} = req.body

    try{
        if (!req.body || !blogURL){
            return res.status(400).json({
                msg: "Url not Provided"
            })
        }

        const Buffer = await generatePodcast(blogURL)
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader("Content-Length", Buffer.length);
        res.send(Buffer);

    }catch(err){
        console.error(err);
    }
}