const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/pool");

const SECRET_KEY = process.env.JWT_SECRET;

exports.register = async (userData) => {
  const { username, password, name } = userData;

  const checkQuery = `
      SELECT * FROM students 
      WHERE username = $1
    `;
  const existingUser = await pool.query(checkQuery, [username]);
  if (existingUser.rows.length > 0) {
    const error = new Error("Username đã tồn tại.");
    error.statusCode = 404;
    throw error;
  }

  // Validate password length
  if (password.length < 6) {
    const error = new Error("Password phải có ít nhất 6 ký tự.");
    error.statusCode = 400;
    throw error;
  }

  // Encrypt the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the new user into the database
  const insertQuery = `
      INSERT INTO students 
      (username, password, name)
      VALUES ($1, $2, $3)
    `;
  await pool.query(insertQuery, [username, hashedPassword, name]);

  // Return success message and user ID
  return {
    message: "Đăng ký thành công!",
  };
};

exports.login = async (username, password) => {
  // Query the database for the user by username or phone
  const userQuery = `SELECT * FROM students WHERE username = $1`;
  const result = await pool.query(userQuery, [username]);

  if (result.rows.length === 0) {
    const error = new Error("Sai username hoặc password.");
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  // Verify the password
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    const error = new Error("Sai username hoặc password.");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign({ id: user.id }, SECRET_KEY);

  const { id, password: userPassword, ...userInfo } = user;

  return {
    user: { ...userInfo },
    token,
  };
};
