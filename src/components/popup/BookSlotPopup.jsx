// // // import { useState, useMemo } from "react";
// // // import {
// // //   X,
// // //   ChevronLeft,
// // //   ChevronRight,
// // //   Clock,
// // //   CheckCircle2,
// // // } from "lucide-react";
// // // import toast from "react-hot-toast";

// // // /**
// // //  * BookSlotPopup
// // //  * Opens AFTER payment success. User must pick a date + time slot and press
// // //  * "Confirm Slot" to close. Backdrop click / outside click does NOT close it,
// // //  * so the booking can't be lost accidentally.
// // //  *
// // //  * consultationType: "voice" | "video"
// // //  *   voice -> 15 min slots
// // //  *   video -> 30 min slots
// // //  *
// // //  * onSubmit(dateObj, timeString) -> called when user presses submit with valid selection
// // //  * onClose() -> only called if you explicitly want a cancel/close (X button)
// // //  */

// // // const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
// // // const MONTHS = [
// // //   "January",
// // //   "February",
// // //   "March",
// // //   "April",
// // //   "May",
// // //   "June",
// // //   "July",
// // //   "August",
// // //   "September",
// // //   "October",
// // //   "November",
// // //   "December",
// // // ];

// // // // Clinic working hours
// // // const WORK_START_HOUR = 8; // 08:00
// // // const WORK_END_HOUR = 18; // 18:00 (exclusive)

// // // function generateTimeSlots(durationMinutes) {
// // //   const slots = [];
// // //   let h = WORK_START_HOUR;
// // //   let m = 0;
// // //   while (h < WORK_END_HOUR) {
// // //     const hh = String(h).padStart(2, "0");
// // //     const mm = String(m).padStart(2, "0");
// // //     slots.push(`${hh}:${mm}`);
// // //     m += durationMinutes;
// // //     if (m >= 60) {
// // //       m -= 60;
// // //       h += 1;
// // //     }
// // //   }
// // //   return slots;
// // // }

// // // function getDaysInMonth(year, month) {
// // //   return new Date(year, month + 1, 0).getDate();
// // // }

// // // function getMondayFirstDay(year, month, day) {
// // //   const jsDay = new Date(year, month, day).getDay();
// // //   return (jsDay + 6) % 7;
// // // }

// // // function isSameDate(a, b) {
// // //   return (
// // //     a &&
// // //     b &&
// // //     a.getFullYear() === b.getFullYear() &&
// // //     a.getMonth() === b.getMonth() &&
// // //     a.getDate() === b.getDate()
// // //   );
// // // }

// // // function formatSelectedDate(date) {
// // //   if (!date) return "";
// // //   const days = [
// // //     "Sunday",
// // //     "Monday",
// // //     "Tuesday",
// // //     "Wednesday",
// // //     "Thursday",
// // //     "Friday",
// // //     "Saturday",
// // //   ];
// // //   const dayName = days[date.getDay()];
// // //   const dateNum = date.getDate();
// // //   const suffix =
// // //     dateNum % 10 === 1 && dateNum !== 11
// // //       ? "st"
// // //       : dateNum % 10 === 2 && dateNum !== 12
// // //         ? "nd"
// // //         : dateNum % 10 === 3 && dateNum !== 13
// // //           ? "rd"
// // //           : "th";
// // //   return `${dayName} ${dateNum}${suffix} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
// // // }

// // // export function BookSlotPopup({
// // //   isOpen = false,
// // //   onClose,
// // //   onSubmit,
// // //   consultationType = "voice",
// // //   isSubmitting = false,
// // // }) {
// // //   const today = useMemo(() => {
// // //     const d = new Date();
// // //     d.setHours(0, 0, 0, 0);
// // //     return d;
// // //   }, []);

// // //   const [viewYear, setViewYear] = useState(today.getFullYear());
// // //   const [viewMonth, setViewMonth] = useState(today.getMonth());
// // //   const [selectedDate, setSelectedDate] = useState(null);
// // //   const [selectedTime, setSelectedTime] = useState(null);

// // //   const durationMinutes = consultationType === "video" ? 30 : 15;
// // //   const timeSlots = useMemo(
// // //     () => generateTimeSlots(durationMinutes),
// // //     [durationMinutes],
// // //   );

// // //   if (!isOpen) return null;

// // //   const daysInMonth = getDaysInMonth(viewYear, viewMonth);
// // //   const firstDayOffset = getMondayFirstDay(viewYear, viewMonth, 1);

// // //   const canGoPrevMonth =
// // //     viewYear > today.getFullYear() ||
// // //     (viewYear === today.getFullYear() && viewMonth > today.getMonth());

// // //   const goPrevMonth = () => {
// // //     if (!canGoPrevMonth) return;
// // //     if (viewMonth === 0) {
// // //       setViewMonth(11);
// // //       setViewYear((y) => y - 1);
// // //     } else {
// // //       setViewMonth((m) => m - 1);
// // //     }
// // //   };

// // //   const goNextMonth = () => {
// // //     if (viewMonth === 11) {
// // //       setViewMonth(0);
// // //       setViewYear((y) => y + 1);
// // //     } else {
// // //       setViewMonth((m) => m + 1);
// // //     }
// // //   };

// // //   const handleDayClick = (day) => {
// // //     const clicked = new Date(viewYear, viewMonth, day);
// // //     clicked.setHours(0, 0, 0, 0);
// // //     if (clicked < today) return; // block past dates
// // //     setSelectedDate(clicked);
// // //     setSelectedTime(null); // reset time when date changes
// // //   };

// // //   const handleSubmit = () => {
// // //     if (!selectedDate) {
// // //       toast.error("Please select a date");
// // //       return;
// // //     }
// // //     if (!selectedTime) {
// // //       toast.error("Please select a time slot");
// // //       return;
// // //     }
// // //     onSubmit &&
// // //       onSubmit({ date: selectedDate, time: selectedTime, durationMinutes });
// // //   };

// // //   // Prevent backdrop click from closing the popup — intentional per requirement.
// // //   const handleBackdropClick = (e) => {
// // //     e.stopPropagation();
// // //   };

// // //   const cells = [];
// // //   for (let i = 0; i < firstDayOffset; i++) cells.push(null);
// // //   for (let d = 1; d <= daysInMonth; d++) cells.push(d);

// // //   return (
// // //     <div
// // //       onClick={handleBackdropClick}
// // //       className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 animate-fade-in"
// // //     >
// // //       <div
// // //         onClick={(e) => e.stopPropagation()}
// // //         className="bg-white w-full max-w-[440px] rounded-[24px] shadow-2xl relative overflow-hidden animate-scale-up border border-gray-100 flex flex-col max-h-[92vh]"
// // //       >
// // //         {/* Header */}
// // //         <div className="bg-[#0b0c0e] px-6 py-5 relative flex items-center justify-between">
// // //           <div>
// // //             <h2 className="text-white text-lg font-black tracking-tight uppercase">
// // //               Choose Your Slot
// // //             </h2>
// // //             <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-1 flex items-center gap-1.5">
// // //               <Clock size={11} />
// // //               {consultationType === "video"
// // //                 ? "Video Call"
// // //                 : "Voice Call"} • {durationMinutes} Min Session
// // //             </p>
// // //           </div>
// // //           {onClose && (
// // //             <button
// // //               onClick={onClose}
// // //               className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
// // //               aria-label="Close popup"
// // //             >
// // //               <X size={15} className="text-white" />
// // //             </button>
// // //           )}
// // //         </div>

// // //         <div className="overflow-y-auto p-5 flex flex-col gap-5">
// // //           {/* Calendar */}
// // //           <div>
// // //             <div className="flex items-center justify-between mb-4 px-1">
// // //               <button
// // //                 onClick={goPrevMonth}
// // //                 disabled={!canGoPrevMonth}
// // //                 className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
// // //                   canGoPrevMonth
// // //                     ? "hover:bg-gray-100 text-gray-700 cursor-pointer"
// // //                     : "text-gray-200 cursor-not-allowed"
// // //                 }`}
// // //               >
// // //                 <ChevronLeft size={18} />
// // //               </button>
// // //               <span className="font-black text-gray-900 text-base tracking-tight">
// // //                 {MONTHS[viewMonth]} {viewYear}
// // //               </span>
// // //               <button
// // //                 onClick={goNextMonth}
// // //                 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
// // //               >
// // //                 <ChevronRight size={18} />
// // //               </button>
// // //             </div>

// // //             <div className="grid grid-cols-7 gap-y-2 text-center">
// // //               {WEEKDAYS.map((w, i) => (
// // //                 <span
// // //                   key={i}
// // //                   className="text-[10px] font-black text-gray-300 uppercase"
// // //                 >
// // //                   {w}
// // //                 </span>
// // //               ))}

// // //               {cells.map((day, idx) => {
// // //                 if (day === null) return <span key={idx} />;
// // //                 const cellDate = new Date(viewYear, viewMonth, day);
// // //                 cellDate.setHours(0, 0, 0, 0);
// // //                 const isPast = cellDate < today;
// // //                 const isSelected = isSameDate(cellDate, selectedDate);
// // //                 const isToday = isSameDate(cellDate, today);

// // //                 return (
// // //                   <button
// // //                     key={idx}
// // //                     disabled={isPast}
// // //                     onClick={() => handleDayClick(day)}
// // //                     className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all
// // //                       ${isPast ? "text-gray-200 cursor-not-allowed" : "cursor-pointer"}
// // //                       ${
// // //                         isSelected
// // //                           ? "bg-[#155e37] text-white shadow-md scale-105"
// // //                           : isPast
// // //                             ? ""
// // //                             : "bg-[#fafafc] text-gray-700 hover:bg-gray-100"
// // //                       }
// // //                       ${isToday && !isSelected ? "ring-2 ring-[#155e37]/40" : ""}
// // //                     `}
// // //                   >
// // //                     {day}
// // //                   </button>
// // //                 );
// // //               })}
// // //             </div>
// // //           </div>

// // //           {/* Time slots */}
// // //           <div>
// // //             <div className="flex items-center justify-between mb-3">
// // //               <span className="text-[10px] font-black tracking-widest text-[#a0a5b5] uppercase">
// // //                 {selectedDate
// // //                   ? formatSelectedDate(selectedDate)
// // //                   : "Select a date first"}
// // //               </span>
// // //               {selectedDate && (
// // //                 <span className="text-[9px] font-bold text-gray-400 uppercase">
// // //                   {timeSlots.length} slots
// // //                 </span>
// // //               )}
// // //             </div>

// // //             {selectedDate ? (
// // //               <div className="grid grid-cols-3 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
// // //                 {timeSlots.map((slot) => {
// // //                   const isSelected = selectedTime === slot;
// // //                   return (
// // //                     <button
// // //                       key={slot}
// // //                       onClick={() => setSelectedTime(slot)}
// // //                       className={`py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all cursor-pointer border-2
// // //                         ${
// // //                           isSelected
// // //                             ? "bg-[#155e37] border-[#155e37] text-white shadow-md scale-[1.03]"
// // //                             : "bg-[#eef6f1] border-transparent text-[#155e37] hover:bg-[#dcefe3]"
// // //                         }`}
// // //                     >
// // //                       {slot}
// // //                     </button>
// // //                   );
// // //                 })}
// // //               </div>
// // //             ) : (
// // //               <div className="py-8 flex items-center justify-center text-gray-300 text-xs font-bold bg-[#fafafc] rounded-2xl">
// // //                 Pick a date above to see available times
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* Selected summary */}
// // //           {selectedDate && selectedTime && (
// // //             <div className="flex items-center gap-2.5 bg-[#eef6f1] border border-[#155e37]/20 rounded-2xl px-4 py-3">
// // //               <CheckCircle2
// // //                 size={16}
// // //                 className="text-[#155e37] flex-shrink-0"
// // //               />
// // //               <span className="text-xs font-bold text-[#155e37]">
// // //                 {formatSelectedDate(selectedDate)} at {selectedTime} (
// // //                 {durationMinutes} min)
// // //               </span>
// // //             </div>
// // //           )}

// // //           {/* Submit */}
// // //           <button
// // //             onClick={handleSubmit}
// // //             disabled={isSubmitting || !selectedDate || !selectedTime}
// // //             className="w-full bg-black hover:bg-neutral-900 text-white font-extrabold tracking-widest py-4 rounded-[20px] uppercase text-xs md:text-sm shadow-lg shadow-black/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
// // //           >
// // //             {isSubmitting ? (
// // //               <>
// // //                 <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
// // //                 SAVING...
// // //               </>
// // //             ) : (
// // //               "CONFIRM SLOT"
// // //             )}
// // //           </button>

// // //           <span className="text-[9px] text-gray-400 font-black tracking-widest text-center uppercase -mt-2">
// // //             Select date & time, then confirm
// // //           </span>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import { useState, useMemo } from "react";
// // import {
// //   X,
// //   ChevronLeft,
// //   ChevronRight,
// //   Clock,
// //   CheckCircle2,
// // } from "lucide-react";
// // import toast from "react-hot-toast";

// // const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
// // const MONTHS = [
// //   "January",
// //   "February",
// //   "March",
// //   "April",
// //   "May",
// //   "June",
// //   "July",
// //   "August",
// //   "September",
// //   "October",
// //   "November",
// //   "December",
// // ];

// // const WORK_START_HOUR = 10;
// // const WORK_END_HOUR = 18;

// // function generateTimeSlots(durationMinutes) {
// //   const slots = [];
// //   let h = WORK_START_HOUR;
// //   let m = 0;
// //   while (h < WORK_END_HOUR) {
// //     const hh = String(h).padStart(2, "0");
// //     const mm = String(m).padStart(2, "0");
// //     slots.push(`${hh}:${mm}`);
// //     m += durationMinutes;
// //     if (m >= 60) {
// //       m -= 60;
// //       h += 1;
// //     }
// //   }
// //   return slots;
// // }

// // function getDaysInMonth(year, month) {
// //   return new Date(year, month + 1, 0).getDate();
// // }

// // function getMondayFirstDay(year, month, day) {
// //   const jsDay = new Date(year, month, day).getDay();
// //   return (jsDay + 6) % 7;
// // }

// // function isSameDate(a, b) {
// //   return (
// //     a &&
// //     b &&
// //     a.getFullYear() === b.getFullYear() &&
// //     a.getMonth() === b.getMonth() &&
// //     a.getDate() === b.getDate()
// //   );
// // }

// // function formatSelectedDate(date) {
// //   if (!date) return "";
// //   const days = [
// //     "Sunday",
// //     "Monday",
// //     "Tuesday",
// //     "Wednesday",
// //     "Thursday",
// //     "Friday",
// //     "Saturday",
// //   ];
// //   const dayName = days[date.getDay()];
// //   const dateNum = date.getDate();
// //   const suffix =
// //     dateNum % 10 === 1 && dateNum !== 11
// //       ? "st"
// //       : dateNum % 10 === 2 && dateNum !== 12
// //         ? "nd"
// //         : dateNum % 10 === 3 && dateNum !== 13
// //           ? "rd"
// //           : "th";
// //   return `${dayName} ${dateNum}${suffix} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
// // }

// // export function BookSlotPopup({
// //   isOpen = false,
// //   onClose,
// //   onSubmit,
// //   consultationType = "voice",
// //   isSubmitting = false,
// // }) {
// //   const today = useMemo(() => {
// //     const d = new Date();
// //     d.setHours(0, 0, 0, 0);
// //     return d;
// //   }, []);

// //   const [viewYear, setViewYear] = useState(today.getFullYear());
// //   const [viewMonth, setViewMonth] = useState(today.getMonth());
// //   const [selectedDate, setSelectedDate] = useState(null);
// //   const [selectedTime, setSelectedTime] = useState(null);

// //   const durationMinutes = consultationType === "video" ? 30 : 15;
// //   const timeSlots = useMemo(
// //     () => generateTimeSlots(durationMinutes),
// //     [durationMinutes],
// //   );

// //   if (!isOpen) return null;

// //   const daysInMonth = getDaysInMonth(viewYear, viewMonth);
// //   const firstDayOffset = getMondayFirstDay(viewYear, viewMonth, 1);

// //   const canGoPrevMonth =
// //     viewYear > today.getFullYear() ||
// //     (viewYear === today.getFullYear() && viewMonth > today.getMonth());

// //   const goPrevMonth = () => {
// //     if (!canGoPrevMonth) return;
// //     if (viewMonth === 0) {
// //       setViewMonth(11);
// //       setViewYear((y) => y - 1);
// //     } else {
// //       setViewMonth((m) => m - 1);
// //     }
// //   };

// //   const goNextMonth = () => {
// //     if (viewMonth === 11) {
// //       setViewMonth(0);
// //       setViewYear((y) => y + 1);
// //     } else {
// //       setViewMonth((m) => m + 1);
// //     }
// //   };

// //   const handleDayClick = (day) => {
// //     const clicked = new Date(viewYear, viewMonth, day);
// //     clicked.setHours(0, 0, 0, 0);
// //     if (clicked < today) return;
// //     setSelectedDate(clicked);
// //     setSelectedTime(null);
// //   };

// //   const handleSubmit = () => {
// //     if (!selectedDate) {
// //       toast.error("Please select a date");
// //       return;
// //     }
// //     if (!selectedTime) {
// //       toast.error("Please select a time slot");
// //       return;
// //     }
// //     onSubmit &&
// //       onSubmit({ date: selectedDate, time: selectedTime, durationMinutes });
// //   };

// //   const handleBackdropClick = (e) => {
// //     e.stopPropagation();
// //   };

// //   const cells = [];
// //   for (let i = 0; i < firstDayOffset; i++) cells.push(null);
// //   for (let d = 1; d <= daysInMonth; d++) cells.push(d);

// //   return (
// //     <div
// //       onClick={handleBackdropClick}
// //       className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 animate-fade-in"
// //     >
// //       <div
// //         onClick={(e) => e.stopPropagation()}
// //         className="bg-white w-full max-w-[440px] rounded-[24px] shadow-2xl relative overflow-hidden animate-scale-up border border-gray-100 flex flex-col max-h-[92vh]"
// //       >
// //         {/* Header */}
// //         <div className="bg-[#0b0c0e] px-6 py-5 relative flex items-center justify-between">
// //           <div>
// //             <h2 className="text-white text-lg font-black tracking-tight uppercase">
// //               Choose Your Slot
// //             </h2>
// //             <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-1 flex items-center gap-1.5">
// //               <Clock size={11} />
// //               {consultationType === "video"
// //                 ? "Video Call"
// //                 : "Voice Call"} • {durationMinutes} Min Session
// //             </p>
// //           </div>
// //           {/* {onClose && (
// //             <button
// //               onClick={onClose}
// //               className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
// //               aria-label="Close popup"
// //             >
// //               <X size={15} className="text-white" />
// //             </button>
// //           )} */}
// //         </div>

// //         <div className="overflow-y-auto p-5 flex flex-col gap-5">
// //           {/* Calendar */}
// //           <div>
// //             <div className="flex items-center justify-between mb-4 px-1">
// //               <button
// //                 onClick={goPrevMonth}
// //                 disabled={!canGoPrevMonth}
// //                 className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
// //                   canGoPrevMonth
// //                     ? "hover:bg-gray-100 text-gray-700 cursor-pointer"
// //                     : "text-gray-200 cursor-not-allowed"
// //                 }`}
// //               >
// //                 <ChevronLeft size={18} />
// //               </button>
// //               <span className="font-black text-gray-900 text-base tracking-tight">
// //                 {MONTHS[viewMonth]} {viewYear}
// //               </span>
// //               <button
// //                 onClick={goNextMonth}
// //                 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
// //               >
// //                 <ChevronRight size={18} />
// //               </button>
// //             </div>

// //             <div className="grid grid-cols-7 gap-y-2 text-center">
// //               {WEEKDAYS.map((w, i) => (
// //                 <span
// //                   key={i}
// //                   className="text-[10px] font-black text-gray-300 uppercase"
// //                 >
// //                   {w}
// //                 </span>
// //               ))}

// //               {cells.map((day, idx) => {
// //                 if (day === null) return <span key={idx} />;
// //                 const cellDate = new Date(viewYear, viewMonth, day);
// //                 cellDate.setHours(0, 0, 0, 0);
// //                 const isPast = cellDate < today;
// //                 const isSelected = isSameDate(cellDate, selectedDate);
// //                 const isToday = isSameDate(cellDate, today);

// //                 return (
// //                   <button
// //                     key={idx}
// //                     disabled={isPast}
// //                     onClick={() => handleDayClick(day)}
// //                     className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all
// //                       ${isPast ? "text-gray-200 cursor-not-allowed" : "cursor-pointer"}
// //                       ${
// //                         isSelected
// //                           ? "bg-[#155e37] text-white shadow-md scale-105"
// //                           : isPast
// //                             ? ""
// //                             : "bg-[#fafafc] text-gray-700 hover:bg-gray-100"
// //                       }
// //                       ${isToday && !isSelected ? "ring-2 ring-[#155e37]/40" : ""}
// //                     `}
// //                   >
// //                     {day}
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div>

// //           <div>
// //             <div className="flex items-center justify-between mb-3">
// //               <span className="text-[10px] font-black tracking-widest text-[#a0a5b5] uppercase">
// //                 {selectedDate
// //                   ? formatSelectedDate(selectedDate)
// //                   : "Select a date first"}
// //               </span>
// //               {selectedDate && (
// //                 <span className="text-[9px] font-bold text-gray-400 uppercase">
// //                   {timeSlots.length} slots
// //                 </span>
// //               )}
// //             </div>

// //             {selectedDate ? (
// //               <div className="grid grid-cols-3 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
// //                 {timeSlots.map((slot) => {
// //                   const isSelected = selectedTime === slot;
// //                   return (
// //                     <button
// //                       key={slot}
// //                       onClick={() => setSelectedTime(slot)}
// //                       className={`py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all cursor-pointer border-2
// //                         ${
// //                           isSelected
// //                             ? "bg-[#155e37] border-[#155e37] text-white shadow-md scale-[1.03]"
// //                             : "bg-[#eef6f1] border-transparent text-[#155e37] hover:bg-[#dcefe3]"
// //                         }`}
// //                     >
// //                       {slot}
// //                     </button>
// //                   );
// //                 })}
// //               </div>
// //             ) : (
// //               <div className="py-8 flex items-center justify-center text-gray-300 text-xs font-bold bg-[#fafafc] rounded-2xl">
// //                 Pick a date above to see available times
// //               </div>
// //             )}
// //           </div>

// //           {selectedDate && selectedTime && (
// //             <div className="flex items-center gap-2.5 bg-[#eef6f1] border border-[#155e37]/20 rounded-2xl px-4 py-3">
// //               <CheckCircle2
// //                 size={16}
// //                 className="text-[#155e37] flex-shrink-0"
// //               />
// //               <span className="text-xs font-bold text-[#155e37]">
// //                 {formatSelectedDate(selectedDate)} at {selectedTime} (
// //                 {durationMinutes} min)
// //               </span>
// //             </div>
// //           )}

// //           <button
// //             onClick={handleSubmit}
// //             disabled={isSubmitting || !selectedDate || !selectedTime}
// //             className="w-full bg-black hover:bg-neutral-900 text-white font-extrabold tracking-widest py-4 rounded-[20px] uppercase text-xs md:text-sm shadow-lg shadow-black/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
// //           >
// //             {isSubmitting ? (
// //               <>
// //                 <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
// //                 SAVING...
// //               </>
// //             ) : (
// //               "CONFIRM SLOT"
// //             )}
// //           </button>

// //           <span className="text-[9px] text-gray-400 font-black tracking-widest text-center uppercase -mt-2">
// //             Select date & time, then confirm
// //           </span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { useState, useMemo, useEffect } from "react";
// import {
//   X,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   CheckCircle2,
//   Loader2,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { useDispatch } from "react-redux";
// // import { fetchBookedSlots } from "../../features/payments/paymentThunk";

// /**
//  * BookSlotPopup
//  * Opens AFTER payment success. User must pick a date + time slot and press
//  * "Confirm Slot" to close. Backdrop click / outside click does NOT close it,
//  * so the booking can't be lost accidentally.
//  *
//  * consultationType: "voice" | "video"
//  *   voice -> 15 min slots
//  *   video -> 30 min slots
//  *
//  * Rules added:
//  *  - Sundays are fully disabled — cannot be selected on the calendar.
//  *  - For the selected date, times already booked by another user (same
//  *    consultation type) are fetched from the backend and disabled/greyed out.
//  */

// const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
// const MONTHS = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

// // Fixed working windows (in minutes from midnight):
// //  Morning: 10:30 AM – 1:30 PM
// //  Evening: 4:30 PM – 8:00 PM
// const TIME_WINDOWS = [
//   { start: 10 * 60 + 30, end: 13 * 60 + 30 }, // 10:30 -> 13:30
//   { start: 16 * 60 + 30, end: 20 * 60 }, // 16:30 -> 20:00
// ];

// // Stored/compared internally as 24hr "HH:MM" (matches backend slot_time format)
// function generateTimeSlots(durationMinutes) {
//   const slots = [];
//   TIME_WINDOWS.forEach(({ start, end }) => {
//     let t = start;
//     while (t + durationMinutes <= end) {
//       const hh = String(Math.floor(t / 60)).padStart(2, "0");
//       const mm = String(t % 60).padStart(2, "0");
//       slots.push(`${hh}:${mm}`);
//       t += durationMinutes;
//     }
//   });
//   return slots;
// }

// // Convert 24hr "HH:MM" -> "10:30 AM" for display only
// function to12Hour(time24) {
//   const [hStr, mStr] = time24.split(":");
//   let h = parseInt(hStr, 10);
//   const period = h >= 12 ? "PM" : "AM";
//   h = h % 12;
//   if (h === 0) h = 12;
//   return `${h}:${mStr} ${period}`;
// }

// function getDaysInMonth(year, month) {
//   return new Date(year, month + 1, 0).getDate();
// }

// function getMondayFirstDay(year, month, day) {
//   const jsDay = new Date(year, month, day).getDay();
//   return (jsDay + 6) % 7;
// }

// function isSameDate(a, b) {
//   return (
//     a &&
//     b &&
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

// function isSunday(year, month, day) {
//   return new Date(year, month, day).getDay() === 0;
// }

// function formatSelectedDate(date) {
//   if (!date) return "";
//   const days = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
//   const dayName = days[date.getDay()];
//   const dateNum = date.getDate();
//   const suffix =
//     dateNum % 10 === 1 && dateNum !== 11
//       ? "st"
//       : dateNum % 10 === 2 && dateNum !== 12
//         ? "nd"
//         : dateNum % 10 === 3 && dateNum !== 13
//           ? "rd"
//           : "th";
//   return `${dayName} ${dateNum}${suffix} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
// }

// function toDateKey(date) {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// }

// export function BookSlotPopup({
//   isOpen = false,
//   onClose,
//   onSubmit,
//   consultationType = "voice",
//   isSubmitting = false,
// }) {
//   const dispatch = useDispatch();

//   const today = useMemo(() => {
//     const d = new Date();
//     d.setHours(0, 0, 0, 0);
//     return d;
//   }, []);

//   const [viewYear, setViewYear] = useState(today.getFullYear());
//   const [viewMonth, setViewMonth] = useState(today.getMonth());
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);

//   const [bookedTimes, setBookedTimes] = useState([]);
//   const [isLoadingSlots, setIsLoadingSlots] = useState(false);

//   const durationMinutes = consultationType === "video" ? 30 : 15;
//   const timeSlots = useMemo(
//     () => generateTimeSlots(durationMinutes),
//     [durationMinutes],
//   );

//   // Backend-type mapping (matches Bookconsaltion schema enum)
//   const backendType =
//     consultationType === "video" ? "video call" : "voice call";

//   // Fetch already-booked slots whenever the selected date (or type) changes
//   useEffect(() => {
//     if (!selectedDate) {
//       setBookedTimes([]);
//       return;
//     }

//     let cancelled = false;
//     setIsLoadingSlots(true);
//     setBookedTimes([]);

//     dispatch(
//       fetchBookedSlots({ date: toDateKey(selectedDate), type: backendType }),
//     )
//       .then((res) => {
//         if (cancelled) return;
//         if (fetchBookedSlots.fulfilled.match(res)) {
//           setBookedTimes(res.payload?.bookedTimes || []);
//         } else {
//           // If fetch fails, fail safe: show all slots as available rather than blocking the user
//           setBookedTimes([]);
//         }
//       })
//       .finally(() => {
//         if (!cancelled) setIsLoadingSlots(false);
//       });

//     return () => {
//       cancelled = true;
//     };
//   }, [selectedDate, backendType, dispatch]);

//   if (!isOpen) return null;

//   const daysInMonth = getDaysInMonth(viewYear, viewMonth);
//   const firstDayOffset = getMondayFirstDay(viewYear, viewMonth, 1);

//   const canGoPrevMonth =
//     viewYear > today.getFullYear() ||
//     (viewYear === today.getFullYear() && viewMonth > today.getMonth());

//   const goPrevMonth = () => {
//     if (!canGoPrevMonth) return;
//     if (viewMonth === 0) {
//       setViewMonth(11);
//       setViewYear((y) => y - 1);
//     } else {
//       setViewMonth((m) => m - 1);
//     }
//   };

//   const goNextMonth = () => {
//     if (viewMonth === 11) {
//       setViewMonth(0);
//       setViewYear((y) => y + 1);
//     } else {
//       setViewMonth((m) => m + 1);
//     }
//   };

//   const handleDayClick = (day) => {
//     if (isSunday(viewYear, viewMonth, day)) return; // Sunday not selectable

//     const clicked = new Date(viewYear, viewMonth, day);
//     clicked.setHours(0, 0, 0, 0);
//     if (clicked < today) return; // block past dates

//     setSelectedDate(clicked);
//     setSelectedTime(null); // reset time when date changes
//   };

//   const handleSubmit = () => {
//     if (!selectedDate) {
//       toast.error("Please select a date");
//       return;
//     }
//     if (!selectedTime) {
//       toast.error("Please select a time slot");
//       return;
//     }
//     if (bookedTimes.includes(selectedTime)) {
//       toast.error("This slot is already booked, please choose another");
//       setSelectedTime(null);
//       return;
//     }
//     onSubmit &&
//       onSubmit({ date: selectedDate, time: selectedTime, durationMinutes });
//   };

//   // Prevent backdrop click from closing the popup — intentional per requirement.
//   const handleBackdropClick = (e) => {
//     e.stopPropagation();
//   };

//   const cells = [];
//   for (let i = 0; i < firstDayOffset; i++) cells.push(null);
//   for (let d = 1; d <= daysInMonth; d++) cells.push(d);

//   return (
//     <div
//       onClick={handleBackdropClick}
//       className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 animate-fade-in"
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className="bg-white w-full max-w-[440px] rounded-[24px] shadow-2xl relative overflow-hidden animate-scale-up border border-gray-100 flex flex-col max-h-[92vh]"
//       >
//         {/* Header */}
//         <div className="bg-[#0b0c0e] px-6 py-5 relative flex items-center justify-between">
//           <div>
//             <h2 className="text-white text-lg font-black tracking-tight uppercase">
//               Choose Your Slot
//             </h2>
//             <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-1 flex items-center gap-1.5">
//               <Clock size={11} />
//               {consultationType === "video"
//                 ? "Video Call"
//                 : "Voice Call"} • {durationMinutes} Min Session
//             </p>
//           </div>
//           {onClose && (
//             <button
//               onClick={onClose}
//               className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
//               aria-label="Close popup"
//             >
//               <X size={15} className="text-white" />
//             </button>
//           )}
//         </div>

//         <div className="overflow-y-auto p-5 flex flex-col gap-5">
//           {/* Calendar */}
//           <div>
//             <div className="flex items-center justify-between mb-4 px-1">
//               <button
//                 onClick={goPrevMonth}
//                 disabled={!canGoPrevMonth}
//                 className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
//                   canGoPrevMonth
//                     ? "hover:bg-gray-100 text-gray-700 cursor-pointer"
//                     : "text-gray-200 cursor-not-allowed"
//                 }`}
//               >
//                 <ChevronLeft size={18} />
//               </button>
//               <span className="font-black text-gray-900 text-base tracking-tight">
//                 {MONTHS[viewMonth]} {viewYear}
//               </span>
//               <button
//                 onClick={goNextMonth}
//                 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>

//             <div className="grid grid-cols-7 gap-y-2 text-center">
//               {WEEKDAYS.map((w, i) => (
//                 <span
//                   key={i}
//                   className={`text-[10px] font-black uppercase ${i === 6 ? "text-red-300" : "text-gray-300"}`}
//                 >
//                   {w}
//                 </span>
//               ))}

//               {cells.map((day, idx) => {
//                 if (day === null) return <span key={idx} />;
//                 const cellDate = new Date(viewYear, viewMonth, day);
//                 cellDate.setHours(0, 0, 0, 0);
//                 const sunday = isSunday(viewYear, viewMonth, day);
//                 const isPast = cellDate < today;
//                 const isDisabled = isPast || sunday;
//                 const isSelected = isSameDate(cellDate, selectedDate);
//                 const isToday = isSameDate(cellDate, today);

//                 return (
//                   <button
//                     key={idx}
//                     disabled={isDisabled}
//                     title={sunday ? "Closed on Sundays" : undefined}
//                     onClick={() => handleDayClick(day)}
//                     className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all
//                       ${isDisabled ? "text-gray-200 cursor-not-allowed" : "cursor-pointer"}
//                       ${sunday && !isPast ? "line-through decoration-red-200" : ""}
//                       ${
//                         isSelected
//                           ? "bg-[#155e37] text-white shadow-md scale-105"
//                           : isDisabled
//                             ? ""
//                             : "bg-[#fafafc] text-gray-700 hover:bg-gray-100"
//                       }
//                       ${isToday && !isSelected ? "ring-2 ring-[#155e37]/40" : ""}
//                     `}
//                   >
//                     {day}
//                   </button>
//                 );
//               })}
//             </div>
//             <div className="flex items-center justify-center gap-4 mt-3">
//               <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
//                 Morning: 10:30 AM – 1:30 PM
//               </span>
//               <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
//                 Evening: 4:30 PM – 8:00 PM
//               </span>
//             </div>
//             <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wide mt-1 text-center">
//               Closed on Sundays
//             </p>
//           </div>

//           {/* Time slots */}
//           <div>
//             <div className="flex items-center justify-between mb-3">
//               <span className="text-[10px] font-black tracking-widest text-[#a0a5b5] uppercase">
//                 {selectedDate
//                   ? formatSelectedDate(selectedDate)
//                   : "Select a date first"}
//               </span>
//               {selectedDate && !isLoadingSlots && (
//                 <span className="text-[9px] font-bold text-gray-400 uppercase">
//                   {timeSlots.length - bookedTimes.length} of {timeSlots.length}{" "}
//                   available
//                 </span>
//               )}
//             </div>

//             {!selectedDate ? (
//               <div className="py-8 flex items-center justify-center text-gray-300 text-xs font-bold bg-[#fafafc] rounded-2xl">
//                 Pick a date above to see available times
//               </div>
//             ) : isLoadingSlots ? (
//               <div className="py-8 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold bg-[#fafafc] rounded-2xl">
//                 <Loader2 size={14} className="animate-spin" />
//                 Checking availability...
//               </div>
//             ) : (
//               <div className="grid grid-cols-3 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
//                 {timeSlots.map((slot) => {
//                   const isSelected = selectedTime === slot;
//                   const isBooked = bookedTimes.includes(slot);
//                   return (
//                     <button
//                       key={slot}
//                       disabled={isBooked}
//                       onClick={() => setSelectedTime(slot)}
//                       title={isBooked ? "Already booked" : undefined}
//                       className={`py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all border-2 relative
//                         ${
//                           isBooked
//                             ? "bg-gray-50 border-transparent text-gray-300 cursor-not-allowed line-through"
//                             : isSelected
//                               ? "bg-[#155e37] border-[#155e37] text-white shadow-md scale-[1.03] cursor-pointer"
//                               : "bg-[#eef6f1] border-transparent text-[#155e37] hover:bg-[#dcefe3] cursor-pointer"
//                         }`}
//                     >
//                       {to12Hour(slot)}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Selected summary */}
//           {selectedDate && selectedTime && (
//             <div className="flex items-center gap-2.5 bg-[#eef6f1] border border-[#155e37]/20 rounded-2xl px-4 py-3">
//               <CheckCircle2
//                 size={16}
//                 className="text-[#155e37] flex-shrink-0"
//               />
//               <span className="text-xs font-bold text-[#155e37]">
//                 {formatSelectedDate(selectedDate)} at {to12Hour(selectedTime)} (
//                 {durationMinutes} min)
//               </span>
//             </div>
//           )}

//           {/* Submit */}
//           <button
//             onClick={handleSubmit}
//             disabled={
//               isSubmitting || !selectedDate || !selectedTime || isLoadingSlots
//             }
//             className="w-full bg-black hover:bg-neutral-900 text-white font-extrabold tracking-widest py-4 rounded-[20px] uppercase text-xs md:text-sm shadow-lg shadow-black/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {isSubmitting ? (
//               <>
//                 <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 SAVING...
//               </>
//             ) : (
//               "CONFIRM SLOT"
//             )}
//           </button>

//           <span className="text-[9px] text-gray-400 font-black tracking-widest text-center uppercase -mt-2">
//             Select date & time, then confirm
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useMemo, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchBookedSlots } from "../../features/payments/paymentThunk";

/**
 * BookSlotPopup
 * Opens AFTER payment success. User must pick a date + time slot and press
 * "Confirm Slot" to close. Backdrop click / outside click does NOT close it,
 * so the booking can't be lost accidentally.
 *
 * consultationType: "voice" | "video"
 *   voice -> 15 min slots
 *   video -> 30 min slots
 *
 * Rules added:
 *  - Sundays are fully disabled — cannot be selected on the calendar.
 *  - For the selected date, times already booked by another user (same
 *    consultation type) are fetched from the backend and disabled/greyed out.
 */

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Fixed working windows (in minutes from midnight):
//  Morning: 10:30 AM – 1:30 PM
//  Evening: 4:30 PM – 8:00 PM
const TIME_WINDOWS = [
  { start: 10 * 60 + 30, end: 13 * 60 + 30 }, // 10:30 -> 13:30
  { start: 16 * 60 + 30, end: 20 * 60 }, // 16:30 -> 20:00
];

// Stored/compared internally as 24hr "HH:MM" (matches backend slot_time format)
function generateTimeSlots(durationMinutes) {
  const slots = [];
  TIME_WINDOWS.forEach(({ start, end }) => {
    let t = start;
    while (t + durationMinutes <= end) {
      const hh = String(Math.floor(t / 60)).padStart(2, "0");
      const mm = String(t % 60).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
      t += durationMinutes;
    }
  });
  return slots;
}
function timeToMinutes(time24) {
  const [h, m] = time24.split(":").map(Number);
  return h * 60 + m;
}

// Convert 24hr "HH:MM" -> "10:30 AM" for display only
function to12Hour(time24) {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr} ${period}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getMondayFirstDay(year, month, day) {
  const jsDay = new Date(year, month, day).getDay();
  return (jsDay + 6) % 7;
}

function isSameDate(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSunday(year, month, day) {
  return new Date(year, month, day).getDay() === 0;
}

function formatSelectedDate(date) {
  if (!date) return "";
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[date.getDay()];
  const dateNum = date.getDate();
  const suffix =
    dateNum % 10 === 1 && dateNum !== 11
      ? "st"
      : dateNum % 10 === 2 && dateNum !== 12
        ? "nd"
        : dateNum % 10 === 3 && dateNum !== 13
          ? "rd"
          : "th";
  return `${dayName} ${dateNum}${suffix} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BookSlotPopup({
  isOpen = false,
  onClose,
  onSubmit,
  consultationType = "voice",
  isSubmitting = false,
}) {
  const dispatch = useDispatch();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [bookedTimes, setBookedTimes] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const durationMinutes = consultationType === "video" ? 30 : 15;
  const timeSlots = useMemo(
    () => generateTimeSlots(durationMinutes),
    [durationMinutes],
  );
  const isSelectedToday = isSameDate(selectedDate, today);

  // live "now" in minutes - recalculated every render, good enough for this use case
  const nowMinutes = useMemo(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  }, [selectedDate, isLoadingSlots]); // recompute when date changes

  // Backend-type mapping (matches Bookconsaltion schema enum)
  const backendType =
    consultationType === "video" ? "video call" : "voice call";

  // Fetch already-booked slots whenever the selected date (or type) changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedTimes([]);
      return;
    }

    let cancelled = false;
    setIsLoadingSlots(true);
    setBookedTimes([]);

    dispatch(
      fetchBookedSlots({ date: toDateKey(selectedDate), type: backendType }),
    )
      .then((res) => {
        if (cancelled) return;
        if (fetchBookedSlots.fulfilled.match(res)) {
          setBookedTimes(res.payload?.bookedTimes || []);
        } else {
          // If fetch fails, fail safe: show all slots as available rather than blocking the user
          setBookedTimes([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, backendType, dispatch]);

  if (!isOpen) return null;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getMondayFirstDay(viewYear, viewMonth, 1);

  const canGoPrevMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const goPrevMonth = () => {
    if (!canGoPrevMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (day) => {
    if (isSunday(viewYear, viewMonth, day)) return; // Sunday not selectable

    const clicked = new Date(viewYear, viewMonth, day);
    clicked.setHours(0, 0, 0, 0);
    if (clicked < today) return; // block past dates

    setSelectedDate(clicked);
    setSelectedTime(null); // reset time when date changes
  };

  const handleSubmit = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }
    const pastNow =
      isSelectedToday && timeToMinutes(selectedTime) <= nowMinutes;
    if (bookedTimes.includes(selectedTime) || pastNow) {
      toast.error(
        pastNow
          ? "This time has already passed, please choose another"
          : "This slot is already booked, please choose another",
      );
      setSelectedTime(null);
      return;
    }
    onSubmit &&
      onSubmit({ date: selectedDate, time: selectedTime, durationMinutes });
  };

  const handleBackdropClick = (e) => {
    e.stopPropagation();
  };

  const cells = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-[440px] rounded-[24px] shadow-2xl relative overflow-hidden animate-scale-up border border-gray-100 flex flex-col max-h-[92vh]"
      >
        <div className="bg-[#0b0c0e] px-6 py-5 relative flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-black tracking-tight uppercase">
              Choose Your Slot
            </h2>
            <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-1 flex items-center gap-1.5">
              <Clock size={11} />
              {consultationType === "video"
                ? "Video Call"
                : "Voice Call"} • {durationMinutes} Min Session
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
              aria-label="Close popup"
            >
              <X size={15} className="text-white" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto p-5 flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <button
                onClick={goPrevMonth}
                disabled={!canGoPrevMonth}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  canGoPrevMonth
                    ? "hover:bg-gray-100 text-gray-700 cursor-pointer"
                    : "text-gray-200 cursor-not-allowed"
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-black text-gray-900 text-base tracking-tight">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                onClick={goNextMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center">
              {WEEKDAYS.map((w, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-black uppercase ${i === 6 ? "text-gray-300" : "text-gray-300"}`}
                >
                  {w}
                </span>
              ))}

              {cells.map((day, idx) => {
                if (day === null) return <span key={idx} />;
                const cellDate = new Date(viewYear, viewMonth, day);
                cellDate.setHours(0, 0, 0, 0);
                const sunday = isSunday(viewYear, viewMonth, day);
                const isPast = cellDate < today;
                const isDisabled = isPast || sunday;
                const isSelected = isSameDate(cellDate, selectedDate);
                const isToday = isSameDate(cellDate, today);

                return (
                  <button
                    key={idx}
                    disabled={isDisabled}
                    title={sunday ? "Closed on Sundays" : undefined}
                    onClick={() => handleDayClick(day)}
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all
                      ${isDisabled ? "text-gray-700" : "cursor-pointer"}
                      ${sunday && !isPast ? " " : ""}
                      ${
                        isSelected
                          ? "bg-primary text-white shadow-md scale-105"
                          : isDisabled
                            ? ""
                            : "bg-gray-200 text-gray-700 hover:bg-gray-500"
                      }
                      ${isToday && !isSelected ? "ring-2 ring-primary" : ""}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                Morning: 10:30 AM – 1:30 PM
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                Evening: 4:30 PM – 8:00 PM
              </span>
            </div>
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wide mt-1 text-center">
              Closed on Sundays
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black tracking-widest text-[#a0a5b5] uppercase">
                {selectedDate
                  ? formatSelectedDate(selectedDate)
                  : "Select a date first"}
              </span>
              {selectedDate && !isLoadingSlots && (
                <span className="text-[9px] font-bold text-gray-400 uppercase">
                  {
                    timeSlots.filter(
                      (s) =>
                        !bookedTimes.includes(s) &&
                        !(isSelectedToday && timeToMinutes(s) <= nowMinutes),
                    ).length
                  }{" "}
                  of {timeSlots.length} available
                </span>
              )}
            </div>

            {!selectedDate ? (
              <div className="py-8 flex items-center justify-center text-gray-300 text-xs font-bold bg-[#fafafc] rounded-2xl">
                Pick a date above to see available times
              </div>
            ) : isLoadingSlots ? (
              <div className="py-8 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold bg-[#fafafc] rounded-2xl">
                <Loader2 size={14} className="animate-spin" />
                Checking availability...
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 max-h-[180px] overflow-y-auto ">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot;
                  const isPastTime =
                    isSelectedToday && timeToMinutes(slot) <= nowMinutes;
                  const isBooked = bookedTimes.includes(slot) || isPastTime;
                  return (
                    <button
                      key={slot}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(slot)}
                      title={isBooked ? "Already booked" : undefined}
                      className={`py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all border-2 relative
                        ${
                          isBooked
                            ? "bg-gray-50 border-transparent text-gray-300 cursor-not-allowed line-through"
                            : isSelected
                              ? "bg-primary border-primary text-white cursor-pointer"
                              : "bg-[var(--ef3a96-9)] border-transparent text-primary hover:bg-gray-300 cursor-pointer"
                        }`}
                    >
                      {to12Hour(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedDate && selectedTime && (
            <div className="flex items-center gap-2.5 bg-[var(--ef3a96-9)] border border-primary rounded-2xl px-4 py-3">
              <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
              <span className="text-xs font-bold text-primary">
                {formatSelectedDate(selectedDate)} at {to12Hour(selectedTime)} (
                {durationMinutes} min)
              </span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting || !selectedDate || !selectedTime || isLoadingSlots
            }
            className="w-full bg-black hover:bg-neutral-900 text-white font-extrabold tracking-widest py-4 rounded-[20px] uppercase text-xs md:text-sm shadow-lg shadow-black/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                SAVING...
              </>
            ) : (
              "CONFIRM SLOT"
            )}
          </button>

          <span className="text-[9px] text-gray-400 font-black tracking-widest text-center uppercase -mt-2">
            Select date & time, then confirm
          </span>
        </div>
      </div>
    </div>
  );
}
