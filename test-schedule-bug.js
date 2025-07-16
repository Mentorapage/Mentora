// Test script to verify the schedule display bug
import { MOCK_TUTORS } from './mock-tutors.js';

// Copy the buggy function from script.js
function generateRedesignedScheduleTable(availability) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
  
  // Convert availability array to schedule format
  const schedule = {};
  days.forEach((day, dayIndex) => {
    schedule[day] = {};
    times.forEach((time, timeIndex) => {
      const slotIndex = (dayIndex * times.length + timeIndex) % 30; // BUG: modulo 30!
      schedule[day][time] = availability.includes(slotIndex + 1);
    });
  });

  return schedule;
}

// Fixed function
function generateRedesignedScheduleTableFixed(availability) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
  
  // Convert availability array to schedule format
  const schedule = {};
  days.forEach((day, dayIndex) => {
    schedule[day] = {};
    times.forEach((time, timeIndex) => {
      const slotIndex = dayIndex * times.length + timeIndex + 1; // FIXED: correct calculation
      schedule[day][time] = availability.includes(slotIndex);
    });
  });

  return schedule;
}

// Frontend generateAvailability function (copied from script.js)
function generateAvailability(tutorAvailableTime) {
  if (!tutorAvailableTime || tutorAvailableTime.length === 0) {
    return []; // No availability
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
  
  let timeRange = null;
  let availableDays = [];
  
  // Parse availability entries to extract time range and day patterns
  tutorAvailableTime.forEach(timeEntry => {
    if (timeEntry.includes('–')) {
      // Format: "16:00–19:00" or similar
      const [startTime, endTime] = timeEntry.split('–');
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      timeRange = { start: startHour, end: endHour };
    } else {
      // Format: "Weekdays", "Weekends", "Daily", or "Mon-Wed-Fri"
      const dayPattern = timeEntry.toLowerCase();
      
      if (dayPattern === 'daily') {
        availableDays = [0, 1, 2, 3, 4, 5, 6]; // All days (Monday=0, Sunday=6)
      } else if (dayPattern === 'weekdays') {
        availableDays = [0, 1, 2, 3, 4]; // Monday to Friday
      } else if (dayPattern === 'weekends') {
        availableDays = [5, 6]; // Saturday and Sunday
      } else if (dayPattern.includes('-')) {
        // Parse patterns like "Mon-Wed-Fri" or "Tue-Thu-Sat"
        const dayAbbrevs = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const patternDays = dayPattern.split('-');
        patternDays.forEach(dayAbbrev => {
          const dayIndex = dayAbbrevs.indexOf(dayAbbrev.trim());
          if (dayIndex !== -1 && !availableDays.includes(dayIndex)) {
            availableDays.push(dayIndex);
          }
        });
      }
    }
  });
  
  // Generate availability slots only for the intersection of time range and available days
  const availableSlots = [];
  
  if (timeRange && availableDays.length > 0) {
    // Generate slots only for available days and times
    availableDays.forEach(dayIndex => {
      times.forEach((time, timeIndex) => {
        const hour = parseInt(time.split(':')[0]);
        if (hour >= timeRange.start && hour < timeRange.end) {
          const slotIndex = dayIndex * times.length + timeIndex + 1;
          availableSlots.push(slotIndex);
        }
      });
    });
  } else if (availableDays.length > 0) {
    // Only day pattern specified, use all time slots for those days
    availableDays.forEach(dayIndex => {
      times.forEach((time, timeIndex) => {
        const slotIndex = dayIndex * times.length + timeIndex + 1;
        availableSlots.push(slotIndex);
      });
    });
  } else if (timeRange) {
    // Only time range specified, apply to all days
    days.forEach((day, dayIndex) => {
      times.forEach((time, timeIndex) => {
        const hour = parseInt(time.split(':')[0]);
        if (hour >= timeRange.start && hour < timeRange.end) {
          const slotIndex = dayIndex * times.length + timeIndex + 1;
          availableSlots.push(slotIndex);
        }
      });
    });
  }

  return [...new Set(availableSlots)].sort((a, b) => a - b); // Remove duplicates and sort
}

console.log('🔍 TESTING SCHEDULE DISPLAY BUG');
console.log('='.repeat(50));

// Test Dr. Elena Volkov
const elena = MOCK_TUTORS.find(t => t.name === 'Dr. Elena Volkov');
console.log('📊 Dr. Elena Volkov:');
console.log(`   Raw availability: ${JSON.stringify(elena.availableTime)}`);

const elenaAvailability = generateAvailability(elena.availableTime);
console.log(`   Frontend availability slots: ${elenaAvailability.join(', ')}`);

console.log('\n🐛 BUGGY SCHEDULE (with modulo 30):');
const buggySchedule = generateRedesignedScheduleTable(elenaAvailability);
console.log('   Sunday availability:');
['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].forEach(time => {
  console.log(`     ${time}: ${buggySchedule['Sun'][time] ? '✅' : '❌'}`);
});

console.log('\n✅ FIXED SCHEDULE (correct calculation):');
const fixedSchedule = generateRedesignedScheduleTableFixed(elenaAvailability);
console.log('   Sunday availability:');
['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].forEach(time => {
  console.log(`     ${time}: ${fixedSchedule['Sun'][time] ? '✅' : '❌'}`);
});

console.log('\n🔍 SLOT INDEX ANALYSIS:');
console.log('   Day 6 (Sunday) slot indices:');
['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].forEach((time, timeIndex) => {
  const correctSlot = 6 * 8 + timeIndex + 1; // 49, 50, 51, 52, 53, 54, 55, 56
  const buggySlot = (6 * 8 + timeIndex) % 30 + 1; // 19, 20, 21, 22, 23, 24, 25, 26
  console.log(`     ${time}: Correct=${correctSlot}, Buggy=${buggySlot}, Available=${elenaAvailability.includes(correctSlot) ? 'Yes' : 'No'}`);
});

console.log('\n🎯 CONCLUSION:');
console.log('   The bug is in the modulo 30 operation which incorrectly maps Sunday slots!'); 