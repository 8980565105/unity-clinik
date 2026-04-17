const NavBtn = ({ direction, onClick, disabled, variant = "default" }) => {
  const directions = {
    left: "left-0 -translate-x-1/2",
    right: "right-0 translate-x-1/2",
  };

  const variants = {
    secondary: "bg-white border-gray-300 shadow-sm hover:bg-gray-50",
    primary:
      "bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] border-none text-[var(--secondary-color)] hover:text-[var(--primary-color)] hover:opacity-90",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-150 flex-shrink-0
        ${directions[direction]} 
        ${variants[variant]} 
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
    >
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        {direction === "left" ? (
          <polyline
            points="15 18 9 12 15 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <polyline
            points="9 18 15 12 9 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
};

export default NavBtn;
