/*
create a stream function that takes a response object and returns a stream of data
The stream should emit the following events:

- `response.created`
- `response.output_text.delta`
- `response.completed`
- `error`
*/


const streamOutput = async (response) => {

    const eventSource=  new EventSource(response.url,()=>{
        if (response.created){
            while (!response.completed){
                const data = response.output  
                console.log(data)
                // Emit the data to the stream
            }
        }
    })

}

// testing the above function
const testStreamOutput = async () => {
    const response = {
        url: 'http://localhost:5000/api/stream',
        created: true,
        output: {
            delta: 'Hello, world!'
        },
        completed: false
    };

    await streamOutput(response);
};
testStreamOutput();
