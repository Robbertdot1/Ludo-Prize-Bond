
import Link from 'next/link';
export default function Home(){
  return (<div className="min-h-screen flex items-center justify-center">
    <div className="max-w-xl p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">Ludo Realm PKR — Demo</h1>
      <p className="mt-2">Demo accounts: demo1..demo4 / demoPass123</p>
      <div className="mt-4 space-x-2">
        <Link href="/auth/login"><a className="px-4 py-2 bg-blue-600 text-white rounded">Login</a></Link>
        <Link href="/lobby"><a className="px-4 py-2 bg-green-600 text-white rounded">Open Lobby</a></Link>
      </div>
    </div>
  </div>)
}
