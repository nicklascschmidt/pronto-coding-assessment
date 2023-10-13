# Pronto AI Coding Assessment
Take-home assessment submission for the Full Stack Software Engineer position at Pronto AI.

## How to run the app?

```bash
#-- Setup and start the server
cd server
npm install # or yarn install
npm start # or yarn start

#-- Setup and start the client
cd client
npm install # or yarn install
npm start # or yarn start
```

## Instructions

Programming Challenge: 'Loons Tower Defense
---
Expected time frame: 1 week
Server URL: `wss://9f1b-136-24-109-242.ngrok-free.app/PAEaHSpkFugUBTNB/ws`

### Problem statement
You've been assigned a project where you implement a single player tower defense game (**NOT** similar to [Bloons Tower Defense](https://en.wikipedia.org/wiki/Bloons_Tower_Defense). The player can place turrets on the map/canvas to pop 'Loons (**NOT** Bloons), which are gas-filled sacs that seem to move of their own accord. The problem is split up into 4 stages:

 1. Implement a user interface for the game. It doesn't have to be feature-complete or pretty. A websockets server running a basic reference implementation of the backend engine & RPC has been provided.
    - The initial frontend should interface with the provided server
    - Players should be able to drag and drop turrets to a location on the canvas
    - Players should be able see the location and trajectory of the 'Loons
    - Turrets should be able to pop the nearest 'Loon at 1 Hz.
    - Loons will expire & disappear when they reach the end of the map.

 2. Implement the backend server for the game. Feel free to change the structure of the RPC if you don't like certain aspects of the reference implementation. Bonus points if you can improve the backend logic.

 3. Extend the RPC interface & frontend to introduce the following mechanics:
    - add a `Level` attribute to both loons & turrets. 
    - Turrets start at level 1. Players should be able to upgrade turrets
    - Level 2 'loons should spawn 10% of the time. 
    - Loon's that are level 2 can only be popped by turrets that have been upgraded to level 2

 4. Discuss potential bugs or exploits with either the game mechanics or the RPC interface. How can we make it more robust? How would you improve the overall architecture?

The programming challenge should take no more than 1 week. We will be discussing your solution and implementation at the end of the challenge; even if all the steps have not been completed. 

Feel free to reach out to kemal at any time if you'd like to discuss parts of the challenge or have any questions! Happy Hacking! 

Basic RPC spec
---
Very basic pub-sub mechanism.

### Subscribing

Client Request:
```
    {'subscribe': 'topicA'}
    {'subscribe': 'topicB'}
```

Server Response: 
```
    {'topicA': <payload>} 
    {'topicB': <payload>} 
    {'topicA': <payload>} 
```

### Subscription topics
 - `msg`: event messages displaying the state of the game
 - `loonState`: the state of all loons in the current wave.

### Publishing

Client Request: 

```
{'publish': {'topicA': <payload>}}
```

### Popping Loons
Client Request:
```
{
  "publish": {
    "popLoon": {
      "loonId": <loonId>
    }
  }
}
```

