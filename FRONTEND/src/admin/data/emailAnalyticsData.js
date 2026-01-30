export const emailAnalyticsSummary = {
  standardUsersEmails: 450,
  premiumUsersEmails: 890,
  freeUsersEmails: 120,
};

export const userEmailActivity = [
  { id: 1, userName: 'Jane Smith', emailsGenerated: 12 },
  { id: 2, userName: 'John Doe', emailsGenerated: 25 },
  { id: 3, userName: 'David Brown', emailsGenerated: 8 },
  { id: 4, userName: 'Sarah Miller', emailsGenerated: 30 },
  { id: 5, userName: 'Emily Williams', emailsGenerated: 5 },
  { id: 6, userName: 'Chris Wilson', emailsGenerated: 3 },
];

export const emailGenerationTrend = {
  labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  datasets: [
    {
      label: 'Standard Users',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(33, 150, 243)',
      tension: 0.1,
    },
    {
      label: 'Premium Users',
      data: [120, 110, 140, 130, 100, 105, 95],
      fill: false,
      borderColor: 'rgb(156, 39, 176)',
      tension: 0.1,
    },
     {
      label: 'Free Users',
      data: [20, 25, 15, 30, 10, 18, 22],
      fill: false,
      borderColor: 'rgb(96, 125, 139)',
      tension: 0.1,
    },
  ],
};
