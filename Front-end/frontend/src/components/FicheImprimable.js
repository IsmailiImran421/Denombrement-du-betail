import { useRef } from "react";

/* ──────────────────────────────────────────
   FicheImprimable
   Props :
     type       : "inscription" | "collection" | "bouclage"
     comite     : objet comité (peut être null pour moqaddem)
     user       : utilisateur connecté
     onClose    : callback pour fermer la prévisualisation
   ────────────────────────────────────────── */
function FicheImprimable({ type, comite, user, onClose }) {
  const ficheRef = useRef();

  function handlePrint() {
    const printContents = ficheRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <title>Fiche de ${type === "inscription" ? "Inscription" : type === "collection" ? "Collection" : "Bouclage"}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri&family=Cairo:wght@400;600;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Cairo', 'Segoe UI', sans-serif;
            font-size: 13px;
            color: #111;
            background: #fff;
            padding: 20px 30px;
          }
          /* ── En-tête ── */
          .fiche-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1a5c38;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .fiche-header .bloc-ar {
            text-align: right;
            direction: rtl;
            font-family: 'Amiri', serif;
            font-size: 13px;
            line-height: 1.7;
          }
          .fiche-header .bloc-fr {
            text-align: left;
            font-size: 12px;
            line-height: 1.7;
          }
          .fiche-header .logo-center {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }
          .fiche-header img {
            width: 60px;
            height: 60px;
            object-fit: contain;
          }
          .fiche-header .kingdom {
            font-size: 10px;
            font-weight: 700;
            text-align: center;
            color: #1a5c38;
            letter-spacing: 0.5px;
          }
          /* ── Titre ── */
          .fiche-title {
            text-align: center;
            margin: 10px 0 18px;
          }
          .fiche-title h1 {
            font-size: 16px;
            font-weight: 700;
            color: #1a5c38;
            text-transform: uppercase;
            letter-spacing: 1px;
            border: 2px solid #1a5c38;
            display: inline-block;
            padding: 6px 20px;
            border-radius: 4px;
          }
          .fiche-title .ref {
            margin-top: 6px;
            font-size: 11px;
            color: #555;
          }
          /* ── Sections ── */
          .section {
            margin-bottom: 16px;
          }
          .section-title {
            background: #1a5c38;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 5px 12px;
            border-radius: 3px;
            margin-bottom: 10px;
          }
          /* ── Champs avec pointillés ── */
          .field {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            margin-bottom: 10px;
          }
          .field label {
            font-weight: 600;
            white-space: nowrap;
            font-size: 12px;
            min-width: 160px;
            color: #222;
          }
          .field .dotline {
            flex: 1;
            border-bottom: 1.5px dotted #555;
            height: 18px;
          }
          .field .dotline-short {
            width: 120px;
            border-bottom: 1.5px dotted #555;
            height: 18px;
          }
          /* ── Grille 2 colonnes ── */
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 20px;
          }
          /* ── Tableau animaux ── */
          .animal-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 6px;
          }
          .animal-table th, .animal-table td {
            border: 1px solid #999;
            padding: 6px 10px;
            text-align: center;
          }
          .animal-table thead th {
            background: #d4edda;
            font-weight: 700;
            color: #1a5c38;
          }
          .animal-table tbody tr:nth-child(even) {
            background: #f9f9f9;
          }
          .animal-table .espece-col {
            text-align: left;
            font-weight: 600;
          }
          .animal-table .total-row {
            background: #e8f5e9 !important;
            font-weight: 700;
          }
          .dotcell {
            border-bottom: 1.5px dotted #999 !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
          }
          /* ── Signatures ── */
          .signatures {
            display: grid;
            gap: 20px;
            margin-top: 24px;
          }
          .sig-box {
            text-align: center;
            border: 1px dashed #999;
            border-radius: 6px;
            padding: 12px 10px 8px;
          }
          .sig-box .sig-label {
            font-weight: 700;
            font-size: 11px;
            color: #1a5c38;
            text-transform: uppercase;
            margin-bottom: 30px;
          }
          .sig-box .sig-name-line {
            border-top: 1.5px dotted #555;
            margin-top: 6px;
            padding-top: 4px;
            font-size: 10px;
            color: #888;
          }
          /* ── Pied ── */
          .fiche-footer {
            margin-top: 20px;
            border-top: 1.5px solid #1a5c38;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #777;
          }
          /* ── Notice ── */
          .notice {
            margin-top: 12px;
            padding: 6px 12px;
            background: #fffde7;
            border-left: 3px solid #f59e0b;
            font-size: 10.5px;
            color: #7c5300;
          }
          @media print {
            body { padding: 10px 15px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${printContents}
        <script>
          window.onload = function() { window.print(); }
        <\/script>
      </body>
      </html>
    `);
    win.document.close();
  }

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const comiteInfo = comite
    ? `${comite.nom_comite}`
    : user?.role === "moqaddem"
    ? `Moqaddem : ${user?.nom || ""}`
    : "—";

  const membresInfo = comite?.membres?.length
    ? comite.membres.map((m) => `${m.nom} ${m.prenom}`).join("  –  ")
    : "—";

  /* ════════════════════════════════════════════
      FICHE INSCRIPTION
     ════════════════════════════════════════════ */
  const FicheInscription = () => (
    <>
      <EnTete type="inscription" />
      <div className="fiche-title">
        <h1>Fiche d'Inscription des Éleveurs</h1>
        <div className="ref">
          Date d'édition : {today} &nbsp;|&nbsp; Comité / Responsable :{" "}
          {comiteInfo}
        </div>
      </div>

      {/* Informations éleveur */}
      <div className="section">
        <div className="section-title">🐄 Informations de l'Éleveur</div>
        <div className="grid-2">
          <div className="field">
            <label>Nom :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Prénom :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>N° CIN :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Téléphone :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Commune :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Date naissance :</label>
            <div className="dotline" />
          </div>
        </div>
        <div className="field" style={{ marginTop: "6px" }}>
          <label>Adresse complète :</label>
          <div className="dotline" />
        </div>
      </div>


      {/* Notice */}
      <div className="notice">
        ⚠️ Cette fiche doit être complétée sur le terrain et remise au
        Moqaddem pour saisie informatique. Les champs marqués sont
        obligatoires.
      </div>

      {/* Signatures */}
      <div className="signatures" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="sig-box">
          <div className="sig-label">Signature du Moqaddem</div>
          <div className="sig-name-line">Nom et Cachet</div>
        </div>
        <div className="sig-box">
          <div className="sig-label">Signature de l'Éleveur</div>
          <div className="sig-name-line">Lu et Approuvé</div>
        </div>
      </div>

      <Pied />
    </>
  );

  /* ════════════════════════════════════════════
      FICHE COLLECTION
     ════════════════════════════════════════════ */
  const FicheCollection = () => (
    <>
      <EnTete type="collection" />
      <div className="fiche-title">
        <h1>Fiche de Collecte – Inventaire du Cheptel</h1>
        <div className="ref">
          Date d'édition : {today} &nbsp;
        </div>
      </div>

      {/* Éleveur concerné */}
      <div className="section">
        <div className="section-title">👤 Éleveur Concerné</div>
        <div className="grid-2">
          <div className="field">
            <label>Nom complet :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>N° CIN :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Commune :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Téléphone :</label>
            <div className="dotline" />
          </div>
        </div>
      </div>

      {/* Tableau de collecte */}
      <div className="section">
        <div className="section-title">📊 Données de Dénombrement</div>
        <table className="animal-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Espèce</th>
              <th>Mâles</th>
              <th>Femelles</th>
              <th>Total Espèce</th>
              <th>Observations</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Moutons (Ovin)",
              "Vaches / Bovins",
              "Chèvres (Caprin)",
              "Chamelles / Camelins",
              "Autres",
            ].map((esp) => (
              <tr key={esp}>
                <td className="espece-col">{esp}</td>
                <td>
                  <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </td>
                <td>
                  <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </td>
                <td>
                  <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </td>
                <td>
                  <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td className="espece-col" style={{ fontWeight: 700 }}>
                TOTAL GÉNÉRAL
              </td>
              <td>
                <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
              <td>
                <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
              <td>
                <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Informations complémentaires */}
      <div className="section">
        <div className="section-title">📝 Informations Complémentaires</div>
        <div className="field">
          <label>Date de visite :</label>
          <div className="dotline" />
        </div>
        <div className="field">
          <label>Lieu de recensement :</label>
          <div className="dotline" />
        </div>
        <div
          className="field"
          style={{ alignItems: "flex-start", marginTop: "6px" }}
        >
          <label>Observations :</label>
          <div
            style={{
              flex: 1,
              borderBottom: "1.5px dotted #555",
              height: "40px",
              marginTop: "4px",
            }}
          />
        </div>
      </div>

      <div className="notice">
        ⚠️ Les données collectées sur cette fiche doivent être saisies dans le
        système avant la fin de la journée. Toute rature doit être paraphée.
      </div>

      {/* Signatures – un bloc par membre + éleveur */}
<div className="signatures" style={{ display: 'block' }}>
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
    <thead>
      <tr style={{ background: '#e8f5e9', borderBottom: '2px solid #1a5c38' }}>
        <th style={{ padding: '8px', textAlign: 'left' }}>Rôle</th>
        <th style={{ padding: '8px', textAlign: 'left' }}>Nom</th>
        <th style={{ padding: '8px', textAlign: 'left' }}>Signature</th>
      </tr>
    </thead>
    <tbody>
      {[
        { role: 'Président' },
        { role: 'Vice‑président' },
        { role: 'Secrétaire' },
        { role: 'Vétérinaire' }
      ].map((r, idx) => (
        <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
          <td style={{ padding: '10px 8px', fontWeight: 'bold', width: '25%' }}>{r.role}</td>
          <td style={{ padding: '10px 8px', width: '35%' }}>
            <div className="dotline" style={{ margin: 0 }} />
          </td>
          <td style={{ padding: '10px 8px', width: '40%' }}>
            <div className="dotline" style={{ margin: 0 }} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Signature de l'éleveur */}
  <div className="sig-box" style={{ marginTop: '15px' }}>
    <div className="sig-label">Éleveur</div>
    <div className="field" style={{ marginBottom: '12px' }}>
      <label style={{ minWidth: '50px', fontSize: '11px' }}>Nom :</label>
      <div className="dotline" />
    </div>
    <div className="field" style={{ marginBottom: '0px' }}>
      <label style={{ minWidth: '50px', fontSize: '11px' }}>Signature :</label>
      <div className="dotline" />
    </div>
  </div>
</div>

      <Pied />
    </>
  );

  /* ════════════════════════════════════════════
      FICHE BOUCLAGE
     ════════════════════════════════════════════ */
  const FicheBouclage = () => (
    <>
      <EnTete type="bouclage" />
      <div className="fiche-title">
        <h1>Fiche de Bouclage des Animaux</h1>
        <div className="ref">
          Date d'édition : {today} &nbsp;
        </div>
      </div>

      {/* Éleveur */}
      <div className="section">
        <div className="section-title">👤 Informations Éleveur</div>
        <div className="grid-2">
          <div className="field">
            <label>Nom complet :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>N° CIN :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Commune :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Téléphone :</label>
            <div className="dotline" />
          </div>
        </div>
      </div>

      {/* Opération de bouclage */}
      <div className="section">
        <div className="section-title">🔖 Opération de Bouclage</div>
        <div className="grid-2">
          <div className="field">
            <label>Date de bouclage :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Nb animaux bouclés :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>N° Boucle (début) :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>N° Boucle (fin) :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Responsable bouclage :</label>
            <div className="dotline" />
          </div>
          <div className="field">
            <label>Lieu d'intervention :</label>
            <div className="dotline" />
          </div>
        </div>
      </div>

      {/* Tableau de contrôle */}
      <div className="section">
        <div className="section-title">📋 Récapitulatif par Espèce</div>
        <table className="animal-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Espèce</th>
              <th>Nb animaux présents</th>
              <th>Nb bouclés</th>
              <th>Nb non bouclés</th>
              <th>N° boucles utilisées</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Moutons (Ovin)",
              "Vaches / Bovins",
              "Chèvres (Caprin)",
              "Chamelles / Camelins",
            ].map((esp) => (
              <tr key={esp}>
                <td className="espece-col">{esp}</td>
                <td>
                  <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </td>
                <td>
                  <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </td>
                <td>
                  <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </td>
                <td>
                  <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td className="espece-col">TOTAL</td>
              <td>
                <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
              <td>
                <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
              <td>
                <span className="dotcell">&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Observations */}
      <div className="section">
        <div className="section-title">📝 Observations / Incidents</div>
        <div
          className="field"
          style={{ alignItems: "flex-start", marginTop: "6px" }}
        >
          <div
            style={{
              flex: 1,
              borderBottom: "1.5px dotted #555",
              height: "45px",
            }}
          />
        </div>
      </div>

      <div className="notice">
        ⚠️ Les numéros de boucles manquantes ou illisibles doivent être
        signalés immédiatement au comité. Cette fiche fait office de document
        officiel.
      </div>

      {/* Signatures – un bloc par membre + éleveur */}
      <div className="signatures" style={{ display: 'block' }}>
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
    <thead>
      <tr style={{ background: '#e8f5e9', borderBottom: '2px solid #1a5c38' }}>
        <th style={{ padding: '8px', textAlign: 'left' }}>Rôle</th>
        <th style={{ padding: '8px', textAlign: 'left' }}>Nom</th>
        <th style={{ padding: '8px', textAlign: 'left' }}>Signature</th>
      </tr>
    </thead>
    <tbody>
      {[
        { role: 'Président' },
        { role: 'Vice‑président' },
        { role: 'Secrétaire' },
        { role: 'Vétérinaire' }
      ].map((r, idx) => (
        <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
          <td style={{ padding: '10px 8px', fontWeight: 'bold', width: '25%' }}>{r.role}</td>
          <td style={{ padding: '10px 8px', width: '35%' }}>
            <div className="dotline" style={{ margin: 0 }} />
          </td>
          <td style={{ padding: '10px 8px', width: '40%' }}>
            <div className="dotline" style={{ margin: 0 }} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Signature de l'éleveur */}
  <div className="sig-box" style={{ marginTop: '15px' }}>
    <div className="sig-label">Éleveur</div>
    <div className="field" style={{ marginBottom: '12px' }}>
      <label style={{ minWidth: '50px', fontSize: '11px' }}>Nom :</label>
      <div className="dotline" />
    </div>
    <div className="field" style={{ marginBottom: '0px' }}>
      <label style={{ minWidth: '50px', fontSize: '11px' }}>Signature :</label>
      <div className="dotline" />
    </div>
  </div>
</div>

      <Pied />
    </>
  );

  /* ── En-tête officiel Maroc ── */
  function EnTete({ type }) {
    const typeColors = {
      inscription: "#1a5c38",
      collection: "#1e3a8a",
      bouclage: "#7c2d12",
    };
    const color = typeColors[type] || "#1a5c38";
    return (
      <div
        className="fiche-header"
        style={{ borderBottomColor: color }}
      >
        <div className="bloc-fr" style={{ fontSize: "11px" }}>
          <strong>Royaume du Maroc</strong>
          <br />
          Ministère de l'Agriculture
          <br />
          Province d'Errachidia
          <br />
          Direction Provinciale de l'Agriculture
        </div>
        <div className="logo-center">
          <img
            src="/Coat_of_arms_of_Morocco.svg"
            alt="Armoiries du Maroc"
            style={{ width: 55, height: 55 }}
          />
          <div className="kingdom" style={{ color }}>
            المملكة المغربية
          </div>
        </div>
        <div
          className="bloc-ar"
          style={{ fontSize: "11px", direction: "rtl" }}
        >
          <strong>المملكة المغربية</strong>
          <br />
          وزارة الفلاحة
          <br />
          إقليم الراشيدية
          <br />
          المديرية الإقليمية للفلاحة
        </div>
      </div>
    );
  }

  /* ── Pied de page ── */
  function Pied() {
    return (
      <div className="fiche-footer">
        <span>Province d'Errachidia – Système de Dénombrement du Bétail</span>
        <span>
          Édité le {today} – Document officiel à conserver
        </span>
        <span>Page 1 / 1</span>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     RENDU PRINCIPAL (prévisualisation dans l'app)
     ═══════════════════════════════════════════ */
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "20px",
      }}
    >
      {/* ── Barre d'actions (no-print) ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10000,
          background: "#1a5c38",
          color: "#fff",
          padding: "10px 20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          borderRadius: "10px 10px 0 0",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          width: "860px",
          maxWidth: "100%",
        }}
      >
        <span style={{ flex: 1, fontWeight: 700, fontSize: "14px" }}>
          🖨️ Prévisualisation — Fiche de{" "}
          {type === "inscription"
            ? "Inscription"
            : type === "collection"
            ? "Collection"
            : "Bouclage"}
        </span>
        <button
          onClick={handlePrint}
          style={{
            background: "#fff",
            color: "#1a5c38",
            border: "none",
            borderRadius: "6px",
            padding: "8px 18px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🖨️ Imprimer / Enregistrer PDF
        </button>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "6px",
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          ✕ Fermer
        </button>
      </div>

      {/* ── Feuille A4 prévisualisée ── */}
      <div
        ref={ficheRef}
        style={{
          background: "#fff",
          width: "860px",
          maxWidth: "100%",
          padding: "28px 36px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          fontFamily: "'Cairo', 'Segoe UI', sans-serif",
          fontSize: "13px",
          color: "#111",
          borderRadius: "0 0 10px 10px",
        }}
      >
        {/* Styles inline pour la prévisualisation */}
        <style>{`
          .fiche-header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #1a5c38; padding-bottom:12px; margin-bottom:16px; }
          .bloc-ar { text-align:right; direction:rtl; font-family:'Amiri',serif; font-size:11px; line-height:1.7; }
          .bloc-fr { text-align:left; font-size:11px; line-height:1.7; }
          .logo-center { display:flex; flex-direction:column; align-items:center; gap:4px; }
          .kingdom { font-size:10px; font-weight:700; text-align:center; color:#1a5c38; letter-spacing:0.5px; }
          .fiche-title { text-align:center; margin:10px 0 18px; }
          .fiche-title h1 { font-size:15px; font-weight:700; color:#1a5c38; text-transform:uppercase; letter-spacing:1px; border:2px solid #1a5c38; display:inline-block; padding:6px 20px; border-radius:4px; }
          .fiche-title .ref { margin-top:6px; font-size:11px; color:#555; }
          .section { margin-bottom:16px; }
          .section-title { background:#1a5c38; color:#fff; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; padding:5px 12px; border-radius:3px; margin-bottom:10px; }
          .field { display:flex; align-items:flex-end; gap:8px; margin-bottom:10px; }
          .field label { font-weight:600; white-space:nowrap; font-size:12px; min-width:160px; color:#222; }
          .dotline { flex:1; border-bottom:1.5px dotted #555; height:18px; }
          .dotline-short { width:120px; border-bottom:1.5px dotted #555; height:18px; }
          .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:8px 20px; }
          .animal-table { width:100%; border-collapse:collapse; font-size:12px; margin-top:6px; }
          .animal-table th, .animal-table td { border:1px solid #999; padding:6px 10px; text-align:center; }
          .animal-table thead th { background:#d4edda; font-weight:700; color:#1a5c38; }
          .animal-table tbody tr:nth-child(even) { background:#f9f9f9; }
          .espece-col { text-align:left !important; font-weight:600; }
          .total-row { background:#e8f5e9 !important; font-weight:700; }
          .dotcell { min-width:60px; display:inline-block; border-bottom:1.5px dotted #999; }
          .signatures { display:grid; gap:20px; margin-top:24px; }
          .sig-box { text-align:center; border:1px dashed #999; border-radius:6px; padding:12px 10px 8px; }
          .sig-box .sig-label { font-weight:700; font-size:11px; color:#1a5c38; text-transform:uppercase; margin-bottom:30px; }
          .sig-box .sig-name-line { border-top:1.5px dotted #555; margin-top:6px; padding-top:4px; font-size:10px; color:#888; }
          .fiche-footer { margin-top:20px; border-top:1.5px solid #1a5c38; padding-top:8px; display:flex; justify-content:space-between; font-size:10px; color:#777; }
          .notice { margin-top:12px; padding:6px 12px; background:#fffde7; border-left:3px solid #f59e0b; font-size:10.5px; color:#7c5300; }
        `}</style>

        {type === "inscription" && <FicheInscription />}
        {type === "collection" && <FicheCollection />}
        {type === "bouclage" && <FicheBouclage />}
      </div>
    </div>
  );
}

export default FicheImprimable;
