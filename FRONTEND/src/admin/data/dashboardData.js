export const summaryData = {
  totalUsers: 12345,
  basicUsers: 5678,
  standardUsers: 4321,
  premiumUsers: 2346,
  emailsGeneratedToday: 876,
  freeEmailsGeneratedToday: 345,
};

export const emailChartData = {
  labels: ['Basic', 'Standard', 'Premium'],
  datasets: [
    {
      label: 'Emails Generated Today',
      data: [400, 250, 226],
      backgroundColor: [
        'rgba(33, 150, 243, 0.6)',
        'rgba(255, 152, 0, 0.6)',
        'rgba(156, 39, 176, 0.6)',
      ],
      borderColor: [
        'rgba(33, 150, 243, 1)',
        'rgba(255, 152, 0, 1)',
        'rgba(156, 39, 176, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

export const userDistributionData = {
  labels: ['Free', 'Basic', 'Standard', 'Premium'],
  datasets: [
    {
      label: 'User Distribution',
      data: [3000, 5678, 4321, 2346],
       backgroundColor: [
        'rgba(96, 125, 139, 0.6)',
        'rgba(33, 150, 243, 0.6)',
        'rgba(255, 152, 0, 0.6)',
        'rgba(156, 39, 176, 0.6)',
      ],
      borderColor: [
        'rgba(96, 125, 139, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(255, 152, 0, 1)',
        'rgba(156, 39, 176, 1)',
      ],
      borderWidth: 1,
    },
  ],
};
