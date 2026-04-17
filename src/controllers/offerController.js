// const Offer = require("../models/Offer");

// const createOffer = async (req, res) => {
//   try {
//     const offer = new Offer(req.body);
//     await offer.save();
//     res.json({ success: true, data: offer });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// };

// const getOffers = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = "", status } = req.query;
//     const skip = (Number(page) - 1) * Number(limit);

//     const query = {};
//     if (search) query.name = { $regex: search, $options: "i" };
//     if (status) query.status = status;

//     const [offers, total] = await Promise.all([
//       Offer.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
//       Offer.countDocuments(query),
//     ]);

//     res.json({ success: true, data: { offers, total } });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// };

// const getOfferById = async (req, res) => {
//   try {
//     const offer = await Offer.findById(req.params.id);
//     if (!offer) return res.json({ success: false, message: "Offer not found" });
//     res.json({ success: true, data: offer });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// };

// const updateOffer = async (req, res) => {
//   try {
//     const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     res.json({ success: true, data: offer });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// };

// const deleteOffer = async (req, res) => {
//   try {
//     await Offer.findByIdAndDelete(req.params.id);
//     res.json({ success: true });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// };

// const bulkDeleteOffers = async (req, res) => {
//   try {
//     const { ids } = req.body;
//     await Offer.deleteMany({ _id: { $in: ids } });
//     res.json({ success: true });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// };

// const updateOfferStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const offer = await Offer.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );
//     res.json({ success: true, data: offer });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// };

// module.exports = {
//   createOffer,
//   getOffers,
//   getOfferById,
//   updateOffer,
//   deleteOffer,
//   bulkDeleteOffers,
//   updateOfferStatus,
// };