'use client';

import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical, Plus } from 'lucide-react';
import { LayerType } from '@/types/editor';

const LayerPanel = () => {
  const { layers, selectedLayerId, selectLayer, updateLayer, removeLayer, reorderLayer, addLayer } = useEditorStore();

  // Sort layers by zIndex descending for display (top layer first)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === targetId) return;

    const draggedLayerIndex = layers.findIndex((l) => l.id === draggedId);
    const targetLayerIndex = layers.findIndex((l) => l.id === targetId);

    // In the store, higher zIndex means on top.
    // In the UI list, top item is highest zIndex.
    // So if we drop A onto B in the list, we want A to take B's zIndex.

    // Simplified reorder: just swap for now or use the store's reorder
    // Ideally we calculate the new index based on the drop position
    reorderLayer(draggedId, targetLayerIndex);
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-2">Layers</h2>
        <div className="flex gap-2">
          <button
            onClick={() => addLayer('text')}
            className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex-1 flex justify-center"
            title="Add Text"
          >
            <span className="text-xs font-bold">T</span>
          </button>
          <button
            onClick={() => addLayer('subject')}
            className="p-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 flex-1 flex justify-center"
            title="Add Image"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedLayers.map((layer) => (
          <div
            key={layer.id}
            draggable
            onDragStart={(e) => handleDragStart(e, layer.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, layer.id)}
            onClick={() => selectLayer(layer.id)}
            className={`
              flex items-center gap-2 p-2 rounded cursor-pointer border
              ${selectedLayerId === layer.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:bg-gray-50'}
            `}
          >
            <div className="cursor-grab text-gray-400">
              <GripVertical size={14} />
            </div>

            <div className="flex-1 truncate text-sm font-medium text-gray-700">
              {layer.name}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, { visible: !layer.visible });
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, { locked: !layer.locked });
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLayer(layer.id);
                }}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerPanel;
