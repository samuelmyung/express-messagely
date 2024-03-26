"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", async function (req, res, next) {
  const id = req.params.id;
  const message = await Message.get(id);

  if (res.locals.user.username === message.from_user.username ||
    res.locals.user.username === message.to_user.username) {
    return res.json({ message });
  }
  throw new UnauthorizedError("Must be to_user or from_user to access");
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {

  const fromUsername = res.locals.user.username;
  const { toUsername, body } = req.body;
  const message = await Message.create({ fromUsername, toUsername, body });
  return res.json({ message });

});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', async function (req, res, next) {
  const results = await Message.get(req.params.id);
  const toUsername = results.to_user.username;

  if (res.locals.user.username === toUsername) {
    const message = await Message.markRead(req.params.id);
    return res.json({ message });
  }
  throw new UnauthorizedError("Must be the recipient of message to mark as read");


});


module.exports = router;