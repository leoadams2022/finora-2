// src/components/ui/Select.jsx

import React, {
  useState,
  useRef,
  useEffect,
  Children,
  isValidElement,
  useCallback,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Custom single-select dropdown component with dark mode support, searchable options,
 * children syntax parsing (`Select.Option`), clearable state, native form validation,
 * element-level CSS customization, and portal rendering for non-overflow issues.
 *
 * @component
 */
export const Select = ({
  options: optionsProp = [],
  value,
  onChange,
  placeholder = "Select an option...",
  searchable = false,
  searchPlaceholder = "Search...",
  clearable = false,
  disabled = false,
  required = false,
  label,
  error,
  className = "",
  classNames = {},
  renderOption,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuStyle, setMenuStyle] = useState({});

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);
  const hiddenInputRef = useRef(null);

  // Extract options from JSX children if provided, otherwise use optionsProp
  const parsedOptions = React.useMemo(() => {
    if (Children.count(children) > 0) {
      const extracted = [];
      Children.forEach(children, (child) => {
        if (!isValidElement(child)) return;

        const optionValue =
          child.props.value !== undefined
            ? child.props.value
            : child.props.children;
        const optionLabel =
          child.props.label || child.props.children || String(optionValue);

        extracted.push({
          value: optionValue,
          label: optionLabel,
          disabled: child.props.disabled || false,
          color: child.props.color,
          icon: child.props.icon,
          ...child.props,
        });
      });
      return extracted;
    }
    return optionsProp;
  }, [children, optionsProp]);

  const selectedOption = parsedOptions.find((opt) => opt.value === value);

  // Dynamic position calculation for fixed dropdown with smart flip detection
  const updateMenuPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const maxAvailableSpace = Math.max(spaceBelow, spaceAbove) - 16;
      const idealDropdownHeight = 240;

      // Flip dropdown to open upwards if space below is limited and space above is larger
      const shouldFlipUp =
        spaceBelow < idealDropdownHeight && spaceAbove > spaceBelow;

      if (shouldFlipUp) {
        setMenuStyle({
          bottom: `${viewportHeight - rect.top + 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          maxHeight: `${Math.min(idealDropdownHeight, maxAvailableSpace)}px`,
        });
      } else {
        setMenuStyle({
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          maxHeight: `${Math.min(idealDropdownHeight, maxAvailableSpace)}px`,
        });
      }
    }
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      updateMenuPosition();
    }
  }, [isOpen, updateMenuPosition]);

  // Recalculate coordinates on window scroll / resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateMenuPosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updateMenuPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isTriggerClick =
        triggerRef.current && triggerRef.current.contains(event.target);
      const isMenuClick =
        menuRef.current && menuRef.current.contains(event.target);

      if (!isTriggerClick && !isMenuClick) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable
    ? parsedOptions.filter((opt) =>
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : parsedOptions;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div
      className={cn("w-full space-y-1 relative", className, classNames.wrapper)}
      ref={dropdownRef}
    >
      {label && (
        <label
          className={cn(
            "block text-xs font-medium text-slate-700 dark:text-slate-300",
            required && "required-asterisk",
            classNames.label,
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Hidden Input for Native HTML5 Form Validation */}
        <input
          ref={hiddenInputRef}
          type="text"
          value={value || ""}
          onChange={() => {}}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          // eslint-disable-next-line no-unused-vars
          onInvalid={(e) => {
            if (triggerRef.current) {
              triggerRef.current.focus();
            }
          }}
          className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
          aria-hidden="true"
        />

        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-xs sm:text-sm transition outline-none min-h-10.5 touch-manipulation",
            "border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white",
            "focus:ring-2 focus:ring-emerald-500",
            disabled &&
              "cursor-not-allowed opacity-50 bg-slate-100 dark:bg-slate-800",
            error && "border-rose-500 focus:ring-rose-500",
            classNames.trigger,
          )}
        >
          <span
            className={cn(
              "flex items-center space-x-2 truncate min-w-0 flex-1",
              classNames.value,
            )}
          >
            {selectedOption ? (
              renderOption ? (
                renderOption(selectedOption)
              ) : (
                <>
                  {selectedOption.color && (
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: selectedOption.color }}
                    />
                  )}
                  {selectedOption.icon && (
                    <span className="text-slate-400 shrink-0">
                      {selectedOption.icon}
                    </span>
                  )}
                  <span className="truncate">{selectedOption.label}</span>
                </>
              )
            ) : (
              <span className="text-slate-400 truncate">{placeholder}</span>
            )}
          </span>

          <div
            className={cn(
              "flex items-center space-x-1 shrink-0 ml-1.5",
              classNames.icon,
            )}
          >
            {clearable && value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === "Enter" && handleClear(e)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-manipulation min-w-7 min-h-7 flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0",
                isOpen && "rotate-180",
              )}
            />
          </div>
        </button>

        {/* Dropdown Menu Portal */}
        {isOpen &&
          createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              className={cn(
                "fixed z-9999 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-in fade-in-50 zoom-in-95 flex flex-col min-h-0",
                classNames.menu,
              )}
            >
              {/* Search Bar */}
              {searchable && (
                <div
                  className={cn(
                    "p-2 border-b border-slate-100 dark:border-slate-700/80 shrink-0",
                    classNames.searchWrapper,
                  )}
                >
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={searchPlaceholder}
                      className={cn(
                        "w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 pl-8 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition min-h-9",
                        classNames.searchInput,
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div
                className={cn(
                  "overflow-y-auto p-1 flex-1 space-y-0.5 min-h-0",
                  classNames.optionsList,
                )}
              >
                {filteredOptions.length === 0 ? (
                  <div
                    className={cn(
                      "p-3 text-center text-xs text-slate-400",
                      classNames.emptyState,
                    )}
                  >
                    No options found.
                  </div>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-2 sm:py-1.5 text-xs text-left transition min-h-9.5 touch-manipulation",
                          isSelected
                            ? "bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 active:bg-slate-200 dark:active:bg-slate-700",
                          opt.disabled && "opacity-50 cursor-not-allowed",
                          classNames.option,
                        )}
                      >
                        <span className="flex items-center space-x-2 truncate min-w-0 flex-1">
                          {renderOption ? (
                            renderOption(opt)
                          ) : (
                            <>
                              {opt.color && (
                                <span
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{ backgroundColor: opt.color }}
                                />
                              )}
                              {opt.icon && (
                                <span className="text-slate-400 shrink-0">
                                  {opt.icon}
                                </span>
                              )}
                              <span className="truncate">{opt.label}</span>
                            </>
                          )}
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>

      {error && (
        <p
          className={cn("text-xs text-rose-500 font-medium", classNames.error)}
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Option Sub-Component Helper
// eslint-disable-next-line no-unused-vars
Select.Option = ({ children, ...props }) => children;

export default Select;
