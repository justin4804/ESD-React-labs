# Prompt log — React Lab 2

Part of what you submit. It shows *how* you used AI: did you hand it the contract and the
rules, or type "make it work"? Fill it in **as you go**, not from memory at the end.

- Name and roll number: Justin George MT2026041
- AI tool and plan: ChatGPT free

**Log every prompt you send, in order — including the ones that didn't help.** Paste each
prompt in full. One exception: if you pasted CONTRACT.md's prompt 1 unchanged, write
"CONTRACT.md prompt 1, unchanged". Summarise each reply; don't paste whole files.

---

## Prompt 1 — generate

**Sent:**

```text
CONTRACT.md prompt 1, unchanged
```

## What came back

The first implementation followed the required four-file structure inside `src/courses/`:

- `useCourses.js` — Contains a custom hook built with `useState` and `useEffect`. It fetches the course list using `apiFetch`, manages loading and error states, and handles adding new courses through the POST endpoint.
- `CoursesView.jsx` — A UI-only component responsible for displaying the loading, error, empty, and populated course-list states.
- `AddCourseForm.jsx` — Implements a controlled form containing all six course fields, along with submission tracking and API validation error handling.
- `CoursesPage.jsx` — Acts as the connecting component, bringing together the custom hook, course list, and add-course form.

The generated code followed the hooks and API helper restrictions specified in the contract. It did not introduce any additional data-fetching libraries or bypass the provided API helper with direct `fetch` calls.

## Did it run?

There was no complete `npm test` result or confirmation of every browser-level requirement available in the conversation. Because of this, I cannot confidently consider the entire feature fully tested. The results from the subsequent stretch tests are documented in the debugging prompt below.

## What I did with it

I used the generated implementation as the foundation for the remaining search-related pre-lab exercises. While continuing the work, I referred to the contract to verify that each component and its responsibilities matched the expected requirements.

---

## Prompt 2 — Building the course search UI

### Why I sent it

The skeleton provided in pre-lab section 06 contained an unfinished placeholder. I needed to implement `CourseSearch` so that it maintained the search input, interacted with the search hook, and supplied the resulting data to the display component.

### Sent:

```text
Implement the pre-lab section 06 CourseSearch component using the supplied skeleton and requirements.

The component should:
- Display the heading "Search the catalogue".
- Include a label "Search courses" and a controlled input with type="search".
- Maintain the user's search query using component state.
- Invoke useCourseSearch(query).
- Forward the returned search information to SearchResults.
- Only handle the query state and the composition of the search interface.

Retain the existing imports and named export defined in the skeleton.
```

### What came back

The generated component used `useState` to maintain the search query and implemented a controlled search field. It invoked `useCourseSearch(query)` and rendered the output through `SearchResults`. The input was also correctly associated with its label using the `htmlFor` and `id` attributes.

### What I kept, and what I rejected

I retained the controlled-input implementation and the separation of responsibilities between the search component, custom hook, and results component. There was no explicitly documented rejected implementation.

---

## Prompt 3 — Building SearchResults

### Why I sent it

The provided `SearchResults.jsx` skeleton described the expected output for different search states. I wanted to implement these conditions while ensuring that the component remained presentational, without maintaining its own state or performing API requests.

### Sent:

```text
Implement SearchResults({ results, status }) from the supplied skeleton.

Follow these rendering rules exactly:
- status "idle" -> return null
- status "loading" -> render <p>Searching…</p>
- status "error" -> render <p>Search failed.</p>
- status "ready" with an empty results array -> render <p>No courses match.</p>
- status "ready" with results -> render a <ul> with one <li> per course.
- Each list item should display "course.code · course.title".
- Use course.id as the React key.

This component must only render from props. Do not add hooks, state, or API calls.
```

### What came back

The implementation handled the different search statuses through conditional rendering. When results were available, it generated a list by mapping over the returned courses. Each item used `course.id` as its React key and displayed the course code alongside its title.

### What I kept, and what I rejected

I kept the conditional rendering based on the search status and the separation between presentation and data fetching. No specific rejected implementation was documented.

---

## Prompt 4 — Building useCourseSearch

### Why I sent it

The search hook needed to support several behaviours, including handling empty input, safely encoding query parameters, managing loading and error states, reacting to query changes, and preventing outdated requests from modifying the latest search results.

### Sent:

```text
Implement useCourseSearch(query) using the supplied skeleton and requirements.

Requirements:
- Trim the query before processing it.
- If the trimmed query is blank, do not make an API request and return { results: [], status: "idle" }.
- Otherwise, send a GET request to /api/courses?q=<query> using apiFetch from ../api/client.js.
- Use URLSearchParams to construct the query string so special characters such as "R&D" are encoded correctly.
- Set the status to "loading" while the request is pending, "ready" when courses are received, and "error" if the request fails.
- Trigger another search only when the trimmed query changes.
- Implement an ignore flag in the effect cleanup to prevent an older request from updating the state after a newer query has been submitted.
- Use only the hooks permitted by the lab instructions.
```

### What came back

The hook was implemented using `useState` and `useEffect`. It used `URLSearchParams` for query encoding and an `ignore` flag inside the cleanup function to prevent outdated responses from updating the component state. The effect also depended on the trimmed query rather than the original input.

### What I kept, and what I rejected

I retained the query encoding, dependency on the trimmed query, and cleanup mechanism for handling stale requests. During the review, I also identified that an empty query should produce the idle state immediately instead of depending entirely on state updates performed inside the effect.

---

## Prompt 5 — Building useDebounced

### Why I sent it

The stretch requirement specified that searching should only happen after the user had stopped typing for 250 milliseconds. Without this behaviour, every individual keystroke could generate a separate API request.

### Sent:

```text
Implement useDebounced(value, ms) from the supplied skeleton.

It should:
- Return the initial value immediately.
- Preserve the previously settled value while the new value is changing.
- Use useState to store the settled value.
- Use useEffect to schedule a timeout whenever value or ms changes.
- Update the settled value once ms milliseconds have elapsed.
- Cancel the previous timeout in the effect cleanup using clearTimeout.
- Return the settled value.

Then integrate it into CourseSearch as:

useCourseSearch(useDebounced(query, 250))
```

### What came back

The generated custom hook initialized its state using the incoming value and scheduled an update through `setTimeout`. Whenever the value or delay changed, the cleanup function cancelled the previous timer using `clearTimeout`. The three tests specifically written for the debounce hook subsequently passed.

### What I kept, and what I rejected

I kept the implementation based on a timeout and cleanup function. The initial implementation of the hook passed all three of its dedicated tests.

---

## Prompt 6 — Fixing the debounced CourseSearch integration

### Why I sent it

Although the individual tests for `useDebounced` were successful, the stretch test for `CourseSearch` revealed that typing a complete word was still generating one API request for every character. I needed to determine whether the problem was in the custom hook itself or in the way it was connected to the search component.

### Sent:

```text
The test output shows:
- The three useDebounced hook tests pass.
- The CourseSearch debounced test fails.
- Expected request: GET /api/courses?q=learn
- Actual requests: GET /api/courses?q=l, le, lea, lear, and learn.

Diagnose the integration problem and show the corrected CourseSearch.jsx.
The search hook must receive the debounced query, not the raw input query.
```

### What came back

The problem was traced to the way `CourseSearch` invoked the search hook. It was still passing the original `query` value directly to `useCourseSearch`, which meant that debouncing was not actually being applied to the API requests.

The fix was to first obtain the debounced query using `useDebounced(query, 250)` and then pass that value to `useCourseSearch`.

### What I kept, and what I rejected

I adopted the corrected implementation with the following data flow:

```javascript
const debouncedQuery = useDebounced(query, 250);
const { results, status } = useCourseSearch(debouncedQuery);
```

Before this correction, the test output available in the conversation showed that 3 out of 4 stretch tests were passing. However, there was no recorded test execution after applying the integration fix, so I cannot claim that all four tests passed.

---

## Afterwards

- **How many prompts did the whole feature take?** The recorded work consists of six implementation and debugging prompts, along with the original contract prompt.

- **Which of your prompts would you write differently now, and how?** I would specify the debouncing requirement more clearly in the initial integration instructions. In particular, I would explicitly state that `CourseSearch` must pass the debounced query to `useCourseSearch` rather than the raw input value. I would also define the expected return values of the hooks and the props accepted by each component upfront.

- **One thing the rules in prompt 1 prevented (or failed to prevent):** The initial contract helped maintain a clear separation of responsibilities. API operations remained inside custom hooks, presentational components received data through props, and the form maintained its own input state. However, these restrictions alone did not guarantee that the search component would connect the debounce hook correctly. The initial implementation still passed the unprocessed query to the search hook, and the stretch test helped identify this integration issue.
