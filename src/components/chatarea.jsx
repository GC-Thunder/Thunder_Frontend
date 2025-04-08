// this is a test component

import { useMyContext } from '../Context/context';
function ChatArea() {
    const { value, setValue } = useMyContext();
  
    return (
      <div>
        <h1 className="text-4xl font-bold">{value}</h1>
        <button 
          onClick={() => setValue("You clicked the button!")} 
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Change Value
        </button>
      </div>
    );
  };
  
  export default ChatArea;
