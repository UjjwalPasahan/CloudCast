"use client"
import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { LogIn, LogOut, Video, Sparkles } from 'lucide-react'

const AuthPage = () => {
    const { data } = useSession()
    console.log('session data : ', data);

    const signin = () => {
        console.log("Signing in Google");
        signIn("google");
    }

    const signout = () => {
        console.log("Signing out of Google");
        signOut();
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center px-4'>
            <div className='max-w-md w-full'>
                <div className='text-center mb-12'>
                    <div className='flex items-center justify-center mb-6'>
                        <div className='p-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-3xl shadow-2xl shadow-purple-500/50'>
                            <Video className='w-12 h-12 text-white' />
                        </div>
                    </div>
                    <h1 className='text-4xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>
                        Welcome Back
                    </h1>
                    <p className='text-gray-400 text-lg'>
                        Sign in to access your video platform
                    </p>
                </div>

                <div className='bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm space-y-4'>
                    {!data ? (
                        <>
                            <button
                                type="submit"
                                onClick={signin}
                                className="w-full group relative overflow-hidden text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:ring-4 focus:outline-none focus:ring-purple-500/50 font-semibold rounded-xl text-base px-6 py-4 text-center transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center space-x-3"
                            >
                                <LogIn className='w-5 h-5 group-hover:scale-110 transition-transform' />
                                <span>Sign In with Google</span>
                                <Sparkles className='w-4 h-4 absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity' />
                            </button>

                            <div className='flex items-center space-x-4 py-4'>
                                <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent' />
                                <span className='text-sm text-gray-500 font-medium'>Quick Access</span>
                                <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent' />
                            </div>

                            <div className='bg-gray-800/50 border border-gray-700 rounded-xl p-5 backdrop-blur-sm'>
                                <div className='flex items-start space-x-3'>
                                    <div className='p-2 bg-purple-500/20 rounded-lg mt-0.5'>
                                        <Sparkles className='w-5 h-5 text-purple-400' />
                                    </div>
                                    <div>
                                        <h3 className='text-white font-medium mb-1'>New here?</h3>
                                        <p className='text-sm text-gray-400'>
                                            Sign in to upload videos, create playlists, and engage with content creators.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-5 mb-6'>
                                <div className='flex items-center space-x-3 mb-3'>
                                    <div className='w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg'>
                                        {data.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className='flex-1'>
                                        <p className='text-white font-semibold text-lg'>{data.user?.name}</p>
                                        <p className='text-gray-400 text-sm'>{data.user?.email}</p>
                                    </div>
                                </div>
                                <div className='flex items-center justify-between pt-3 border-t border-gray-700'>
                                    <span className='text-sm text-gray-400'>Status</span>
                                    <div className='flex items-center space-x-2'>
                                        <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                                        <span className='text-sm text-green-400 font-medium'>Active Session</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                onClick={signout}
                                className="w-full group relative overflow-hidden text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:ring-4 focus:outline-none focus:ring-red-500/50 font-semibold rounded-xl text-base px-6 py-4 text-center transition-all duration-300 shadow-lg hover:shadow-red-500/50 flex items-center justify-center space-x-3"
                            >
                                <LogOut className='w-5 h-5 group-hover:scale-110 transition-transform' />
                                <span>Sign Out</span>
                            </button>
                        </>
                    )}
                </div>

                <p className='text-center text-sm text-gray-500 mt-8'>
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    )
}

export default AuthPage