import React, { forwardRef, useState } from "react";
import ErrorIcon from "@mui/icons-material/Error";

interface InputProps {
  name?: string;
  onChange: any;
  label?: string;
  type?: string;
  required?: boolean;
  helper?: string;
  placeholder?: string;
  Icon?: React.ComponentType<{}>;
  guidMessage?: string;
  rules?: Record<string, object | string | boolean | undefined>;
  errors?: any;
  maxLength?: number;
  handleOnChange?: (value: string | undefined | number) => void;
  hasNumberSeparator?: boolean;
  disabled?: boolean;
  value?: any;
  className?: string;
  onKeyDown?: any;
  onFocus?: any;
  multiline?: boolean; 
  maxHeight?: string; 
}
 
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name,
      onFocus,
      onKeyDown,
      value,
      label,
      className,
      type = "text",
      Icon,
      placeholder,
      errors,
      onChange,
      guidMessage,
      maxLength,
      disabled = false,
      handleOnChange = () => {},
      multiline = false,
      maxHeight = "120px",
    },
    ref
  ) => {
    const [isOverflow, setIsOverflow] = useState<boolean>(false);

    const changeHandler = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      onChange: (value: any) => void
    ): void => {
      const { value } = e.target;

      if (multiline && e.target instanceof HTMLTextAreaElement) {
        e.target.style.height = "auto";
        const newHeight = Math.min(e.target.scrollHeight, parseInt(maxHeight));
        e.target.style.height = `${newHeight}px`;
        setIsOverflow(e.target.scrollHeight > parseInt(maxHeight));
      }

      handleOnChange(value);
      onChange(e);
    };

    if (multiline) {
      return (
        <div>
          <label
            htmlFor={name}
            className="input-label  input-label-sm lg:input-label-base"
          >
            {label}
          </label>
          <div className="input-container">
            <textarea
              disabled={disabled}
              maxLength={maxLength}
              onFocus={onFocus}
              id={name}
              onKeyDown={onKeyDown}
              name={name}
              placeholder={placeholder}
              onChange={(e) => changeHandler(e, onChange)}
              value={value}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={className}
              style={{
                maxHeight: maxHeight,
              }}
              data-state={
                disabled && !Icon
                  ? "disabled"
                  : errors
                    ? "failed"
                    : !!value && !errors
                      ? "success"
                      : ""
              }
              rows={1}
            />
            {!!Icon && (
              <div className="input-icon">
                <Icon />
              </div>
            )}
            {errors && (
              <div className="input-icon-error">
                <ErrorIcon />
              </div>
            )}
          </div>
          {errors && (
            <span className="input-message-error">{errors?.message}</span>
          )}
          {guidMessage && (
            <span className="input-message-guid">{guidMessage}</span>
          )}
        </div>
      );
    }

    return (
      <div>
        <label
          htmlFor={name}
          className="input-label input-label-sm lg:input-label-base"
        >
          {label}
        </label>
        <div className="input-container">
          <input
            disabled={disabled}
            maxLength={maxLength}
            onFocus={onFocus}
            type={type}
            id={name}
            onKeyDown={onKeyDown}
            name={name}
            placeholder={placeholder}
            onChange={(e) => changeHandler(e, onChange)}
            value={value}
            ref={ref}
            className={`${className}  input input-sm lg:input-base data-[state=failed]:input-failed 
            data-[state=success]:input-success truncate disabled:cursor-pointer disabled:!border-none 
            disabled:bg-gray-100 disabled:text-[#777777] disabled:!shadow-none data-[state=disabled]:disabled:!px-1 data-[state=disabled]:disabled:!py-2`}
            data-state={
              disabled && !Icon
                ? "disabled"
                : errors
                  ? "failed"
                  : !!value && !errors
                    ? "success"
                    : ""
            }
          />
          {!!Icon && (
            <div className="input-icon">
              <Icon />
            </div>
          )}
          {errors && (
            <div className="input-icon-error">
              <ErrorIcon />
            </div>
          )}
        </div>
        {errors && (
          <span className="input-message-error">{errors?.message}</span>
        )}
        {guidMessage && (
          <span className="input-message-guid">{guidMessage}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;