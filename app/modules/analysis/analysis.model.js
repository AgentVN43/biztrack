const db = require("../../config/db.config");

const AnalysisModel = {
  async findInvoicesWithFilters(fields, filter, sort, page, limit) {
    let selectClause = "*";
    if (fields) {
      selectClause = fields
        .split(",")
        .map((field) => db.escapeId(field.trim()))
        .join(", ");
    }

    let whereClause = "WHERE 1=1"; // Default to select all
    if (filter) {
      for (const field in filter) {
        const conditions = filter[field];
        for (const operator in conditions) {
          const value = conditions[operator];
          const escapedField = db.escapeId(field);
          switch (operator.toLowerCase()) {
            case "eq":
              whereClause += ` AND ${escapedField} = ${db.escape(value)}`;
              break;
            case "ne":
              whereClause += ` AND ${escapedField} != ${db.escape(value)}`;
              break;
            case "gt":
              whereClause += ` AND ${escapedField} > ${db.escape(value)}`;
              break;
            case "gte":
              whereClause += ` AND ${escapedField} >= ${db.escape(value)}`;
              break;
            case "lt":
              whereClause += ` AND ${escapedField} < ${db.escape(value)}`;
              break;
            case "lte":
              whereClause += ` AND ${escapedField} <= ${db.escape(value)}`;
              break;
            case "like":
              whereClause += ` AND ${escapedField} LIKE ${db.escape(
                `%${value}%`
              )}`;
              break;
            default:
              console.warn(`Operator "${operator}" không được hỗ trợ.`);
          }
        }
      }
    }

    let orderByClause = "";
    if (sort) {
      const sortFields = sort.split(",");
      const sortParts = sortFields.map((s) => {
        const trimmed = s.trim();
        const direction = trimmed.startsWith("-") ? "DESC" : "ASC";
        const field = db.escapeId(
          direction === "DESC" ? trimmed.substring(1) : trimmed
        );
        return `${field} ${direction}`;
      });
      orderByClause = `ORDER BY ${sortParts.join(", ")}`;
    }

    const limitClause = limit ? `LIMIT ${db.escape(parseInt(limit))}` : "";
    const offsetClause =
      page && limit
        ? `OFFSET ${db.escape((parseInt(page) - 1) * parseInt(limit))}`
        : "";

    const query = `SELECT ${selectClause} FROM invoices ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`;

    try {
      const [results] = await db.promise().query(query);
      return results;
    } catch (error) {
      console.error("Lỗi ở Model khi lấy hóa đơn với bộ lọc:", error);
      throw error;
    }
  },

  async countInvoicesWithFilters(filter) {
    let whereClause = "WHERE 1=1";
    if (filter) {
      for (const field in filter) {
        const conditions = filter[field];
        for (const operator in conditions) {
          const value = conditions[operator];
          const escapedField = db.escapeId(field);
          switch (operator.toLowerCase()) {
            case "eq":
              whereClause += ` AND ${escapedField} = ${db.escape(value)}`;
              break;
            case "ne":
              whereClause += ` AND ${escapedField} != ${db.escape(value)}`;
              break;
            case "gt":
              whereClause += ` AND ${escapedField} > ${db.escape(value)}`;
              break;
            case "gte":
              whereClause += ` AND ${escapedField} >= ${db.escape(value)}`;
              break;
            case "lt":
              whereClause += ` AND ${escapedField} < ${db.escape(value)}`;
              break;
            case "lte":
              whereClause += ` AND ${escapedField} <= ${db.escape(value)}`;
              break;
            case "like":
              whereClause += ` AND ${escapedField} LIKE ${db.escape(
                `%${value}%`
              )}`;
              break;
            default:
              console.warn(`Operator "${operator}" không được hỗ trợ.`);
          }
        }
      }
    }

    const query = `SELECT COUNT(*) AS total FROM invoices ${whereClause}`;
    try {
      const [results] = await db.promise().query(query);
      return results[0].total;
    } catch (error) {
      console.error("Lỗi ở Model khi đếm hóa đơn với bộ lọc:", error);
      throw error;
    }
  },

  async getRevenueByTimePeriod(period, startDate, endDate) {
    let groupByClause;
    let dateFormat;

    switch (period.toLowerCase()) {
      case "day":
        groupByClause = "DATE(i.issued_date)";
        dateFormat = "%Y-%m-%d";
        break;
      case "week":
        groupByClause = "WEEK(i.issued_date, 3)";
        dateFormat = "%Y-W%v";
        break;
      case "month":
        groupByClause = 'DATE_FORMAT(i.issued_date, "%Y-%m")';
        dateFormat = "%Y-%m";
        break;
      case "year":
        groupByClause = "YEAR(i.issued_date)";
        dateFormat = "%Y";
        break;
      default:
        throw new Error(
          'Tham số "period" không hợp lệ (day, week, month, year).'
        );
    }

    let whereClause =
      "WHERE o.order_status = 'Hoàn tất' AND i.invoice_type = 'sale_invoice'";
    const conditions = [];
    if (startDate) {
      conditions.push(`DATE(i.issued_date) >= ${db.escape(startDate)}`);
    }
    if (endDate) {
      conditions.push(`DATE(i.issued_date) <= ${db.escape(endDate)}`);
    }
    if (conditions.length > 0) {
      whereClause += " AND " + conditions.join(" AND ");
    }

    const query = `
      SELECT
          ${groupByClause} AS time_period,
          SUM(i.final_amount) AS total_revenue
      FROM invoices i
      INNER JOIN orders o ON i.order_id = o.order_id
      WHERE o.order_status = 'Hoàn tất' AND i.invoice_type = 'sale_invoice'
      GROUP BY time_period
      ORDER BY time_period;
    `;

    try {
      const [results] = await db.promise().query(query);
      return results;
    } catch (error) {
      console.error(
        "Lỗi ở Model khi lấy thống kê doanh thu (theo order hoàn tất):",
        error
      );
      throw error;
    }
  },

  async getOutstandingDebt() {
    try {
      const query = `
        SELECT
          SUM(CASE WHEN status NOT IN ('paid', 'cancelled') THEN final_amount ELSE 0 END) AS total_outstanding,
          SUM(CASE WHEN invoice_type = 'sale_invoice' AND status NOT IN ('cancelled') THEN final_amount ELSE 0 END) AS total_receivable
        FROM invoices
      `;
      const [results] = await db.promise().query(query);
      return results[0];
    } catch (error) {
      console.error("Lỗi ở Model khi lấy thống kê công nợ và phải thu:", error);
      throw error;
    }
  },

  async getReceivableOrders() {
    try {
      const query = `
        SELECT
          i.invoice_id,
          i.invoice_code,
          i.order_id,
          i.final_amount,
          i.status AS invoice_status,
          o.order_code,
          o.order_date,
          o.order_status
        FROM invoices i
        LEFT JOIN orders o ON i.order_id = o.order_id
        WHERE i.invoice_type = 'sale_invoice'
          AND i.status NOT IN ('paid', 'cancelled')
      `;
      const [results] = await db.promise().query(query);
      return results;
    } catch (error) {
      console.error("Lỗi ở Model khi lấy danh sách order phải thu:", error);
      throw error;
    }
  },

  async getPayablePurchaseOrders() {
    try {
      const query = `
        SELECT
          i.invoice_id,
          i.invoice_code,
          i.supplier_id,
          i.total_amount AS purchase_amount,
          i.status AS invoice_status
        FROM invoices i
        WHERE i.invoice_type = 'purchase_invoice'
          AND i.status NOT IN ('paid', 'cancelled')
      `;
      const [results] = await db.promise().query(query);
      return results;
    } catch (error) {
      console.error(
        "Lỗi ở Model khi lấy danh sách purchase order phải trả:",
        error
      );
      throw error;
    }
  },
};

module.exports = AnalysisModel;
