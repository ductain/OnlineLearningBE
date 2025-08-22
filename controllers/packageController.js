const packageService = require('../services/packageService');

exports.getPackages = async (req, res) => {
  try {
    const { teacherId } = req.query;
    const packages = await packageService.getPackages(teacherId);
    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await packageService.getPackageById(id);
    res.json(pkg);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error fetching package:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

