"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { NotFoundError } = require("../expressError");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
        VALUES
          ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
        FROM users
        WHERE username = $1`,
      [username]);
    const user = result.rows[0];

    if (!user) {
      throw new UnauthorizedError("Invalid user/password");
    }
    return await bcrypt.compare(password, user.password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const updatedUser = await db.query(`
    UPDATE users
           SET last_login_at = CURRENT_TIMESTAMP
             WHERE username = $1
             RETURNING username, last_login_at`,
      [username]
    );
    if (!updatedUser.rows[0]) {
      throw new NotFoundError("User not found");
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(`
    SELECT username, first_name, last_name
    FROM users`
    );
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(`
    SELECT username, first_name, last_name, phone, join_at, last_login_at
    FROM users
    WHERE username = $1`,
      [username]
    );
    if (!results.rows[0]) {
      throw new NotFoundError("User Not Found");
    }
    return results.rows[0];
  }

  /** Return messages from this user.
   * Every message sent from this user
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT id, to_username, body, sent_at, read_at, username, first_name,
      last_name, phone
        FROM messages as m
        JOIN users as u ON m.to_username = u.username
        WHERE m.from_username = $1`,
        [username]
    );
    if (!results.rows[0]) {
      throw new NotFoundError("User Not Found");
    }
    const messages = results.rows // [{1, "jacknorquist", hi, 10 pm, 11 pm, jn, jack, nor, 919}, {2, "katemoser", hi, 10 pm, 11 pm}, {3, "edmond", hi, 10 pm, 11 pm}];
    const messageResults = messages.map(m => {
     return {id: m.id,
      to_user: {
        username: m.username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at}
    });

    console.log(messageResults)
    return messageResults;
  }
  // ({
  //   id: m.id,
  //   to_user: {
  //     username: m.username,
  //     first_name: m.first_name,
  //     last_name: m.last_name,
  //     phone: m.phone
  //   },
  //   body: m.body,
  //   sent_at: m.sent_at,
  //   read_at: m.read_at
  // }));


  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
