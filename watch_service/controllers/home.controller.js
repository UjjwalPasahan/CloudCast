import prisma from '../lib/prisma.js';

const getAllVideos = async (req, res) => {
  try {
    const allData = await prisma.videoData.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    console.log('Fetched videos:', allData.length);
    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch videos',
      message: error.message
    });
  }
}

export default getAllVideos;