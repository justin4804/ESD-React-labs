// Section 03 — Values, truthiness and expressions

// "Full", "1 seat left", or "12 seats left".
export function seatLabel(course) {
  if (course.seatsLeft === 0) {
    return "Full";
  } else if (course.seatsLeft === 1) {
    return "1 seat left";
  } else {
    return `${course.seatsLeft} seats left`;
  }
}

// The course's description, or "No description yet." ONLY when it is
// null or undefined. An empty string "" is a real value and is kept.
export function descriptionOrDefault(course) {
  if (course.description === null || course.description === undefined) {
    return "No description yet.";
  }
  return course.description;
}

// "3 in planner" for a positive count, and null (not 0, not "") for zero.
export function plannerBadge(count) {
  if(count > 0) {
    return `${count} in planner`;
  }
  return null;
}
