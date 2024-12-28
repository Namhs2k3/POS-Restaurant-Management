import express from "express";
import {
  addProductToCart,
  createTable,
  deleteTable,
  getTableById,
  getTables,
  updateTable,
} from "../controllers/table.controller.js";

const router = express.Router();

router.get("/", getTables);
router.get("/:id", getTableById);
router.post("/", createTable);
router.put("/:id/addProduct", addProductToCart);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

export default router;
