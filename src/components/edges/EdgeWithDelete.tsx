import React from 'react';
import { EdgeProps } from 'reactflow';
import { X } from 'lucide-react';
import useWorkflowStore from '../../store/workflowStore';

// Fonction utilitaire locale pour générer un path step (escalier)
function getStepEdgePath({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}) {
  const midX = sourceX + (targetX - sourceX) / 2;
  const edgePath = `M${sourceX},${sourceY} L${midX},${sourceY} L${midX},${targetY} L${targetX},${targetY}`;
  // Position du label au centre du segment vertical
  const labelX = midX;
  const labelY = sourceY + (targetY - sourceY) / 2;
  return [edgePath, labelX, labelY];
}

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

  // Utilisation du style step (escalier) pour les edges (fonction locale)
  const [edgePath, labelX, labelY] = getStepEdgePath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Position du bouton de suppression (proche du centre du lien)
  const curveX = labelX;
  const curveY = labelY;

  const handleDelete = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    deleteEdge(id);
  };

  return (
    <>
      <path
        id={id !== undefined ? String(id) : undefined}
        className="react-flow__edge-path dark:opacity-90"
        d={typeof edgePath === 'string' ? edgePath : String(edgePath)}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: data?.selected ? 2.5 : 1.5,
          stroke: data?.selected ? '#3b82f6' : '#94a3b8',
          transition: 'none',
          filter: data?.selected ? 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))' : 'none',
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
          filter: data?.selected ? 'drop-shadow(0 0 2px #3b82f6)' : 'none',
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