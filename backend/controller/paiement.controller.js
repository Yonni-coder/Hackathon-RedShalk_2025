// // controller/paiement.controller.js
// const db = require("../db/connectDB");
// const Stripe = require("stripe");
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // clé en .env (test)
// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");
// const PDFDocument = require("pdfkit");

// // ------ multer config pour upload des preuves ------
// const uploadDir = path.join(__dirname, "../uploads/payments");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname) || "";
//     const name = `${Date.now()}_${Math.random().toString(36).slice(2,8)}${ext}`;
//     cb(null, name);
//   }
// });
// const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// // helper : génération de reçu PDF simple
// async function generateReceiptPDF(reservationId, details = {}) {
//   const outDir = path.join(__dirname, "../receipts");
//   if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
//   const filename = `receipt_${reservationId}.pdf`;
//   const filePath = path.join(outDir, filename);

//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument();
//       const stream = fs.createWriteStream(filePath);
//       doc.pipe(stream);

//       doc.fontSize(18).text("Reçu de réservation", { align: "center" });
//       doc.moveDown();
//       doc.fontSize(12).text(`Réservation ID: ${reservationId}`);
//       if (details.client) doc.text(`Client: ${details.client}`);
//       if (details.company) doc.text(`Entreprise: ${details.company}`);
//       if (details.ressource) doc.text(`Ressource: ${details.ressource}`);
//       if (details.start_date) doc.text(`Début: ${details.start_date}`);
//       if (details.end_date) doc.text(`Fin: ${details.end_date}`);
//       if (details.amount) doc.text(`Montant payé: ${details.amount} ${details.currency || ""}`);
//       doc.moveDown();
//       doc.text(`Date émission: ${new Date().toLocaleString()}`);
//       doc.end();

//       stream.on("finish", () => resolve(filePath));
//       stream.on("error", (e) => reject(e));
//     } catch (e) {
//       reject(e);
//     }
//   });
// }

// // === Fonctions exportées ===

// // Méthode interne réutilisable pour créer PaymentIntent (appelée par panier.controller)
// exports.createPaymentIntentInternal = async ({ amount, currency = "usd", metadata = {}, receipt_email = null }) => {
//   // amount en unités (ex: 50.00) -> stripe cents
//   const cents = Math.round(parseFloat(amount) * 100);
//   const pi = await stripe.paymentIntents.create({
//     amount: cents,
//     currency,
//     metadata,
//     receipt_email
//   });
//   return { clientSecret: pi.client_secret, intentId: pi.id, raw: pi };
// };

// // Endpoint public pour créer un intent (optionnel)
// exports.createPaymentIntent = async (req, res) => {
//   try {
//     const { amount, currency = "usd", reservationIds = [] } = req.body;
//     if (!amount) return res.status(400).json({ message: "amount requis" });

//     const meta = { reservationIds: JSON.stringify(reservationIds) };
//     const pi = await exports.createPaymentIntentInternal({ amount, currency, metadata: meta, receipt_email: req.user?.email || null });

//     // store in payments table
//     if (req.user) {
//       await db.query("INSERT INTO payments (user_id, stripe_intent_id, amount, currency, status, metadata) VALUES (?, ?, ?, ?, ?, ?)",
//         [req.user.id, pi.intentId, amount, currency, "created", JSON.stringify(meta)]);
//     }

//     res.json({ clientSecret: pi.clientSecret, paymentAmount: amount });
//   } catch (err) {
//     console.error("createPaymentIntent error:", err);
//     res.status(500).json({ message: "Erreur création PaymentIntent" });
//   }
// };

// // Webhook stripe
// exports.stripeWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Webhook signature error:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // gérer payment_intent.succeeded
//   if (event.type === "payment_intent.succeeded") {
//     const pi = event.data.object;
//     const meta = pi.metadata || {};
//     let reservationIds = [];
//     try { reservationIds = JSON.parse(meta.reservationIds || "[]"); } catch(e) { reservationIds = []; }

//     try {
//       // mettre payments.status = succeeded
//       await db.query("UPDATE payments SET status = 'succeeded' WHERE stripe_intent_id = ?", [pi.id]);

//       // pour chaque reservation : set status en_attente_validation et générer reçu
//       for (const rid of reservationIds) {
//         // récupérer données pour reçu
//         const [rows] = await db.query(
//           `SELECT r.id, r.price, r.start_date, r.end_date, u.fullname as client_name, res.name as ressource_name, comp.name as company_name
//            FROM reservations r
//            JOIN users u ON r.user_id = u.id
//            JOIN ressources res ON r.ressource_id = res.id
//            JOIN companies comp ON res.company_id = comp.id
//            WHERE r.id = ?`, [rid]);

//         if (rows.length === 0) {
//           console.warn("Reservation non trouvée pour receipt:", rid);
//           continue;
//         }

//         const info = rows[0];
//         // générer reçu PDF
//         const receiptPath = await generateReceiptPDF(rid, {
//           client: info.client_name,
//           company: info.company_name,
//           ressource: info.ressource_name,
//           start_date: info.start_date,
//           end_date: info.end_date,
//           amount: info.price,
//           currency: pi.currency
//         });

//         // mettre à jour reservation et stocker path (relative)
//         const relativePath = `/receipts/${path.basename(receiptPath)}`;
//         await db.query("UPDATE reservations SET status = 'en_attente_validation', receipt_url = ? WHERE id = ?", [relativePath, rid]);
//       }
//     } catch (e) {
//       console.error("Erreur traitement webhook succeeded:", e);
//       // Ne pas échouer le webhook ; log seulement
//     }
//   }

//   // gérer d'autres events (ex: payment_intent.payment_failed)
//   if (event.type === "payment_intent.payment_failed") {
//     const pi = event.data.object;
//     // marquer payment failed
//     await db.query("UPDATE payments SET status = 'failed' WHERE stripe_intent_id = ?", [pi.id]);

//     // si metadata ReservationIds présent => remettre les ressources en libre et reservations en cancelled
//     const meta = pi.metadata || {};
//     let reservationIds = [];
//     try { reservationIds = JSON.parse(meta.reservationIds || "[]"); } catch(e) { reservationIds = []; }
//     for (const rid of reservationIds) {
//       try {
//         const [resRows] = await db.query("SELECT ressource_id FROM reservations WHERE id = ?", [rid]);
//         if (resRows.length) {
//           await db.query("UPDATE ressources SET status = 'libre' WHERE id = ?", [resRows[0].ressource_id]);
//         }
//         await db.query("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [rid]);
//       } catch (e) {
//         console.error("Erreur rollback après paiement failed for reservation", rid, e);
//       }
//     }
//   }

//   res.json({ received: true });
// };

// // Upload preuve (multer middleware) -> wrapper pour usage dans routes
// exports.uploadProof = [
//   // multer middleware
//   (req, res, next) => upload.single("proof")(req, res, (err) => {
//     if (err) {
//       console.error("Multer error:", err);
//       return res.status(400).json({ message: "Erreur upload fichier", details: err.message });
//     }
//     next();
//   }),
//   // handler
//   async (req, res) => {
//     try {
//       const reservationId = req.params.reservationId;
//       const userId = req.user.id;
//       // vérifier reservation existe et appartient à user (ou user manager/admin)
//       const [rows] = await db.query("SELECT * FROM reservations WHERE id = ?", [reservationId]);
//       if (rows.length === 0) return res.status(404).json({ message: "Réservation non trouvée" });
//       const reservation = rows[0];
//       if (req.user.role === "client" && reservation.user_id !== userId) {
//         return res.status(403).json({ message: "Accès refusé à cette réservation" });
//       }

//       if (!req.file) return res.status(400).json({ message: "Fichier proof manquant (field name: proof)" });

//       const fileRelative = `/uploads/payments/${req.file.filename}`;
//       // Enregistrer comme preuve dans payments table (création d'un enregistrement lié si besoin)
//       // Ici on crée une entrée payments avec status 'proof_uploaded'
//       await db.query(
//         "INSERT INTO payments (user_id, stripe_intent_id, amount, currency, status, metadata) VALUES (?, ?, ?, ?, ?, ?)",
//         [userId, null, reservation.price || 0, "usd", "proof_uploaded", JSON.stringify({ reservationId, proof: fileRelative })]
//       );

//       // mettre reservation à 'pending_manual_validation'
//       await db.query("UPDATE reservations SET status = 'pending_manual_validation' WHERE id = ?", [reservationId]);

//       res.json({ message: "Preuve uploadée avec succès", proofUrl: fileRelative });
//     } catch (err) {
//       console.error("uploadProof error:", err);
//       res.status(500).json({ message: "Erreur lors de l'upload de la preuve" });
//     }
//   }
// ];

// // GET /api/paiement/receipt/:reservationId -> renvoie fichier si existe
// exports.getReceiptFile = async (req, res) => {
//   try {
//     const reservationId = req.params.reservationId;
//     // vérifier existance
//     const [rows] = await db.query("SELECT receipt_url FROM reservations WHERE id = ?", [reservationId]);
//     if (rows.length === 0) return res.status(404).json({ message: "Réservation non trouvée" });
//     const rec = rows[0].receipt_url;
//     if (!rec) return res.status(404).json({ message: "Aucun reçu disponible pour cette réservation" });

//     // rec contient par ex "/receipts/receipt_123.pdf" -> on récupère path absolu
//     const filePath = path.join(__dirname, "..", rec);
//     if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Fichier reçu introuvable" });

//     res.download(filePath, (err) => {
//       if (err) console.error("Erreur téléchargement reçu:", err);
//     });
//   } catch (err) {
//     console.error("getReceiptFile error:", err);
//     res.status(500).json({ message: "Erreur lors de la récupération du reçu" });
//   }
// };
