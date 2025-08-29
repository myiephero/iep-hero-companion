# 🔒 Pull Request Checklist — My IEP Hero

Before this PR is merged, confirm the following:

## ✅ Namespace & Role Separation
- [ ] All **Parent routes** remain under `#/parent/...`
- [ ] All **Advocate routes** remain under `#/advocate/...`
- [ ] No navigation or tool crosses from one role to the other
- [ ] Router guard (`src/router.tsx`) still enforces active role
- [ ] Sidebars/TopBar only show links relevant to active role
- [ ] Emergent integrations remain **role-scoped** (`parent` vs `advocate`)

## 🔐 Compliance & Security
- [ ] No `.env` secrets committed
- [ ] FERPA/HIPAA considerations upheld
- [ ] Supabase policies unchanged or stricter

## 🧪 Testing
- [ ] Verified navigation as Parent
- [ ] Verified navigation as Advocate
- [ ] Mismatched route redirects to correct dashboard
- [ ] Local build succeeds (`npm run build`)

---

### 📖 Notes
<!-- Add any details about what this PR changes, and why -->
