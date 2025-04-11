const LlmConfig = () => {
    return (
      <div className="flex items-center gap-2 bg-white rounded-full shadow-md p-2 pl-3 max-w-[15rem]">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-gray-700">@ChatGPT</span>
        </div>
        <button className="bg-cyan-500 text-white text-sm font-medium px-4 py-1 rounded-full cursor-pointer">
          Create
        </button>
      </div>
    );
  };
  
export default LlmConfig
  