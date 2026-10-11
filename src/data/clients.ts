import { ClientAccount } from '../types';

const CLIENTS_STORAGE_KEY = 'dwellio_client_accounts_v1';

const INITIAL_CLIENTS: ClientAccount[] = [
  {
    id: 'client-sarah',
    name: 'Sarah Jenkins',
    email: 'sarah@dwellio.com',
    passcode: 'host123',
    assignedPropertySlugs: ['cedar-house'],
    createdAt: '2026-10-01',
  },
  {
    id: 'client-david',
    name: 'David Miller',
    email: 'david@dwellio.com',
    passcode: 'host123',
    assignedPropertySlugs: ['pine-crest-villa'],
    createdAt: '2026-10-05',
  },
];

let inMemoryClients: ClientAccount[] = [...INITIAL_CLIENTS];

function loadClientsFromStorage(): ClientAccount[] {
  if (typeof window === 'undefined') return inMemoryClients;
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryClients = parsed;
        return inMemoryClients;
      }
    }
  } catch (err) {
    console.warn('Failed to load clients from storage:', err);
  }
  // If first time, persist initial clients
  persistClients(INITIAL_CLIENTS);
  return inMemoryClients;
}

function persistClients(clients: ClientAccount[]): void {
  inMemoryClients = clients;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
      window.dispatchEvent(new CustomEvent('clients-updated', { detail: { clients } }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Failed to persist clients to storage:', err);
    }
  }
}

// Initial sync on module load
loadClientsFromStorage();

export function getAllClients(): ClientAccount[] {
  return loadClientsFromStorage();
}

export function getClientById(id: string): ClientAccount | undefined {
  const clients = loadClientsFromStorage();
  return clients.find((c) => c.id === id);
}

export function getClientByEmail(email: string): ClientAccount | undefined {
  const clients = loadClientsFromStorage();
  const normalized = email.toLowerCase().trim();
  return clients.find((c) => c.email.toLowerCase().trim() === normalized);
}

export function getClientForProperty(propertySlug: string): ClientAccount | undefined {
  const clients = loadClientsFromStorage();
  return clients.find((c) => c.assignedPropertySlugs.includes(propertySlug));
}

export function createClient(data: {
  name: string;
  email: string;
  passcode: string;
  assignedPropertySlugs?: string[];
}): ClientAccount {
  const clients = loadClientsFromStorage();
  const newClient: ClientAccount = {
    id: 'client-' + Date.now(),
    name: data.name.trim(),
    email: data.email.trim(),
    passcode: data.passcode.trim() || 'host123',
    assignedPropertySlugs: data.assignedPropertySlugs || [],
    createdAt: new Date().toISOString().split('T')[0],
  };

  const updated = [...clients, newClient];
  persistClients(updated);
  return newClient;
}

export function updateClient(updatedClient: ClientAccount): void {
  const clients = loadClientsFromStorage();
  const next = clients.map((c) => (c.id === updatedClient.id ? updatedClient : c));
  persistClients(next);
}

export function deleteClient(clientId: string): boolean {
  const clients = loadClientsFromStorage();
  const next = clients.filter((c) => c.id !== clientId);
  if (next.length !== clients.length) {
    persistClients(next);
    return true;
  }
  return false;
}

export function assignPropertyToClient(clientId: string, propertySlug: string): void {
  const clients = loadClientsFromStorage();
  const next = clients.map((c) => {
    if (c.id === clientId) {
      if (!c.assignedPropertySlugs.includes(propertySlug)) {
        return {
          ...c,
          assignedPropertySlugs: [...c.assignedPropertySlugs, propertySlug],
        };
      }
    }
    return c;
  });
  persistClients(next);
}

export function removePropertyFromClient(clientId: string, propertySlug: string): void {
  const clients = loadClientsFromStorage();
  const next = clients.map((c) => {
    if (c.id === clientId) {
      return {
        ...c,
        assignedPropertySlugs: c.assignedPropertySlugs.filter((slug) => slug !== propertySlug),
      };
    }
    return c;
  });
  persistClients(next);
}
