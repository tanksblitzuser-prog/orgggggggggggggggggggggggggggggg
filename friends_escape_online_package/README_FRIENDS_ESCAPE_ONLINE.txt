FRIENDS ESCAPE — ONLINE CHAT + VOICE

WHAT WORKS
- Create a room automatically when you open the game.
- Share the 5-character room code with friends.
- Friends enter the code in the KOD field and press KIRISH.
- Text chat is sent to everyone in the same room.
- Voice chat uses WebRTC peer-to-peer audio between room members.
- Microphone toggle: press once to mute, again to unmute.
- Maximum 4 players per room.

RUN LOCALLY
1. Install Node.js 18 or newer.
2. Extract the ZIP into one folder. Keep the HTML, server.js, package.json and GLB together.
3. Open a terminal in that folder and run:
   npm install
   npm start
4. Open http://localhost:3000
5. For friends on the internet, deploy this folder to Render as a Web Service:
   Build command: npm install
   Start command: npm start
   Runtime: Node
6. Share the Render URL. One player shares their 5-character room code; others enter it.

IMPORTANT
- Microphone permission is required. Use HTTPS (Render provides HTTPS) and allow microphone access.
- WebRTC uses public STUN servers. Some strict school/work networks may block direct peer audio; a TURN relay server would be needed for those networks.
- This build makes the text chat and voice chat online. Player movement/character positions are not synchronized between clients yet; each player currently runs their own local game session.
- Browser audio autoplay rules may require one click on the page before remote voice starts.
