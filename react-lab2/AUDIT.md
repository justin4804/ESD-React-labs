# Audit — React Lab 2

Part of what you submit. Fill in sections 0–4 **before** you ask the AI to change anything:
deciding what's wrong is your job, not the AI's. The sheet you audit against is "The Shape
of a Good React Slice" — section 08 of the lab doc.

Point at code as `file:line`, e.g. `CoursesPage.jsx:14`.

---

## 0. What came back

| File the AI gave you | What's in it (components, hooks) | Lines |
| --- | --- | --- |
| `src/courses/useCourses.js` | `useCourses` hook; owns the course list, status and load error; loads the list and handles adding a course. | 6–55 |
| `src/courses/CoursesView.jsx` | `CoursesView` component; displays loading, error, empty and populated list states. | 3–36 |
| `src/courses/AddCourseForm.jsx` | `AddCourseForm` component; controlled form fields, submit state and API error display. | 14–145 |
| `src/courses/CoursesPage.jsx` | `CoursesPage` component; calls the hook and passes its data/action to the two child components. | 8–29 |

- **Does it run?** The uploaded source passes the component tests using the project's mock API. The list loads with the seeded courses; a valid course is added in code order and the form clears; a duplicate code displays `Course code already exists`; invalid code/credits display `Validation failed` and the relevant field errors. These behaviours are covered by `test/courses/CoursesPage.test.jsx:31–73`, `test/courses/AddCourseForm.test.jsx:87–110`, and `test/courses/useCourses.test.jsx:80–138`. I did not do a separate manual browser run for this audit.
- **Requests in the Network tab:** I did not personally inspect the browser Network tab. From the code, the expected development behaviour is:
  - **Page load:** 2 `GET /api/courses` requests because `src/main.jsx:6–10` wraps the app in `StrictMode`, which runs the mount effect twice in development. The cleanup ignores the first response. In production, it should be one GET.
  - **First add after a page load:** 2 requests — `POST /api/auth/login` to obtain the admin token, then `POST /api/courses`. The token is cached in `src/api/client.js:63–74`, so a later add in the same page session should make 1 `POST /api/courses`. There should be no extra GET after an add.
- **`npm test` before any further audit fixes:** 62 passed / 0 failed across 9 test files in the uploaded snapshot. The files that passed were `test/client.test.js`, `test/courses/AddCourseForm.test.jsx`, `test/courses/CoursesPage.test.jsx`, `test/courses/CoursesView.test.jsx`, `test/courses/fieldErrors.test.jsx`, `test/courses/useCourses.test.jsx`, `test/search/CourseSearch.test.jsx`, `test/search/SearchResults.test.jsx`, and `test/search/useCourseSearch.test.jsx`. The original first-run output immediately after Prompt 1 is not recorded in `PROMPTS.md`, so I cannot give a separate first-version test count.

## 1. Part A — walk the allowed list

| Element (the sheet, Part A) | Where it is in the AI's code (`file:line`, or "missing") | Right place? If not, where should it be? |
| --- | --- | --- |
| One View component that only renders | `src/courses/CoursesView.jsx:3–36` | Yes. It receives courses, status and error as props. It has no hooks, state or API calls. |
| Fetch + logic in a separate hook or module | `src/courses/useCourses.js:6–54` | Yes. The hook owns the list request and add action. `CoursesView` does not fetch. |
| `useState` for the course list, at the right level | `src/courses/useCourses.js:7` | Yes. The list is shared by the View and the add action, so it belongs in the hook called by the page. |
| `useState` for the form's inputs, at the right level | `src/courses/AddCourseForm.jsx:15` | Yes. The form values are only used by the form, so they do not need to be lifted into the page or hook. |
| `useEffect` — for the initial fetch only (with a cleanup) | `src/courses/useCourses.js:11–32` | Yes. The empty dependency array runs the initial GET on mount, and the cleanup sets `ignore = true` so an old response is not used. |
| Props down, callbacks up (the form raises "add this course") | `src/courses/CoursesPage.jsx:20–26`; `src/courses/AddCourseForm.jsx:28–40` | Yes. The page passes the list data to `CoursesView` and passes `addCourse` to the form as `onAdd`. The form calls `onAdd` rather than making an API request itself. |
| `.map` to render the list, with a stable `key` | `src/courses/CoursesView.jsx:18–20` | Yes. The list uses `course.id`, not the array index. |
| Loading / error / empty states, from one `status` | `src/courses/useCourses.js:8, 19, 26`; `src/courses/CoursesView.jsx:4–14` | Yes. `status` is loading, ready or error. When the status is ready and the array is empty, the View displays the empty message. There are no separate loading/error booleans. |

## 2. Part B — scan for "not yet"

I searched the source under `src/`. The `fetch()` calls inside `src/api/client.js` are part of the supplied API wrapper; the feature files call `apiFetch`.

| Not yet | Found? (`file:line`) | What it does in *this* slice | Cut, or keep — and why |
| --- | --- | --- | --- |
| `useMemo` | Not found. | No memoized calculation is needed for this small list. | Nothing to cut. |
| `useCallback` | Not found. | No function memoization is used. | Nothing to cut. |
| `useReducer` | Not found. | State changes are simple enough for `useState`. | Nothing to cut. |
| `useRef` | Not found. | No DOM reference or mutable value is needed. | Nothing to cut. |
| Context (`createContext`, `useContext`) | Not found. | The page passes the required props directly to its children. | Nothing to cut. |
| A data-fetching library, or `axios`, or raw `fetch` instead of `apiFetch` | No library or axios found. Feature hooks use `apiFetch` (`src/courses/useCourses.js:4, 14, 35`; `src/search/useCourseSearch.js:17, 44`). The only raw `fetch()` calls are in the supplied wrapper at `src/api/client.js:33, 67`. | The wrapper handles the HTTP request and admin token. The feature code does not bypass it. | Keep the supplied wrapper; no feature-level fetch code to remove. |
| TypeScript (types, interfaces, `.ts`/`.tsx`) | Not found. The source uses `.js` and `.jsx`. | This project is written in JavaScript as required. | Nothing to cut. |
| Anything else nobody taught you (name it) | Not found. `useDebounced` is used at `src/search/CourseSearch.jsx:20`, but it is the lab's taught stretch task. | It delays search until typing has stopped, reducing requests while the user types. | Keep. It uses the allowed `useState` and `useEffect`; it is not an item from Part B. |

## 3. The rule — every hook and every component split

I included the pre-lab search slice in this inventory as well, because those hooks and components are also present in the uploaded app. The first group is the Courses slice; the search entries are the pre-lab/stretch slice.

| Hook call or component (`file:line`) | What earns it here? (one sentence) | Keep / cut / move (to where) |
| --- | --- | --- |
| `useState` — `src/courses/useCourses.js:7` | It stores the course array that the View displays and `addCourse` updates. | Keep in `useCourses`; the list is shared by the page's children. |
| `useState` — `src/courses/useCourses.js:8` | It records whether the initial list request is loading, ready or failed. | Keep in `useCourses`; the View needs this status to choose what to render. |
| `useState` — `src/courses/useCourses.js:9` | It stores the initial-load error message for the View. | Keep in `useCourses`; the page passes it to the View. |
| `useEffect` — `src/courses/useCourses.js:11` | It sends the initial GET when the page appears and ignores a response after cleanup. | Keep in `useCourses`; this is the initial server load. |
| `useState` — `src/courses/AddCourseForm.jsx:15` | It stores the six controlled input values while the user fills the form. | Keep in `AddCourseForm`; no other component needs half-typed values. |
| `useState` — `src/courses/AddCourseForm.jsx:16` | It tracks whether the POST is still running so the submit button can be disabled. | Keep in `AddCourseForm`; only the form uses this state. |
| `useState` — `src/courses/AddCourseForm.jsx:17` | It stores the last add error, including its message and field errors. | Keep in `AddCourseForm`; the form is responsible for displaying the server's feedback. |
| `useCourses()` call — `src/courses/CoursesPage.jsx:14` | It gives the page one shared course list and one `addCourse` action for both children. | Keep in `CoursesPage`; do not call the hook separately in the View and form. |
| `CoursesView` — `src/courses/CoursesView.jsx:3` | It turns the list data and status props into the loading, error, empty or list JSX. | Keep as the one View for the Courses list. |
| `AddCourseForm` — `src/courses/AddCourseForm.jsx:14` | It owns the input values and submission UI, then raises the request through `onAdd`. | Keep; the form should not own the course list or call the API. |
| `CoursesPage` — `src/courses/CoursesPage.jsx:8` | It connects the hook to the View and form and renders the page heading. | Keep as the wiring component. |
| `useState` — `src/search/CourseSearch.jsx:17` | It stores the text currently typed into the search box. | Keep in `CourseSearch`; the query belongs to the input component. |
| `useDebounced()` call — `src/search/CourseSearch.jsx:20` | It supplies a settled query so each keystroke does not immediately trigger a search request. | Keep; this is the stretch requirement. |
| `useCourseSearch()` call — `src/search/CourseSearch.jsx:23` | It gets results and status for the settled query. | Keep in `CourseSearch`; pass the result to the results View. |
| `CourseSearch` — `src/search/CourseSearch.jsx:16` | It owns the search input and connects the debounce hook, search hook and results component. | Keep as the wiring component for the pre-lab search slice. |
| `useState` — `src/search/useCourseSearch.js:22` | It stores the courses returned by the latest search. | Keep in `useCourseSearch`; results belong with the search request logic. |
| `useState` — `src/search/useCourseSearch.js:23` | It stores the search status: idle, loading, ready or error. | Keep in `useCourseSearch`; `SearchResults` uses it to choose the output. |
| `useEffect` — `src/search/useCourseSearch.js:25` | It makes a request when the trimmed query changes and drops stale responses in cleanup. | Keep in `useCourseSearch`; fetching is a side effect and belongs in the hook. |
| `SearchResults` — `src/search/SearchResults.jsx:14` | It renders the search status or the matching courses from props only. | Keep as a presentational component; it does not fetch or own state. |
| `useState` — `src/search/useDebounced.js:14` | It stores the last value that has stayed unchanged for the requested delay. | Keep in `useDebounced`; it is the value returned by the debounce hook. |
| `useEffect` — `src/search/useDebounced.js:16` | It starts the delay timer and cancels the previous timer during cleanup. | Keep in `useDebounced`; the timer is the side effect being managed. |

## 4. Decisions — before any fix prompt

- **I will cut:** Nothing from the Part B list. I did not find any of those items in the feature code.
- **I will move (from → to):** Nothing. The course list and add action are already in `useCourses`, the form values are in `AddCourseForm`, and the page connects them.
- **I will add (missing from the AI's version):** Add the heading `<h2>Add a course</h2>` inside the form. The contract says the form should be headed “Add a course”; the current form starts with the error message/Code label (`src/courses/AddCourseForm.jsx:62–68`).
- **Other smells I found:**
  1. The Description field is currently placed before Department, Credits and Capacity (`src/courses/AddCourseForm.jsx:90–102`). I will move it after Capacity so the fields follow the order listed in `CONTRACT.md`.
  2. In `useCourseSearch`, a blank query is handled by calling `setResults` and `setStatus` inside the effect (`src/search/useCourseSearch.js:28–35`). The lab notes say the idle result should be returned during render after all hook calls. I will make a blank trimmed query return `{ results: [], status: "idle" }` immediately, rather than briefly returning the previous search state while the effect runs.
  3. I did not find the other common smells: the list is not reloaded after an add (`src/courses/useCourses.js:34–46`); the returned course is inserted into a new sorted array; there is no `key={index}`; and there is no browser-side required/min/max validation on the form inputs.

---

## 5. Strip check (section 14 of the doc)

| Removed | `npm test` after | The app after (loads / adds / shows errors) |
| --- | --- | --- |
| No Part B item was present, so there was nothing to remove. | Not applicable as a strip experiment. The unchanged uploaded snapshot passes `npm test`: 62/62; `npm run test:stretch`: 4/4. | No removal was made, so I cannot claim a before/after browser check. The automated component tests cover loading, valid add, duplicate and field errors. |

The prompt's rules likely prevented the Part B items: it explicitly says to use only `useState` and `useEffect`, and not to use `useMemo`, `useCallback`, `useReducer`, `useRef`, Context, TypeScript or a data-fetching library. It also says to use the supplied `apiFetch` wrapper. The `useDebounced` hook is part of the taught stretch task, not one of the Part B items.

## 6. Before / after

This comparison is for the Courses slice. The original first AI response is described in `PROMPTS.md`, but its exact source snapshot and first-run test output were not preserved there. I have marked those details as not recorded rather than guessing.

|  | Before (the AI's first version) | After (the current uploaded version) |
| --- | --- | --- |
| Files and components | `PROMPTS.md` records four files: `useCourses.js`, `CoursesView.jsx`, `AddCourseForm.jsx` and `CoursesPage.jsx`. Exact first-version line counts are not recorded. | Same four files. `CoursesPage` wires the hook, `CoursesView` renders the list, and `AddCourseForm` owns the form. |
| `useState` calls (and where) | Exact count/locations not preserved in the first-version record. | 6 in the Courses slice: 3 in `useCourses.js:7–9` and 3 in `AddCourseForm.jsx:15–17`. |
| `useEffect` calls | Exact first-version count not recorded. | 1 in the Courses slice: `useCourses.js:11`, for the initial GET and cleanup. |
| "Not yet" items | `PROMPTS.md` says the generated version followed the allowed hooks/API helper, but it does not preserve a complete first-version scan. | None found in the current Courses slice. |
| Requests: on load / per add | First-version Network-tab count was not recorded. | Development: 2 GETs on page load because of StrictMode. First add: login POST + course POST; later adds: one course POST each. No list reload after add. |
| `npm test` | First-run result after Prompt 1 was not recorded. | 62 passed / 0 failed across 9 test files. Stretch: 4 passed / 0 failed. |

## 7. Two sentences

- **One thing the AI got right that I might not have thought of:** It used an ignore flag in the effect cleanup, so an older request cannot overwrite the result after the query or component has moved on.
- **One thing I will never accept from an AI without checking again:** I will check that adding a course uses the POST response to update the existing list in sorted order, instead of making another GET and reloading the whole list.
