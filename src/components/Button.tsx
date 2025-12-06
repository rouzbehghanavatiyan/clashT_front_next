import * as React from "react";

const Button: React.FC<any> = ({
  type = "button",
  label,
  icon,
  className,
  asChild = false,
  loading = false,
  ref,
  ...props
}) => {
  const Comp = "button";
  return (
    <Comp
      className={className}
      ref={ref}
      type={type}
      {...props}
      disabled={loading}
    >
      {loading ? (
        <div className="loader_btn mx-1" />
      ) : (
        <>
          <span className="mx-1">{icon}</span>
          {label}
        </>
      )}
    </Comp>
  );
};

export default Button;
