import type { DataProduct } from "./types";
import { generateId } from "./storage";
import { parseAvroSchema } from "./utils/avro";
import { parseOpenApi } from "./utils/openapi";

// Finance/banking-oriented example schemas
const avroTransaction = {
  type: "record",
  name: "Transaction",
  fields: [
    { name: "transaction_id", type: "string" },
    { name: "account_id", type: "string" },
    { name: "customer_id", type: "string" },
    { name: "card_id", type: "string" },
    { name: "merchant_id", type: "string" },
    { name: "amount", type: "double" },
    { name: "currency", type: "string" },
    { name: "auth_code", type: "string" },
    { name: "status", type: "string" },
    { name: "channel", type: "string" },
    { name: "mcc", type: "string" },
    { name: "country", type: "string" },
    { name: "city", type: "string" },
    { name: "lat", type: "string" },
    { name: "lon", type: "string" },
    { name: "is_card_present", type: "string" },
    { name: "is_contactless", type: "string" },
    { name: "device_id", type: "string" },
    { name: "timestamp", type: "string" },
  ],
};

const avroAccount = {
  type: "record",
  name: "Account",
  fields: [
    { name: "account_id", type: "string" },
    { name: "customer_id", type: "string" },
    { name: "iban", type: "string" },
    { name: "routing_number", type: "string" },
    { name: "type", type: "string" },
    { name: "status", type: "string" },
    { name: "balance", type: "double" },
    { name: "available_balance", type: "double" },
    { name: "currency", type: "string" },
    { name: "opened_at", type: "string" },
    { name: "closed_at", type: "string" },
    { name: "branch", type: "string" },
  ],
};

const avroCustomer = {
  type: "record",
  name: "Customer",
  fields: [
    { name: "customer_id", type: "string" },
    { name: "first_name", type: "string" },
    { name: "last_name", type: "string" },
    { name: "email", type: "string" },
    { name: "phone", type: "string" },
    { name: "address_line1", type: "string" },
    { name: "address_line2", type: "string" },
    { name: "city", type: "string" },
    { name: "state", type: "string" },
    { name: "postal_code", type: "string" },
    { name: "country", type: "string" },
    { name: "kyc_status", type: "string" },
    { name: "risk_segment", type: "string" },
    { name: "created_at", type: "string" },
  ],
};

const avroCard = {
  type: "record",
  name: "Card",
  fields: [
    { name: "card_id", type: "string" },
    { name: "customer_id", type: "string" },
    { name: "pan_token", type: "string" },
    { name: "status", type: "string" },
    { name: "brand", type: "string" },
    { name: "product", type: "string" },
    { name: "limit", type: "double" },
    { name: "available_credit", type: "double" },
    { name: "opened_at", type: "string" },
    { name: "expired_at", type: "string" },
  ],
};


const avroPayment = {
  type: "record",
  name: "Payment",
  fields: [
    { name: "payment_id", type: "string" },
    { name: "source_account_id", type: "string" },
    { name: "dest_account_id", type: "string" },
    { name: "source_customer_id", type: "string" },
    { name: "dest_customer_id", type: "string" },
    { name: "amount", type: "double" },
    { name: "currency", type: "string" },
    { name: "channel", type: "string" },
    { name: "status", type: "string" },
    { name: "country", type: "string" },
    { name: "city", type: "string" },
    { name: "timestamp", type: "string" },
  ],
};

const openApiAccounts = {
  openapi: "3.0.0",
  info: { title: "Accounts API", version: "1.0.0" },
  servers: [{ url: "https://bank.api.example" }],
  paths: {
    "/accounts": { get: { summary: "List accounts" } },
    "/accounts/{id}": { get: { summary: "Get account" } },
  },
  components: {
    schemas: {
      Account: {
        type: "object",
        properties: {
          account_id: { type: "string" },
          customer_id: { type: "string" },
          balance: { type: "number" },
        },
      },
    },
  },
};

const openApiPayments = {
  openapi: "3.0.0",
  info: { title: "Payments API", version: "1.0.0" },
  servers: [{ url: "https://payments.api.example" }],
  paths: {
    "/payments": { get: { summary: "List payments" } },
  },
  components: {
    schemas: {
      Payment: {
        type: "object",
        properties: {
          payment_id: { type: "string" },
          source_account_id: { type: "string" },
          dest_account_id: { type: "string" },
          amount: { type: "number" },
        },
      },
    },
  },
};

const openApiFraud = {
  openapi: "3.0.0",
  info: { title: "Fraud Scoring API", version: "1.0.0" },
  servers: [{ url: "https://fraud.api.example" }],
  paths: {
    "/score": { post: { summary: "Score a transaction" } },
  },
  components: {
    schemas: {
      ScoreRequest: { type: "object", properties: { transaction_id: { type: "string" } } },
    },
  },
};

export function makeSeedProducts(): DataProduct[] {
  const now = new Date().toISOString();

  const transactionAvro = JSON.stringify(avroTransaction, null, 2);
  const accountAvro = JSON.stringify(avroAccount, null, 2);
  const customerAvro = JSON.stringify(avroCustomer, null, 2);
  const cardAvro = JSON.stringify(avroCard, null, 2);
  // merchants schema removed (not used in simplified seed)
  const paymentAvro = JSON.stringify(avroPayment, null, 2);
  const accountsApi = JSON.stringify(openApiAccounts, null, 2);
  const paymentsApi = JSON.stringify(openApiPayments, null, 2);
  const fraudApi = JSON.stringify(openApiFraud, null, 2);

  const base: DataProduct[] = [
    {
      id: generateId("prod"),
      name: "Core Banking - Transactions Hub",
      description: "Authoritative store for retail banking account and transaction data.",
      lineOfBusiness: "Retail Banking",
      owner: {
        name: "Sarah Chen",
        email: "sarah.chen@bank.com",
        team: "Core Banking Data"
      },
      businessNeeds: [
        {
          id: generateId("need"),
          title: "Transaction Fraud Detection",
          description: "Enable real-time fraud detection by providing comprehensive transaction data with account and customer context.",
          priority: "high"
        },
        {
          id: generateId("need"),
          title: "Regulatory Reporting",
          description: "Support compliance teams with accurate transaction reporting for regulatory audits and AML monitoring.",
          priority: "high"
        }
      ],
      usageExamples: [
        {
          id: generateId("example"),
          name: "Daily Transaction Summary",
          description: "Get a summary of all transactions for a specific date range",
          code: "SELECT \n  DATE(timestamp) as transaction_date,\n  COUNT(*) as total_transactions,\n  SUM(amount) as total_amount,\n  AVG(amount) as avg_amount\nFROM txhub_transactions_ledger \nWHERE DATE(timestamp) BETWEEN '2024-01-01' AND '2024-01-31'\nGROUP BY DATE(timestamp)\nORDER BY transaction_date;",
          language: "sql"
        }
      ],
      dataSources: [
        { id: generateId("ds"), name: "txhub_transactions_ledger", kind: "dataset", description: "Core banking transactions", schema: parseAvroSchema(transactionAvro) },
        { id: generateId("ds"), name: "txhub_accounts_dim", kind: "dataset", description: "Account master data", schema: parseAvroSchema(accountAvro) },
        { id: generateId("ds"), name: "txhub_accounts_api", kind: "api", description: "Accounts service", schema: parseOpenApi(accountsApi) },
      ],
      createdAt: now, updatedAt: now,
    },
    {
      id: generateId("prod"),
      name: "Customer 360",
      description: "Unified customer profile across accounts, cards, and payments.",
      lineOfBusiness: "Retail Banking",
      dataSources: [
        { id: generateId("ds"), name: "c360_customers_dim", kind: "dataset", description: "Customer master", schema: parseAvroSchema(customerAvro) },
        { id: generateId("ds"), name: "c360_accounts_api", kind: "api", description: "Accounts API", schema: parseOpenApi(accountsApi) },
        { id: generateId("ds"), name: "c360_cards_dim", kind: "dataset", description: "Card master", schema: parseAvroSchema(cardAvro) },
      ],
      createdAt: now, updatedAt: now,
    },
    {
      id: generateId("prod"),
      name: "Cards Spend Analytics",
      description: "Cards portfolio spend and behavior analytics.",
      lineOfBusiness: "Cards",
      dataSources: [
        { id: generateId("ds"), name: "cards_cards_dim", kind: "dataset", description: "Card master", schema: parseAvroSchema(cardAvro) },
        { id: generateId("ds"), name: "cards_transactions_ledger", kind: "dataset", description: "Card transactions", schema: parseAvroSchema(transactionAvro) },
        { id: generateId("ds"), name: "cards_payments_api", kind: "api", description: "Payments service", schema: parseOpenApi(paymentsApi) },
      ],
      createdAt: now, updatedAt: now,
    },
    {
      id: generateId("prod"),
      name: "Payments Fraud Monitor",
      description: "Real-time and batch analytics to detect fraudulent payments.",
      lineOfBusiness: "Payments",
      dataSources: [
        { id: generateId("ds"), name: "fraud_payments_ledger", kind: "dataset", description: "Payments events", schema: parseAvroSchema(paymentAvro) },
        { id: generateId("ds"), name: "fraud_transactions_ledger", kind: "dataset", description: "Transactions for patterns", schema: parseAvroSchema(transactionAvro) },
        { id: generateId("ds"), name: "fraud_fraud_api", kind: "api", description: "Fraud scoring service", schema: parseOpenApi(fraudApi) },
      ],
      createdAt: now, updatedAt: now,
    },
    {
      id: generateId("prod"),
      name: "AML Monitoring",
      description: "Anti-money laundering monitoring with alerts and case context.",
      lineOfBusiness: "Compliance",
      dataSources: [
        { id: generateId("ds"), name: "aml_transactions_ledger", kind: "dataset", description: "All transactions", schema: parseAvroSchema(transactionAvro) },
        { id: generateId("ds"), name: "aml_customers_dim", kind: "dataset", description: "Customer master", schema: parseAvroSchema(customerAvro) },
        { id: generateId("ds"), name: "aml_payments_api", kind: "api", description: "Payments service", schema: parseOpenApi(paymentsApi) },
      ],
      createdAt: now, updatedAt: now,
    },
  ];

  // Trim to 2-3 sources per product: no synthetic extras
  for (const product of base) {
    if (product.dataSources.length > 3) {
      product.dataSources = product.dataSources.slice(0, 3);
    }
  }

  return base;
}


