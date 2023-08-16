import React, { useState } from "react";
import axios from "axios";
import Message from "../Message/Message";
import styles from "./ChatContainer.module.scss";

interface IMessage {
  text: string;
  isBot: boolean;
  isStopped: boolean;
  load: boolean;
}
const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const addMessage = (text: string, isBot: boolean) => {
    if (!isBot) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputMessage, isBot, isStopped: false, load: false },
      ]);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text, isBot, isStopped: false, load: false },
      ]);
    }
  };

  const updateBotMessage = (text: string, load: boolean) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      if (updatedMessages[prevMessages.length - 1].isBot) {
        const lastBotMessageIndex = updatedMessages.length - 1;
        if (lastBotMessageIndex >= 0) {
          if (updatedMessages[lastBotMessageIndex].isStopped) {
            setLoading(false);
            return updatedMessages;
          } else {
            updatedMessages[lastBotMessageIndex].text = text;
            updatedMessages[lastBotMessageIndex].load = load;
          }
        }
        return updatedMessages;
      }
      return updatedMessages;
    });
  };
  const handleStopBot = (message: IMessage) => {
    console.log(message);
    if (!message.isBot || message.isStopped) return;

    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.map((msg) => {
        if (msg === message) {
          console.log(msg);
          return { ...msg, isStopped: true, load: false };
        }
        return msg;
      });
      return updatedMessages;
    });
  };
  
  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || loading) return;
    setLoading(true);
    addMessage(inputMessage, false);
    setInputMessage("");
    try {
      const response = await axios.post(
        "http://185.46.8.130/api/v1/chat/send-message",
        {
          message: inputMessage,
        }
      );
      const dataChunks = response.data;
      const formattedInput = `[${dataChunks.replace(/}{/g, "},{")}]`;
      const parsedData = JSON.parse(formattedInput);

      let botMessage: string = "";
      addMessage("", true);
      for (const chunk of parsedData) {
        if (chunk.status === "done") {
          setLoading(false);
          updateBotMessage(botMessage, false);
          break;
        }
        botMessage += chunk.value;
        updateBotMessage(botMessage, true);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMargin}>
        <h2 className={styles.chatTitle}>Bot chat</h2>
        <p className={styles.chatSubtitle}>AI-based service</p>
        <div className={styles.messageContainer}>
          {messages.map((message, index) => (
            <Message
              key={index}
              message={message}
              handleStopBot={handleStopBot}
              loading={loading}
            />
          ))}
        </div>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Start typing here..."
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div
            className={`${styles.buttonContainer} ${
              loading ? styles.disabled : ""
            }`}
          >
            <button onClick={handleSendMessage} disabled={loading}></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
