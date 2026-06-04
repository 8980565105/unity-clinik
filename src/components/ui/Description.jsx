function Description({ Description, align = "center", className = "" }) {
  return (
    <div
      className={`relative flex items-center w-full ${
        align === "start" ? "justify-start" : "justify-center"
      } ${className}`}
    >

      <p className="text-center text-gray-500 text-sm">
        {Description}
      </p>

    </div>
  );
}

export default Description;


