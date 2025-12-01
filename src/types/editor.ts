export type LayerType = 'background' | 'subject' | 'effect' | 'frame' | 'text';

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  content: string; // URL for images, text content for text
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  // Text specific properties
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  align?: string;
  zIndex: number;
}

export interface CardState {
  layers: Layer[];
  selectedLayerId: string | null;
  canvasWidth: number;
  canvasHeight: number;
}
