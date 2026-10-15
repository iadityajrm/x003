import type { Plugin } from 'vite';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

export function neonApiPlugin(): Plugin {
  // Load environment variables from .env
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  } catch (e) {
    console.error('Error reading .env in neon plugin:', e);
  }

  return {
    name: 'neon-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // API Endpoint: Health check & db status
        if (url === '/api/neon/health') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
              return res.end(JSON.stringify({ ok: false, error: 'DATABASE_URL not configured' }));
            }
            const sql = neon(dbUrl);
            const [row] = await sql`SELECT 1 as connected, NOW() as server_time, current_database() as db_name`;
            return res.end(JSON.stringify({ 
              ok: true, 
              connected: true, 
              serverTime: row.server_time,
              database: row.db_name,
              branch: process.env.NEON_BRANCH || 'production',
              neonAuthUrl: process.env.NEON_AUTH_BASE_URL
            }));
          } catch (err: any) {
            return res.end(JSON.stringify({ ok: false, error: err.message }));
          }
        }

        // API Endpoint: Auth Login / Sign Up
        if (url === '/api/neon/auth' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const data = JSON.parse(body || '{}');
              const { action, email, password, name, provider, role } = data;
              const dbUrl = process.env.DATABASE_URL;
              if (!dbUrl) {
                return res.end(JSON.stringify({ ok: false, error: 'Database not connected' }));
              }
              const sql = neon(dbUrl);

              if (action === 'google') {
                // Handle Google Sign-In (Login or Auto-Register)
                const userEmail = (email || '').trim().toLowerCase();
                const userName = (name || userEmail.split('@')[0] || 'User').trim();
                const userRole = role || (userEmail.includes('admin') ? 'admin' : 'client');

                const existing = await sql`SELECT * FROM users WHERE email = ${userEmail}`;
                let user;
                if (existing.length > 0) {
                  user = existing[0];
                } else {
                  const newId = 'usr_' + Date.now();
                  const defaultSlugs = userRole === 'admin' 
                    ? ['cedar-house', 'pine-crest-villa', 'seaside-haven'] 
                    : ['cedar-house'];
                  const created = await sql`
                    INSERT INTO users (id, email, name, role, provider, assigned_property_slugs)
                    VALUES (${newId}, ${userEmail}, ${userName}, ${userRole}, 'google', ${defaultSlugs})
                    RETURNING *
                  `;
                  user = created[0];
                }

                return res.end(JSON.stringify({
                  ok: true,
                  user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    provider: user.provider,
                    assignedPropertySlugs: user.assigned_property_slugs || []
                  }
                }));
              }

              // Credentials login
              if (action === 'login') {
                const userEmail = (email || '').trim().toLowerCase();
                const userPass = (password || '').trim();

                const rows = await sql`SELECT * FROM users WHERE email = ${userEmail}`;
                if (rows.length === 0) {
                  return res.end(JSON.stringify({ ok: false, error: 'Account not found with this email.' }));
                }

                const user = rows[0];
                // Check password match (supports seeded passwords or demo passwords)
                if (user.password_hash && user.password_hash !== userPass) {
                  return res.end(JSON.stringify({ ok: false, error: 'Incorrect password.' }));
                }

                return res.end(JSON.stringify({
                  ok: true,
                  user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    provider: user.provider,
                    assignedPropertySlugs: user.assigned_property_slugs || []
                  }
                }));
              }

              // Credentials register
              if (action === 'register') {
                const userEmail = (email || '').trim().toLowerCase();
                const userPass = (password || '').trim();
                const userName = (name || userEmail.split('@')[0]).trim();
                const userRole = role || 'client';

                if (!userEmail || !userPass) {
                  return res.end(JSON.stringify({ ok: false, error: 'Email and password required' }));
                }

                const newId = 'usr_' + Date.now();
                const defaultSlugs = userRole === 'admin' 
                  ? ['cedar-house', 'pine-crest-villa', 'seaside-haven'] 
                  : ['cedar-house'];

                const created = await sql`
                  INSERT INTO users (id, email, name, role, password_hash, provider, assigned_property_slugs)
                  VALUES (${newId}, ${userEmail}, ${userName}, ${userRole}, ${userPass}, 'credentials', ${defaultSlugs})
                  ON CONFLICT (email) DO UPDATE 
                    SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name
                  RETURNING *
                `;

                const user = created[0];
                return res.end(JSON.stringify({
                  ok: true,
                  user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    provider: user.provider,
                    assignedPropertySlugs: user.assigned_property_slugs || []
                  }
                }));
              }

              return res.end(JSON.stringify({ ok: false, error: 'Invalid auth action' }));
            } catch (err: any) {
              return res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }

        // API Endpoint: Sync guest booking
        if (url === '/api/neon/bookings' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const data = JSON.parse(body || '{}');
              const { slug, booking } = data;
              const dbUrl = process.env.DATABASE_URL;
              if (!dbUrl) return res.end(JSON.stringify({ ok: false, error: 'No database URL' }));
              const sql = neon(dbUrl);

              if (!booking) {
                await sql`DELETE FROM guest_bookings WHERE property_slug = ${slug}`;
                return res.end(JSON.stringify({ ok: true, deleted: true }));
              }

              const id = 'bk_' + slug;
              await sql`
                INSERT INTO guest_bookings (id, property_slug, guest_phone, guest_name, days_of_stay, notes, updated_at)
                VALUES (${id}, ${slug}, ${booking.guestPhone}, ${booking.guestName || null}, ${booking.daysOfStay || null}, ${booking.notes || null}, NOW())
                ON CONFLICT (id) DO UPDATE SET
                  guest_phone = EXCLUDED.guest_phone,
                  guest_name = EXCLUDED.guest_name,
                  days_of_stay = EXCLUDED.days_of_stay,
                  notes = EXCLUDED.notes,
                  updated_at = NOW()
              `;
              return res.end(JSON.stringify({ ok: true, booking }));
            } catch (err: any) {
              return res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}
