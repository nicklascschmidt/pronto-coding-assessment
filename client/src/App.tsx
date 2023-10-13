import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styled, { css } from 'styled-components';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Turret from './components/Turret';
import BalloonIcon from './components/BalloonIcon';
import CommandPanel from './components/CommandPanel';
import sampleLoonsData from './data/sampleLoonsData.json';
import {
  CANVAS_HEIGHT_PX,
  CANVAS_WIDTH_PX,
  LOON_CANVAS_CLASS_NAME,
  LOON_SIZE_PX,
  PX_MULTIPLIER
} from './constants/constants';
import {
  GameStatus,
  LoonPosition,
  LoonStateTopicMessageEventData,
  MessageEventData,
  MessageEventPayload,
  MessageHistory,
  MsgTopicMessageEventData,
  TurretState
} from './types/types';
import './App.css';

const WS_URL = 'ws://127.0.0.1:8000';

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content;
  gap: 1rem;
  margin: 1rem;
`;

// Width ranges from 0-200 for the loon positions, so imagine the
//  X-axis as 0-200, then scaled for the UI.
// Height ranges from -65-65, so imagine the Y-axis as both
//  positive and negative, from 0-65 in both directions.
const LoonCanvas = styled.div`
  width: calc(${CANVAS_WIDTH_PX}px * ${PX_MULTIPLIER});
  height: calc(${CANVAS_HEIGHT_PX}px * ${PX_MULTIPLIER});
  border: 1px solid black;
  position: relative;
`;

const Loon = styled.div<{
  $positionX: number;
  $positionY: number;
}>`
  width: ${LOON_SIZE_PX}px;
  height: ${LOON_SIZE_PX}px;
  transform: translate(-50%, -50%);
  position: absolute;
  top: ${({ $positionY }) =>
    typeof $positionY === 'number' &&
    css`calc(50% - ${$positionY}px * ${PX_MULTIPLIER})`};
  left: ${({ $positionX }) =>
    typeof $positionX === 'number' &&
    css`calc(${$positionX}px * ${PX_MULTIPLIER})`};
`;

const HorizontalLine = styled.div`
  position: absolute;
  bottom: 50%;
  border-bottom: 1px solid purple;
  width: 100%;
`;

const VerticalLine = styled.div`
  position: absolute;
  left: 0%;
  border-right: 1px solid purple;
  height: 100%;
`;

const App = () => {
  const loonCanvasRef = useRef<HTMLDivElement>(null);
  const [loonsPositions, setLoonsPositions] = useState<
    [string, LoonPosition][]
  >(
    // []
    sampleLoonsData as [string, LoonPosition][]
  );
  const [turrets, setTurrets] = useState<TurretState[]>([]);
  const [selectedTurret, setSelectedTurret] = useState<TurretState>();
  const [messageHistory, setMessageHistory] = useState<MessageHistory>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('NOT_STARTED');
  const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true,
    onMessage: (msgEvent: MessageEvent<MessageEventPayload['data']>) => {
      // console.log('msgEvent.data', msgEvent.data);
      const parsedMessage: MessageEventData = JSON.parse(msgEvent.data);
      if ('msg' in parsedMessage) {
        console.log('received a message', parsedMessage);
        if (
          (parsedMessage as MsgTopicMessageEventData)?.msg?.msg.includes(
            'No loons left'
          )
        ) {
          setGameStatus('ENDED');
        } else {
          setMessageHistory([
            {
              timestamp: Date.now(),
              text:
                (parsedMessage as MsgTopicMessageEventData)?.msg?.msg ||
                'No message data.'
            },
            ...messageHistory
          ]);
        }
      } else if ('loonState' in parsedMessage) {
        console.log('received loon state', parsedMessage);
        const loonStateEntries = Object.entries(
          (parsedMessage as LoonStateTopicMessageEventData).loonState
        );
        setLoonsPositions(loonStateEntries);
      } else {
        console.log('parsed', parsedMessage);
      }
    }
  });

  const handleStartGame = () => {
    console.log('start!');
    sendJsonMessage({ type: 'start_game' });
    setGameStatus('IN_PROGRESS');
    setSelectedTurret(undefined);
  };

  const handleEndGame = () => {
    console.log('end!');
    // sendJsonMessage({ type: "end_game" });
    setGameStatus('ENDED');
  };

  const handleAddTurret = () => {
    setTurrets([
      ...turrets,
      {
        level: 0,
        id: uuidv4()
      }
    ]);
  };

  const handleLevelUpTurret = (turret: TurretState) => {
    const nextTurrets = [...turrets];
    const selectedTurretIndex = turrets.findIndex(
      (item) => item.id === turret.id
    );
    nextTurrets[selectedTurretIndex].level += 1;
    setTurrets(nextTurrets);
  };

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        type: 'test123'
      });
    }
  }, [sendJsonMessage, readyState]);

  return (
    <AppContainer>
      <CommandPanel
        handleStartGame={handleStartGame}
        handleEndGame={handleEndGame}
        handleAddTurret={handleAddTurret}
        messageHistory={messageHistory}
        selectedTurret={selectedTurret}
        handleLevelUpTurret={handleLevelUpTurret}
      />

      <LoonCanvas ref={loonCanvasRef} className={LOON_CANVAS_CLASS_NAME}>
        {turrets.map((turret, idx) => (
          <Turret
            key={idx}
            turret={turret}
            containerRef={loonCanvasRef}
            gameStatus={gameStatus}
            loonsPositions={loonsPositions}
            sendJsonMessage={sendJsonMessage}
            setSelectedTurret={setSelectedTurret}
            isSelected={turret.id === selectedTurret?.id}
          />
        ))}
        <HorizontalLine />
        <VerticalLine />
        {loonsPositions.map(([_loonId, loonData], idx) => (
          <Loon
            key={idx}
            $positionX={loonData.position_x}
            $positionY={loonData.position_y}
          >
            <BalloonIcon size={LOON_SIZE_PX} />
          </Loon>
        ))}
      </LoonCanvas>
    </AppContainer>
  );
};

export default App;
