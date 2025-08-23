# Stripe Integration Setup

## Environment Variables

Add these to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook endpoint secret
FRONTEND_URL=https://your-domain.com # Your frontend URL (must include http:// or https://)
```

**Important:** The `FRONTEND_URL` must include the scheme (http:// or https://). Examples:
- ✅ `https://yourdomain.com`
- ✅ `http://localhost:5173`
- ❌ `yourdomain.com` (missing scheme)
- ❌ `localhost:5173` (missing scheme)

## Database Migration

Run this SQL to add Stripe payment tracking:

```sql
ALTER TABLE purchases ADD COLUMN stripePaymentId VARCHAR(255);
CREATE INDEX idx_purchases_stripe_payment_id ON purchases(stripePaymentId);
```

## API Endpoints

### 1. Create Checkout Session
```
POST /api/v1/purchases/payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageId": 1
}
```

Response:
```json
{
  "message": "Checkout session created successfully",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_...",
  "amount": 500000,
  "package": {
    "id": 1,
    "name": "Basic Package",
    "price": 500000,
    "totalHours": 10,
    "teacherName": "John Doe"
  }
}
```

### 2. Webhook Endpoint
```
POST /api/v1/purchases/webhook
```

This endpoint receives Stripe webhooks and automatically creates purchase records when payments succeed.

## Frontend Integration

1. Call the payment intent endpoint:
```javascript
const response = await fetch('/api/v1/purchases/payment-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ packageId: 1 })
});

const { checkoutUrl } = await response.json();

// Redirect user to Stripe Checkout
window.location.href = checkoutUrl;
```

2. Handle success/cancel redirects:
```javascript
// On your success page (/payment/success)
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  // Payment was successful
  console.log('Payment completed!');
}

// On your cancel page (/payment/cancel)
console.log('Payment was cancelled');
```

## Stripe Dashboard Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/v1/purchases/webhook`
3. Select events: `checkout.session.completed`, `checkout.session.expired`
4. Copy the webhook secret to your `.env` file

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Expired: `4000 0000 0000 0069`

## Payment Flow

1. Frontend calls `POST /api/v1/purchases/payment-intent` with packageId
2. Backend creates Stripe Checkout session and returns checkout URL
3. Frontend redirects user to checkout URL
4. User completes payment on Stripe's hosted page
5. Stripe redirects to success/cancel URL
6. Stripe sends webhook to `/api/v1/purchases/webhook` on success
7. Backend automatically creates purchase record
