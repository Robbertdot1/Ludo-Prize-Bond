
import { useState } from 'react';
import axios from 'axios';
import Router from 'next/router';
export default function Login(){
  const [email,setEmail] = useState('demo1@example.com');
  const [password,setPassword] = useState('demoPass123');
  async function doLogin(e){ e.preventDefault();
    const res = await axios.post((process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000')+'/api/auth/login',{ email, password });
    localStorage.setItem('token', res.data.token);
    Router.push('/lobby');
  }
  return (<div className="min-h-screen flex items-center justify-center">
    <form onSubmit={doLogin} className="p-6 bg-white rounded shadow space-y-3">
      <h2 className="text-xl font-semibold">Login</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} className="border p-2 w-80" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="border p-2 w-80" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form>
  </div>)
}
