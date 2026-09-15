export interface CandidateExportRow {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobTitle: string;
  jobDepartment: string;
  status: string;
  applied_at: string;
}

export function exportJobCandidatesToCsv(
  jobTitle: string,
  items: CandidateExportRow[],
) {
  if (!items || items.length === 0) {
    alert(`No candidate applications found for job: "${jobTitle}" to export.`);
    return;
  }

  const headers = [
    "Candidate Name",
    "Email Address",
    "Phone Number",
    "Target Job Position",
    "Department",
    "Pipeline Stage",
    "Applied Date",
  ];

  const cell = (value: string) => {
    // Prevent spreadsheet software from executing untrusted candidate values.
    const safe = /^[\s]*[=+\-@]|^[\t\r\n]/.test(value) ? "'" + value : value;
    return `"${safe.replace(/"/g, '\"\"')}"`;
  };
  const rows = items.map((item) =>
    [
      item.candidateName || "Applicant",
      item.candidateEmail || "N/A",
      item.candidatePhone || "N/A",
      item.jobTitle || jobTitle,
      item.jobDepartment || "General",
      (item.status || "applied").toUpperCase(),
      item.applied_at
        ? new Date(item.applied_at).toLocaleDateString("en-US")
        : "N/A",
    ].map(cell),
  );

  const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  const sanitizedTitle = jobTitle.replace(/[^a-zA-Z0-9]/g, "_");
  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute(
    "download",
    `${sanitizedTitle}_Applications_${dateStr}.csv`,
  );

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
