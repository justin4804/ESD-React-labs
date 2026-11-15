// Section 06 — the grid: a Matrix made of Cells.
//
// Props:  matrix        an array of rows, each an array of numbers (any size — don't assume 3)
//         onIncrement   a function: onIncrement(row, col)   (you need it in section 08)
//
// Render:
//   <table className="matrix">
//     <tbody>
//       one <tr> per row
//         one <td> per value, with a <Cell> inside it
//
// Lists need a key on the element you return from map — section 06 says which.
// Section 08: each Cell's onClick calls onIncrement with THAT cell's row and column.
import Cell from "./Cell.jsx";
import { stats } from "./matrix.js";

export default function Matrix({ matrix, onIncrement }) {
  const { max } = stats(matrix);
  return (
    <table className="matrix">
      <tbody>
        {matrix.map((values, r) => (
          <tr key={r}>
            {/* one <td> per number in values, each with a <Cell> inside */}
            {values.map((value, c) => (
              <td key={c}>
                <Cell row={r} col={c} value={value} onClick={() => onIncrement(r, c)} isMax={max > 0 && value === max}></Cell>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
