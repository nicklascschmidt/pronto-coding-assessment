import { FC } from 'react';
import styled from 'styled-components';

import { MessageHistoryList } from '../types/types';

const MessageHistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  /* height: 400px; */
  border: 1px solid black;
  padding: 0.5rem;
  overflow: auto;
`;

const TimeText = styled.p`
  font-size: 0.8rem;
  margin: 0;
`;

type MessageHistoryProps = {
  messageHistory: MessageHistoryList;
};

const MessageHistory: FC<MessageHistoryProps> = ({ messageHistory }) => {
  return (
    <MessageHistoryContainer>
      <h5 style={{ textAlign: 'center' }}>Message History</h5>
      {messageHistory.map(({ timestamp, text }, idx) => (
        <div key={idx}>
          <TimeText>{new Date(timestamp).toLocaleTimeString()}</TimeText>
          <p style={{ margin: 0 }}>{text}</p>
        </div>
      ))}
    </MessageHistoryContainer>
  );
};

export default MessageHistory;
