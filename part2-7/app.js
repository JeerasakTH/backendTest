const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

// create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  port: "3309",
  database: "sql_invoicing",
});

const params =
  "SELECT SUM(invoice_total) AS `invoice`, SUM(invoice_total) * 0.2 AS `discount_20_percent`, SUM(invoice_total) - (SUM(invoice_total) * 0.2) AS `new_invoice`, (SUM(invoice_total) - (SUM(invoice_total)) * 0.2) * 0.07 AS `VAT_7_percent`, SUM(invoice_total) - (SUM(invoice_total) * 0.2) + ((SUM(invoice_total) - (SUM(invoice_total)) * 0.2) * 0.07) AS `invoices_total` FROM `invoices`";

connection.query(params, function (error, results, fields) {
  if (error) throw error;
  console.log(results);
});

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
