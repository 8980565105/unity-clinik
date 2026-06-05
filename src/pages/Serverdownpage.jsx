
import React from "react";

const ServerDown = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center relative">
      <div className="text-center z-10 mb-80">
        <h1 className="text-[50px] md:text-5xl font-semibold text-black">
          Website is
        </h1>

        <h2 className="text-[40px]  md:text-[60px] font-extrabold text-black mt-3 uppercase">
          Under Construction
        </h2>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
     
        <div className="absolute rotate-12 w-[180%] bg-yellow-400 py-4 shadow-lg overflow-hidden">
          <div className="marquee-container">
            {[...Array(2)].map((_, group) => (
              <div key={group} className="flex shrink-0">
                {[...Array(20)].map((_, i) => (
                  <span
                    key={i}
                    className="mx-6 text-black font-extrabold text-2xl uppercase whitespace-nowrap"
                  >
                    ⚠ UNDER CONSTRUCTION
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

     
        <div className="absolute -rotate-12 w-[180%] bg-yellow-400 py-4 shadow-lg overflow-hidden">
          <div className="marquee-container reverse">
            {[...Array(2)].map((_, group) => (
              <div key={group} className="flex shrink-0">
                {[...Array(20)].map((_, i) => (
                  <span
                    key={i}
                    className="mx-6 text-black font-extrabold text-2xl uppercase whitespace-nowrap"
                  >
                    ⚠ UNDER CONSTRUCTION
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-40 text-center z-10">
        <h3 className="text-[30px] md:text-5xl font-bold uppercase tracking-widest">
          Coming Soon...
        </h3>
      </div>
    </div>
  );
};

export default ServerDown;
