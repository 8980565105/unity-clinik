import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  CollapsibleFilter,
  FilterItemCheckbox,
  PriceRangeFilter,
} from "./WomenCollections";
import { fetchCategories } from "../../features/categories/categoriesThunk";
import { fetchsubCategories } from "../../features/subcategories/subcategoriesThunk";
import { fetchBrands } from "../../features/brands/brandsThunk";
import { fetchtypes } from "../../features/types/typeThunk";
import { fetchDiscounts } from "../../features/discounts/discountsThunk";
import { fetchProductLabels } from "../../features/productLabels/productlabelsThunk";
import { useDispatch, useSelector } from "react-redux";

const MobileFilterModal = ({
  isOpen,
  onClose,
  selectedCategories,
  handleCategoryChange,
  handleResetCategories,
  selectedBrands,
  handleBrandChange,
  handleResetBrands,
  selectedTypes,
  handleTypeChange,
  handleResetTypes,
  // selectedDiscounts,
  // handleDiscountChange,
  // handleResetDiscounts,
  selectedLabels,
  handleLabelChange,
  handleResetLabels,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}) => {
  const dispatch = useDispatch();
  const [openFilter, setOpenFilter] = useState("Category");
  const toggleFilter = (filterId) => {
    setOpenFilter((prev) => (prev === filterId ? null : filterId));
  };
  const { items: subcategories = [], loading: subcatLoading } = useSelector(
    (state) => state.subcategories,
  );
  const { products } = useSelector((state) => state.products);
  const { brands = [], loading: brandLoading } = useSelector(
    (state) => state.brands,
  );
  const { types = [], loading: typesLoading } = useSelector(
    (state) => state.types,
  );
  const { discounts = [], loading: discountsLoading } = useSelector(
    (state) => state.discounts,
  );
  const { productLabels = [], loading: labelsLoading } = useSelector(
    (state) => state.productLabels,
  );
  const subCategoryCountsById = Array.isArray(products)
    ? products.reduce((acc, product) => {
        const catId = product.category_id;
        if (catId) {
          acc[catId] = (acc[catId] || 0) + 1;
        }
        return acc;
      }, {})
    : {};

  const brandCounts = products.reduce((acc, product) => {
    const brandId = product.variants?.[0]?.brand?.[0]?._id;
    if (brandId) {
      acc[brandId] = (acc[brandId] || 0) + 1;
    }
    return acc;
  }, {});

  const typeCounts = products.reduce((acc, product) => {
    const typeId = product.variants?.[0]?.type?.[0]?._id;
    if (typeId) {
      acc[typeId] = (acc[typeId] || 0) + 1;
    }
    return acc;
  }, {});

  // const discountCounts = products.reduce((acc, product) => {
  //   const discountId = product.discount_id;
  //   if (discountId) {
  //     acc[discountId] = (acc[discountId] || 0) + 1;
  //   }
  //   return acc;
  // }, {});

  const labelCounts = products.reduce((acc, product) => {
    const labelId = product.variants?.[0]?.labels?.[0];
    if (labelId) {
      acc[labelId] = (acc[labelId] || 0) + 1;
    }
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity duration-300"
        onClick={onClose}
      ></div>
      <div
        className={`
              fixed top-0 left-0 z-50 bg-white lg:hidden overflow-y-auto w-4/5 h-full max-w-md
              transition-transform duration-500 ease-in-out
              ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
      >
        <div className="w-full h-full">
          <div className="sticky top-0 bg-white  px-2 py-4 flex justify-start items-center z-10">
            <button
              onClick={onClose}
              className="flex items-center space-x-1 p-1 font-inter text-base sm:text-lg font-semibold text-black/70 hover:text-black gap-3"
            >
              <X className="w-5 h-5 text-black" />
              CLOSE
            </button>
          </div>

          <div className=" space-y-4 py-[10px] ">
            <CollapsibleFilter
              title="Category"
              defaultOpen={true}
              isOpen={openFilter === "Category"}
              onToggle={() => toggleFilter("Category")}
              isSelected={selectedCategories.length > 0}
              showButtons={true}
              onCancelClick={handleResetCategories}
              onApplyClick={onClose}
            >
              <div className="space-y-1 h-[140px] overflow-y-auto hide-scrollbar">
                <div className=" px-3 py-3">
                  {subcatLoading ? (
                    <p className="text-sm text-gray-500">
                      Loading subcategories...
                    </p>
                  ) : subcategories.length > 0 ? (
                    subcategories.map((cat) => (
                      <FilterItemCheckbox
                        key={cat._id}
                        name={cat.name}
                        count={subCategoryCountsById[cat._id] || 0}
                        isChecked={selectedCategories.includes(cat.name)}
                        onChange={handleCategoryChange}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No categories found.
                    </p>
                  )}
                </div>
              </div>
            </CollapsibleFilter>

            <PriceRangeFilter
              isOpen={openFilter === "Price"}
              onToggle={() => toggleFilter("Price")}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              isMobile={false}
            />

            <CollapsibleFilter
              title="Brands"
              isOpen={openFilter === "Brands"}
              onToggle={() => toggleFilter("Brands")}
              isSelected={selectedBrands.length > 0}
              showButtons={true}
              onCancelClick={handleResetBrands}
              onApplyClick={onClose}
            >
              <div className=" px-3 py-3">
                {brandLoading ? (
                  <p className="text-sm text-gray-500">Loading brands...</p>
                ) : brands.length > 0 ? (
                  brands.map((brand) => (
                    <FilterItemCheckbox
                      key={brand._id}
                      name={brand.name}
                      count={brandCounts[brand._id] || 0}
                      isChecked={selectedBrands.includes(brand.name)}
                      onChange={handleBrandChange}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No brands found.</p>
                )}
              </div>
            </CollapsibleFilter>

            <CollapsibleFilter
              title="Type"
              isOpen={openFilter === "Type"}
              onToggle={() => toggleFilter("Type")}
              isSelected={selectedTypes.length > 0}
              showButtons={true}
              onCancelClick={handleResetTypes}
              onApplyClick={onClose}
            >
              <div className=" px-3 py-3">
                {typesLoading ? (
                  <p className="text-sm text-gray-500">Loading brands...</p>
                ) : types.length > 0 ? (
                  types.map((type) => (
                    <FilterItemCheckbox
                      key={type._id}
                      name={type.name}
                      count={typeCounts[type._id] || 0}
                      isChecked={selectedTypes.includes(type.name)}
                      onChange={handleTypeChange}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No types found.</p>
                )}
              </div>
            </CollapsibleFilter>

            {/* <CollapsibleFilter
              title="Discounts"
              isOpen={openFilter === "Discounts"}
              onToggle={() => toggleFilter("Discounts")}
              isSelected={selectedDiscounts.length > 0}
              showButtons={true}
              onCancelClick={handleResetDiscounts}
              onApplyClick={onClose}
            >
              <div className=" px-3 py-3">
                {discountsLoading ? (
                  <p className="text-sm text-gray-500">Loading brands...</p>
                ) : discounts.length > 0 ? (
                  discounts.map((discount) => (
                    <FilterItemCheckbox
                      key={discount._id}
                      name={discount.name}
                      count={discountCounts[discount._id] || 0}
                      isChecked={selectedDiscounts.includes(discount._id)}
                      onChange={() => handleDiscountChange(discount._id)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No discounts found.</p>
                )}
              </div>
            </CollapsibleFilter> */}

            <CollapsibleFilter
              title="Product Label"
              isOpen={openFilter === "Product Label"}
              onToggle={() => toggleFilter("Product Label")}
              isSelected={selectedLabels.length > 0}
              showButtons={true}
              onCancelClick={handleResetLabels}
              onApplyClick={onClose}
            >
              <div className=" px-3 py-3">
                {labelsLoading ? (
                  <p className="text-sm text-gray-500">Loading brands...</p>
                ) : productLabels.length > 0 ? (
                  productLabels.map((label) => (
                    <FilterItemCheckbox
                      key={label._id}
                      name={label.name}
                      count={labelCounts[label._id] || 0}
                      isChecked={selectedLabels.includes(label._id)}
                      onChange={() => handleLabelChange(label._id)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No product labels found.
                  </p>
                )}
              </div>
            </CollapsibleFilter>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFilterModal;
