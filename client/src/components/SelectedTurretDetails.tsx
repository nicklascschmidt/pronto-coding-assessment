import { styled } from 'styled-components';
import { TurretState } from '../types/types';
import { FC } from 'react';

const Container = styled.div`
  border: 1px solid black;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type SelectedTurretDetailsProps = {
  turret: TurretState;
  handleLevelUpTurret: (turret: TurretState) => void;
};

const SelectedTurretDetails: FC<SelectedTurretDetailsProps> = ({
  turret,
  handleLevelUpTurret
}) => {
  return (
    <Container>
      <div>Current Level: {turret.level}</div>
      <button
        style={{ display: 'block' }}
        onClick={() => handleLevelUpTurret(turret)}
      >
        +
      </button>
    </Container>
  );
};

export default SelectedTurretDetails;
