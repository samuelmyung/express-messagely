"use strict";

const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { NotFoundError } = require("./expressError");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING username`,
      [username, hashedPassword, first_name, last_name, phone]);

    return res.json(result.rows[0]);
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
        FROM users
        WHERE username = $1`
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
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

  }

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
