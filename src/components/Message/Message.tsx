import React from "react";
import styles from "./Message.module.scss";
import botAvatar from "../../assets/botAvatar.png";
import userAvatar from "../../assets/userAvatar.png";
import Stop from "../../assets/hand-solid.svg";

interface Message {
  text: string;
  isBot: boolean;
  isStopped: boolean;
  load: boolean;
}
interface MessageProps {
  message: Message;
  handleStopBot: (message: Message) => void;
  loading: boolean;
}

const Message: React.FC<MessageProps> = ({
  message,
  handleStopBot,
  loading,
}) => {
  
  return (
    <div
      className={`${styles.messagerContainer} ${
        !message.isBot && styles.messageUser
      }`}
    >
      <img
        className={styles.avatar}
        src={message.isBot ? botAvatar : userAvatar}
        alt={message.isBot ? "Bot" : "User"}
      />

      <div className={styles.message}>
        {message.isBot && !message.isStopped && message.load && (
          <button
            className={styles.stop}
            onClick={() => handleStopBot(message)}
          >
            <img src={Stop} alt={Stop} />
          </button>
        )}
        <p className={styles.messageText}>
          {message.text}
          {message.load && (
            <span
              className={`${styles.cursor} ${
                loading ? styles.typingAnimation : ""
              }`}
            >
              &nbsp;
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Message;
