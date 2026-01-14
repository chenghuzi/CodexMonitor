import type { SlashItem } from "../types";

type SlashMenuProps = {
  items: SlashItem[];
  selectedIndex: number;
  onSelect: (item: SlashItem) => void;
  onHover: (index: number) => void;
  emptyLabel?: string;
};

export function SlashMenu({
  items,
  selectedIndex,
  onSelect,
  onHover,
  emptyLabel = "No results found.",
}: SlashMenuProps) {
  if (items.length === 0) {
    return (
      <div className="composer-slash-menu" role="listbox">
        <div className="composer-slash-empty">{emptyLabel}</div>
      </div>
    );
  }

  return (
    <div className="composer-slash-menu" role="listbox">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={`composer-slash-item${
            index === selectedIndex ? " is-active" : ""
          }`}
          onClick={() => onSelect(item)}
          onMouseEnter={() => onHover(index)}
          role="option"
          aria-selected={index === selectedIndex}
        >
          <div className="composer-slash-title">
            <span className="composer-slash-name">{item.title}</span>
            {item.hint && (
              <span className="composer-slash-hint">{item.hint}</span>
            )}
          </div>
          {item.description && (
            <div className="composer-slash-description">{item.description}</div>
          )}
        </button>
      ))}
    </div>
  );
}
