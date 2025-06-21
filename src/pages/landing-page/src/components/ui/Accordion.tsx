import React, { useState } from 'react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  className?: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen = false,
  onToggle
}) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-2">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg"
        onClick={onToggle}
      >
        <span className="text-lg font-medium text-gray-900">{title}</span>
        <img 
          src="/images/img_caretdown.svg" 
          alt="Toggle" 
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
  className = ''
}) => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  
  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems(prev => 
        prev.includes(index) ? [] : [index]
      );
    }
  };
  
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === AccordionItem) {
          return React.cloneElement(child, {
            isOpen: openItems.includes(index),
            onToggle: () => toggleItem(index)
          });
        }
        return child;
      })}
    </div>
  );
};

export { Accordion, AccordionItem };
export default Accordion;