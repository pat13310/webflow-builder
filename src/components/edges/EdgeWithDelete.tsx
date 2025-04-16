import React from 'react';
import { EdgeProps } from 'reactflow';
import { X } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';

const EdgeWithDelete = React.memo(function EdgeWithDelete({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const deleteEdge = useWorkflowStore((state) => state.deleteEdge);

  // Courbe de Bézier par défaut pour les edges
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calcul de l'angle et de l'orientation
  const angle = Math.atan2(dy, dx);
  const isVertical = Math.abs(angle) > Math.PI / 4 && Math.abs(angle) < (3 * Math.PI) / 4;

  // Ajustement des points de contrôle selon l'orientation
  const controlDistance = Math.min(distance * 0.25, 50);
  let [controlX1, controlY1, controlX2, controlY2] = [sourceX, sourceY, targetX, targetY];

  if (isVertical) {
    controlY1 = sourceY + (dy > 0 ? controlDistance : -controlDistance);
    controlY2 = targetY + (dy > 0 ? -controlDistance : controlDistance);
    controlX1 = controlX2 = sourceX + dx * 0.5;
  } else {
    controlX1 = sourceX + (dx > 0 ? controlDistance : -controlDistance);
    controlX2 = targetX + (dx > 0 ? -controlDistance : controlDistance);
    controlY1 = controlY2 = sourceY + dy * 0.5;
  }

  // Position du bouton au milieu de la courbe
  const t = 0.5;
  const curveX = sourceX + dx * t;
  const curveY = sourceY + dy * t;

  const edgePath = `M${sourceX},${sourceY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${targetX},${targetY}`;

  const handleDelete = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    deleteEdge(id);
  };


  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: data?.selected ? 2 : 1,
          stroke: data?.selected ? '#3b82f6' : '#94a3b8',
          transition: 'none'
        }}
      />
      <g
        transform={`translate(${curveX} ${curveY})`}
        onClick={handleDelete}
        onMouseDown={(evt) => evt.stopPropagation()}
        className="edge-delete-button"
        style={{
          cursor: 'pointer',
          pointerEvents: 'all',
          filter: data?.selected ? 'drop-shadow(0 0 2px #3b82f6)' : 'none'
        }}
      >
        <g transform="translate(-6 -6)">
          <circle
            cx="6"
            cy="6"
            r="6"
            fill="white"
            stroke="#94a3b8"
            strokeWidth="1"
            className="dark:fill-gray-800"
          />
          <X
            size={12}
            className="text-red-500"
            style={{ transform: 'translate(6px, 6px)' }}
          />
        </g>
      </g>
    </>
  );
});

EdgeWithDelete.displayName = 'EdgeWithDelete';
export default EdgeWithDelete;
