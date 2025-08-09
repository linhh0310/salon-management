const db = require('./config/db');

async function addTestAppointments() {
  try {
    console.log('🔄 Bắt đầu thêm lịch hẹn test...');
    
    // Sử dụng user ID 5 (user đang đăng nhập)
    const userId = 5;
    console.log('👤 User ID:', userId);

    // Thêm lịch hẹn test
    const testAppointments = [
      {
        user_id: userId,
        service_id: 1,
        stylist_id: 1,
        appointment_date: '2025-08-09',
        appointment_time: '17:00:00',
        notes: 'Gội dưỡng sinh thư giãn',
        status: 'cancelled'
      },
      {
        user_id: userId,
        service_id: 2,
        stylist_id: 1,
        appointment_date: '2025-08-09',
        appointment_time: '13:30:00',
        notes: 'Lấy ráy tai êm',
        status: 'cancelled'
      },
      {
        user_id: userId,
        service_id: 3,
        stylist_id: 2,
        appointment_date: '2025-08-08',
        appointment_time: '18:00:00',
        notes: 'Cắt tóc',
        status: 'cancelled'
      },
      {
        user_id: userId,
        service_id: 2,
        stylist_id: 1,
        appointment_date: '2025-08-08',
        appointment_time: '15:00:00',
        notes: 'Lấy ráy tai êm',
        status: 'cancelled'
      },
      {
        user_id: userId,
        service_id: 3,
        stylist_id: 2,
        appointment_date: '2025-08-07',
        appointment_time: '17:30:00',
        notes: 'Cắt tóc',
        status: 'confirmed'
      }
    ];

    for (const appointmentData of testAppointments) {
      const [result] = await db.execute(`
        INSERT INTO appointments (user_id, service_id, stylist_id, appointment_date, appointment_time, notes, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        appointmentData.user_id,
        appointmentData.service_id,
        appointmentData.stylist_id,
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        appointmentData.notes,
        appointmentData.status
      ]);
      
      const appointmentId = result.insertId;
      console.log('✅ Đã tạo lịch hẹn #' + appointmentId);
    }

    console.log('🎉 Hoàn thành thêm lịch hẹn test!');
    console.log('📊 Tổng cộng đã thêm ' + testAppointments.length + ' lịch hẹn');
    
  } catch (error) {
    console.error('❌ Lỗi khi thêm lịch hẹn test:', error);
  } finally {
    process.exit(0);
  }
}

addTestAppointments();

