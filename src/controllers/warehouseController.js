const Warehouse = require("../models/Warehouse");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

// const getWarehouses = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = "", status, isDownload } = req.query;

//     const query = {};

//     if (search) {
//       query.name = { $regex: search, $options: "i" };
//     }
//     applyOwnershipFilter(req, query);

//     if (status && ["active", "inactive"].includes(status)) {
//       query.status = status;
//     }

//     if (isDownload === "true") {
//       const warehouses = await Warehouse.find(query).sort({ createdAt: -1 });
//       return sendResponse(
//         res,
//         true,
//         { warehouses, total: warehouses.length },
//         "Warehouses retrieved successfully",
//       );
//     }

//     const skip = (Number(page) - 1) * Number(limit);

//     const [warehouses, total] = await Promise.all([
//       Warehouse.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit)),
//       Warehouse.countDocuments(query),
//     ]);

//     sendResponse(
//       res,
//       true,
//       { warehouses, total },
//       "Warehouses retrieved successfully",
//     );
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

const getWarehouses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, isDownload } = req.query;

    let query = {};

    // જો સર્ચ હોય તો
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // મહત્વનું: જો યુઝર admin હોય તો બધો ડેટા બતાવવો,
    // જો store_owner હોય તો ફક્ત તેના સ્ટોરનો ડેટા[cite: 5, 6]
    if (req.user.role === "store_owner") {
      query.storeId = req.user.storeId;
    } else if (req.user.role !== "admin") {
      // અન્ય કોઈ રોલ માટે (જો લાગુ પડતું હોય)
      applyOwnershipFilter(req, query);
    }

    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    // ડાઉનલોડ લોજિક
    if (isDownload === "true") {
      const warehouses = await Warehouse.find(query).sort({ createdAt: -1 });
      return sendResponse(
        res,
        true,
        { warehouses, total: warehouses.length },
        "Success",
      );
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [warehouses, total] = await Promise.all([
      Warehouse.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Warehouse.countDocuments(query),
    ]);

    sendResponse(res, true, { warehouses, total }, "Success");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse)
      return sendResponse(res, false, null, "Warehouse not found");
    sendResponse(res, true, warehouse, "Warehouse retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// const createWarehouse = async (req, res) => {
//   try {
//     const { name, status } = req.body;
//     if (!name) return sendResponse(res, false, null, "name is required");
//     const warehouse = new Warehouse({
//       name,
//       status: status || "active",
//       createdBy: req.user.id,
//     });
//     await warehouse.save();
//     sendResponse(res, true, warehouse, "Warehouse created successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

const createWarehouse = async (req, res) => {
  try {
    const { name, status, storeId } = req.body;
    const warehouse = new Warehouse({
      name,
      status: status || "active",
      createdBy: req.user.id,
      storeId: req.user.role === "store_owner" ? req.user.storeId : storeId,
    });
    await warehouse.save();
    sendResponse(res, true, warehouse, "Created");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const { name, status } = req.body;
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { name, status },
      { new: true },
    );
    if (!warehouse) {
      return sendResponse(res, false, null, "Warehouse not found");
    }
    sendResponse(res, true, warehouse, "Warehouse updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateWarehouseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const warehouse = await Warehouse.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!warehouse) {
      return sendResponse(res, false, null, "Warehouse not found");
    }

    sendResponse(res, true, warehouse, "Warehouse status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse)
      return sendResponse(res, false, null, "Warehouse not found");
    sendResponse(res, true, null, "Warehouse deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteWarehouses = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");
    const result = await Warehouse.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Warehouses deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  bulkDeleteWarehouses,
  updateWarehouseStatus,
};
