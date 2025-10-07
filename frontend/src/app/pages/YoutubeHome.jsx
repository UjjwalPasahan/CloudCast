import React, { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import NavBar from "../components/NavBar";
import { BackgroundLines } from "../components/ui/background-lines";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const YouTubeHome = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getVideos = async () => {
      try {
        const res = await axios.get("http://localhost:8082/watch/home");
        setVideos(res.data);
      } catch (error) {
        console.error("Error in fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    getVideos();
  }, []);

  return (
    <div className="w-full">
      <NavBar />
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="lds-dual-ring"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="container mx-auto flex justify-center items-center h-screen text-gray-500">
          No videos available at the moment. Check back later.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 p-8">
          {videos.map((video) => (
            <div
              key={`${video.id}-${video.title}`}
              className="bg-gray-800 rounded-md overflow-hidden shadow-lg"
            >
              <div>
                <ReactPlayer
                  url={video.url}
                  className="react-player z-50"
                  width="100%"
                  height="180px"
                  controls={true}
                />
              </div>
              <div className="p-4 text-white">
                <h2 className="text-lg font-semibold mb-2">{video.title}</h2>
                <p className="text-gray-400">Author - {video.author}</p>
                <p className="text-gray-400">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YouTubeHome;