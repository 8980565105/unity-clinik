export default function Row({
  children,
  className = "",
  style = {},
  ...props
}) {
  return (
    <div
      className={`w-[90%] md:w-[90%] lg:max-w-[1440px] mx-auto ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
