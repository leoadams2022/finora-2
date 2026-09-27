// src/components/ui/SortableList.jsx
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/**
 * Standardized Sortable Container using @hello-pangea/dnd.
 */
export const SortableList = ({
  items = [],
  onReorder,
  renderItem,
  droppableId = "sortable-list",
  direction = "vertical",
  containerClassName = "space-y-3",
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId} direction={direction}>
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
                      className={`transition-shadow rounded-xl ${
                        snapshot.isDragging
                          ? "shadow-xl ring-2 ring-emerald-500/80 opacity-90 z-50 bg-white dark:bg-slate-800"
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
