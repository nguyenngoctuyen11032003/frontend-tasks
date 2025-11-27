/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error("No data to export")
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escape commas and quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(",")
    ),
  ].join("\n")

  // Create blob and download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  
  const blob = new Blob([jsonContent], { type: "application/json" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.json`)
  link.style.visibility = "hidden"
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Export HTML table to Excel format
 */
export function exportTableToExcel(tableId: string, filename: string) {
  const table = document.getElementById(tableId)
  if (!table) {
    throw new Error(`Table with id "${tableId}" not found`)
  }

  const html = table.outerHTML
  const blob = new Blob([html], { type: "application/vnd.ms-excel" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.xls`)
  link.style.visibility = "hidden"
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Print content (can be used for PDF export via browser print)
 */
export function printContent(contentId: string) {
  const content = document.getElementById(contentId)
  if (!content) {
    throw new Error(`Content with id "${contentId}" not found`)
  }

  const printWindow = window.open("", "", "width=800,height=600")
  if (!printWindow) {
    throw new Error("Could not open print window")
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.focus()
  
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

/**
 * Format data for export
 */
export function formatExportData(data: any[], fields?: string[]) {
  if (!fields) {
    return data
  }

  return data.map((item) => {
    const formatted: any = {}
    fields.forEach((field) => {
      formatted[field] = item[field]
    })
    return formatted
  })
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, extension: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
  return `${prefix}_${timestamp}.${extension}`
}
