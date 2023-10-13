import { Dispatch, SetStateAction } from 'react';
import {
  LoonPositions,
  LoonStateTopicMessageEventData,
  MessageEventData,
  MessageEventPayload,
  MessageHistoryList,
  MsgTopicMessageEventData
} from '../types/types';

// This is fired when we receive a message over the websocket connection.
// Each time a message comes in, we'll take a resulting action, typically
//  updating a value in the App's state.
export const handleWebsocketMessage = (
  msgEvent: MessageEvent<MessageEventPayload['data']>,
  contextData: {
    messageHistory: MessageHistoryList;
    setMessageHistory: Dispatch<SetStateAction<MessageHistoryList>>;
    setLoonsPositions: Dispatch<SetStateAction<LoonPositions>>;
  }
) => {
  const { messageHistory, setMessageHistory, setLoonsPositions } = contextData;
  const parsedMessage: MessageEventData = JSON.parse(msgEvent.data);

  // Depending on which topic subscription we're receiving a message from,
  //    use the message to trigger a state update for the App.
  if ('msg' in parsedMessage) {
    console.log('received a message:', parsedMessage);
    if (
      (parsedMessage as MsgTopicMessageEventData).msg.msg.includes(
        'No loons left'
      )
    ) {
      // This is my best guess at detecting when a round is over. Ideally, the
      //  user should be able to pause between rounds, so they can update turrets (etc.).
      console.log('No loons left - should set game_status=END_ROUND');
      // setGameStatus('ENDED');
    } else {
      // When we get a message, add (i.e. shift) the message to the top of the queue.
      setMessageHistory([
        {
          timestamp: Date.now(),
          text:
            (parsedMessage as MsgTopicMessageEventData).msg.msg ||
            'No message data.'
        },
        ...messageHistory
      ]);
    }
  } else if ('loonState' in parsedMessage) {
    console.log('received loon state:', parsedMessage);
    const loonStateEntries = Object.entries(
      (parsedMessage as LoonStateTopicMessageEventData).loonState
    );
    setLoonsPositions(loonStateEntries);
  } else {
    console.log('unrecognized message type:', parsedMessage);
  }
};
