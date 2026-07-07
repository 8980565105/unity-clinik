import { useRef } from "react";

export default function useDragScroll() {
  const ref = useRef(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    isDown.current = true;
    ref.current.classList.add("cursor-grabbing");

    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  };

  const onMouseLeave = () => {
    isDown.current = false;
    ref.current.classList.remove("cursor-grabbing");
  };

  const onMouseUp = () => {
    isDown.current = false;
    ref.current.classList.remove("cursor-grabbing");
  };

  const onMouseMove = (e) => {
    if (!isDown.current) return;

    e.preventDefault();

    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 2;

    ref.current.scrollLeft = scrollLeft.current - walk;
  };

  return {
    ref,
    handlers: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
    },
  };
}