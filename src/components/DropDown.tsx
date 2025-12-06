import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface DropdownItem<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick?: (data?: T) => void;
  href?: string | ((data?: T) => string);
  className?: string;
  divider?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  switchIcon?: boolean;
  label?: string;
  buttonIcon?: React.ReactNode;
  position?: "left" | "right";
  className?: string;
  iconOnly?: boolean;
  setIsOpenOptions: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenOptions?: boolean;
  itemData?: any;
  showRank?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  items = [],
  showRank = false,
  setIsOpenOptions,
  isOpenOptions,
  switchIcon = false,
  label,
  buttonIcon,
  position = "right",
  className = "",
  itemData,
  iconOnly = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick(itemData);
    }
    setIsOpenOptions(false);
  };

  const getHref = (item: DropdownItem) =>
    typeof item.href === "function" ? item.href(itemData) : item.href;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenOptions(false);
      }
    };

    if (isOpenOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenOptions]);

  // جدا کردن آیتم رنک اسکور از بقیه آیتم‌ها
  const rankScoreItem = items.find((item) => item.label === "rankScore");
  const rankItems = items.filter((item) => item.label !== "rankScore");

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      <div>
        <span
          aria-expanded={isOpenOptions}
          aria-haspopup="true"
          onClick={() => setIsOpenOptions(!isOpenOptions)}
          aria-label={label || "Dropdown menu"}
          className="flex items-center cursor-pointer select-none"
        >
          {buttonIcon && <span className={label || iconOnly ? "mr-1" : ""}>{buttonIcon}</span>}
          {!iconOnly && label}
        </span>
      </div>

      {isOpenOptions && (
        <div
          className={`absolute ${position === "right" ? "right-0" : "left-0"} z-20 mt-2 ${
            showRank ? "w-80" : "w-56"
          } origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none`}
          role="menu"
          aria-orientation="vertical"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {!showRank ? (
              // حالت عادی dropdown
              items.map((item, index) => (
                <div key={index}>
                  {item.divider ? (
                    <div className="my-1" />
                  ) : item.href ? (
                    <Link href={getHref(item) || "#"} passHref legacyBehavior>
                      <a
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          item.className || ""
                        }`}
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => handleItemClick(item)}
                      >
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.label}
                      </a>
                    </Link>
                  ) : (
                    <span
                      className={`flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 ${
                        item.className || ""
                      }`}
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => handleItemClick(item)}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3">
                {rankScoreItem && (
                  <div className="mb-4 pb-3 border-b border-gray-200">
                    <div
                      className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleItemClick(rankScoreItem)}
                    >
                      <span className="text-lg font-bold text-gray-800 mb-1">
                        {rankScoreItem.icon}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        Your rank
                      </span>
                    </div>
                  </div>
                )}

                {/* بخش گرید رنک‌ها */}
                <div className="grid grid-cols-3 gap-3">
                  {rankItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex items-center justify-center w-12 h-12 mb-1">
                        {item.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
