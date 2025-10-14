import React, { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import NavBar from "../components/NavBar";
import { Play, User, Clock, Loader2, VideoOff, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <NavBar />

      {loading ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full animate-pulse mb-6"></div>
            <Loader2 className="w-20 h-20 text-white animate-spin absolute top-0 left-0" />
          </div>
          <p className="text-gray-400 text-lg font-medium mt-4">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="container mx-auto flex flex-col justify-center items-center h-screen px-4">
          <div className="text-center max-w-md">
            <div className="mb-6 relative inline-block">
              <div className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-3xl border border-purple-500/30">
                <VideoOff className="w-16 h-16 text-purple-400" />
              </div>
              <Sparkles className="w-6 h-6 text-purple-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">No Videos Yet</h2>
            <p className="text-gray-400 text-lg mb-6">
              Be the first to share content! Upload your videos and start building your collection.
            </p>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Check back later for new content</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <Play className="w-8 h-8 text-purple-400" />
              <span>Discover Videos</span>
            </h1>
            <p className="text-gray-400 ml-11">
              Explore {videos.length} amazing {videos.length === 1 ? 'video' : 'videos'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <div
                key={`${video.id}-${video.title}`}
                className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative overflow-hidden bg-gray-950">
                  <ReactPlayer
                    url={video.url}
                    className="react-player"
                    width="100%"
                    height="200px"
                    controls={true}
                    light={false}
                  />
                </div>

                <div className="p-5 space-y-3">
                  <h2 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-purple-400 transition-colors leading-tight">
                    {video.title}
                  </h2>

                  <div className="flex items-center space-x-2 text-sm">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-gray-400 font-medium">{video.author}</span>
                  </div>

                  {video.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeHome;