/* =========================================================
   CONFIGURACIÓN · En El Músculo
   Solo cambia lo que está entre comillas.
   Estas claves son públicas por diseño: la seguridad la da
   la base de datos (solo tu correo puede leer los datos).
   ========================================================= */
window.EEM_CONFIG = {
  // Supabase → Project Settings → API
  supabaseUrl: "https://xquwiaccpjxweevmpzri.supabase.co",          // ej.: https://abcdefgh.supabase.co
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdXdpYWNjcGp4d2Vldm1wenJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyOTgzNjYsImV4cCI6MjEwNzg3NDM2Nn0.0GRz54bhm6eRitO1uG8lsWXRpHEt9-MFObXzQCiC5pE",  // empieza con eyJ...

  // Shopify → Canales de venta → Headless → Storefront API → token de acceso público
  shopifyDominio: "enelmusculo.com",
  shopifyStorefrontToken: "67b783baa30364656e1526474e892d7e",
  shopifyApiVersion: "2026-07",

  // WhatsApp de respaldo si el envío automático del formulario falla
  whatsapp: "584129723481",
  whatsappTexto: "0412-9723481",

  // Dirección de la app y del formulario cuando estén publicados (GitHub Pages)
  urlFormulario: "entrevista.html"
};
