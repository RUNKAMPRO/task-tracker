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

  // Kryptografischer Salt (Schutz vor Rainbow-Table & Dictionary-Angriffen)
  adminSalt: 'orbit_suite_salt_8f7b2c9e4a1d603e',

  // Autorisierte Administrator-Konten (als gesalzener & gepepperter Einweg-Hash)
  adminEmailHashes: [
    '0360abb0b5a61f231df78a97c916648b81ece575ffaa2d7171212d7b79f7f667'
  ],

  // Standard Admin-PIN (über das Admin-Panel im Browser anpassbar)
  defaultAdminPin: '1234'
};
