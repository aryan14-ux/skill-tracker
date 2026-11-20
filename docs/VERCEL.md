# Deploy SkillTrack on Vercel

## Quick demo deployment

1. In Vercel, choose **Add New > Project** and import `aryan14-ux/skill-tracker`.
2. Keep **Root Directory** at the repository root (`./`), not `frontend`.
3. Keep **Services** as the Application Preset. The checked-in `vercel.json` declares `frontend` (Vite) and `backend` (Express). If the import screen was already open, click **Refresh** in the multi-service panel to reload the latest configuration. Do not select either **Import single project** button.
4. Add an environment variable named `JWT_SECRET` with a long random value. Generate one locally with:

   ```sh
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Leave `VITE_API_URL` unset so the frontend uses `/api` on the same deployment. Do not set it to localhost.
6. Click **Deploy**. Open `/api/health`, then `/login` and try a demo account. Refresh `/student/dashboard` after signing in to check client-side routing.

The React frontend and Express API deploy together. `/api/*` and `/uploads/*` route to the backend with their original paths; remaining requests route to the frontend. The frontend builds from `frontend` using `npm run build` and serves `dist`, with a fallback for React page refreshes. Express uses `backend/src/vercel.js`, which exports the app without opening a listener or seeding the database. No separate API hosting is needed for the demo. Future pushes to `main` trigger Vercel deployments once the repository is connected.

## Data persistence and uploads

Without `DB_HOST`, this is a **demo**, with sample accounts and data in memory. Registrations and edits can disappear whenever a function restarts, and different function instances do not share data. Do not use this mode for real student records.

For persistent database records, provision a publicly reachable MySQL database, initialize the schema before deployment, and set these Vercel environment variables:

| Variable | Value |
| --- | --- |
| `DB_HOST` | Your hosted MySQL hostname; never localhost |
| `DB_PORT` | Your provider's port, typically 3306 |
| `DB_NAME` | Your database name |
| `DB_USER` | Your database username |
| `DB_PASSWORD` | Your database password |
| `DB_SSL` | `true` when your provider requires TLS |
| `DB_SSL_CA` | Optional provider CA certificate (PEM) |
| `JWT_SECRET` | The same private random secret used above |

Use the provider's SQL console or a MySQL client to import `database/schema.sql` and, for sample data only, `database/seed.sql`. The serverless handler does not create tables or seed records on requests. If a configured database cannot connect, the API returns 503 instead of silently accepting writes into memory.

Resume files on Vercel use temporary storage. Parsing is supported, but uploaded-file links are not durable across restarts or instances. Vercel also limits function request bodies to 4.5 MB, including multipart overhead; use smaller resumes. Permanent resume downloads require object storage such as S3 or Vercel Blob, which is not configured in this project yet.

This configuration enables deployment; it is not a production security audit. Review demo login access and sample accounts before using real student data.

## Local development from the repository root

```sh
npm ci
npm start
```

In a second terminal:

```sh
npm run dev
```

Open http://localhost:3000. On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

Run `npm test` for regression checks and `npm run build` for a production frontend build.

References: [Vercel Services guide](https://vercel.com/kb/guide/vercel-services), [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json), [function limits](https://vercel.com/docs/functions/limitations), [function runtimes and temporary storage](https://vercel.com/docs/functions/runtimes).
