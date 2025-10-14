"use client"

import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Upload, LogIn, LogOut, Video, Sparkles } from 'lucide-react'

const NavBar = () => {
    const router = useRouter()
    const { data } = useSession()
    console.log('data---------- ', data);

    const goToUpload = () => {
        router.push('/upload')
    }

    const goToHome = () => {
        router.push('/')
    }

    return (
        <nav className="bg-gray-900 border-b border-gray-800 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <button
                    onClick={goToHome}
                    className="flex items-center space-x-3 group cursor-pointer"
                >
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        CloudCast
                    </span>
                </button>

                <div className="flex items-center space-x-3">
                    {data ? (
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={goToUpload}
                                className="group flex items-center space-x-2 text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:ring-4 focus:outline-none focus:ring-purple-500/50 font-medium rounded-lg text-sm px-5 py-2.5 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
                            >
                                <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Upload</span>
                            </button>

                            <button
                                type="button"
                                onClick={signOut}
                                className="group flex items-center space-x-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 transition-all duration-300"
                            >
                                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Sign Out</span>
                            </button>

                            <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-700">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-white">
                                        {data.user.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Welcome back!
                                    </p>
                                </div>
                                <div className="relative">
                                    <img
                                        className="w-10 h-10 rounded-full border-2 border-purple-500 shadow-lg"
                                        src={data.user.image}
                                        alt={data.user.name}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={signIn}
                            className="group flex items-center space-x-2 text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:ring-4 focus:outline-none focus:ring-purple-500/50 font-medium rounded-lg text-sm px-6 py-2.5 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
                        >
                            <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Sign In</span>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default NavBar