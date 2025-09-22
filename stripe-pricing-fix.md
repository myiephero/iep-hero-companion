# STRIPE DASHBOARD PRICING CORRECTIONS NEEDED

## Current Issues (found in your Stripe dashboard):

### Advocate Annual Plans - WRONG CONFIGURATION:
- `price_1S6eXk8iKZXV0srZYfDQoLE5` (Starter Annual) → Currently: $39/month | Should be: $468/year
- `price_1S6eXk8iKZXV0srZk5htFfFP` (Pro Annual) → Currently: $75/month | Should be: $900/year  
- `price_1S6eXl8iKZXV0srZNPTt6cI1` (Agency Annual) → Currently: $199/month | Should be: $2,388/year

## CORRECT Stripe Dashboard Configuration:

### 1. Pro Annual (price_1S6eXk8iKZXV0srZk5htFfFP):
   - Billing Period: **Yearly**
   - Amount: **$900.00**
   - Currency: USD
   - Description: "Advocate Pro Annual Plan"

### 2. Starter Annual (price_1S6eXk8iKZXV0srZYfDQoLE5):
   - Billing Period: **Yearly** 
   - Amount: **$468.00**
   - Currency: USD
   - Description: "Advocate Starter Annual Plan"

### 3. Agency Annual (price_1S6eXl8iKZXV0srZNPTt6cI1):
   - Billing Period: **Yearly**
   - Amount: **$2,388.00** 
   - Currency: USD
   - Description: "Advocate Agency Annual Plan"

## How to Fix in Stripe Dashboard:
1. Go to Stripe Dashboard → Products → [Select Product]
2. Edit the Price ID that's wrong
3. Change "Billing Period" from "Monthly" to "Yearly"  
4. Update the amount to the full annual amount
5. Save changes

## Verification:
After fixing, test the Pro Annual plan - Stripe checkout should show "$900.00 per year" instead of "$75.00 per month"
