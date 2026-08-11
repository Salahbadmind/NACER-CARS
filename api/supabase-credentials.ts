export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  let anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  // Check for joined keys or malformed combinations in all environment variables
  for (const key of Object.keys(process.env)) {
    const val = (process.env[key] || "").trim();
    
    // Case 1: Key itself is VITE_SUPABASE_ANON_KEYVITE_SUPABASE_URL or similar combined key
    if (key.includes("SUPABASE_ANON_KEY") && key.includes("SUPABASE_URL")) {
      const parts = val.split(/VITE_SUPABASE_URL=|SUPABASE_URL=/i);
      if (parts.length >= 2) {
        anonKey = parts[0].trim();
        url = parts[1].trim();
        break;
      }
    }
    
    // Case 2: The value contains both a URL pattern and a JWT pattern in a single variable
    if (val.includes("https://") && val.includes("eyJ")) {
      const urlMatch = val.match(/https:\/\/[a-z0-9-.]+\.supabase\.(co|net)/i);
      if (urlMatch) {
        url = urlMatch[0];
      }
      const jwtMatch = val.match(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+/);
      if (jwtMatch) {
        anonKey = jwtMatch[0];
      }
      break;
    }
  }

  return res.status(200).json({
    url: url.trim(),
    anonKey: anonKey.trim()
  });
}
