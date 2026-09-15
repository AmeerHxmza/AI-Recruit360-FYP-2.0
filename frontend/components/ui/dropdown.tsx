import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = "right",
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-[1500] mt-2 min-w-[200px] rounded-lg border border-border bg-hover p-1.5 shadow-sm animate-in fade-in-50 zoom-in-95 duration-150 text-text-primary",
            align === "right" ? "right-0" : "left-0",
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  danger?: boolean;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  icon,
  danger,
  className,
  ...props
}) => (
  <button
    className={cn(
      "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-micro focus:outline-none focus:bg-hover",
      danger
        ? "text-danger hover:bg-danger/10"
        : "text-text-secondary hover:bg-hover hover:text-text-primary",
      className,
    )}
    {...props}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    <span>{children}</span>
  </button>
);

const DropdownSeparator: React.FC = () => (
  <div className="my-1 h-px bg-hover" />
);

const DropdownHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="px-3 py-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase">
    {children}
  </div>
);

export { Dropdown, DropdownItem, DropdownSeparator, DropdownHeader };
