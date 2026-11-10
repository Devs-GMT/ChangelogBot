"use client";

import { useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GroupBadge } from "@/components/ui/group-badge";
import { cn } from "@/lib/utils/cn";
import { GROUPS, type Group, type NoteItem } from "@/lib/changelog/types";
import { useComposer } from "../use-composer";
import { NoteCard } from "./note-card";

const COL_PREFIX = "col:";

function SortableNote({ item }: { item: NoteItem }) {
  const { actions } = useComposer();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-40")}
    >
      <NoteCard
        item={item}
        handleProps={{ attributes, listeners }}
        onEdit={(text) => actions.editItem(item.id, text)}
        onHide={() => actions.toggleHidden(item.id)}
        onMove={(g) => actions.moveItem(item.id, g)}
      />
    </li>
  );
}

function Column({ group, items }: { group: (typeof GROUPS)[number]; items: NoteItem[] }) {
  const { actions } = useComposer();
  const { setNodeRef, isOver } = useDroppable({ id: `${COL_PREFIX}${group.id}` });
  return (
    <section
      aria-label={`${group.label} changes`}
      className={cn(
        "flex min-h-32 flex-col rounded-xl border bg-canvas/60 p-2.5 transition-colors",
        isOver ? "border-violet/50 bg-violet-soft/50" : "border-line",
      )}
    >
      <header className="mb-2 flex items-center justify-between px-0.5">
        <GroupBadge group={group.id} />
        <span className="text-xs text-muted tabular-nums">{items.length}</span>
      </header>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="grid flex-1 content-start gap-2">
          {items.map((item) => (
            <SortableNote key={item.id} item={item} />
          ))}
          {items.length === 0 && (
            <li className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-xs text-muted">
              Drop notes here
            </li>
          )}
        </ul>
      </SortableContext>
      <button
        type="button"
        onClick={() => actions.addItem(group.id)}
        className="mt-2 rounded-lg px-2 py-1.5 text-left text-xs text-muted hover:bg-paper hover:text-ink"
      >
        + Add note
      </button>
    </section>
  );
}

export function GroupBoard() {
  const { state, actions } = useComposer();
  const notes = state.notes;
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!notes) return null;
  const visible = notes.items.filter((i) => !i.hidden);
  const byGroup = (g: Group) => visible.filter((i) => i.group === g);
  const active = activeId ? notes.items.find((i) => i.id === activeId) : undefined;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const activeItem = notes.items.find((i) => i.id === active.id);
    if (!activeItem) return;
    const overId = String(over.id);

    if (overId.startsWith(COL_PREFIX)) {
      actions.moveItem(activeItem.id, overId.slice(COL_PREFIX.length) as Group, null);
      return;
    }
    const overItem = notes.items.find((i) => i.id === overId);
    if (!overItem || overItem.id === activeItem.id) return;

    if (overItem.group === activeItem.group) {
      const ids = byGroup(activeItem.group).map((i) => i.id);
      const reordered = arrayMove(ids, ids.indexOf(activeItem.id), ids.indexOf(overItem.id));
      actions.moveItem(activeItem.id, activeItem.group, reordered[reordered.indexOf(activeItem.id) + 1] ?? null);
    } else {
      actions.moveItem(activeItem.id, overItem.group, overItem.id);
    }
  };

  return (
    <DndContext
      id="release-notes-board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {GROUPS.map((g) => (
          <Column key={g.id} group={g} items={byGroup(g.id)} />
        ))}
      </div>
      <DragOverlay>{active ? <NoteCard item={active} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}
