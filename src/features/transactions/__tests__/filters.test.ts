import { Transaction } from "../../../api/types";
import {
  defaultTransactionFilters,
  filterAndSortTransactions,
  getCategories,
} from "../filters";

const transactions: Transaction[] = [
  {
    id: "txn_100",
    date: "2026-03-04",
    amount: -25,
    merchant: "Coffee Club",
    category: "Food",
    account: "Main",
    balance: 975,
  },
  {
    id: "txn_101",
    date: "2026-03-05",
    amount: 2500,
    merchant: "Acme Payroll",
    category: "Income",
    account: "Main",
    balance: 3475,
  },
  {
    id: "txn_102",
    date: "2026-03-05",
    amount: -80,
    merchant: "Power Grid",
    category: "Bills",
    account: "Main",
    balance: 3395,
  },
  {
    id: "txn_103",
    date: "2026-03-03",
    amount: 120,
    merchant: "Refund Mart",
    category: "Shopping",
    account: "Main",
    balance: 1095,
  },
  {
    id: "txn_104",
    date: "2026-03-02",
    amount: 0,
    merchant: "Cashback Bonus",
    category: "Income",
    account: "Main",
    balance: 1095,
  },
];

describe("getCategories", () => {
  it("returns ALL first and then unique sorted categories", () => {
    expect(getCategories(transactions)).toEqual([
      "ALL",
      "Bills",
      "Food",
      "Income",
      "Shopping",
    ]);
  });
});

describe("filterAndSortTransactions", () => {
  it("keeps all transactions when all filters are at their default values", () => {
    expect(
      filterAndSortTransactions(transactions, defaultTransactionFilters).map(
        (transaction) => transaction.id,
      ),
    ).toEqual(["txn_102", "txn_101", "txn_100", "txn_103", "txn_104"]);
  });

  it("filters by category", () => {
    expect(
      filterAndSortTransactions(transactions, {
        ...defaultTransactionFilters,
        category: "Income",
      }).map((transaction) => transaction.id),
    ).toEqual(["txn_101", "txn_104"]);
  });

  it("filters positive transactions including zero values", () => {
    expect(
      filterAndSortTransactions(transactions, {
        ...defaultTransactionFilters,
        direction: "POSITIVE",
      }).map((transaction) => transaction.id),
    ).toEqual(["txn_101", "txn_103", "txn_104"]);
  });

  it("filters only negative transactions", () => {
    expect(
      filterAndSortTransactions(transactions, {
        ...defaultTransactionFilters,
        direction: "NEGATIVE",
      }).map((transaction) => transaction.id),
    ).toEqual(["txn_102", "txn_100"]);
  });

  it("matches merchant search case-insensitively and trims whitespace", () => {
    expect(
      filterAndSortTransactions(transactions, {
        ...defaultTransactionFilters,
        merchantSearch: "  pOwEr  ",
      }).map((transaction) => transaction.id),
    ).toEqual(["txn_102"]);
  });

  it("sorts by oldest date first for DATE_ASC", () => {
    expect(
      filterAndSortTransactions(transactions, {
        ...defaultTransactionFilters,
        sort: "DATE_ASC",
      }).map((transaction) => transaction.id),
    ).toEqual(["txn_104", "txn_103", "txn_100", "txn_101", "txn_102"]);
  });

  it("sorts by highest amount first for AMOUNT_DESC", () => {
    expect(
      filterAndSortTransactions(transactions, {
        ...defaultTransactionFilters,
        sort: "AMOUNT_DESC",
      }).map((transaction) => transaction.id),
    ).toEqual(["txn_101", "txn_103", "txn_104", "txn_100", "txn_102"]);
  });

  it("sorts by lowest amount first for AMOUNT_ASC", () => {
    expect(
      filterAndSortTransactions(transactions, {
        ...defaultTransactionFilters,
        sort: "AMOUNT_ASC",
      }).map((transaction) => transaction.id),
    ).toEqual(["txn_102", "txn_100", "txn_104", "txn_103", "txn_101"]);
  });

  it("applies category, direction, search, and sorting together", () => {
    expect(
      filterAndSortTransactions(transactions, {
        category: "Income",
        direction: "POSITIVE",
        merchantSearch: " bonus ",
        sort: "AMOUNT_ASC",
      }).map((transaction) => transaction.id),
    ).toEqual(["txn_104"]);
  });
});
