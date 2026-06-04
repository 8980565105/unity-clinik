const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
}) => {
  const variants = {
    common:
      "bg-primary text-white text-[18px] min-w-[100px] py-[8px] md:py-[15px] hover:bg-[var(--theme-hover-color)] hover:text-white",
    secondary:
      "bg-secondary text-white hover:text-secondary hover:bg-primary text-[18px] min-w-[200px] py-[8px] md:py-[15px] box-shadow",
    outline:
      "border border-primary  text-primary hover:text-secondary hover:bg-primary hover:border-primary text-[18px] min-w-[200px] py-[8px] md:py-[15px] ",
  };
  const sizes = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-6 text-base",
    lg: "py-3 px-8 text-[18px]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[12px]  inline-flex  justify-center transition duration-300 ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
