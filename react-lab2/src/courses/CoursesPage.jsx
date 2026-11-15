// Lab day (AI required): the Courses page — list + add. src/App.jsx renders it.
// You generate it with AI from CONTRACT.md, then audit and fix it (doc sections 10–14).

import { useCourses } from "./useCourses.js";
import { CoursesView } from "./CoursesView.jsx";
import { AddCourseForm } from "./AddCourseForm.jsx";

export function CoursesPage() {
  const {
    courses,
    status,
    error,
    addCourse,
  } = useCourses();

  return (
    <section className="courses-page">
      <h1>Courses</h1>

      <CoursesView
        courses={courses}
        status={status}
        error={error}
      />

      <AddCourseForm onAdd={addCourse} />
    </section>
  );
}
