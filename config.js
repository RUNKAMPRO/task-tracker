/**
 * OrbitSuite • Globale System- & Cloud-Konfiguration
 * 
 * Hier können die Supabase-Verbindungsdaten fest hinterlegt werden.
 * Dadurch ist die Cloud-Datenbank auf ALLEN Geräten (Handy, Tablet, Laptop)
 * sofort aktiv, ohne dass du den Schlüssel auf jedem Gerät erneut eingeben musst!
 * 
 * Die Werte können auch bequem über das geschützte Admin-Panel in der App
 * eingegeben und geändert werden (erreichbar über das Schloss-Symbol 🔒).
 */
window.ORBIT_CONFIG = {
  // Deine Supabase Project URL (z. B. "https://xyzcompany.supabase.co")
  supabaseUrl: '',

  // Dein Supabase Anon Public Key (beginnt mit "eyJhbGciOi...")
  supabaseKey: '',

  // Standard Admin-PIN (z. B. "1234" oder über das Admin-Panel anpassbar)
  defaultAdminPin: '1234'
};
