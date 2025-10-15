
import prisma from '../lib/prisma.js';
// Instead of: const prisma = new PrismaClient()
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

export async function addVideoDetailsToDB(title, description, author, url) {
 const videoData = await prisma.videoData.create({
  data: {
      title: title,
      description: description,
      author: author,
      url: url
  } })
 console.log(videoData);
}