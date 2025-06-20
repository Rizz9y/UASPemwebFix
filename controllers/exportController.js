const ExcelJS = require("exceljs");
const path = require("path");
const {
  Product,
  StockTransaction,
  Category,
  Supplier,
  User,
} = require("../models/mysql");

const exportProductsToExcel = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: "category", attributes: ["name"] },
        { model: Supplier, as: "supplier", attributes: ["name"] },
      ],
      order: [["name", "ASC"]],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Daftar Produk");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nama Produk", key: "name", width: 30 },
      { header: "Kode", key: "code", width: 15 },
      { header: "Deskripsi", key: "description", width: 40 },
      {
        header: "Harga",
        key: "price",
        width: 15,
        style: { numFmt: '"Rp"#,##0.00' },
      },
      { header: "Stok Saat Ini", key: "currentStock", width: 15 },
      { header: "Warna", key: "color", width: 20 },
      { header: "Kategori", key: "categoryName", width: 20 },
      { header: "Supplier", key: "supplierName", width: 20 },
      { header: "URL Gambar", key: "imageUrl", width: 50 },
      {
        header: "Dibuat Pada",
        key: "createdAt",
        width: 20,
        style: { numFmt: "yyyy-mm-dd hh:mm:ss" },
      },
      {
        header: "Diperbarui Pada",
        key: "updatedAt",
        width: 20,
        style: { numFmt: "yyyy-mm-dd hh:mm:ss" },
      },
    ];

    products.forEach((product) => {
      worksheet.addRow({
        id: product.id,
        name: product.name,
        code: product.code,
        description: product.description,
        price: parseFloat(product.price),
        currentStock: product.currentStock,
        color: product.color,
        categoryName: product.category ? product.category.name : "N/A",
        supplierName: product.supplier ? product.supplier.name : "N/A",
        imageUrl: product.imageUrl
          ? `${req.protocol}://${req.get("host")}${product.imageUrl}`
          : "",
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "daftar_produk.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting products:", error);
    next(error);
  }
};

const exportStockTransactionsToExcel = async (req, res, next) => {
  try {
    const transactions = await StockTransaction.findAll({
      include: [
        { model: Product, as: "product", attributes: ["name", "code"] },
        { model: User, as: "user", attributes: ["username"] },
      ],
      order: [["transactionDate", "DESC"]],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Riwayat Stok");

    worksheet.columns = [
      { header: "ID Transaksi", key: "id", width: 12 },
      {
        header: "Tanggal",
        key: "transactionDate",
        width: 22,
        style: { numFmt: "yyyy-mm-dd hh:mm:ss" },
      },
      { header: "Produk", key: "productName", width: 30 },
      { header: "Kode Produk", key: "productCode", width: 15 },
      { header: "Tipe", key: "type", width: 10 },
      { header: "Kuantitas", key: "quantity", width: 12 },
      { header: "Varian Digunakan", key: "variantUsed", width: 25 }, // Meskipun di frontend dihapus, di DB masih ada kolom ini
      { header: "Sumber/Tujuan", key: "sourceDestination", width: 30 },
      { header: "Catatan", key: "notes", width: 40 },
      { header: "Dicatat Oleh", key: "recordedBy", width: 20 },
    ];

    transactions.forEach((t) => {
      worksheet.addRow({
        id: t.id,
        transactionDate: t.transactionDate,
        productName: t.product ? t.product.name : "N/A",
        productCode: t.product ? t.product.code : "N/A",
        type: t.type,
        quantity: t.quantity,
        variantUsed: t.variantUsed,
        sourceDestination: t.sourceDestination,
        notes: t.notes,
        recordedBy: t.user ? t.user.username : "N/A",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "riwayat_stok.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting stock transactions:", error);
    next(error);
  }
};

module.exports = {
  exportProductsToExcel,
  exportStockTransactionsToExcel,
};
