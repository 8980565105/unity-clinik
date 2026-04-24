function Heading({ title, align = "center", className = "" }) {
  return (
    <div
      className={`relative flex items-center w-full mb-[20px] md:mb-[30px] ${
        align === "start" ? "justify-start" : "justify-center"
      } ${className}`}
    >
      <div className="w-[18px] md:w-[50px] border-t border-black"></div>

      <h2 className="font-h2 text-black whitespace-nowrap relative z-10 mx-5">
        {title}
      </h2>

      <div className="w-[18px] md:w-[50px] border-t border-black"></div>
    </div>
  );
}

export default Heading;


