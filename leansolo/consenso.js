/* LeanSolo — consenso ai cookie e monitoraggio delle conversioni Google Ads.
 *
 * - Il tag Google (AW-18448274554) si carica SOLO dopo "Accetta" nel banner.
 * - Conversione "Download LeanSolo" (categoria Registrazione), inviata quando:
 *     · si clicca un download (Microsoft Store, programma Windows, zip Mac);
 *     · la registrazione alla prova di 30 giorni va a buon fine
 *       (registrati.html chiama window.lsConversione()).
 * - In fondo alla pagina aggiunge il link "Preferenze cookie" per cambiare scelta.
 * Testi nelle 6 lingue del sito, scelti da <html lang>.
 */
(function () {
  var ADS_ID = "AW-18448274554";
  var CONV = ADS_ID + "/TI4nCIuMm70dEPqo6dxE";
  var CHIAVE = "ls_cookie";

  var TESTI = {
    it: { msg: "Usiamo i cookie di Google Ads solo per sapere se i nostri annunci portano a provare LeanSolo. Nessun cookie finché non accetti.",
          dett: "Dettagli", si: "Accetta", no: "Rifiuta", pref: "Preferenze cookie" },
    en: { msg: "We use Google Ads cookies only to find out whether our ads lead people to try LeanSolo. No cookies until you accept.",
          dett: "Details", si: "Accept", no: "Decline", pref: "Cookie preferences" },
    de: { msg: "Wir verwenden Google-Ads-Cookies nur, um zu erfahren, ob unsere Anzeigen dazu führen, LeanSolo auszuprobieren. Keine Cookies, bevor du zustimmst.",
          dett: "Details", si: "Akzeptieren", no: "Ablehnen", pref: "Cookie-Einstellungen" },
    fr: { msg: "Nous utilisons les cookies Google Ads uniquement pour savoir si nos annonces amènent à essayer LeanSolo. Aucun cookie avant ton accord.",
          dett: "Détails", si: "Accepter", no: "Refuser", pref: "Préférences cookies" },
    es: { msg: "Usamos las cookies de Google Ads solo para saber si nuestros anuncios llevan a probar LeanSolo. Ninguna cookie hasta que aceptes.",
          dett: "Detalles", si: "Aceptar", no: "Rechazar", pref: "Preferencias de cookies" },
    pt: { msg: "Usamos os cookies do Google Ads só para saber se os nossos anúncios levam a experimentar o LeanSolo. Nenhum cookie até aceitares.",
          dett: "Detalhes", si: "Aceitar", no: "Recusar", pref: "Preferências de cookies" }
  };
  var lingua = (document.documentElement.lang || "it").slice(0, 2);
  var t = TESTI[lingua] || TESTI.it;
  var privacy = "privacy.html#cookie";   // ogni lingua ha la sua privacy.html nella stessa cartella

  function leggi() { try { return localStorage.getItem(CHIAVE); } catch (e) { return null; } }
  function salva(v) { try { localStorage.setItem(CHIAVE, v); } catch (e) {} }

  var caricato = false;
  function caricaTag() {
    if (caricato) return;
    caricato = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("consent", "default", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "denied", analytics_storage: "denied" });
    gtag("js", new Date());
    gtag("config", ADS_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ADS_ID;
    document.head.appendChild(s);
  }

  // Conversione: con consenso la invia, altrimenti non fa nulla. dopo() parte comunque.
  window.lsConversione = function (dopo) {
    if (!caricato || typeof window.gtag !== "function") { if (dopo) dopo(); return; }
    var fatto = false;
    var avanti = function () { if (!fatto) { fatto = true; if (dopo) dopo(); } };
    gtag("event", "conversion", { send_to: CONV, event_callback: avanti });
    setTimeout(avanti, 1200);
  };

  // Banner
  var b = document.createElement("div");
  b.className = "cookie";
  b.setAttribute("role", "dialog");
  b.setAttribute("aria-label", t.pref);
  b.innerHTML = '<p></p><div class="cookie-pulsanti"><button type="button" class="no"></button><button type="button" class="si pulsante"></button></div>';
  b.querySelector("p").textContent = t.msg + " ";
  var a = document.createElement("a");
  a.href = privacy;
  a.textContent = t.dett;
  b.querySelector("p").appendChild(a);
  b.querySelector(".si").textContent = t.si;
  b.querySelector(".no").textContent = t.no;
  b.querySelector(".si").onclick = function () { salva("si"); b.hidden = true; caricaTag(); };
  b.querySelector(".no").onclick = function () { salva("no"); b.hidden = true; };
  var scelta = leggi();
  b.hidden = scelta === "si" || scelta === "no";
  document.body.appendChild(b);
  if (scelta === "si") caricaTag();

  // "Preferenze cookie" nel piè di pagina
  var spazio = document.querySelector("footer .contenitore span:last-child");
  if (spazio) {
    var p = document.createElement("a");
    p.href = "#";
    p.textContent = t.pref;
    p.onclick = function (e) { e.preventDefault(); b.hidden = false; };
    spazio.appendChild(document.createTextNode(" · "));
    spazio.appendChild(p);
  }

  // Download: Microsoft Store, programma Windows, zip Mac
  document.querySelectorAll('a[href*="apps.microsoft.com/detail"], a[href*="releases/download/leansolo"]').forEach(function (l) {
    l.addEventListener("click", function (e) {
      if (!caricato) return;            // senza consenso: link normale
      e.preventDefault();
      var dove = l.href, nuova = l.target === "_blank";
      window.lsConversione(function () { if (nuova) window.open(dove, "_blank"); else location.href = dove; });
    });
  });
})();
