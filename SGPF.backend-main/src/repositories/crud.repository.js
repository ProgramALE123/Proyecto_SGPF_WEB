import { pool, withTransaction } from '../database/connection.js';

const sanitizeRow = (row, definition) => {
  if (!row) return row;
  const copy = { ...row };
  for (const field of definition.hidden || []) delete copy[field];
  delete copy.__total;
  return copy;
};

const buildWhere = (definition, query = {}) => {
  const clauses = [];
  const values = [];
  for (const field of definition.allowedFilters || []) {
    if (query[field] !== undefined) {
      values.push(query[field]);
      clauses.push(`${definition.table}.${field} = $${values.length}`);
    }
  }
  if (query.search && definition.searchable?.length) {
    values.push(`%${query.search}%`);
    const index = values.length;
    clauses.push(`(${definition.searchable.map((field) => `${definition.table}.${field} ILIKE $${index}`).join(' OR ')})`);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values };
};

export const createCrudRepository = (definition) => ({
  async findAll({ filters = {}, limit, offset }) {
    const { where, values } = buildWhere(definition, filters);
    const select = definition.select || `${definition.table}.*`;
    const joins = definition.joins || '';
    const orderBy = `${definition.orderBy}, ${definition.table}.id ASC`;
    const dataSql = `SELECT ${select}, COUNT(*) OVER()::integer AS __total FROM ${definition.table} ${joins} ${where} ORDER BY ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    const countSql = `SELECT COUNT(*)::integer AS total FROM ${definition.table} ${joins} ${where}`;
    const data = await pool.query(dataSql, [...values, limit, offset]);
    if (data.rows.length) {
      return { data: data.rows.map((row) => sanitizeRow(row, definition)), total: data.rows[0].__total };
    }
    const count = await pool.query(countSql, values);
    return { data: [], total: count.rows[0].total };
  },

  async existsWithVersion(id, version) {
    const result = await pool.query(`SELECT 1 FROM ${definition.table} WHERE id = $1 AND version = $2`, [id, version]);
    return result.rowCount === 1;
  },

  async findById(id) {
    const select = definition.select || `${definition.table}.*`;
    const joins = definition.joins || '';
    const result = await pool.query(`SELECT ${select} FROM ${definition.table} ${joins} WHERE ${definition.table}.id = $1`, [id]);
    return sanitizeRow(result.rows[0], definition);
  },

  async create(payload) {
    const fields = definition.fields.filter((field) => payload[field] !== undefined);
    const placeholders = fields.map((_, index) => `$${index + 1}`);
    const result = await pool.query(
      `INSERT INTO ${definition.table} (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      fields.map((field) => payload[field])
    );
    return sanitizeRow(result.rows[0], definition);
  },

  async update(id, payload, version) {
    const fields = definition.fields.filter((field) => payload[field] !== undefined);
    const setSql = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE ${definition.table} SET ${setSql} WHERE id = $${fields.length + 1} AND version = $${fields.length + 2} RETURNING *`,
      [...fields.map((field) => payload[field]), id, version]
    );
    return sanitizeRow(result.rows[0], definition);
  },

  async remove(id, version) {
    const result = await pool.query(
      `DELETE FROM ${definition.table} WHERE id = $1 AND version = $2 RETURNING *`,
      [id, version]
    );
    return sanitizeRow(result.rows[0], definition);
  }
});

export const createAlineacionWithDetails = async (definition, payload) => {
  const { detalles = [], ...alineacion } = payload;
  const shouldConfirm = alineacion.confirmado === true;
  if (shouldConfirm && detalles.length === 0) {
    const error = new Error('Una alineación confirmada debe incluir detalles');
    error.code = 'P0001';
    throw error;
  }
  return withTransaction(async (client) => {
  alineacion.confirmado = false;
  const fields = definition.fields.filter((field) => alineacion[field] !== undefined);
  const placeholders = fields.map((_, index) => `$${index + 1}`);
  const created = await client.query(
    `INSERT INTO alineaciones (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    fields.map((field) => alineacion[field])
  );
  const alineacionRow = created.rows[0];
  let details = [];
  if (detalles.length) {
    const values = [];
    const groups = detalles.map((detail, index) => {
      const base = index * 8;
      values.push(alineacionRow.id, detail.jugador_id, detail.posicion_en_campo, detail.slot_indice ?? null, detail.titular ?? true, detail.capitan ?? false, detail.minuto_ingreso ?? 0, detail.minuto_salida ?? null);
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
    });
    const result = await client.query(
      `INSERT INTO detalle_alineacion (alineacion_id, jugador_id, posicion_en_campo, slot_indice, titular, capitan, minuto_ingreso, minuto_salida)
       VALUES ${groups.join(', ')}
       RETURNING *`,
      values
    );
    details = result.rows;
  }
  if (shouldConfirm) {
    const confirmed = await client.query('UPDATE alineaciones SET confirmado = TRUE WHERE id = $1 RETURNING *', [alineacionRow.id]);
    return { ...confirmed.rows[0], detalles: details };
  }
  return { ...alineacionRow, detalles: details };
  });
};

export const updateAlineacionWithDetails = async (definition, id, payload, version) => withTransaction(async (client) => {
  const { detalles, ...alineacion } = payload;
  const fields = definition.fields.filter((field) => alineacion[field] !== undefined);
  const setSql = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const updated = await client.query(
    `UPDATE alineaciones SET ${setSql} WHERE id = $${fields.length + 1} AND version = $${fields.length + 2} RETURNING *`,
    [...fields.map((field) => alineacion[field]), id, version]
  );
  if (!updated.rowCount) return null;
  let savedDetails;
  if (detalles !== undefined) {
    await client.query('DELETE FROM detalle_alineacion WHERE alineacion_id = $1', [id]);
    savedDetails = [];
    for (const detail of detalles) {
      const result = await client.query(
        `INSERT INTO detalle_alineacion (alineacion_id, jugador_id, posicion_en_campo, slot_indice, titular, capitan, minuto_ingreso, minuto_salida)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [id, detail.jugador_id, detail.posicion_en_campo, detail.slot_indice ?? null, detail.titular ?? true, detail.capitan ?? false, detail.minuto_ingreso ?? 0, detail.minuto_salida ?? null]
      );
      savedDetails.push(result.rows[0]);
    }
  }
  return { ...updated.rows[0], ...(savedDetails ? { detalles: savedDetails } : {}) };
});
