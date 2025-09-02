# SihaCare

**Version:** 1.0.0  
**Type:** Fully Interactive Demo MVP Web System (Frontend Only)
VIEW & INTERACT WITH PROJECT: https://sihacarre.netlify.app/

## Overview
**SihaCare** is a *fully interactive, demo-only web system* designed to demonstrate **end-to-end traceability of medical supplies** in a public healthcare context. It simulates workflows from **central warehouse dispatch → hospital receipt → patient administration**, enabling **role-based monitoring and interaction**.

> ⚠️ **Note:** This MVP is entirely frontend-based. There is **no backend or database connection**. All data is stored in memory (React state / JSON objects) and persists only during the current session.

The system is ideal for hackathons, presentations, and demonstrating supply chain workflows in healthcare without requiring backend infrastructure.

## Role & Purpose
SihaCare was built to:
- Combat diversion and corruption in medical supply chains by visualizing the **flow of medical units**.
- Demonstrate **role-based dashboards** for Admin, Warehouse Staff, Hospital Staff, and Clinicians.
- Provide an **interactive demo** showing creation, dispatch, receipt, and administration of medical supplies.
- Track **patient-level administration** in real time within a controlled demo environment.

## Branding
- **System Name:** SihaCare  
- **Logo:** Stylized combination of “S + T” symbolizing **security in healthcare**  
  - Visual elements: shield, cross, or lock motifs  
  - Colors: professional medical theme (**blue, green, white**)  
  - Appears on all pages; clicking it **redirects to Home/Dashboard**

## Tech Stack
- **Frontend:** React + TypeScript + Vite  
- **Hosting:** Netlify  
- **Data:** Entirely in-memory; no backend or database required  
- **State Management:** React state / JSON objects

## Demo Accounts

| Role              | Email                   | Password   |
|------------------|------------------------|------------|
| Admin             | admin@example.com       | admin123   |
| Warehouse Staff   | warehouse@example.com   | demo123    |
| Hospital Staff    | hospital@example.com    | demo123    |
| Clinician         | clinician@example.com   | demo123    |

> Users can log in immediately; Admin can approve or reject “pending” demo users in the dashboard.

## Preloaded Demo Data

- Hospitals & Warehouses  
- Batches (e.g., *Paracetamol Batch A*)  
- Dispatches (Pending / Received)  
- Patients (with sample Kenyan names)  
- Usage records (clinician-administered logs)

All data is loaded into memory upon starting the app.

## Functional Features

### 1. Authentication & Roles

- **Login page:** username/password fields  
- **Request Access Flow:** demo users can appear as “Pending Approval” in Admin dashboard  
- **Role-based Dashboards:**  
  - **Admin:** Approve/reject users, view all batches, dispatches, and patient records  
  - **Warehouse Staff:** Create batches, generate units, dispatch to hospitals  
  - **Hospital Staff:** Confirm receipt of batches, manage hospital inventory  
  - **Clinicians:** Record administration of units to patients, view patient history  

> Users see **only actions allowed** for their role.

### 2. Workflow Interactions
All workflows are handled **in-memory**, updating dashboards instantly:
1. Admin approves or rejects users → updates all relevant dashboards  
2. Warehouse Staff creates batch → batch appears in dispatch dropdowns  
3. Warehouse dispatches batch → Hospital Staff sees pending dispatch  
4. Hospital Staff confirms receipt → status updates for Admin & Warehouse  
5. Clinicians administer units → usage logs update in real time  
6. Admin can trace batch lifecycle: **Created → Dispatched → Received → Administered**

### 3. Navigation & UX
- **Back/Forward support** preserves form state  
- **Logo click** always returns to Home/Dashboard  
- Dashboard cards display totals (e.g., batches, patients, dispatches)  
- Lists and tables are interactive with clickable rows and action buttons  
- Forms include input validation (cannot dispatch without selecting batch)  

### 4. Frontend UI
- Fully **role-based dashboards** with dynamic components  
- Buttons, forms, and lists are fully functional  
- State updates **in real-time**; no dead buttons  
- Optional charts/metrics visualize supply flows  
- Professional medical theme using **SihaCare logo, blue/green/white palette**  

## Deployment
- **Hosting:** Netlify (drag-and-drop or GitHub deployment)  
- **No backend required**; ready-to-run demo in browser  
- Simply open `/index.html` or deploy to Netlify  
- Refreshing browser **resets all in-memory data**  

## Usage Instructions
1. **Login:** Use one of the demo accounts above  
2. **Admin:** Approve/reject users, view batches, track dispatches and patient administration  
3. **Warehouse Staff:** Create and dispatch batches to hospitals  
4. **Hospital Staff:** Receive batches, confirm stock  
5. **Clinicians:** Administer units to patients, view usage logs  
6. **Tracing:** Admin can follow any batch from creation to patient administration  

## Additional Notes
- All actions are **fully functional in-memory**, reflecting immediately across dashboards  
- Use **predefined demo accounts** to simulate realistic workflows  
- Easy to add more demo data or roles by editing in-memory JSON/state  
- Designed for **hackathon presentations**, showing complete traceability without backend infrastructure  

## Folder Structure (Frontend Demo)
siha-care/
├─ README.md
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ /public
│ ├─ index.html
│ ├─ logo.svg
├─ /src
│ ├─ main.tsx
│ ├─ App.tsx
│ ├─ /components
│ │ ├─ Logo.tsx
│ │ ├─ DashboardCard.tsx
│ │ ├─ BatchList.tsx
│ │ ├─ PatientList.tsx
│ ├─ /pages
│ │ ├─ Login.tsx
│ │ ├─ AdminDashboard.tsx
│ │ ├─ WarehouseDashboard.tsx
│ │ ├─ HospitalDashboard.tsx
│ │ ├─ ClinicianDashboard.tsx
│ ├─ /state
│ │ ├─ demoData.ts
│ │ ├─ userContext.tsx
│ ├─ /utils
│ │ ├─ validation.ts
│ │ ├─ helpers.ts

## Summary
**SihaCare** is a **fully interactive, demo-only MVP** demonstrating **end-to-end traceability** of medical supplies in Kenya. It supports:

- Role-based dashboards  
- In-memory workflows  
- Preloaded demo data  
- Real-time updates  
- Deployable entirely to Netlify  

> ⚠️ **Note:** Refreshing or closing the browser **resets all in-memory data**.

