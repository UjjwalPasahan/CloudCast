"use client"
// import AuthPage from "./pages/AuthPage";
// import Room from "./pages/Room";
import YouTubeHome from "./pages/YoutubeHome";
// import UploadForm from "./upload/page";
import YouTubeHLS from "./pages/YouTubeHLS"

export default function Home() {
  return (
    <div suppressHydrationWarning={true}>
      <YouTubeHome/>
      {/* <Room/>
      <AuthPage/> */}
      {/* <UploadForm/> */}

      <p>HLS Streaming</p>
      <YouTubeHLS/>
    </div>
  );
}
