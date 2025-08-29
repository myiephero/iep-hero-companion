---
name: 🔒 Role-Based Namespace Guard
about: Ensure Parent & Advocate tools remain strictly independent
title: "[Role Guard] "
labels: security, compliance, high-priority
assignees: ''
---

## 🔒 Description
All tools and dashboards must enforce strict **namespace separation**:  
- Parent tools → `#/parent/...`  
- Advocate tools → `#/advocate/...`  

🚫 **It must never be possible** for a Parent to click into an Advocate tool, or for an Advocate to click into a Parent tool.  
This is required for **FERPA/HIPAA compliance** and core UX clarity.

---

## ✅ Acceptance Criteria
- [ ] All Parent routes use `#/parent/...`
- [ ] All Advocate routes use `#/advocate/...`
- [ ] Router includes a Guard that redirects mismatched sessions back to the correct dashboard
- [ ] Sidebar/TopBar show only tools relevant to the active role
- [ ] Emergent integrations declare their role namespace (Parent or Advocate)
- [ ] Session state enforces `activeRole` across navigation

---

## 🛠 Implementation Notes
- Guard logic lives in `src/router.tsx`
- Store `activeRole` in session/localStorage (temporary until Supabase Auth/RLS is active)
- Emergent tools:  
  - `#/parent/tools/iep-review` → Parent IEP Review tool  
  - `#/advocate/tools/iep-review` → Advocate IEP Review tool  
- Stripe billing: ensure subscriptions are role-specific

---

## 📖 References
- Mission: Empower Parents, Elevate Advocacy, Scale Impact [oai_citation:0‡My-IEP-Hero.pdf](file-service://file-NHYGtWA7vddieHwJbcv85Z)  
- Parent Tools: IEP Review, Smart Letters, Meeting Prep, Secure Vault [oai_citation:1‡My-IEP-Hero.pdf](file-service://file-NHYGtWA7vddieHwJbcv85Z)  
- Advocate Tools: CRM, Scheduling, Case Notes, AI Generators [oai_citation:2‡My-IEP-Hero.pdf](file-service://file-NHYGtWA7vddieHwJbcv85Z)  
- Compliance: FERPA/HIPAA, role-based access only [oai_citation:3‡My-IEP-Hero.pdf](file-service://file-NHYGtWA7vddieHwJbcv85Z)  

---

## 🔐 Priority
**High** — Non-negotiable guardrail for all development.
