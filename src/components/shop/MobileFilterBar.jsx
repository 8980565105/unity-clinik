
import OriginalSortByIcon from "../icons/SortByIcon";
import { ChevronDown} from 'lucide-react';
import FilterIconComponent from "../icons/filter"; 
const SortByIcon = (props) => (<OriginalSortByIcon {...props} className="h-4 w-4 md:text-gray-500" />);
const CustomChevronDown = (props) => ( <ChevronDown {...props} />);
const Filter = (props) => (<FilterIconComponent {...props} />);
const MobileFilterBar = ({ sortBy, filterCount, onSortClick, onFilterClick ,isHidden }) => (
    <div className="flex flex-wrap items-center w-full  gap-4 sm:gap-2  ${isHidden  ? 'hidden' : 'flex'}`}">
        <div className="rounded-[10px] cursor-pointer transition duration-300 border border-[#989696] drop-shadow-[0_0_4px_rgba(0,0,0,0.1)] bg-white w-[140px] sm:w-[180px] md:w-[200px] "
            onClick={onSortClick}
        >
            <div className="flex items-center justify-between py-2 px-3 sm:py-3 sm:px-4">
                <div>
                    <div className="text-base sm:text-lg font-inter font-semibold text-black/70">Sort By</div>
                    <div className="text-xs sm:text-sm font-inter font-medium mt-0.5 text-[#989696]">{sortBy}</div>
                </div>
                <SortByIcon className="h-5 w-5 sm:h-6 sm:w-6 text-black/70" />
            </div>
        </div>
        <div className={`bg-color rounded-[10px] shadow-lg cursor-pointer transition duration-300 hover:shadow-xl text-white w-[140px] sm:w-[180px] md:w-[200px]`}
            onClick={onFilterClick}
        >
            <div className="flex items-center justify-between py-2 px-3 sm:py-3 sm:px-4">
                <div>
                    <div className="text-base sm:text-lg font-inter font-semibold">Filter</div>
                    <div className="flex items-center mt-0.5">
                        <span className="text-xs sm:text-sm font-inter font-medium">Applied</span>
                        <span className="ml-2 px-2 py-0.5 bg-white text-black/70 font-semibold rounded-full text-xs">
                            {filterCount}
                        </span>
                    </div>
                </div>
                <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
        </div>
    </div>
);

export default MobileFilterBar;