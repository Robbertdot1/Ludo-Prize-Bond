
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
let socket;
export default function Lobby(){
  const [roomCode,setRoomCode] = useState('ROOM1');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  useEffect(()=>{ socket = io(SOCKET_URL); socket.on('connect', ()=>{}); socket.on('room-update', data=>{ setMessages(m=>[...m, JSON.stringify(data)]); }); socket.on('dice-rolled', d=> setMessages(m=>[...m, 'dice:'+d.dice])); socket.on('game-ended', d=> setMessages(m=>[...m, 'game-ended:'+JSON.stringify(d)]) ); return ()=> socket.disconnect(); }, []);
  function join(){ const token = localStorage.getItem('token'); socket.emit('join-room', { token, roomCode }); setJoined(true); }
  function roll(){ socket.emit('roll-dice-request', { roomCode }); }
  return (<div className="min-h-screen p-6">
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold">Lobby</h1>
      <div className="mt-3 flex gap-2">
        <input value={roomCode} onChange={e=>setRoomCode(e.target.value)} className="border p-2" />
        <button onClick={join} className="bg-green-600 text-white px-3 py-1 rounded">Join</button>
        <button onClick={roll} className="bg-yellow-500 text-white px-3 py-1 rounded">Roll (server)</button>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Events</h3>
        <div className="h-40 overflow-auto bg-gray-100 p-2">{messages.map((m,i)=>(<div key={i} className="text-sm">{m}</div>))}</div>
      </div>
    </div>
  </div>)
}
