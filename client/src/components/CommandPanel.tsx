import { FC } from 'react';
import { styled } from 'styled-components';

import { TurretState } from '../types/types';

const Container = styled.div`
  display: grid;
  grid-template-rows: min-content 1fr;
  gap: 0.25rem;
`;

type CommandPanelProps = {
  handleStartGame: () => void;
  handleEndGame: () => void;
  handleAddTurret: () => void;
  selectedTurret: TurretState | undefined;
  handleLevelUpTurret: (turret: TurretState) => void;
};

const CommandPanel: FC<CommandPanelProps> = ({
  handleStartGame,
  handleEndGame,
  handleAddTurret,
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
    </Container>
  );
};

export default CommandPanel;
