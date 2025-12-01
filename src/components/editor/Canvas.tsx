'use client';

import React, { useEffect, useState } from 'react';
import { Stage, Layer as KonvaLayer, Rect, Image as KonvaImage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useEditorStore } from '@/store/editorStore';
import { Layer } from '@/types/editor';

const URLImage = ({ layer, isSelected, onSelect, onChange }: { layer: Layer; isSelected: boolean; onSelect: () => void; onChange: (newAttrs: any) => void }) => {
  const [image] = useImage(layer.content || 'https://placehold.co/100x100');
  const shapeRef = React.useRef<any>(null);
  const trRef = React.useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        image={image}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        rotation={layer.rotation}
        scaleX={layer.scaleX}
        scaleY={layer.scaleY}
        draggable={!layer.locked}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !layer.locked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const Canvas = () => {
  const { layers, canvasWidth, canvasHeight, selectedLayerId, selectLayer, updateLayer } = useEditorStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading Canvas...</div>;
  }

  return (
    <div className="bg-gray-200 p-8 flex justify-center items-center h-full overflow-auto">
      <div className="shadow-2xl">
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={(e) => {
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
              selectLayer(null);
            }
          }}
        >
          <KonvaLayer>
            {/* Render Background Color if no background image */}
            <Rect width={canvasWidth} height={canvasHeight} fill="#ffffff" />

            {layers
              .slice()
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((layer) => {
                if (!layer.visible) return null;

                if (layer.type === 'text') {
                  const isSelected = layer.id === selectedLayerId;
                  return (
                    <Text
                      key={layer.id}
                      text={layer.content || 'Double-click to edit'}
                      x={layer.x}
                      y={layer.y}
                      fontSize={layer.fontSize || 24}
                      fontFamily={layer.fontFamily || 'Arial'}
                      fill={layer.fill || '#000000'}
                      align={layer.align || 'left'}
                      width={layer.width}
                      rotation={layer.rotation}
                      scaleX={layer.scaleX}
                      scaleY={layer.scaleY}
                      draggable={!layer.locked}
                      onClick={() => selectLayer(layer.id)}
                      onTap={() => selectLayer(layer.id)}
                      onDragEnd={(e) => {
                        updateLayer(layer.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }}
                      onDblClick={() => {
                        const newText = prompt('Enter text:', layer.content);
                        if (newText !== null) {
                          updateLayer(layer.id, { content: newText });
                        }
                      }}
                    />
                  );
                }

                return (
                  <URLImage
                    key={layer.id}
                    layer={layer}
                    isSelected={layer.id === selectedLayerId}
                    onSelect={() => selectLayer(layer.id)}
                    onChange={(newAttrs) => updateLayer(layer.id, newAttrs)}
                  />
                );
              })}
          </KonvaLayer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;
