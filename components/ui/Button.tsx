import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  size?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}) => {
  const classes = ["btn"];

  if (variant) classes.push(`btn--${variant}`);
  if (size) classes.push(`btn--${size}`);
  if (fullWidth) classes.push("btn--fullWidth");
  if (className) classes.push(className);

  return (
    <button className={classes.join(" ")} {...rest}>
      {children}
    </button>
  );
};

export default Button;
