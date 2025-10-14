import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderAuth from "./components/sessionProviderAuth.jsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
 title: "CloudCast"
};

export default function RootLayout({ children }) {
 return (
   <html lang="en">
     <SessionProviderAuth>
       <body className={inter.className}>{children}</body>
     </SessionProviderAuth>
   </html>
 );}