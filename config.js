/**
 * OrbitSuite • Globale System- & Cloud-Konfiguration
 * 
 * Hier sind deine Supabase-Verbindungsdaten fest hinterlegt.
 * Dadurch ist die Cloud-Datenbank auf ALLEN Geräten (Handy, Tablet, Laptop)
 * sofort aktiv, ohne dass du den Schlüssel auf jedem Gerät erneut eingeben musst!
 * 
 * Die Werte können auch bequem über das geschützte Admin-Panel in der App
 * eingesehen und geändert werden (erreichbar über das Schloss-Symbol 🔒).
 */
window.ORBIT_CONFIG = {
  // Deine Supabase Project URL
  supabaseUrl: 'https://hsbtkwiuoxehexbcykvn.supabase.co',

  // Dein Supabase Publishable Key
  supabaseKey: 'sb_publishable_O3RjZyTjL_D9pF68PtxImg_ZDe-J1RM',

  // Autorisierte Administrator-Konten (als anonymer SHA-256 Hash geschützt - keine Klartext-E-Mail im Code!)
  adminEmailHashes: [
    '83c026bcf211c9f2c87c482e45712e6c389b9fe9f0e2f9bcf5ec62ce47af07fa'
  ],

  // Standard Admin-PIN (über das Admin-Panel im Browser anpassbar)
  defaultAdminPin: '1234'
};
