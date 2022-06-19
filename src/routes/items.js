const { Router } = require("express");

const router = Router();

//RUTAS GET
router.get("/", async (req, res) => {
  const query = req.query.q || req.body.q;
  res.status(200).json({ Query: query });
});

module.exports = router;
