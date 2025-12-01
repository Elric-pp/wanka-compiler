import Canvas from '@/components/editor/Canvas';
import LayerPanel from '@/components/editor/LayerPanel';

export default function EditorPage() {
  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* Left Sidebar (Tools/Assets - Future) */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4">
        {/* Placeholder for tools */}
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <Canvas />
      </div>

      {/* Right Sidebar (Layers & Properties) */}
      <div className="flex">
        <LayerPanel />
        {/* Properties Panel can go here later */}
      </div>
    </div>
  );
}
