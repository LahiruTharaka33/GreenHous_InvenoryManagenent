export default function SkeletonTable({ rows = 5, columns = 3 }) {
  return (
    <table className="w-full border mt-4 bg-white animate-pulse">
      <thead>
        <tr className="bg-gray-100">
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="p-2 border">&nbsp;</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx} className="p-2 border">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
} 