// src/components/ui/SortableList.jsx
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/**
 * Standardized Sortable Container supporting both 1D lists and 2D grid layouts.
 *
 * @param {Array} items - Array of items to be reordered.
 * @param {Function} onReorder - Callback receiving array of ordered IDs `(orderedIds) => Promise<void>`.
 * @param {Function} renderItem - Render prop `(item, index, { dragHandleProps }) => ReactNode`.
 * @param {string} [droppableId="sortable-list"] - Unique identifier for the droppable container.
 * @param {string} [direction="horizontal"] - Direction: "vertical", "horizontal", or "grid".
 * @param {string} [containerClassName] - Layout classes for the grid or list container.
 */
export const SortableList = ({
  items = [],
  onReorder,
  renderItem,
  droppableId = "sortable-list",
  direction = "horizontal",
  containerClassName = "grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3",
}) => {
  const handleDragEnd = async (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const reorderedItems = Array.from(items);
    const [movedItem] = reorderedItems.splice(source.index, 1);
    reorderedItems.splice(destination.index, 0, movedItem);

    const orderedIds = reorderedItems.map((item) => item.id || item.code);

    if (typeof onReorder === "function") {
      await onReorder(orderedIds);
    }
  };

  // Map "grid" or multi-column layouts to "horizontal" direction so @hello-pangea/dnd calculates row-wrapping swaps
  const dndDirection = direction === "vertical" ? "vertical" : "horizontal";

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId} direction={dndDirection}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={containerClassName}
          >
            {items.map((item, index) => {
              const itemId = String(item.id || item.code);

              return (
                <Draggable key={itemId} draggableId={itemId} index={index}>
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      style={{
                        ...draggableProvided.draggableProps.style,
                      }}
                      className={`transition-shadow rounded-xl h-full ${
                        snapshot.isDragging
                          ? "shadow-2xl ring-2 ring-emerald-500 opacity-90 z-50 bg-white dark:bg-slate-800 scale-[1.02]"
                          : ""
                      }`}
                    >
                      {renderItem(item, index, {
                        dragHandleProps: draggableProvided.dragHandleProps,
                      })}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SortableList;
