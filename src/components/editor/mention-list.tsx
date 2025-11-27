import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { User } from '@/types';

export interface MentionListProps {
  items: User[];
  command: (item: { id: string; label: string }) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.name });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="z-50 rounded-md border bg-popover shadow-md overflow-hidden">
      {props.items.length ? (
        <div className="max-h-[200px] overflow-y-auto p-1">
          {props.items.map((item, index) => (
            <button
              key={item.id}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-sm text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex-shrink-0">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.name}</div>
                {item.email && (
                  <div className="text-xs text-muted-foreground truncate">{item.email}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-3 py-2 text-sm text-muted-foreground">No users found</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';
