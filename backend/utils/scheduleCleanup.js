import cron from 'node-cron';
import Doctor from '../models/doctorModel.js';

// Run daily at midnight to remove expired schedules
export const startScheduleCleanup = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = today.toISOString().split('T')[0];

      // Remove schedules where date is before today
      const result = await Doctor.updateMany(
        {},
        {
          $pull: {
            schedule: {
              date: { $lt: todayString }
            }
          }
        }
      );

      console.log(`🧹 Cleaned up expired schedules: ${result.modifiedCount} doctors updated`);
    } catch (error) {
      console.error('❌ Error cleaning up schedules:', error);
    }
  });

  console.log('✅ Schedule cleanup job started - runs daily at midnight');
};