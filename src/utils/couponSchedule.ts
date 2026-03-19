/**
 * Utility functions for validating coupon recurring schedules
 */

export interface CouponSchedule {
  valid_days?: string[] | null;
  valid_time_start?: string | null;
  valid_time_end?: string | null;
}

/**
 * Check if a coupon is currently valid based on its recurring schedule
 * Returns true if:
 * - No schedule is set (always valid)
 * - Current day and time fall within the schedule
 */
export const isCouponScheduleValid = (schedule: CouponSchedule): { valid: boolean; message?: string } => {
  // If no schedule is set, coupon is always valid
  if (!schedule.valid_days || schedule.valid_days.length === 0) {
    return { valid: true };
  }

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check if today is in the valid days
  if (!schedule.valid_days.includes(currentDay)) {
    const nextDay = getNextValidDay(schedule.valid_days, currentDay);
    return { 
      valid: false, 
      message: `This coupon is only available on ${schedule.valid_days.join(', ')}. Next available: ${nextDay}`
    };
  }

  // If time range is set, check if current time is within range
  if (schedule.valid_time_start && schedule.valid_time_end) {
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    if (currentTime < schedule.valid_time_start || currentTime > schedule.valid_time_end) {
      return {
        valid: false,
        message: `This coupon is only available between ${formatTime(schedule.valid_time_start)} and ${formatTime(schedule.valid_time_end)}`
      };
    }
  }

  return { valid: true };
};

/**
 * Get the next valid day for a coupon
 */
const getNextValidDay = (validDays: string[], currentDay: string): string => {
  const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentIndex = daysOrder.indexOf(currentDay);
  
  // Find the next valid day in order
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (currentIndex + i) % 7;
    const nextDay = daysOrder[nextIndex];
    if (validDays.includes(nextDay)) {
      return i === 1 ? 'tomorrow' : nextDay;
    }
  }
  
  return validDays[0]; // Fallback to first valid day
};

/**
 * Format time string for display (convert 24h to 12h format)
 */
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Get a human-readable description of the coupon schedule
 */
export const getScheduleDescription = (schedule: CouponSchedule): string | null => {
  if (!schedule.valid_days || schedule.valid_days.length === 0) {
    return null;
  }

  let description = `Available ${schedule.valid_days.join(', ')}`;
  
  if (schedule.valid_time_start && schedule.valid_time_end) {
    description += ` from ${formatTime(schedule.valid_time_start)} to ${formatTime(schedule.valid_time_end)}`;
  }
  
  return description;
};
