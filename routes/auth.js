"use strict";

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post('/login', function (req, res, next) {

});



router.post("/login-", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const { username, password } = req.body;
  const authenticated = User.authenticate(username, password);


  if (authenticated) {
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

module.exports = router;