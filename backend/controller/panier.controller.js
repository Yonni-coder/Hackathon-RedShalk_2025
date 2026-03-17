// controller/panier.controller.js
const db = require("../db/connectDB");
const paiementController = require("./paiement.controller"); // on réutilise des fonctions de paiement ici
// helper déjà présent dans reservation.controller.js : formatForMySQL, checkReservationConflict
// On redéfinit formatForMySQL minimale ici (ou assume import) — je garde une copie légère
const formatForMySQL = (isoDate) => {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
};

// getOrCreateCart
async function getOrCreateCartForUser(userId) {
  const [rows] = await db.query("SELECT * FROM carts WHERE user_id = ?", [userId]);
  if (rows.length > 0) return rows[0];
  const [result] = await db.query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
  const [newCart] = await db.query("SELECT * FROM carts WHERE id = ?", [result.insertId]);
  return newCart[0];
}

// NOTE: on suppose que checkReservationConflict existe dans reservation.controller.js
// Pour éviter cycles d'import, on recalcule un check simple ici (overlap logic)
// Cette version réutilise la même logique SQL que ton controller reservations.
async function checkReservationConflict(ressourceId, startDate, endDate, excludeId=null) {
  const formattedStart = formatForMySQL(startDate);
  const formattedEnd = formatForMySQL(endDate);
  if (!formattedStart || !formattedEnd) throw new Error("Dates invalides passées à checkReservationConflict");

  let query = `
    SELECT * FROM reservations 
    WHERE ressource_id = ? 
    AND status NOT IN ('cancelled', 'completed')
    AND (
      (start_date BETWEEN ? AND ?) 
      OR (end_date BETWEEN ? AND ?) 
      OR (start_date <= ? AND end_date >= ?)
    )
  `;
  const params = [ressourceId, formattedStart, formattedEnd, formattedStart, formattedEnd, formattedStart, formattedEnd];
  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }
  const [rows] = await db.query(query, params);
  return rows.length > 0;
}

// POST /api/panier/items
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ressource_id, start_date, end_date, price, qty } = req.body;

    if (!ressource_id || !start_date || !end_date || price === undefined) {
      return res.status(400).json({ message: "Champs obligatoires manquants: ressource_id, start_date, end_date, price" });
    }

    // vérifier ressource existante
    const [r] = await db.query("SELECT id FROM ressources WHERE id = ?", [ressource_id]);
    if (r.length === 0) return res.status(404).json({ message: "Ressource non trouvée" });

    const cart = await getOrCreateCartForUser(userId);

    const formattedStart = formatForMySQL(start_date);
    const formattedEnd = formatForMySQL(end_date);
    if (!formattedStart || !formattedEnd) return res.status(400).json({ message: "Dates invalides" });

    // petite vérif immédiate de conflit — utile UX
    const conflict = await checkReservationConflict(ressource_id, formattedStart, formattedEnd);
    if (conflict) {
      return res.status(409).json({ message: "Conflit : la ressource est déjà réservée pour cette période" });
    }

    const [insert] = await db.query(
      "INSERT INTO cart_items (cart_id, ressource_id, start_date, end_date, price, qty) VALUES (?, ?, ?, ?, ?, ?)",
      [cart.id, ressource_id, formattedStart, formattedEnd, price, qty || 1]
    );

    const [itemRows] = await db.query("SELECT * FROM cart_items WHERE id = ?", [insert.insertId]);
    return res.status(201).json({ message: "Item ajouté au panier", item: itemRows[0] });
  } catch (err) {
    console.error("panier.addToCart error:", err);
    return res.status(500).json({ message: "Erreur lors de l'ajout au panier" });
  }
};

// GET /api/panier
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const [cartRows] = await db.query("SELECT * FROM carts WHERE user_id = ?", [userId]);
    if (cartRows.length === 0) return res.json({ cartId: null, items: [], total: 0 });

    const cart = cartRows[0];
    const [items] = await db.query(
      `SELECT ci.*, r.name as ressource_name, r.location 
       FROM cart_items ci
       JOIN ressources r ON ci.ressource_id = r.id
       WHERE ci.cart_id = ?`,
      [cart.id]
    );
    const total = items.reduce((s, it) => s + parseFloat(it.price) * it.qty, 0);
    res.json({ cartId: cart.id, items, total });
  } catch (err) {
    console.error("panier.getCart error:", err);
    res.status(500).json({ message: "Erreur lors de la récupération du panier" });
  }
};

// DELETE /api/panier/items/:id
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const [rows] = await db.query(
      `SELECT ci.* FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE ci.id = ? AND c.user_id = ?`,
      [itemId, userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Item non trouvé dans votre panier" });

    await db.query("DELETE FROM cart_items WHERE id = ?", [itemId]);
    res.json({ message: "Item supprimé du panier" });
  } catch (err) {
    console.error("panier.removeCartItem error:", err);
    res.status(500).json({ message: "Erreur lors de la suppression de l'item" });
  }
};

// POST /api/panier/checkout
// body: { payFull: boolean, currency: 'usd'|'ariary', customerEmail }
exports.checkoutCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { payFull = false, currency = "usd", customerEmail } = req.body;

    // récupérer panier
    const [cartRows] = await db.query("SELECT * FROM carts WHERE user_id = ?", [userId]);
    if (cartRows.length === 0) return res.status(400).json({ message: "Panier vide" });
    const cart = cartRows[0];

    const [items] = await db.query("SELECT * FROM cart_items WHERE cart_id = ?", [cart.id]);
    if (items.length === 0) return res.status(400).json({ message: "Panier vide" });

    // vérifier conflit pour chaque item
    for (const it of items) {
      const conflict = await checkReservationConflict(it.ressource_id, it.start_date, it.end_date);
      if (conflict) return res.status(409).json({ message: `Conflit pour la ressource ${it.ressource_id}` });
    }

    // créer reservations temporaires (status pending_payment) et réserver les ressources
    const reservationIds = [];
    for (const it of items) {
      const priceTotal = (parseFloat(it.price) * it.qty).toFixed(2);
      const [r] = await db.query(
        `INSERT INTO reservations (ressource_id, user_id, start_date, end_date, notes, status, price)
         VALUES (?, ?, ?, ?, ?, 'pending_payment', ?)`,
        [it.ressource_id, userId, it.start_date, it.end_date, null, priceTotal]
      );
      // bloquer temporairement la ressource pour éviter double booking
      await db.query("UPDATE ressources SET status = 'reserve' WHERE id = ?", [it.ressource_id]);
      reservationIds.push(r.insertId);
    }

    // calcul total & montant à payer (acompte 30% si payFull=false)
    const total = items.reduce((s, it) => s + parseFloat(it.price) * it.qty, 0);
    const amountToPay = payFull ? total : Math.round(total * 0.3 * 100) / 100;

    // créer PaymentIntent via paiement.controller (qui gère stripe)
    const meta = { reservationIds: JSON.stringify(reservationIds), userId, cartId: cart.id };
    const paymentIntent = await paiementController.createPaymentIntentInternal({
      amount: amountToPay,
      currency,
      metadata: meta,
      receipt_email: customerEmail || req.user.email
    });

    // enregistrer payment en DB
    await db.query(
      "INSERT INTO payments (user_id, stripe_intent_id, amount, currency, status, metadata) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, paymentIntent.intentId, amountToPay, currency, "created", JSON.stringify(meta)]
    );

    res.json({
      message: "Checkout initié",
      clientSecret: paymentIntent.clientSecret,
      paymentAmount: amountToPay,
      reservationIds
    });
  } catch (err) {
    console.error("panier.checkoutCart error:", err);
    res.status(500).json({ message: "Erreur lors du checkout" });
  }
};
