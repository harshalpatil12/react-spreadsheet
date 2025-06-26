import { useState } from 'react';

// 10 Rows by default
// 10 Columns by default
const rows = 10;
const cols = 10;

const Spreadsheet = () => {
  // copied cell value and position
  const [copyRange, setCopyRange] = useState(null);

  // Spreadsheet grid 
  const [data, setData] = useState(() =>
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ value: '', bold: false, bgColor: '' }))
    )
  );

  // Update the value of specific cell
  const handleChange = (row, col, val) => {
    const updated = [...data];
    updated[row][col].value = val;
    console.log("updated.", updated)
    setData(updated);
  };

  const evaluateFormula = (cellValue) => {
    // debugger;
    try {
      // convert to uppercase 
      const formula = cellValue.slice(1).toUpperCase();
      let operation = '';
      let range = '';

      // Check formate
      if (formula.startsWith('SUM(') && formula.endsWith(')')) {
        operation = 'SUM';
        range = formula.slice(4, -1); // Extract inside of SUM(...)
      } else if (formula.startsWith('AVG(') && formula.endsWith(')')) {
        operation = 'AVG';
        range = formula.slice(8, -1); // Extract inside of AVG(...)
      } else {
        return 'ERROR'; // Invalid formula format
      }

      const [start, end] = range.split(':');
      if (!start || !end) {
        return 'ERROR';
      }
      console.log("start", start, "end", end)
      const startCol = start.charCodeAt(0) - 65;
      const startRow = parseInt(start.slice(1), 10) - 1;

      const endCol = end.charCodeAt(0) - 65;
      const endRow = parseInt(end.slice(1), 10) - 1;

      const values = [];

      // Loop through the specified range
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cell = data?.[row]?.[col]; // optional chaining for handling data
          const numericValue = parseFloat(cell?.value);
          console.log("numericValue", numericValue)
          if (!isNaN(numericValue)) {
            values.push(numericValue);
          }
        }
      }

      // Reduce function guve sum to num
      if (operation === 'SUM') {
        return values.reduce((acc, num) => acc + num, 0);
      }

      // give AVG to num
      if (operation === 'AVG') {
        const total = values.reduce((acc, num) => acc + num, 0);
        return values.length > 0 ? (total / values.length).toFixed(2) : '0.00';
      }
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return 'ERROR';
    }

    return cellValue;
  };


  // Add rows
  const addRow = () => {
    const newRow = Array.from({ length: data[0].length }, () => ({ value: '', bold: false, bgColor: '' }));
    setData([...data, newRow]);
  };

  // Add columns
  const addColumn = () => {
    const updated = data.map(row => [...row, { value: '', bold: false, bgColor: '' }]);
    setData(updated);
  };

  // Toggle bold for a specific cell
  const toggleBold = (row, col) => {
    const updated = [...data];
    updated[row][col].bold = !updated[row][col].bold;
    setData(updated);
  };

  // Change background color 
  const changeBgColor = (row, col, color) => {
    const updated = [...data];
    updated[row][col].bgColor = color;
    setData(updated);
  };

  // Save spreadsheet data to JSON file
  const saveToJSON = () => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'spreadsheet.json';
    link.click();
  };

  return (
    <div className="space-y-4 px-4 py-6 max-w-screen overflow-x-auto font-sans bg-gray-50 min-h-screen">
      <div className="flex flex-wrap items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white shadow">
        <button onClick={addRow} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">+ Row</button>
        <button onClick={addColumn} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">+ Column</button>
        <button onClick={saveToJSON} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">💾 Save</button>
      </div>

      <div className="overflow-auto border border-gray-300 rounded-lg shadow-md bg-white">
        <table className="table-auto border-collapse min-w-max w-full text-sm">
          <thead>
            <tr className="bg-gray-100 sticky top-0 z-10">
              <th className="text-center text-gray-600 font-semibold border p-2 w-10">#</th>
              {data[0].map((_, colIdx) => (
                <th key={colIdx} className="text-center text-gray-700 font-semibold border p-2 w-24">
                  {String.fromCharCode(65 + colIdx)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="bg-gray-100 text-center text-gray-700 font-semibold border p-2">
                  {rowIdx + 1}
                </td>
                {row.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className="relative border p-0 transition-all"
                    style={{
                      fontWeight: cell.bold ? 'bold' : 'normal',
                      backgroundColor: cell.bgColor || '#fff'
                    }}
                    onDoubleClick={() => toggleBold(rowIdx, colIdx)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      changeBgColor(rowIdx, colIdx, prompt('Enter background color (e.g., #ffcc00):', cell.bgColor || '#ffffcc'));
                    }}
                  >
                    <input
                      value={cell.value}
                      className="w-full h-full px-2 py-1 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-400"
                      onChange={(e) => handleChange(rowIdx, colIdx, e.target.value)}
                      onBlur={(e) => handleChange(rowIdx, colIdx, e.target.value)}
                    />

                    {cell.value.startsWith('=') && (
                      <div className="absolute bottom-1 text-sm right-1 text-gray-500 font-mono">
                        {evaluateFormula(cell.value)}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className='text-xl font-semibold'>Note</p>
      <p>1. Right click on a cell to change the color.</p>
      <p>2. Double click on a cell to make it bold</p>
    </div>
  );
};

export default Spreadsheet;
