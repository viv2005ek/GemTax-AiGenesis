# GemTax AI — Multimodal Tax Optimization & Compliance Intelligence  
Built for AI Genesis Hackathon | Powered by **Google AI Studio + Gemini 2.5 Pro**

GemTax AI is a multimodal tax intelligence system that automates financial document extraction, tax optimization, and UAE VAT + Corporate Tax compliance checks. All processing runs entirely inside **Google AI Studio** through three custom Gemini agents, orchestrated using a Lovable-hosted demo application.

---

## 🚀 Key Features

### **1. Multimodal Document Extraction (Agent #1)**  
Extracts structured JSON from:  
- PDFs (salary slips, invoices, P&L statements)  
- Images (receipts, screenshots)  
- CSVs (bank transactions)  
- VAT invoices  
- Corporate tax documents  

---

### **2. Tax Optimization Engine (Agent #2)**  
Uses the extracted JSON to generate:  
- Personalized UAE tax-saving recommendations  
- Investment suggestions  
- 3-year projected returns  
- After-tax wealth improvement strategies  

---

### **3. UAE VAT & Corporate Tax Compliance Review (Agent #3)**  
Performs detailed UAE compliance validation, including:  
- Missing or invalid TRNs  
- Incorrect VAT calculations (5%)  
- Zero-rated supply + RCM validation  
- Free-zone qualifying income risks  
- Non-deductible or suspicious expenses  
- Bank vs invoice mismatches  
- Vendor legitimacy issues  

---

## 🧠 System Architecture

GemTax AI uses **three Gemini agents** built inside Google AI Studio:

**1. v1_extractor** – Extracts structured financial data  
**2. v1_optimizer** – Generates tax optimization & investment insights  
**3. v1_compliance_UAE** – Performs VAT + Corporate Tax compliance checks  

These agents are orchestrated through a **Lovable App**, which uses Lovable’s built-in Gemini API keys to perform real-time multi-agent reasoning.

---

## 🛠️ Tech Stack

- **Google AI Studio**  
- **Gemini 1.5 Pro (Multimodal / JSON Mode)**  
- **Lovable App (Orchestrator)**  
- **Python** (Dataset generation)  
- **GitHub** for documentation  

---

## 💻 Live Demo

**Demo Application URL:**  
https://gem-tax.lovable.app  

This publicly accessible demo runs all three agents sequentially through a unified interface.

---

## 📦 Dataset

A custom UAE dataset is included in the repository:  
- UAE VAT Invoice  
- Salary Slip (UAE format)  
- Bank Transactions CSV  
- Corporate Tax Summary PDF  
- P&L Statement PDF  

---

## 📚 Repository Structure

