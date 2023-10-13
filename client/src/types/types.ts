import { SVGAttributes } from 'react';

export type MessageHistoryList = { timestamp: number; text: string }[];

export type MessageEventPayload = {
  type: 'msg' | 'loonState';
  data: string; // this is unparsed JSON
};

export type LoonPosition = { position_x: number; position_y: number };

export type LoonStateTopicMessageEventData = {
  loonState: Record<string, LoonPosition>;
};

export type MsgTopicMessageEventData = {
  msg: {
    msg: string;
  };
};

export type MessageEventData =
  | LoonStateTopicMessageEventData
  | MsgTopicMessageEventData;

export type GameStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ENDED';

export type IconProps = {
  size?:
    | SVGAttributes<SVGElement>['width']
    | SVGAttributes<SVGElement>['height'];
  color?: SVGAttributes<SVGElement>['fill'];
  customStyle?: SVGAttributes<SVGElement>['style'];
};

export type TurretState = {
  level: number;
  id: string;
}

export type TurretPosition = {
  top: number;
  left: number;
};
