const db = require("../db/connectDB");

// Récupère le panier (cart) et ses items, ainsi que fullname + email de l'utilisateur
exports.getAchat = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) récupérer fullname + email
    const [userRows] = await db.query(
      `SELECT fullname, email FROM users WHERE id = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    const user = userRows[0];

    // 2) récupérer le cart actif ou dernier créé
    const [activeCartRows] = await db.query(
      `SELECT id, user_id, status, total_price, created_at, updated_at
       FROM carts
       WHERE user_id = ? AND status = 'active' LIMIT 1`,
      [userId]
    );

    let cart;
    if (activeCartRows.length > 0) {
      cart = activeCartRows[0];
    } else {
      const [lastCartRows] = await db.query(
        `SELECT id, user_id, status, total_price, created_at, updated_at
         FROM carts
         WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      if (lastCartRows.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun panier trouvé pour cet utilisateur" });
      }
      cart = lastCartRows[0];
    }

    // 3) récupérer les items du panier avec le nom du ressource
    const [itemRows] = await db.query(
      `SELECT ci.id, ci.cart_id, ci.ressource_id, r.name AS ressource_name,
              ci.start_date, ci.end_date, ci.price, ci.notes, ci.created_at
       FROM cart_items ci
       JOIN ressources r ON ci.ressource_id = r.id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at ASC`,
      [cart.id]
    );

    return res.status(200).json({
      user, // { fullname, email }
      cart, // { id, user_id, status, total_price, created_at, updated_at }
      items: itemRows, // chaque item contient maintenant ressource_name
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la récupération du panier et des items",
      error: String(error),
    });
  }
};
