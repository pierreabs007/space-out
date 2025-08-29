'use client'

export default function SimpleTest() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-900 to-black flex items-center justify-center">
      <div className="text-center text-white space-y-4">
        <h1 className="text-6xl font-bold animate-pulse">🌟 TEST WORKING! 🌟</h1>
        <p className="text-2xl">React + Tailwind are functioning</p>
        <div className="text-lg space-y-2">
          <p>✅ Next.js App Router</p>
          <p>✅ TypeScript</p>
          <p>✅ Tailwind CSS</p>
          <p className="text-red-400">❓ Three.js (testing...)</p>
        </div>
        <button 
          onClick={() => alert('Button works!')}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          Click Test
        </button>
      </div>
    </div>
  )
}
