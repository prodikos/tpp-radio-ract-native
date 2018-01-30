const DAY_NAMES = [
  "Κυριακή",
  "Δευτέρα",
  "Τρίτη",
  "Τετάρτη",
  "Πέμπτη",
  "Παρασκευή",
  "Σάββατο"
];

/**
 * Check if time is within bounds
 */
function timeInBounds(date, start, end) {
  const dateMin = date.getHours() * 60 + date.getMinutes();
  const startMin = start[0] * 60 + start[1];
  const endMin = end[0] * 60 + end[1];

  return dateMin >= startMin && dateMin < endMin;
}

/**
 * Check if the given schedule is active
 */
export function isBroadcastActive(schedule, broadcast, day=null) {
  const now = getScheduleDate(schedule);
  if (broadcast.days.indexOf(now.getDay()) === -1) return false;
  if (day != null && now.getDay() != day) return;
  return timeInBounds(now, broadcast.start, broadcast.end);
}

/**
 * Get a date object on the timezone of the schedule
 */
export function getScheduleDate(schedule) {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * parseInt(schedule.timezone));
}

/**
 * Compose a table of the broadcast schedule for each day
 */
export function getScheduleTable(schedule) {
  const days = [[], [], [], [], [], [], []];
  const now = getScheduleDate(schedule);

  // Assign names on days
  for (let i = 0; i < 7; ++i) {
    days[i].name = DAY_NAMES[i];
    days[i].day = i;
  }

  // Arrange broadcasts on days
  schedule.broadcasts.forEach(broadcast => {
    broadcast.days.forEach(day => {
      days[day].push(broadcast);
    });
  });

  // Sort broadcasts by time
  for (let i = 0; i < 7; ++i) {
    days[i].sort(
      (a, b) => a.start[0] * 60 + a.start[1] - (b.start[0] * 60 + b.start[1])
    );
  }

  // Shift schedule by current time
  const ans = [[], [], [], [], [], [], []];
  for (let i = 0; i < 7; ++i) {
    const j = (i + now.getDay()) % 7;
    ans[i] = days[j];
  }

  return ans;
}

/**
 * Walk the schedule and find what's the current broadcast
 */
export function getCurrentBroadcast(schedule) {
  const now = getScheduleDate(schedule);

  return schedule.broadcasts.find(broadcast => {
    if (broadcast.days.indexOf(now.getDay()) === -1) return false;
    return timeInBounds(now, broadcast.start, broadcast.end);
  });
}
