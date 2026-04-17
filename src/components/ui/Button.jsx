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
      "bg-[var(--primary-color)] text-white text-[18px] min-w-[200px] py-[8px] md:py-[15px] hover:bg-[var(--theme-hover-color)] hover:text-white",
    secondary:
      "bg-[var(--secondary-color)] text-white hover:text-[var(--secondary-color)] hover:bg-[var(--primary-color)] text-[18px] min-w-[200px] py-[8px] md:py-[15px] box-shadow",
    outline:
      "border border-[var(--primary-color)]  text-[var(--primary-color)] hover:text-[var(--secondary-color)] hover:border-[var(--secondary-color)] text-[18px] min-w-[200px] py-[8px] md:py-[15px] ",
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
      className={`rounded-[3px]  inline-flex  justify-center transition duration-300 ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
