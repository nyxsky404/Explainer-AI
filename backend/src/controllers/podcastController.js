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
                status: "Completed",
                user: {
                    connect: {
                        id: req.userID
                    }
                }
            },
        })

        res.status(200).json(data)


    }catch(err){
        throw new Error(err)
    }
}

export const checkPodcast = async(req, res)=>{
    const {id} = req.params

    try{

        if (!id){
            return res.status(400).json({
                msg: "No id provided"
            })
        }
    
        const data = await prisma.podcast.findUnique({
            where: {id}
        })
    
        if (!data){
            return res.status(400).json({
                msg: "No data found"
            })
        }
    
        res.status(200).json({
            msg: "podcast found 🎉",
            data
        })
    }catch(err){
        console.log(err)
        throw new Error(err)
    }

}


export const getPodcast = async(req, res) => {
    const userId = req.userID

    try {
        const data = await prisma.user.findMany({
            where : {id: userId},
            include: {
                podcasts: true,
            }
        })

        if (!data){
            return res.status(400).json({
                msg: "No data found"
            })
        }
    
        res.status(200).json(data)
    }catch(err){
        throw new Error(err)
    }
}