import { useState } from 'react'
import React from 'react'
import plus from '../assets/plus.svg'
import clock from '../assets/clock.svg'
import star from '../assets/star.svg' 
import { useToggleMenu } from '../Context/context'
import { useCurrentChatMap } from '../Context/context'



const ChatSideBar = () => {
  const {chatArray,setChatArray} = useToggleMenu();
  const {currentChatMap,setCurrentChatMap} = useCurrentChatMap();
 
  return (
    <div className="wrapper h-screen  md:w-[34vw] relative lg:w-[24vw] sm:left-[-500px] md:left-0">
      <div className="rightMenu h-full w-full bg-white shadow-lg relative">
        <div className="absolute top-0 right-[-5px] h-full w-1 bg-white" style={{
          boxShadow: "2px 0px 8px 0px rgba(0,0,0,0.3)",
          zIndex: 10
        }}></div>
        <div className="py-10 innerWrapepr flex flex-col items-center gap-10 justify-between h-full bg-gradient-to-b from-gray-100 to-gray-200">
          <div className="iconContainer relative">
            <div className="activeTab h-7 w-1 bg-blue-600 rounded-3xl absolute left-[-12px] transition-all duration-300 ease-in-out" style={{
              top:`4px`
             }}></div>
            <ul className='flex gap-5'>
              <li className='cursor-pointer hover:scale-110 transition-transform duration-200 p-2 rounded-full hover:bg-blue-100'>< img src={plus} alt="" srcSet="" className="w-6 h-6" /></li>
              <li className='cursor-pointer hover:scale-110 transition-transform duration-200 p-2 rounded-full hover:bg-blue-100' ><img src={clock} alt="" srcSet="" className="w-6 h-6" /></li>
              <li className='cursor-pointer hover:scale-110 transition-transform duration-200 p-2 rounded-full hover:bg-blue-100' ><img src={star} alt="" srcSet="" className="w-6 h-6" /></li>
            </ul>
          </div>
          <div className="chatList w-full h-full flex flex-col items-center">
            <div className="header text-center w-full">
              <h1 className='text-cyan-500 font-bold text-3xl'>Your Recent Chats</h1>
            </div>
                    <ul className='inline-flex items-center flex-col justify-center w-full rounded-lg overflow-hidden shadow-md'>
                        {
                            Array.from(chatArray).map((eli,ind) => {
                                return (
                                    <li onClick={()=> setCurrentChatMap(eli[1])} className='py-4 px-6  w-full border-b border-blue-100 cursor-pointer h-16 overflow-x-hidden hover:bg-blue-50 transition-all duration-200 text-gray-700 font-medium' key={ind}>{eli[0]}</li>
                                )
                            })
                        }
                    </ul>
                </div>
          <div className="bottomMenu">
           
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatSideBar