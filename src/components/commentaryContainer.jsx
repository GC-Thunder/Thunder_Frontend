import React from 'react'

const CommentaryContainer = (textChunk) => {
    console.log(typeof textChunk)
  return (
    <div className=" overflow-y-auto p-4 bg-gray-950 text-white rounded-lg shadow-md text-center mx-20 my-40">
        {
            textChunk.textChunk
        }
    </div>
  )
}

export default CommentaryContainer