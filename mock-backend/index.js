const express = require('express');
const cors = require('cors');

const app = express();
const port = 6001;

app.use(cors());
app.use(express.json());

// In-memory store for settings, mirroring LocalSettings.java
let adminSettings = {
  general: {
    applicationName: 'Cyclos',
    rootUrl: 'http://localhost:6002',
    language: 'ENGLISH',
    theme: 'light',
    cyclosId: 'cyclos-main',
    applicationUsername: 'The Administration',
  },
  localization: {
    charset: 'UTF-8',
    numberLocale: 'COMMA_AS_DECIMAL',
    precision: 'TWO',
    datePattern: 'DD_MM_YYYY_SLASH',
    timePattern: 'HH24_MM_SS',
    timeZone: 'UTC',
  },
  registration: {
    allowNewRegistrations: true,
    emailRequired: true,
    emailUnique: true,
    deletePendingRegistrationsAfter: { value: 7, field: 'DAYS' },
  },
  members: {
    memberSortOrder: 'CHRONOLOGICAL',
    memberResultDisplay: 'USERNAME',
    referenceLevels: 5,
  },
  transactions: {
    transactionNumber: { prefix: 'TX-#yyMM#-', padLength: 6, suffix: '', enabled: true },
    maxChargebackTime: { value: 1, field: 'MONTHS' },
  },
  messaging: {
    deleteMessagesOnTrashAfter: { value: 30, field: 'DAYS' },
    messageFormat: 'RICH',
  },
  uploads: {
    maxUploadSize: 5, // In MB
    maxImageWidth: 800,
    maxImageHeight: 600,
    maxThumbnailWidth: 100,
    maxThumbnailHeight: 100,
  },
  system: {
    maxPageResults: 15,
    maxIteratorResults: 1000,
    maxAjaxResults: 8,
    schedulingHour: 0,
    schedulingMinute: 0,
    transferListenerClass: 'com.example.MyTransferListener',
    containerUrl: 'http://localhost:6001',
  },
};

// Mock database for accounts
const mockAccounts = [
  { id: '1', type: 'Member Account', name: 'Checking Account', number: '1234-5678', balance: 1500.75, currency: 'USD' },
  { id: '2', type: 'Member Account', name: 'Savings Account', number: '9876-5432', balance: 8250.00, currency: 'USD' },
];

const mockTransactions = {
  '1': [
    { id: 't1', date: '2026-06-22', description: 'Grocery Store', amount: -75.50 },
    { id: 't2', date: '2026-06-21', description: 'Paycheck Deposit', amount: 1200.00 },
    { id: 't3', date: '2026-06-20', description: 'Restaurant', amount: -45.00 },
  ],
  '2': [
    { id: 't4', date: '2026-06-15', description: 'Initial Deposit', amount: 10000.00 },
    { id: 't5', date: '2026-06-18', description: 'Transfer to Checking', amount: -1750.00 },
  ]
};

// Mock database for users/contacts
const mockUsers = [
  { id: '1', name: 'John Doe', username: 'johndoe', email: 'john.doe@example.com', role: 'user', status: 'active' },
  { id: '2', name: 'Jane Smith', username: 'janesmith', email: 'jane.smith@example.com', role: 'user', status: 'active' },
  { id: '3', name: 'Peter Jones', username: 'peterjones', email: 'peter.jones@example.com', role: 'user', status: 'inactive' },
  { id: '4', name: 'Global Admin', username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active' },
];

// Mock database for roles/groups
const mockRoles = [
    { id: '1', name: 'Administrator', description: 'Has full system access', permissions: ['view_all_users', 'edit_all_users', 'view_settings', 'edit_settings'] },
    { id: '2', name: 'Member', description: 'Standard user account', permissions: ['view_own_account', 'make_payments'] },
    { id: '3', name: 'Broker', description: 'Can manage other users', permissions: ['view_own_account', 'make_payments', 'view_all_users'] },
];

app.get('/rest/general', (req, res) => {
  res.json({
    cyclosVersion: '4.15.1 (mocked)',
    applicationName: adminSettings.applicationName
  });
});

app.post('/rest/login', (req, res) => {
  const { principal, password } = req.body;

  // In a real application, you would validate the credentials.
  // Here, we'll just accept any login and return a mock user.
  if (principal && password) {
    res.json({
      user: {
        name: principal === 'admin' ? 'Global Admin' : 'Mock User',
        username: principal,
        email: `${principal}@example.com`,
        role: principal === 'admin' ? 'admin' : 'user'
      },
      sessionToken: 'mock-session-token-12345'
    });
  } else {
    res.status(400).json({ error: 'Missing principal or password' });
  }
});

app.get('/rest/admin/settings', (req, res) => {
  // In a real app, you would check if the user is an admin
  res.json(adminSettings);
});

app.post('/rest/admin/settings', (req, res) => {
  // In a real app, you would check if the user is an admin
  const newSettings = req.body;
  adminSettings = { ...adminSettings, ...newSettings };
  res.json(adminSettings);
});

// New endpoints for accounts
app.get('/rest/accounts', (req, res) => {
  res.json(mockAccounts.map(({ id, name, number, balance, currency }) => ({ id, name, number, status: { balance }, currency })));
});

app.get('/rest/accounts/:id', (req, res) => {
  const account = mockAccounts.find(acc => acc.id === req.params.id);
  if (account) {
    res.json({ ...account, transactions: mockTransactions[account.id] || [] });
  } else {
    res.status(404).json({ error: 'Account not found' });
  }
});

// New endpoints for payments
app.get('/rest/users', (req, res) => {
  // Returns a list of potential payment recipients
  res.json(mockUsers);
});

// New endpoint for admin user management
app.get('/rest/admin/users', (req, res) => {
  // In a real app, you would check for admin role
  res.json(mockUsers);
});

// New endpoints for role management
app.get('/rest/admin/roles', (req, res) => {
    res.json(mockRoles);
});

app.post('/rest/admin/roles', (req, res) => {
    const newRole = req.body;
    newRole.id = `r${Date.now()}`;
    mockRoles.push(newRole);
    res.status(201).json(newRole);
});

app.put('/rest/admin/roles/:id', (req, res) => {
    const { id } = req.params;
    const updatedRole = req.body;
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex > -1) {
        mockRoles[roleIndex] = { ...mockRoles[roleIndex], ...updatedRole };
        res.json(mockRoles[roleIndex]);
    } else {
        res.status(404).json({ error: 'Role not found' });
    }
});

app.post('/rest/admin/users', (req, res) => {
  const newUser = req.body;
  newUser.id = `u${Date.now()}`;
  mockUsers.push(newUser);
  res.status(201).json(newUser);
});

app.put('/rest/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex > -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedUser };
    res.json(mockUsers[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/rest/payments/member', (req, res) => {
  const { fromAccountId, toUsername, amount, description } = req.body;

  if (!fromAccountId || !toUsername || !amount) {
    return res.status(400).json({ error: 'Missing required payment information' });
  }

  const fromAccount = mockAccounts.find(acc => acc.id === fromAccountId);
  const toUser = mockUsers.find(u => u.username === toUsername);

  if (!fromAccount) return res.status(404).json({ error: 'Source account not found' });
  if (!toUser) return res.status(404).json({ error: 'Recipient not found' });

  if (fromAccount.balance < amount) {
    return res.status(400).json({ error: 'Not enough credits' });
  }
  
  // Simulate the transaction
  fromAccount.balance -= amount;
  const newTransaction = {
    id: `t${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    description: `Payment to ${toUser.name}: ${description}`,
    amount: -amount
  };
  mockTransactions[fromAccountId].unshift(newTransaction);

  console.log(`Payment successful: ${amount} from ${fromAccount.name} to ${toUser.name}`);

  res.status(201).json({ success: true, transaction: newTransaction });
});

app.listen(port, () => {
  console.log(`Mock Cyclos backend listening at http://localhost:${port}`);
});
