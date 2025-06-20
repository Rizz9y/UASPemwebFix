// backend/hash_password.js
const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
  const hashedPassword = await bcrypt.hash(password, salt); // Hash the password
  console.log("Password Anda (plaintext):", password);
  console.log("Password Anda (dihash):", hashedPassword);
  process.exit(0); // Keluar dari proses setelah selesai
}

// Ganti 'admin123' dengan password plaintext yang ingin Anda gunakan untuk admin
// Contoh: 'StrongAdminP@ss123'
const myAdminPassword = "admin123";
hashPassword(myAdminPassword);
