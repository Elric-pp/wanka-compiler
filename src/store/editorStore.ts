import { create } from 'zustand';
import { CardState, Layer, LayerType } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';

interface EditorStore extends CardState {
  // Actions
  addLayer: (type: LayerType, content?: string) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  selectLayer: (id: string | null) => void;
  reorderLayer: (id: string, newIndex: number) => void;
  setCanvasSize: (width: number, height: number) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  layers: [
    {
      id: 'bg-1',
      type: 'background',
      name: 'Background',
      visible: true,
      locked: false,
      content: '',
      x: 0,
      y: 0,
      width: 400,
      height: 600,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 0,
    },
  ],
  selectedLayerId: null,
  canvasWidth: 400,
  canvasHeight: 600,

  addLayer: (type, content = '') =>
    set((state) => {
      const isText = type === 'text';
      const newLayer: Layer = {
        id: uuidv4(),
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${state.layers.length + 1}`,
        visible: true,
        locked: false,
        content: isText ? 'New Text' : content,
        x: 50,
        y: 50,
        width: isText ? 200 : 100,
        height: isText ? 50 : 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        zIndex: state.layers.length,
        ...(isText && {
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'left',
        }),
      };
      return { layers: [...state.layers, newLayer], selectedLayerId: newLayer.id };
    }),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    })),

  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  selectLayer: (id) => set({ selectedLayerId: id }),

  reorderLayer: (id, newIndex) =>
    set((state) => {
      const layers = [...state.layers];
      const oldIndex = layers.findIndex((l) => l.id === id);
      if (oldIndex === -1) return state;
      const [removed] = layers.splice(oldIndex, 1);
      layers.splice(newIndex, 0, removed);
      // Update zIndex based on new order
      return { layers: layers.map((l, i) => ({ ...l, zIndex: i })) };
    }),

  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
}));
