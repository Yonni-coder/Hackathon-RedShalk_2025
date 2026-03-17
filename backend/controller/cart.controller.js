const db = require("../db/connectDB");

// Obtenir le panier actif de l'utilisateur
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer le panier actif ou en créer un nouveau
    let [cartRows] = await db.query(
      "SELECT * FROM carts WHERE user_id = ? AND status = 'active'",
      [userId]
    );

    let cart;
    if (cartRows.length === 0) {
      // Créer un nouveau panier
      const [result] = await db.query(
        "INSERT INTO carts (user_id) VALUES (?)",
        [userId]
      );
      cart = {
        id: result.insertId,
        user_id: userId,
        total_price: 0,
        items: [],
      };
    } else {
      cart = cartRows[0];
      // Récupérer les éléments du panier
      const [items] = await db.query(
        `
        SELECT ci.*, r.name as ressource_name, r.location as ressource_location
        FROM cart_items ci
        JOIN ressources r ON ci.ressource_id = r.id
        WHERE ci.cart_id = ?
      `,
        [cart.id]
      );

      cart.items = items;
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du panier" });
  }
};

// Ajouter un élément au panier
exports.addToCart = async (req, res) => {
  try {
    const { ressource_id, start_date, end_date, price, notes } = req.body;
    const userId = req.user.id;

    // Validation des champs requis
    const missingFields = [];
    if (!ressource_id) missingFields.push("ressource_id");
    if (!start_date) missingFields.push("start_date");
    if (!end_date) missingFields.push("end_date");
    if (!price) missingFields.push("price");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Champs obligatoires manquants",
        details: `Les champs suivants sont requis : ${missingFields.join(
          ", "
        )}`,
        missingFields: missingFields,
      });
    }

    // Vérifier que le prix est valide
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        message: "Prix invalide",
        details: "Le prix doit être un nombre positif",
      });
    }

    // Vérifier que les dates sont valides
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Dates invalides",
        details: "Les dates de début et de fin doivent être au format valide",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        message: "Dates incohérentes",
        details: "La date de début doit être avant la date de fin",
      });
    }

    // Vérifier que la ressource existe
    const [ressourceRows] = await db.query(
      "SELECT * FROM ressources WHERE id = ?",
      [ressource_id]
    );

    if (ressourceRows.length === 0) {
      return res.status(404).json({ message: "Ressource non trouvée" });
    }

    // Récupérer ou créer le panier actif
    let [cartRows] = await db.query(
      "SELECT * FROM carts WHERE user_id = ? AND status = 'active'",
      [userId]
    );

    let cartId;
    if (cartRows.length === 0) {
      // Créer un nouveau panier
      const [result] = await db.query(
        "INSERT INTO carts (user_id) VALUES (?)",
        [userId]
      );
      cartId = result.insertId;
    } else {
      cartId = cartRows[0].id;
    }

    // Ajouter l'élément au panier
    const [result] = await db.query(
      "INSERT INTO cart_items (cart_id, ressource_id, start_date, end_date, price, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [cartId, ressource_id, start_date, end_date, price, notes || null]
    );

    // Mettre à jour le prix total du panier
    await db.query(
      "UPDATE carts SET total_price = total_price + ? WHERE id = ?",
      [price, cartId]
    );

    // Récupérer l'élément ajouté avec les détails de la ressource
    const [newItem] = await db.query(
      `
      SELECT ci.*, r.name as ressource_name, r.location as ressource_location
      FROM cart_items ci
      JOIN ressources r ON ci.ressource_id = r.id
      WHERE ci.id = ?
    `,
      [result.insertId]
    );

    res.status(201).json({
      message: "Élément ajouté au panier avec succès",
      item: newItem[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'ajout au panier" });
  }
};

// Supprimer un élément du panier
exports.removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;

    // Vérifier que l'élément existe et appartient à l'utilisateur
    const [itemRows] = await db.query(
      `
      SELECT ci.*, c.user_id 
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ?
    `,
      [itemId]
    );

    if (itemRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Élément non trouvé dans le panier" });
    }

    const item = itemRows[0];

    if (item.user_id !== userId) {
      return res.status(403).json({
        message: "Accès refusé",
        details: "Vous ne pouvez supprimer que vos propres éléments du panier",
      });
    }

    // Supprimer l'élément
    await db.query("DELETE FROM cart_items WHERE id = ?", [itemId]);

    // Mettre à jour le prix total du panier
    await db.query(
      "UPDATE carts SET total_price = total_price - ? WHERE id = ?",
      [item.price, item.cart_id]
    );

    res.json({ message: "Élément supprimé du panier avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur lors de la suppression de l'élément du panier",
      });
  }
};

// Vider le panier
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer le panier actif
    const [cartRows] = await db.query(
      "SELECT * FROM carts WHERE user_id = ? AND status = 'active'",
      [userId]
    );

    if (cartRows.length === 0) {
      return res.status(404).json({ message: "Panier non trouvé" });
    }

    const cartId = cartRows[0].id;

    // Supprimer tous les éléments du panier
    await db.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    // Réinitialiser le prix total
    await db.query("UPDATE carts SET total_price = 0 WHERE id = ?", [cartId]);

    res.json({ message: "Panier vidé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du vidage du panier" });
  }
};

// Valider le panier et créer les réservations
exports.checkoutCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer le panier actif avec tous ses éléments
    const [cartRows] = await db.query(
      "SELECT * FROM carts WHERE user_id = ? AND status = 'active'",
      [userId]
    );

    if (cartRows.length === 0) {
      return res.status(404).json({ message: "Panier non trouvé" });
    }

    const cart = cartRows[0];

    // Vérifier que le panier n'est pas vide
    const [items] = await db.query(
      "SELECT * FROM cart_items WHERE cart_id = ?",
      [cart.id]
    );

    if (items.length === 0) {
      return res.status(400).json({ message: "Le panier est vide" });
    }

    // Vérifier les conflits de réservation pour tous les éléments
    const conflicts = [];
    for (const item of items) {
      const hasConflict = await checkReservationConflict(
        item.ressource_id,
        item.start_date,
        item.end_date
      );
      if (hasConflict) {
        conflicts.push({
          item_id: item.id,
          ressource_id: item.ressource_id,
          start_date: item.start_date,
          end_date: item.end_date,
          message: "La ressource est déjà réservée pour cette période",
        });
      }
    }

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "Conflits de réservation détectés",
        details:
          "Certaines ressources ne sont plus disponibles pour les périodes sélectionnées",
        conflicts: conflicts,
      });
    }

    // Créer les réservations pour tous les éléments
    const createdReservations = [];
    for (const item of items) {
      const [result] = await db.query(
        "INSERT INTO reservations (ressource_id, user_id, start_date, end_date, notes, status, price) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
        [
          item.ressource_id,
          userId,
          item.start_date,
          item.end_date,
          item.notes || null,
          item.price,
        ]
      );

      // Mettre à jour le statut de la ressource
      await db.query("UPDATE ressources SET status = 'reserve' WHERE id = ?", [
        item.ressource_id,
      ]);

      createdReservations.push(result.insertId);
    }

    // Marquer le panier comme complété
    await db.query(
      "UPDATE carts SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [cart.id]
    );

    // Vider les éléments du panier
    await db.query("DELETE FROM cart_items WHERE cart_id = ?", [cart.id]);

    res.status(201).json({
      message:
        "Panier validé avec succès. Réservations en attente de validation par les managers.",
      reservation_ids: createdReservations,
      total_price: cart.total_price,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la validation du panier" });
  }
};

// Fonction pour vérifier les conflits de réservation (à réutiliser depuis reservation.controller.js)
const checkReservationConflict = async (
  ressourceId,
  startDate,
  endDate,
  excludeId = null
) => {
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

  let params = [
    ressourceId,
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
  ];

  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.query(query, params);
  return rows.length > 0;
};
