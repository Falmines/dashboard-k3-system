const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
*/

async function getColumns() {
  const result = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'corrective_actions'
    ORDER BY ordinal_position
  `);

  return result.rows.map(row => row.column_name);
}

function firstExisting(columns, candidates) {
  return candidates.find(column => columns.includes(column)) || null;
}

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

/*
|--------------------------------------------------------------------------
| GET /api/tindakan
| Ambil semua tindakan korektif
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const columns = await getColumns();

    if (!columns.includes("id")) {
      return res.status(500).json({
        success: false,
        message: "Kolom id tidak ditemukan pada corrective_actions"
      });
    }

    const actionTypeColumn = firstExisting(columns, [
      "action_type"
    ]);

    const descriptionColumn = firstExisting(columns, [
      "description",
      "problem",
      "problem_description",
      "finding",
      "issue"
    ]);

    const priorityColumn = firstExisting(columns, [
      "priority",
      "priority_level"
    ]);

    const assigneeColumn = firstExisting(columns, [
      "assignee",
      "responsible_person",
      "responsible",
      "owner",
      "assigned_to"
    ]);

    const dueDateColumn = firstExisting(columns, [
      "due_date",
      "deadline",
      "target_date",
      "completion_date"
    ]);

    const statusColumn = firstExisting(columns, [
      "status"
    ]);

    /*
    |--------------------------------------------------------------------------
    | SELECT
    |--------------------------------------------------------------------------
    */

    const selectParts = [
      `"id"`
    ];

    if (actionTypeColumn) {
      selectParts.push(
        `${quoteIdentifier(actionTypeColumn)} AS "source"`
      );
    } else {
      selectParts.push(`NULL AS "source"`);
    }

    if (descriptionColumn) {
      selectParts.push(
        `${quoteIdentifier(descriptionColumn)} AS "description"`
      );
    } else {
      selectParts.push(`NULL AS "description"`);
    }

    if (priorityColumn) {
      selectParts.push(
        `${quoteIdentifier(priorityColumn)} AS "priority"`
      );
    } else {
      selectParts.push(`NULL AS "priority"`);
    }

    if (assigneeColumn) {
      selectParts.push(
        `${quoteIdentifier(assigneeColumn)} AS "assignee"`
      );
    } else {
      selectParts.push(`NULL AS "assignee"`);
    }

    if (dueDateColumn) {
      selectParts.push(
        `${quoteIdentifier(dueDateColumn)} AS "due_date"`
      );
    } else {
      selectParts.push(`NULL AS "due_date"`);
    }

    if (statusColumn) {
      selectParts.push(
        `${quoteIdentifier(statusColumn)} AS "status"`
      );
    } else {
      selectParts.push(`NULL AS "status"`);
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const search = String(req.query.search || "").trim();

    let where = "";
    const params = [];

    if (search) {

      const searchableColumns = [
        actionTypeColumn,
        descriptionColumn,
        priorityColumn,
        assigneeColumn,
        statusColumn
      ].filter(Boolean);

      if (searchableColumns.length) {

        where = `
          WHERE ${searchableColumns
            .map(column => `
              CAST(${quoteIdentifier(column)} AS TEXT)
              ILIKE $1
            `)
            .join(" OR ")
          }
        `;

        params.push(`%${search}%`);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY
    |--------------------------------------------------------------------------
    */

    const query = `
      SELECT
        ${selectParts.join(",\n        ")}
      FROM corrective_actions
      ${where}
      ORDER BY id DESC
    `;

    console.log("QUERY TINDAKAN:");
    console.log(query);

    const result = await pool.query(query, params);

    /*
    |--------------------------------------------------------------------------
    | Generate Action Code
    |
    | Tidak membutuhkan kolom action_code di database.
    |--------------------------------------------------------------------------
    */

    const currentYear = new Date().getFullYear();

    const data = result.rows.map(row => ({
      ...row,

      action_code:
        `CA-${currentYear}-${String(row.id).padStart(3, "0")}`
    }));

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error("GET TINDAKAN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data tindakan korektif",
      error: error.message
    });
  }
});


/*
|--------------------------------------------------------------------------
| GET /api/tindakan/summary
|--------------------------------------------------------------------------
*/

router.get("/summary", async (req, res) => {

  try {

    const columns = await getColumns();

    const statusColumn = firstExisting(columns, [
      "status"
    ]);

    const priorityColumn = firstExisting(columns, [
      "priority",
      "priority_level"
    ]);

    const actionTypeColumn = firstExisting(columns, [
      "action_type"
    ]);

    const dueDateColumn = firstExisting(columns, [
      "due_date",
      "deadline",
      "target_date"
    ]);

    if (!statusColumn) {

      return res.status(500).json({
        success: false,
        message: "Kolom status tidak ditemukan"
      });

    }

    const status = quoteIdentifier(statusColumn);

    let priorityQuery = `
      SELECT
        ${priorityColumn
          ? quoteIdentifier(priorityColumn)
          : "NULL"
        } AS priority,
        COUNT(*)::int AS total
      FROM corrective_actions
    `;

    if (priorityColumn) {
      priorityQuery += `
        GROUP BY ${quoteIdentifier(priorityColumn)}
        ORDER BY total DESC
      `;
    } else {
      priorityQuery += `
        GROUP BY 1
      `;
    }

    const queries = [

      /*
      |--------------------------------------------------------------------------
      | TOTAL
      |--------------------------------------------------------------------------
      */

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM corrective_actions
      `),

      /*
      |--------------------------------------------------------------------------
      | STATUS
      |--------------------------------------------------------------------------
      */

      pool.query(`
        SELECT
          LOWER(${status}) AS status,
          COUNT(*)::int AS total
        FROM corrective_actions
        GROUP BY LOWER(${status})
      `),

      /*
      |--------------------------------------------------------------------------
      | PRIORITY
      |--------------------------------------------------------------------------
      */

      pool.query(priorityQuery),

      /*
      |--------------------------------------------------------------------------
      | SOURCE / ACTION TYPE
      |--------------------------------------------------------------------------
      */

      actionTypeColumn
        ? pool.query(`
            SELECT
              ${quoteIdentifier(actionTypeColumn)} AS source,
              COUNT(*)::int AS total
            FROM corrective_actions
            GROUP BY ${quoteIdentifier(actionTypeColumn)}
            ORDER BY total DESC
          `)
        : Promise.resolve({ rows: [] }),

      /*
      |--------------------------------------------------------------------------
      | LATE
      |--------------------------------------------------------------------------
      */

      dueDateColumn
        ? pool.query(`
            SELECT
              id,
              ${quoteIdentifier(dueDateColumn)} AS due_date,
              ${status} AS status,
              ${descriptionColumnSafe(columns)} AS description
            FROM corrective_actions
            WHERE
              ${quoteIdentifier(dueDateColumn)} < CURRENT_DATE
              AND LOWER(${status}) NOT IN (
                'closed',
                'completed',
                'complete',
                'selesai'
              )
            ORDER BY ${quoteIdentifier(dueDateColumn)} ASC
            LIMIT 10
          `)
        : Promise.resolve({ rows: [] })
    ];

    const [
      totalResult,
      statusResult,
      priorityResult,
      sourceResult,
      lateResult
    ] = await Promise.all(queries);

    /*
    |--------------------------------------------------------------------------
    | STATUS NORMALIZATION
    |--------------------------------------------------------------------------
    */

    let open = 0;
    let progress = 0;
    let done = 0;

    statusResult.rows.forEach(row => {

      const value = String(row.status || "")
        .toLowerCase()
        .trim();

      const count = Number(row.total || 0);

      if (
        value === "open" ||
        value === "opened" ||
        value === "terbuka"
      ) {
        open += count;
      }

      else if (
        value === "in progress" ||
        value === "progress" ||
        value === "processing" ||
        value === "proses" ||
        value === "dalam proses"
      ) {
        progress += count;
      }

      else if (
        value === "closed" ||
        value === "completed" ||
        value === "complete" ||
        value === "selesai"
      ) {
        done += count;
      }

    });

    /*
    |--------------------------------------------------------------------------
    | LATE
    |--------------------------------------------------------------------------
    */

    const late = lateResult.rows.length;

    /*
    |--------------------------------------------------------------------------
    | RESULT
    |--------------------------------------------------------------------------
    */

    res.json({

      success: true,

      data: {

        total: Number(totalResult.rows[0]?.total || 0),

        open,

        progress,

        done,

        late,

        priority: priorityResult.rows,

        sources: sourceResult.rows,

        late_actions: lateResult.rows

      }

    });

  } catch (error) {

    console.error("SUMMARY TINDAKAN ERROR:", error);

    res.status(500).json({

      success: false,

      message: "Gagal mengambil ringkasan tindakan korektif",

      error: error.message

    });

  }

});


/*
|--------------------------------------------------------------------------
| Helper description column
|--------------------------------------------------------------------------
*/

function descriptionColumnSafe(columns) {

  const column = firstExisting(columns, [
    "description",
    "problem",
    "problem_description",
    "finding",
    "issue"
  ]);

  return column
    ? quoteIdentifier(column)
    : "NULL";
}


/*
|--------------------------------------------------------------------------
| POST /api/tindakan
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {

  try {

    const columns = await getColumns();

    const {
      source,
      description,
      priority,
      assignee,
      due_date,
      status
    } = req.body;

    if (!source) {

      return res.status(400).json({
        success: false,
        message: "Sumber tindakan wajib diisi"
      });

    }

    const actionTypeColumn = firstExisting(columns, [
      "action_type"
    ]);

    const descriptionColumn = firstExisting(columns, [
      "description",
      "problem",
      "problem_description",
      "finding",
      "issue"
    ]);

    const priorityColumn = firstExisting(columns, [
      "priority",
      "priority_level"
    ]);

    const assigneeColumn = firstExisting(columns, [
      "assignee",
      "responsible_person",
      "responsible",
      "owner",
      "assigned_to"
    ]);

    const dueDateColumn = firstExisting(columns, [
      "due_date",
      "deadline",
      "target_date"
    ]);

    const statusColumn = firstExisting(columns, [
      "status"
    ]);

    const insertColumns = [];
    const values = [];
    const placeholders = [];

    function addColumn(column, value) {

      if (!column) return;

      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      insertColumns.push(quoteIdentifier(column));

      values.push(value);

      placeholders.push(`$${values.length}`);
    }

    /*
    |--------------------------------------------------------------------------
    | action_type
    |--------------------------------------------------------------------------
    */

    addColumn(
      actionTypeColumn,
      source
    );

    /*
    |--------------------------------------------------------------------------
    | description
    |--------------------------------------------------------------------------
    */

    addColumn(
      descriptionColumn,
      description
    );

    /*
    |--------------------------------------------------------------------------
    | priority
    |--------------------------------------------------------------------------
    */

    addColumn(
      priorityColumn,
      priority
    );

    /*
    |--------------------------------------------------------------------------
    | assignee
    |--------------------------------------------------------------------------
    */

    addColumn(
      assigneeColumn,
      assignee
    );

    /*
    |--------------------------------------------------------------------------
    | due date
    |--------------------------------------------------------------------------
    */

    addColumn(
      dueDateColumn,
      due_date
    );

    /*
    |--------------------------------------------------------------------------
    | status
    |--------------------------------------------------------------------------
    */

    addColumn(
      statusColumn,
      status || "Open"
    );

    if (!insertColumns.length) {

      return res.status(500).json({

        success: false,

        message:
          "Tidak ada kolom yang dapat digunakan untuk INSERT pada corrective_actions",

        columns

      });

    }

    const query = `
      INSERT INTO corrective_actions
      (
        ${insertColumns.join(", ")}
      )
      VALUES
      (
        ${placeholders.join(", ")}
      )
      RETURNING *
    `;

    console.log("INSERT TINDAKAN:");
    console.log(query);
    console.log(values);

    const result = await pool.query(
      query,
      values
    );

    const row = result.rows[0];

    res.status(201).json({

      success: true,

      message: "Tindakan korektif berhasil dibuat",

      data: {

        ...row,

        action_code:
          `CA-${new Date().getFullYear()}-${String(row.id).padStart(3, "0")}`

      }

    });

  } catch (error) {

    console.error("POST TINDAKAN ERROR:", error);

    res.status(500).json({

      success: false,

      message: "Gagal membuat tindakan korektif",

      error: error.message

    });

  }

});


/*
|--------------------------------------------------------------------------
| PUT /api/tindakan/:id
|--------------------------------------------------------------------------
*/

router.put("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const columns = await getColumns();

    const {
      source,
      description,
      priority,
      assignee,
      due_date,
      status
    } = req.body;

    const mapping = {

      action_type: source,

      description,

      priority,

      assignee,

      due_date,

      status

    };

    const actualMapping = {

      action_type: "action_type",

      description: firstExisting(columns, [
        "description",
        "problem",
        "problem_description",
        "finding",
        "issue"
      ]),

      priority: firstExisting(columns, [
        "priority",
        "priority_level"
      ]),

      assignee: firstExisting(columns, [
        "assignee",
        "responsible_person",
        "responsible",
        "owner",
        "assigned_to"
      ]),

      due_date: firstExisting(columns, [
        "due_date",
        "deadline",
        "target_date"
      ]),

      status: firstExisting(columns, [
        "status"
      ])

    };

    const sets = [];
    const values = [];

    for (const [field, value] of Object.entries(mapping)) {

      if (
        value === undefined ||
        value === null
      ) {
        continue;
      }

      const actualColumn = actualMapping[field];

      if (!actualColumn) continue;

      values.push(value);

      sets.push(
        `${quoteIdentifier(actualColumn)} = $${values.length}`
      );

    }

    if (!sets.length) {

      return res.status(400).json({

        success: false,

        message: "Tidak ada data yang dapat diperbarui"

      });

    }

    values.push(id);

    const query = `
      UPDATE corrective_actions

      SET
        ${sets.join(", ")}

      WHERE id = $${values.length}

      RETURNING *
    `;

    const result = await pool.query(
      query,
      values
    );

    if (!result.rows.length) {

      return res.status(404).json({

        success: false,

        message: "Tindakan korektif tidak ditemukan"

      });

    }

    const row = result.rows[0];

    res.json({

      success: true,

      message: "Tindakan korektif berhasil diperbarui",

      data: {

        ...row,

        action_code:
          `CA-${new Date().getFullYear()}-${String(row.id).padStart(3, "0")}`

      }

    });

  } catch (error) {

    console.error("PUT TINDAKAN ERROR:", error);

    res.status(500).json({

      success: false,

      message: "Gagal memperbarui tindakan korektif",

      error: error.message

    });

  }

});


/*
|--------------------------------------------------------------------------
| DELETE /api/tindakan/:id
|--------------------------------------------------------------------------
*/

router.delete("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(`

      DELETE FROM corrective_actions

      WHERE id = $1

      RETURNING *

    `, [id]);

    if (!result.rows.length) {

      return res.status(404).json({

        success: false,

        message: "Tindakan korektif tidak ditemukan"

      });

    }

    res.json({

      success: true,

      message: "Tindakan korektif berhasil dihapus",

      data: result.rows[0]

    });

  } catch (error) {

    console.error("DELETE TINDAKAN ERROR:", error);

    res.status(500).json({

      success: false,

      message: "Gagal menghapus tindakan korektif",

      error: error.message

    });

  }

});


module.exports = router;