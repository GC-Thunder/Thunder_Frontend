




const Card = ({ question }) => {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 w-64 flex flex-col gap-3 cursor-pointer">
        <p className="text-sm font-medium text-gray-800">{question}</p>
      
      </div>
    );
  };

  export default Card