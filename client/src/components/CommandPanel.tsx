import { FC } from 'react';
import styled from 'styled-components';

import { MessageHistory, TurretState } from '../types/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MessageHistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 400px;
  border: 1px solid black;
  padding: 0.5rem;
  overflow: auto;
`;

const TimeText = styled.p`
  font-size: 0.8rem;
  margin: 0;
`;

type CommandPanelProps = {
  handleStartGame: () => void;
  handleEndGame: () => void;
  handleAddTurret: () => void;
  messageHistory: MessageHistory;
  selectedTurret: TurretState | undefined;
  handleLevelUpTurret: (turret: TurretState) => void;
};

const CommandPanel: FC<CommandPanelProps> = ({
  handleStartGame,
  handleEndGame,
  handleAddTurret,
  messageHistory,
  selectedTurret,
  handleLevelUpTurret
}) => {
  return (
    <Container>
      <button onClick={handleStartGame}>Start Game</button>
      <button onClick={handleEndGame}>End Game</button>
      <button onClick={handleAddTurret}>Add Turret</button>
      {selectedTurret && (
        <button onClick={() => handleLevelUpTurret(selectedTurret)}>
          Level Up Turret
        </button>
      )}
      <MessageHistoryContainer>
        <h5 style={{ textAlign: 'center' }}>Message History</h5>
        {messageHistory.map(({ timestamp, text }, idx) => (
          <div key={idx}>
            <TimeText>{new Date(timestamp).toLocaleTimeString()}</TimeText>
            <p style={{ margin: 0 }}>{text}</p>
          </div>
        ))}
      </MessageHistoryContainer>
    </Container>
  );
};

export default CommandPanel;
