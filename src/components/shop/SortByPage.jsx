// SortByPage.jsx
import React from 'react';

import CloseIcon from '../icons/CloseIcon';

import { FaRegStar } from "react-icons/fa"; 
import PopularityIcon from '../icons/PopularityIcon'; 
import RatingIcon from '../icons/Rating';
import PriceIcon from '../icons/PriceIcon';
import PriceHigh from '../icons/PriceHigh';
import DiscountIcon from '../icons/DiscountIcon';

const LatestIcon = FaRegStar;


const SortByPage = ({ isOpen, onClose, selectedSort, onSelectSort }) => {
    if (!isOpen) return null;

    const sortOptions = [
        { label: 'Popularity', value: 'popularity', icon: PopularityIcon },
        { label: 'Latest', value: 'latest', icon: LatestIcon  },
        { label: 'Average Rating', value: 'rating', icon: RatingIcon },
        { label: 'Price Low to High', value: 'price_asc', icon: PriceIcon },
        { label: 'Price High to Low', value: 'price_desc', icon: PriceHigh },
        { label: 'Discounts', value: 'discounts', icon: DiscountIcon },
    ];


    return (
  
        <div 
            className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-500 
                ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
                bg-black/60 overflow-y-hidden scrollbar-none`}
        >

            <div 
                className={`w-full  flex flex-col items-center justify-center transform transition-transform duration-1000 ease-in-out`}
                
     style={{
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                  
                    transition: 'transform 500ms ease-in-out' 
                }}
                onClick={(e) => e.stopPropagation()} 
            >
                
              
                <button
                onClick={onClose}
                aria-label="Close sort options"
                className="flex items-center justify-center w-[20px] h-[20px] mb-4 rounded-full border-[1.5px] border-white text-gray-700  transition duration-150"
                >
                <CloseIcon width={8} height={8} />
                </button>


                {/* 2. Bottom Sheet Content  */}
                <div 
                    className="w-full bg-white rounded-t-[15px]  py-[20px] overflow-hidden"
                >
                    
                    {/* Header (માત્ર Title) */}
                    <div className="px-[20px]">
                        <div className="flex justify-start items-center items-end pb-[15px] border-b border-gray-300">
                            <h2 className="text-[20px] font-roboto font-medium text-gray-900">Sort By</h2>
                        </div>
                    </div>

                    {/* Sort Options List (Scrollable if content is long) */}
                    <div className="mt-2 space-y-1 max-h-[70vh] overflow-y-auto">
                        {sortOptions.map((option) => {
                            const isSelected = selectedSort === option.value;
                            
                            const iconColor =  'rgba(0,0,0,0.7)';
                           
                            const bgColor = isSelected ? 'bg-pink-50' : 'hover:bg-gray-50';
                            const textColor =  'text-black/70';

                            return (
                                <div
                                    key={option.value}
                                    // bg-ef3a96-9 ક્લાસને સુધારીને tailwind નો માન્ય bg-pink-50 ક્લાસનો ઉપયોગ કર્યો
                                    className={`flex items-center justify-between py-3 px-[20px] cursor-pointer transition duration-200 ${bgColor}`} 
                                    onClick={() => onSelectSort(option.value, option.label)} 
                                >
                                    <div className="flex items-center gap-[12px]">
                                        {/* આઇકન કમ્પોનન્ટનો ઉપયોગ */}
                                        <option.icon className="h-5 w-5" style={{ color: iconColor }} />

                                        <span className={`text-[14px] font-sans font-[400] leading-[19px] ${textColor}`}>
                                            {option.label}
                                        </span>
                                    </div>
                                    
                                    {/* Radio Button (Pink checked style) */}
                                    <div className={`h-[15px] w-[15px] rounded-full border-[1px] flex items-center justify-center 
                                        ${isSelected ? 'border-[#EF3A96]' : 'border-gray-300'}`}
                                    >
                                        {isSelected && (
                                            // bg-color ક્લાસને સુધારીને #EF3A96 નો ઉપયોગ કર્યો
                                            <div className="h-[9px] w-[9px] rounded-full bg-[#EF3A96]"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Safe Area for bottom of phone */}
                    <div className="flex justify-center py-[5px]">
                        <div 
                            style={{ width: '135px', height: '5px' }} 
                            className="bg-black rounded-full"
                        >
                           </div> 
                        </div>
                      
                    
                </div>
            </div>
        </div>
    );
};

export default SortByPage;