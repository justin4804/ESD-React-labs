// Section 05 — State as a state machine
//
// The whole app's state is ONE object. It only ever changes through
// transition(state, event), which returns a NEW state (or the SAME state
// when the event changes nothing). Never change `state` itself.

export const initialState = Object.freeze({
  status: "idle",       // "idle" | "loading" | "ready" | "error"
  courses: [],          // the courses from the last successful load
  error: null,          // the error message when status is "error"
  departments: [],      // every department name, sorted — filled by the first successful load
  department: "",       // the selected department filter ("" = all)
  query: "",            // the search box text
  planner: [],          // planned courses: { id, code, title, credits }
  grades: {},           // the SGPA calculator form: { [courseId]: "A" | "A-" | … }
});

export function transition(state, event) {
  switch (event.type) {
    case "LOAD_START":
      // status becomes "loading" and error becomes null; everything else stays
      return { ...state, status: "loading", error: null };
    case "LOAD_OK":
      // status "ready", courses from event.courses; on the FIRST success also
      // fill departments (unique, sorted) from those courses
      return { ...state, status: "ready", courses: event.courses, 
        departments: state.departments.length === 0 ? [...new Set(event.courses.map(c => c.department))].sort() : state.departments }; 
    case "LOAD_FAIL":
      // status "error", error from event.message (keep the old courses)
      return { ...state, status: "error", error: event.message };
    case "SET_DEPARTMENT":
      // department from event.department — the SAME state if it didn't change
      if (state.department === event.department) return state;
      return { ...state, department: event.department };
    case "SET_QUERY":
      // query from event.query — the SAME state if it didn't change
      if (state.query === event.query) return state;
      return { ...state, query: event.query };
    case "ADD":
      // add { id, code, title, credits } of event.course to the planner —
      // the SAME state if it's already there.
      // Stretch: also refuse a full course, or one that would go over 24 credits.
      const course = event.course;
      if (state.planner.some(c => c.id === course.id)) {
        return state; 
      }

      if (course.seatsLeft === 0) {
        return state;
      }

      const totalCredits = state.planner.reduce((sum, c) => sum + c.credits, 0);
      if (totalCredits + course.credits > 24) {
        return state;
      }
      return {
        ...state,
        planner: [
          ...state.planner,
          {
            id: course.id,
            code: course.code,
            title: course.title,
            credits: course.credits
          }
        ]
      };
    case "REMOVE":
      // remove the course with id event.id, AND its grade if it has one —
      // the SAME state if it isn't in the planner
      const exists = state.planner.some(c => c.id === event.id);

      if (!exists) return state;

      const newGrades = { ...state.grades };
      delete newGrades[event.id];

      return {
        ...state,
        planner: state.planner.filter(c => c.id !== event.id),
        grades: newGrades
      };
    case "SET_GRADE":
      // grades[event.id] = event.grade (a computed key!); an empty grade ""
      // removes that course's entry — the SAME state if nothing changes
      const currentGrade = state.grades[event.id];

      if (event.grade === "") {
        if (currentGrade === undefined) return state;

        const newGrades = { ...state.grades };
        delete newGrades[event.id];

        return { ...state, grades: newGrades };
      }

      if (currentGrade === event.grade) return state;

      return {
        ...state,
        grades: {
          ...state.grades,
          [event.id]: event.grade
        }
      };
    default:
      return state;
  }
}
