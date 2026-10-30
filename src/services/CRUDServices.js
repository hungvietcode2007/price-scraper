const connection = require("../config/database");
const addProductInfo = async (values, singleConnection = connection) => {
  try {
    const [results] = await singleConnection.query(
      `
        INSERT INTO products (platform,product_code,url,name,image_url,current_price)
        VALUES ?
        ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        current_price = VALUES(current_price),
        image_url=VALUES(image_url),
        name=VALUES(name),
        current_price=VALUES(current_price)
        `,
      [values],
    );
    return results;
  } catch (error) {
    console.log(`Lỗi từ DB: ${error.message}`);
    throw error;
  }
};
const addPriceToHistory = async (
  product_id,
  price,
  singleConnection = connection,
) => {
  try {
    await singleConnection.query(
      `
    INSERT INTO price_history(product_id,price)
    VALUES (?,?)
    `,
      [product_id, price],
    );
  } catch (error) {
    throw error;
  }
};
const addUser = async (email, access_token, singleConnection = connection) => {
  try {
    const [results] = await singleConnection.query(
      `
            INSERT INTO user(email,access_token)
            VALUES(?,?)
            ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id)
            `,
      [email, access_token],
    );
    return results;
  } catch (error) {
    throw error;
  }
};
const addSubscriptions = async (
  product_id,
  user_id,
  target_price,
  singleConnection = connection,
) => {
  try {
    await singleConnection.query(
      `
    INSERT INTO subscriptions(product_id,user_id,target_price)
    VALUES (?,?,?)
    ON DUPLICATE KEY UPDATE
    target_price = VALUES(target_price)
    `,
      [product_id, user_id, target_price],
    );
  } catch (error) {
    throw error;
  }
};
const linkWorkflow = async (values) => {
  const singleConnection = await connection.getConnection();
  try {
    await singleConnection.beginTransaction();
    const results = await addProductInfo(values, singleConnection);
    const product_id = results.insertId;
    await addPriceToHistory(product_id, values[0][5], singleConnection);
    return product_id;
  } catch (error) {
    await singleConnection.rollback();
    console.error("Có lỗi xảy ra, đã rollback dữ liệu:", error.message);
    throw error;
  } finally {
    singleConnection.release();
  }
};
const userWorkflow = async (product_id, email, access_token, target_price) => {
  const singleConnection = await connection.getConnection();
  try {
    await singleConnection.beginTransaction();
    const results2 = await addUser(email, access_token);
    const user_id = results2.insertId;
    await addSubscriptions(product_id, user_id, target_price, singleConnection);
    await singleConnection.commit();
  } catch (error) {
    await singleConnection.rollback();
    console.error("Có lỗi xảy ra, đã rollback dữ liệu:", error.message);
    throw error;
  } finally {
    singleConnection.release();
  }
};
const getProductInfo = async (platform, product_code) => {
  const [results] = await connection.query(
    `
        SELECT id,platform,product_code,url,name,image_url,current_price FROM products WHERE platform=? AND product_code=?
        `,
    [platform, product_code],
  );
  return results;
};
const getHistoryPrice = async (platform, product_code) => {
  try {
    const [results] = await connection.query(
      `
    SELECT 
    ph.price,
    ph.recorded_at,
    pr.id
    FROM price_history ph
    INNER JOIN products pr ON pr.id=ph.product_id
    WHERE pr.platform=? AND pr.product_code=? AND recorded_at >= NOW() - INTERVAL 30 DAY
    ORDER BY recorded_at ASC
        `,
      [platform, product_code],
    );
    return results;
  } catch (error) {
    console.error("Có lỗi xảy ra, đã rollback dữ liệu:", error.message);
    throw error;
  }
};
const getProductInfoFromId = async (id) => {
  try {
    const [results] = await connection.query(
      `SELECT * FROM products WHERE id=?`,
      [id],
    );
    return results;
  } catch (error) {
    throw error;
  }
};
const getAllProductInfo = async () => {
  try {
    const [results] = await connection.query(
      `
      SELECT * FROM products
      `,
    );
    return results;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getPersonalProduct = async (access_token) => {
  try {
    const [results] = await connection.query(
      `
    SELECT
    u.id AS user_id,
    s.target_price,
    p.id AS product_id,
    p.product_code,
    p.platform,
    p.url,
    p.name,
    p.image_url,
    p.current_price,
    u.email
    FROM subscriptions s
    INNER JOIN user u ON u.id=s.user_id
    INNER JOIN products p ON p.id=s.product_id
    WHERE u.access_token=?
    GROUP BY u.email,u.id,s.target_price,p.id,p.product_code,p.platform,p.url,p.name,p.image_url,p.current_price
    `,
      [access_token],
    );
    return results;
  } catch (error) {
    throw error;
  }
};
const deleteSubscription = async (user_id, product_id) => {
  await connection.query(
    `
    DELETE FROM subscriptions WHERE user_id=? AND product_id=?
    `,
    [user_id, product_id],
  );
};
const getSubscriptionInfo = async (product_id) => {
  try {
    const [results] = await connection.query(
      `
    SELECT
    s.target_price, 
    s.user_id,
    u.email,
    u.access_token
    FROM subscriptions s
    INNER JOIN user u ON u.id=s.user_id
    WHERE s.product_id=? AND notified_at IS NULL
    `,
      [product_id],
    );
    return results;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const updateNotified = async (product_id, user_id) => {
  await connection.query(
    `
    UPDATE subscriptions
    SET notified_at=NOW()
    WHERE product_id=? AND user_id=?
    `,
    [product_id, user_id],
  );
};
const getUserInfo = async (email) => {
  const [results] = await connection.query(
    `SELECT access_token FROM user WHERE email=?`,
    [email],
  );
  return results;
};
module.exports = {
  addProductInfo,
  addPriceToHistory,
  addSubscriptions,
  addUser,
  linkWorkflow,
  userWorkflow,
  getProductInfo,
  getHistoryPrice,
  getProductInfoFromId,
  getAllProductInfo,
  getPersonalProduct,
  deleteSubscription,
  getSubscriptionInfo,
  getUserInfo,
  updateNotified,
};
