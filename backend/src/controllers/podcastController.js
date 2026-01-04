import { v4 as uuid } from 'uuid';
import { generatePodcast } from "../services/podcastService.js";
import { uploadAudioBuffer } from "../services/storageService.js";
import prisma from '../config/db.js';

export const podcastGenerate = async(req, res) => {
    console.log(req.body)
    const {blogUrl} = req.body

    try{
        if (!req.body || !blogUrl){
            return res.status(400).json({
                msg: "Url not Provided"
            })
        }

        const wavBuffer = await generatePodcast(blogUrl)
        const podcastId = uuid()
        const audioUrl = await uploadAudioBuffer(wavBuffer, podcastId)

        const data = await prisma.podcast.create({
            data: {
                id: podcastId,
                blogUrl,
                audioUrl,
                status: "Completed"
            }
        })

        res.status(200).json(data)


    }catch(err){
        console.error(err);
    }
}