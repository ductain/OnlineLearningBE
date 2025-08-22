const studentService = require("../services/studentService");

exports.register = async (req, res) => {
  try {
    const { username, password, name } = req.body;

    // Validate required fields
    if (!username || !password || !name) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Call the service to handle registration
    const result = await studentService.register({
      username,
      password,
      name,
    });

    // Respond with success
    res.status(201).json(result);
  } catch (err) {
    // Handle errors returned by the service
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    console.error("Error during registration:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: "Cần Username và password." });
    }

    // Call the service to handle login
    const { user, token } = await studentService.login(username, password);

    // Respond with the JWT token
    res.status(201).json({ user, token, message: "Đăng nhập thành công!" });
  } catch (err) {
    // Handle errors returned by the service
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
