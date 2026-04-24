const NavBtn = ({ direction, onClick, disabled, variant = "default" }) => {
  const variants = {
    secondary:
      "bg-secondary text-white hover:text-secondary hover:bg-primary text-[18px] min-w-[200px] py-[8px] md:py-[15px] box-shadow",
    primary:
      "bg-primary text-white text-[18px] py-[8px] md:py-[15px] hover:bg-primary hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-[50px] h-10  rounded border flex items-center justify-center transition-all duration-150
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
