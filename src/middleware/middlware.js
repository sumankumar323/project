const jwt = require("jsonwebtoken");

//Authentication & Authorization

const mid1 = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"] || req.headers["X-API-KEY"];

    if (!token)
      return res
        .status(401)
        .send({ status: false, msg: "You are not authenticated!" });

    jwt.verify(token, "group no 54", (err, user) => {
      if (err) return res.status(403).json({ status: false, msg: "Token is not valid!" });
      req.userId = user.userId;
      next();
    });
  } catch (err) {
    return res.status(500).send({ msg: "Error", error: err.message });
  }
};

module.exports.mid1 = mid1;
