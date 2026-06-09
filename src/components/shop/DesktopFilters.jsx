import React, { useEffect, useState } from "react";
import {
  CollapsibleFilter,
  FilterItemCheckbox,
  PriceRangeFilter,
} from "./WomenCollections";
import { fetchCategories } from "../../features/categories/categoriesThunk";
import { fetchsubCategories } from "../../features/subcategories/subcategoriesThunk";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "../../features/brands/brandsThunk";
import { fetchtypes } from "../../features/types/typeThunk";
import { fetchDiscounts } from "../../features/discounts/discountsThunk";
import { fetchProductLabels } from "../../features/productLabels/productlabelsThunk";
const DesktopFilters = ({
  selectedCategories = [],
  handleCategoryChange,
  handleResetCategories,
  selectedBrands = [],
  handleBrandChange,
  handleResetBrands,
  selectedTypes = [],
  handleTypeChange,
  handleResetTypes,
  // selectedDiscounts = [],
  // handleDiscountChange,
  // handleResetDiscounts,
  selectedLabels = [],
  handleLabelChange,
  handleResetLabels,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  isCategorySelected,
}) => {
  const dispatch = useDispatch();
  const [openFilter, setOpenFilter] = useState("Category");
  const toggleFilter = (filterId) => {
    setOpenFilter((prev) => (prev === filterId ? null : filterId));
  };
  const { items: subcategories = [], loading: subcatLoading } = useSelector(
    (state) => state.subcategories,
  );
  const {
    products = [],
    loading,
    error,
  } = useSelector((state) => state.products);
  const { brands = [], loading: brandLoading } = useSelector(
    (state) => state.brands,
  );
  const { types = [], loading: typesLoading } = useSelector(
    (state) => state.types,
  );
  // const { discounts = [], loading: discountsLoading } = useSelector(
  //   (state) => state.discounts,
  // );
  const { productLabels = [], loading: labelsLoading } = useSelector(
    (state) => state.productLabels,
  );
  useEffect(() => {
    dispatch(fetchBrands({ status: "active" }));
    dispatch(fetchtypes({ status: "active" }));
    // dispatch(fetchDiscounts({ status: "active" }));
    dispatch(fetchProductLabels({ status: "active" }));
  }, [dispatch]);

  const subCategoryCountsById = {};

  products?.forEach((product) => {
    if (Array.isArray(product.category_id)) {
      product.category_id.forEach((cat) => {
        const catId = typeof cat === "object" ? cat._id : cat;

        if (catId) {
          subCategoryCountsById[catId] =
            (subCategoryCountsById[catId] || 0) + 1;
        }
      });
    } else if (product.category_id) {
      subCategoryCountsById[product.category_id] =
        (subCategoryCountsById[product.category_id] || 0) + 1;
    }
  });

  const brandCounts = Array.isArray(products)
    ? products.reduce((acc, product) => {
        const brandId = product.variants?.[0]?.brand?.[0]?._id;
        if (brandId) acc[brandId] = (acc[brandId] || 0) + 1;
        return acc;
      }, {})
    : {};

  const typeCounts = Array.isArray(products)
    ? products.reduce((acc, product) => {
        const typeId = product.variants?.[0]?.type?.[0]?._id;
        if (typeId) acc[typeId] = (acc[typeId] || 0) + 1;
        return acc;
      }, {})
    : {};

  // const discountCounts = Array.isArray(products)
  //   ? products.reduce((acc, product) => {
  //       const discountId = product.discount_id;
  //       if (discountId) acc[discountId] = (acc[discountId] || 0) + 1;
  //       return acc;
  //     }, {})
  //   : {};

  const labelCounts = Array.isArray(products)
    ? products.reduce((acc, product) => {
        const labelId = product.variants?.[0]?.labels?.[0];
        if (labelId) acc[labelId] = (acc[labelId] || 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <aside className="hidden lg:block lg:w-1/4 h-[100%] box-shadow px-4 py-5 rounded-[20px]">
      <div className="p-4">
        <h2 className="text-20px font-medium text-black lowercase">
          Filter Products
        </h2>
      </div>

      <CollapsibleFilter
        title="Category"
        defaultOpen={true}
        isOpen={openFilter === "Category"}
        onToggle={() => toggleFilter("Category")}
        isSelected={isCategorySelected}
        onReset={handleResetCategories}
        showButtons={true}
      >
        <div className="space-y-1 px-3 py-3 h-[200px] overflow-y-auto hide-scrollbar">
          {subcatLoading ? (
            <p className="text-sm text-gray-500">Loading subcategories...</p>
          ) : subcategories.length > 0 ? (
            subcategories
              .filter((cat) => cat.parent_id !== null)
              .map((cat) => (
                <FilterItemCheckbox
                  key={cat._id}
                  name={cat.name}
                  count={subCategoryCountsById[cat._id] || 0}
                  isChecked={selectedCategories.includes(cat._id)}
                  onChange={() => handleCategoryChange(cat._id)}
                />
              ))
          ) : (
            <p className="text-sm text-gray-500">No categories found.</p>
          )}
        </div>
      </CollapsibleFilter>

      <PriceRangeFilter
        title="Price"
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        isMobile={false}
        isOpen={openFilter === "Price"}
        onToggle={() => toggleFilter("Price")}
      />

      <CollapsibleFilter
        title="Brands"
        isOpen={openFilter === "Brands"}
        onToggle={() => toggleFilter("Brands")}
        z
        isSelected={selectedBrands.length > 0}
        onReset={handleResetBrands}
        showButtons={true}
      >
        <div className="space-y-1 overflow-y-auto px-3 py-3">
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
        onReset={handleResetTypes}
        showButtons={true}
      >
        <div className="space-y-1 overflow-y-auto px-3 py-3">
          {typesLoading ? (
            <p className="text-sm text-gray-500">Loading types...</p>
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
        onReset={handleResetDiscounts}
        showButtons={true}
      >
        <div className="space-y-1 overflow-y-auto px-3 py-3">
          {discountsLoading ? (
            <p className="text-sm text-gray-500">Loading discounts...</p>
          ) : discounts.length > 0 ? (
            discounts.map((discount) => (
              <FilterItemCheckbox
                key={discount._id}
                name={discount.name}
                count={discountCounts[discount._id] || 0}
                isChecked={selectedDiscounts.some((d) => d.id === discount._id)}
                onChange={() =>
                  handleDiscountChange(discount._id, discount.name)
                }
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
        onReset={handleResetLabels}
        showButtons={true}
      >
        <div className="space-y-1 overflow-y-auto px-3 py-3">
          {labelsLoading ? (
            <p className="text-sm text-gray-500">Loading labels...</p>
          ) : productLabels.length > 0 ? (
            productLabels.map((label) => (
              <FilterItemCheckbox
                key={label._id}
                name={label.name}
                count={labelCounts[label._id] || 0}
                isChecked={selectedLabels.some((l) => l.id === label._id)}
                onChange={() => handleLabelChange(label._id, label.name)}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No product labels found.</p>
          )}
        </div>
      </CollapsibleFilter>
    </aside>
  );
};

export default DesktopFilters;
