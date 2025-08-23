const bookingService = require('../services/bookingService');

exports.createTrialBooking = async (req, res) => {
  try {
    const { teacherId, scheduleDate, scheduleTime } = req.body;
    const studentId = req.user?.id;

    const booking = await bookingService.createTrialBooking({
      studentId,
      teacherId,
      scheduleDate,
      scheduleTime,
    });

    res.status(201).json({ message: 'Đặt lịch học thử thành công', booking });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error creating trial booking:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getBookingsByStudentId = async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const bookings = await bookingService.getBookingsByStudentId(studentId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

