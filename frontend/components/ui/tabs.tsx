import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}) => {
  const [selected, setSelected] = React.useState(defaultValue);

  const activeTab = value !== undefined ? value : selected;
  const setActiveTab = (val: string) => {
    if (value === undefined) setSelected(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 rounded-lg border border-[#242932] bg-[#0D0F12] p-1 text-[#A7AFBC]",
      className
    )}
    role="tablist"
    {...props}
  >
    {children}
  </div>
);

export interface TabTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabTrigger: React.FC<TabTriggerProps> = ({
  value,
  className,
  children,
  ...props
}) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-micro focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#39D9FF]",
        isActive
          ? "bg-[#171B21] text-[#F5F7FA] shadow-xs font-semibold text-[#39D9FF] border border-[#242932]"
          : "text-[#A7AFBC] hover:text-[#F5F7FA] hover:bg-[#12151A]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabContent: React.FC<TabContentProps> = ({
  value,
  className,
  children,
  ...props
}) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("animate-in fade-in-50 duration-200 focus:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabList, TabTrigger, TabContent };
