import React, { useEffect, useState } from "react";
import {
  CollapsibleFilter,
  FilterItemCheckbox,
  PriceRangeFilter,
} from "./WomenCollections";
import { fetchCategories } from "../../features/categories/categoriesThunk";
import { fetchsubCategories } from "../../features/subcategories/subcategoriesThunk";
import { useDispatch, useSelector } from "react-redux";
import { fetchSizes } from "../../features/sizes/sizesThunk";
import { fetchColors } from "../../features/colors/colorsThunk";
import { fetchBrands } from "../../features/brands/brandsThunk";
import { fetchtypes } from "../../features/types/typeThunk";
import { fetchFabrics } from "../../features/fabrics/fabricsThunk";
import { fetchDiscounts } from "../../features/discounts/discountsThunk";
import { fetchProductLabels } from "../../features/productLabels/productlabelsThunk";
const DesktopFilters = ({
  selectedCategories = [],
  handleCategoryChange,
  handleResetCategories,
  selectedSizes = [],
  handleSizeChange,
  handleResetSizes,
  selectedColors = [],
  handleColorChange,
  handleResetColors,
  selectedBrands = [],
  handleBrandChange,
  handleResetBrands,
  selectedTypes = [],
  handleTypeChange,
  handleResetTypes,
  selectedFabrics = [],
  handleFabricChange,
  handleResetFabrics,
  selectedDiscounts = [],
  handleDiscountChange,
  handleResetDiscounts,
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
  const { sizes = [], loading: sizeLoading } = useSelector(
    (state) => state.sizes,
  );
  const { colors = [], loading: colorLoading } = useSelector(
    (state) => state.colors,
  );
  const { brands = [], loading: brandLoading } = useSelector(
    (state) => state.brands,
  );
  const { types = [], loading: typesLoading } = useSelector(
    (state) => state.types,
  );
  const { fabrics = [], loading: fabricsLoading } = useSelector(
    (state) => state.fabrics,
  );
  const { discounts = [], loading: discountsLoading } = useSelector(
    (state) => state.discounts,
  );
  const { productLabels = [], loading: labelsLoading } = useSelector(
    (state) => state.productLabels,
  );
  useEffect(() => {
    dispatch(fetchCategories({ status: "active" }));
    dispatch(fetchsubCategories({ status: "active" }));
    dispatch(fetchSizes({ status: "active" }));
    dispatch(fetchColors({ status: "active" }));
    dispatch(fetchBrands({ status: "active" }));
    dispatch(fetchtypes({ status: "active" }));
    dispatch(fetchFabrics({ status: "active" }));
    dispatch(fetchDiscounts({ status: "active" }));
    dispatch(fetchProductLabels({ status: "active" }));
  }, [dispatch]);
  const subCategoryCountsById = Array.isArray(products)
    ? products.reduce((acc, product) => {
        const catId = product.category_id;
        if (catId) {
          acc[catId] = (acc[catId] || 0) + 1;
        }
        return acc;
      }, {})
    : {};

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

  const fabricCounts = Array.isArray(products)
    ? products.reduce((acc, product) => {
        const fabricId = product.variants?.[0]?.fabric?.[0]?._id;
        if (fabricId) acc[fabricId] = (acc[fabricId] || 0) + 1;
        return acc;
      }, {})
    : {};

  const discountCounts = Array.isArray(products)
    ? products.reduce((acc, product) => {
        const discountId = product.discount_id;
        if (discountId) acc[discountId] = (acc[discountId] || 0) + 1;
        return acc;
      }, {})
    : {};

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
                  isChecked={selectedCategories.includes(cat.name)}
                  onChange={handleCategoryChange}
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
        title="Size"
        isOpen={openFilter === "Size"}
        onToggle={() => toggleFilter("Size")}
        isSelected={selectedSizes.length > 0}
        onReset={handleResetSizes}
        showButtons={true}
      >
        <div className="grid grid-cols-2 gap-2 px-3 py-3">
          {sizeLoading ? (
            <p className="text-sm text-gray-500">Loading sizes...</p>
          ) : sizes.length > 0 ? (
            sizes.map((size) => (
              <FilterItemCheckbox
                key={size._id}
                name={size.name}
                isChecked={selectedSizes.includes(size.name)}
                onChange={handleSizeChange}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No sizes found.</p>
          )}
        </div>
      </CollapsibleFilter>

      <CollapsibleFilter
        title="Color"
        isOpen={openFilter === "Color"}
        onToggle={() => toggleFilter("Color")}
        isSelected={selectedColors.length > 0}
        onReset={handleResetColors}
        showButtons={true}
      >
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-[15px] gap-x-[10px] px-3 py-3">
          {colorLoading ? (
            <p className="text-sm text-gray-500 col-span-full">
              Loading colors...
            </p>
          ) : Array.isArray(colors) && colors.length > 0 ? (
            colors.map((clr) => (
              <div
                key={clr._id || clr.name}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleColorChange(clr.name)}
              >
                <div
                  className={`w-[22px] h-[22px] rounded-full box-shadow ${
                    selectedColors.includes(clr.name)
                      ? "ring-2 ring-offset-1 ring-black"
                      : ""
                  } transition-transform duration-200`}
                  style={{ backgroundColor: clr.code }}
                ></div>
                <p className="text-[10px] sec-text-color mt-1 text-center">
                  {clr.name}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full">
              No colors found.
            </p>
          )}
        </div>
      </CollapsibleFilter>

      <CollapsibleFilter
        title="Brands"
        isOpen={openFilter === "Brands"}
        onToggle={() => toggleFilter("Brands")}
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

      <CollapsibleFilter
        title="Fabric"
        isOpen={openFilter === "Fabric"}
        onToggle={() => toggleFilter("Fabric")}
        isSelected={selectedFabrics.length > 0}
        onReset={handleResetFabrics}
        showButtons={true}
      >
        <div className="space-y-1 overflow-y-auto px-3 py-3">
          {fabricsLoading ? (
            <p className="text-sm text-gray-500">Loading fabrics...</p>
          ) : fabrics.length > 0 ? (
            fabrics.map((fabric) => (
              <FilterItemCheckbox
                key={fabric._id}
                name={fabric.name}
                count={fabricCounts[fabric._id] || 0}
                isChecked={selectedFabrics.includes(fabric.name)}
                onChange={handleFabricChange}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No fabrics found.</p>
          )}
        </div>
      </CollapsibleFilter>

      <CollapsibleFilter
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
      </CollapsibleFilter>
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
