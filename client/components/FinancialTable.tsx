export default function FinancialTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Metric</th>
            <th className="border border-gray-300 px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="border px-4 py-2">Total revenue</td><td className="border px-4 py-2">$1,000</td></tr>
          <tr><td className="border px-4 py-2">Cost of revenue</td><td className="border px-4 py-2">$200</td></tr>
          <tr><td className="border px-4 py-2">Depreciation</td><td className="border px-4 py-2">$300</td></tr>
          <tr><td className="border px-4 py-2">Interest expense</td><td className="border px-4 py-2">$100</td></tr>
          <tr><td className="border px-4 py-2">Other expenses</td><td className="border px-4 py-2">$50</td></tr>
        </tbody>
      </table>
    </div>
  )
}