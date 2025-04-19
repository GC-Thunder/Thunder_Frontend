export const processStreamChunk = (chunk, decoder) => {
    const messages = chunk.split('\n\n');
    const processedData = [];
    
    for (const msg of messages) {
      const lines = msg.split('\n');
      let eventName;
      let dataPayload;
  
      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.replace('event:', '').trim();
        } else if (line.startsWith('data:')) {
          try {
            dataPayload = JSON.parse(line.replace('data:', '').trim());
          } catch {
            // ignore parse errors
          }
        }
      }
  
      if (eventName || dataPayload) {
        processedData.push({ eventName, dataPayload });
      }
    }
    
    return processedData;
  };