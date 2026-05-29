import { useState, useEffect, useCallback } from "react";
import { dbLoad, dbSave } from "./supabase";

const fmt = (n, d = 2) => (Number(n) || 0).toFixed(d);
const fmtUSD = (n) => `$${fmt(n)}`;
const today = () => new Date().toISOString().split("T")[0];
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const daysSince = (dateStr) => {
  if (!dateStr) return 999;
  return Math.floor((new Date() - new Date(dateStr)) / 86400000);
};
const SEED_PRODUCTS = [
  { id: "P001", name: "Atlantic Salmon Whole", category: "Fish", unit: "LB", caseQty: 40, costPerLb: 4.85, pricePerLb: 7.50, catchWeight: true, zone: "Cooler", active: true },
  { id: "P002", name: "Atlantic Salmon Fillet", category: "Fish", unit: "LB", caseQty: 10, costPerLb: 9.20, pricePerLb: 13.50, catchWeight: true, zone: "Cooler", active: true },
  { id: "P003", name: "Salmon Trim/Belly", category: "Fish", unit: "LB", caseQty: 10, costPerLb: 3.10, pricePerLb: 5.00, catchWeight: true, zone: "Cooler", active: true },
  { id: "P004", name: "Shrimp 16/20 P&D", category: "Shellfish", unit: "LB", caseQty: 10, costPerLb: 8.40, pricePerLb: 12.00, catchWeight: false, zone: "Frozen", active: true },
  { id: "P005", name: "Cod Fillet Skin-On", category: "Fish", unit: "LB", caseQty: 25, costPerLb: 5.60, pricePerLb: 8.75, catchWeight: true, zone: "Cooler", active: true },
  { id: "P006", name: "Tuna Loin YF #1", category: "Fish", unit: "LB", caseQty: 20, costPerLb: 11.50, pricePerLb: 17.00, catchWeight: true, zone: "Cooler", active: true },
  { id: "P007", name: "Lobster Tail 6oz", category: "Shellfish", unit: "EA", caseQty: 24, costPerLb: 22.00, pricePerLb: 32.00, catchWeight: false, zone: "Frozen", active: true },
  { id: "P008", name: "Scallops 10/20 Dry", category: "Shellfish", unit: "LB", caseQty: 10, costPerLb: 14.20, pricePerLb: 20.00, catchWeight: true, zone: "Cooler", active: true },
];

const SEED_INVENTORY = [
  { id: "INV001", productId: "P001", qtyLbs: 320, qtyCases: 8, lot: "L240520", expDate: "2026-06-15" },
  { id: "INV002", productId: "P002", qtyLbs: 140, qtyCases: 14, lot: "L240521", expDate: "2026-06-18" },
  { id: "INV003", productId: "P003", qtyLbs: 60, qtyCases: 6, lot: "L240521", expDate: "2026-06-18" },
  { id: "INV004", productId: "P004", qtyLbs: 200, qtyCases: 20, lot: "L240515", expDate: "2026-12-15" },
  { id: "INV005", productId: "P005", qtyLbs: 175, qtyCases: 7, lot: "L240519", expDate: "2026-06-12" },
  { id: "INV006", productId: "P006", qtyLbs: 80, qtyCases: 4, lot: "L240518", expDate: "2026-06-10" },
  { id: "INV007", productId: "P007", qtyLbs: 144, qtyCases: 6, lot: "L240510", expDate: "2026-11-10" },
  { id: "INV008", productId: "P008", qtyLbs: 90, qtyCases: 9, lot: "L240517", expDate: "2026-06-08" },
];

const SEED_REPS = [
  { id: "R001", name: "Manager", email: "manager@jvfoods.com", role: "manager", color: "#2e8b57" },
  { id: "R002", name: "Rep 1", email: "rep1@jvfoods.com", role: "rep", color: "#4a9eda" },
  { id: "R003", name: "Rep 2", email: "rep2@jvfoods.com", role: "rep", color: "#d4800a" },
];

const SEED_CUSTOMERS = [
  { id: "C001", name: "Harbor View Restaurant", contact: "Mike Chen", phone: "617-555-0101", email: "mike@harborview.com", creditLimit: 15000, balance: 4200, priceTier: "A", repId: "R002", lastOrderDate: "2026-05-25", topSkus: ["P002","P008"] },
  { id: "C002", name: "Blue Ocean Bistro", contact: "Sarah Lamb", phone: "617-555-0102", email: "sarah@blueocean.com", creditLimit: 8000, balance: 1100, priceTier: "B", repId: "R002", lastOrderDate: "2026-05-10", topSkus: ["P005","P006"] },
  { id: "C003", name: "Fisherman's Wharf Grille", contact: "Tom Reyes", phone: "508-555-0103", email: "tom@fwgrille.com", creditLimit: 20000, balance: 7800, priceTier: "A", repId: "R003", lastOrderDate: "2026-05-28", topSkus: ["P001","P004"] },
  { id: "C004", name: "Neptune Seafood Market", contact: "Dana Price", phone: "781-555-0104", email: "dana@neptunemarket.com", creditLimit: 25000, balance: 2300, priceTier: "A", repId: "R003", lastOrderDate: "2026-05-20", topSkus: ["P002","P007","P008"] },
  { id: "C005", name: "Coastal Kitchen", contact: "Jess Moore", phone: "508-555-0105", email: "jess@coastalkitchen.com", creditLimit: 5000, balance: 890, priceTier: "C", repId: "R002", lastOrderDate: "2026-04-30", topSkus: ["P004"] },
];

const SEED_ORDERS = [
  { id: "ORD-001", customerId: "C001", repId: "R002", date: "2026-05-25", status: "Invoiced", lines: [{ productId: "P002", qty: 20, price: 13.50 },{ productId: "P008", qty: 10, price: 20.00 }] },
  { id: "ORD-002", customerId: "C003", repId: "R003", date: "2026-05-28", status: "Pending", lines: [{ productId: "P001", qty: 80, price: 7.50 },{ productId: "P004", qty: 20, price: 12.00 }] },
  { id: "ORD-003", customerId: "C002", repId: "R002", date: "2026-05-10", status: "Invoiced", lines: [{ productId: "P005", qty: 25, price: 8.75 },{ productId: "P006", qty: 10, price: 17.00 }] },
];

const SEED_VENDORS = [
  { id: "V001", name: "Atlantic Seafood Co", contact: "Bill Murray", phone: "207-555-0201", terms: "Net 30", balance: 12400, dueDate: "2026-06-05" },
  { id: "V002", name: "Gulf Shrimp Distributors", contact: "Ray Tanner", phone: "985-555-0202", terms: "Net 15", balance: 4800, dueDate: "2026-06-02" },
  { id: "V003", name: "Pacific Tuna Inc", contact: "Kenji Mori", phone: "310-555-0203", terms: "Net 30", balance: 8900, dueDate: "2026-06-18" },
];
export default function App() {
  const [nav, setNav] = useState("dashboard");
  const [currentRep, setCurrentRep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reps, setReps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [processing, setProcessing] = useState([]);
  const [counts, setCounts] = useState([]);
  const [costHistory, setCostHistory] = useState([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [p,inv,o,c,r,v] = await Promise.all([
          dbLoad("products"),dbLoad("inventory"),dbLoad("orders"),
          dbLoad("customers"),dbLoad("reps"),dbLoad("alerts"),
        ]);
        if(p.length===0){
