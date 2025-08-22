const purchaseService = require('../services/purchaseService');

exports.createPurchase = async (req, res) => {
  try {
    const { packageId } = req.body;
    const studentId = req.user?.id;

    const purchase = await purchaseService.createPurchase({ studentId, packageId });
    res.status(201).json({ message: 'Mua gói học thành công', purchase });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error creating purchase:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

