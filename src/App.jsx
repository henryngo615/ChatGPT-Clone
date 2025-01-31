import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";

function App() {
  const [typing, setTyping] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT!",
      sender: "ChatGPT",
      direction: "incoming",
    },
  ]);

  // 🔹 Fetch API Key from Netlify Function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/.netlify/functions/getSecrets");
        const data = await response.json();
        setApiKey(data.apiKey);
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };

    fetchApiKey();
  }, []);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    if (!apiKey) {
      console.error("API Key is not available yet.");
      return;
    }

    const apiMessages = chatMessages.map((messageObject) => ({
      role: messageObject.sender === "ChatGPT" ? "assistant" : "user",
      content: messageObject.message,
    }));

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "Explain all concepts like I am 10 years old" }, ...apiMessages],
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setMessages([...chatMessages, { message: data.choices[0].message.content, sender: "ChatGPT", direction: "incoming" }]);
      } else {
        console.error("Invalid response from OpenAI:", data);
      }
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
    }

    setTyping(false);
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList scrollBehavior="smooth" typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}>
              {messages.map((message, i) => (
                <Message key={i} model={message} />
              ))}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
