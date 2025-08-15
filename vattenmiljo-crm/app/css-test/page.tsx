'use client'

export default function CSSTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          CSS & Tailwind Test Page
        </h1>

        {/* Color Test */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Color Test</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-red-500 text-white p-4 rounded">Red</div>
            <div className="bg-blue-500 text-white p-4 rounded">Blue</div>
            <div className="bg-green-500 text-white p-4 rounded">Green</div>
            <div className="bg-yellow-500 text-black p-4 rounded">Yellow</div>
          </div>
        </div>

        {/* Layout Test */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Layout Test</h2>
          <div className="flex space-x-4">
            <div className="flex-1 bg-blue-100 p-4 rounded">Flex Item 1</div>
            <div className="flex-1 bg-green-100 p-4 rounded">Flex Item 2</div>
            <div className="flex-1 bg-purple-100 p-4 rounded">Flex Item 3</div>
          </div>
        </div>

        {/* Typography Test */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Typography Test</h2>
          <div className="space-y-2">
            <p className="text-xs">Extra Small Text</p>
            <p className="text-sm">Small Text</p>
            <p className="text-base">Base Text</p>
            <p className="text-lg">Large Text</p>
            <p className="text-xl">Extra Large Text</p>
            <p className="text-2xl font-bold">2XL Bold Text</p>
          </div>
        </div>

        {/* Button Test */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Button Test</h2>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Primary Button
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors">
              Secondary Button
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
              Success Button
            </button>
          </div>
        </div>

        {/* Gradient Test */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Gradient Test</h2>
          <p>This should have a blue to purple gradient background</p>
        </div>

        {/* Shadow Test */}
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">Shadow Test</h2>
          <p>This card should have a large shadow (shadow-xl)</p>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <a 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}