# Webhook Debugging Guide

## Step 1: Test Webhook Endpoint Accessibility

1. **Test if webhook endpoint is accessible:**
   ```
   GET /api/v1/purchases/webhook-test
   ```
   This should return a success response.

2. **Check your server logs** for any errors when accessing the webhook endpoint.

## Step 2: Verify Stripe Webhook Configuration

1. **Go to Stripe Dashboard > Developers > Webhooks**
2. **Check your webhook endpoint URL:**
   - Should be: `https://your-domain.com/api/v1/purchases/webhook`
   - For local testing: Use ngrok or similar tool

3. **Verify selected events:**
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

4. **Check webhook status:**
   - Look for any failed deliveries
   - Check the "Recent deliveries" section

## Step 3: Environment Variables

Make sure these are set in your `.env` file:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 4: Test Payment Flow

1. **Make a test payment** using Stripe Checkout
2. **Check server logs** for these messages:
   ```
   Webhook received - Headers: {...}
   Webhook endpoint secret: Set
   Received webhook event: checkout.session.completed
   ```

3. **If no webhook logs appear:**
   - Webhook URL is not accessible from Stripe
   - Check your domain/ngrok URL
   - Verify the webhook endpoint is public

## Step 5: Manual Testing

1. **After successful payment, copy the sessionId**
2. **Test manually:**
   ```
   GET /api/v1/purchases/test-webhook/{sessionId}
   ```
3. **Check if this works** - if it does, the issue is with webhook delivery

## Step 6: Common Issues

### Issue: No webhook logs
**Solution:** 
- Use ngrok for local testing: `ngrok http 3000`
- Update webhook URL in Stripe Dashboard
- Check if your server is accessible from internet

### Issue: Webhook signature verification failed
**Solution:**
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Copy the webhook secret from Stripe Dashboard

### Issue: Wrong event type
**Solution:**
- Make sure you selected `checkout.session.completed` in Stripe Dashboard
- Check server logs for "Unhandled event type"

### Issue: Session not found
**Solution:**
- Check if the session ID is correct
- Verify the session was created successfully

## Step 7: Debug Commands

```bash
# Test webhook endpoint
curl -X GET https://your-domain.com/api/v1/purchases/webhook-test

# Test with session ID (replace with actual session ID)
curl -X GET https://your-domain.com/api/v1/purchases/test-webhook/cs_test_...
```

## Step 8: Check Database

After successful payment, verify:
```sql
SELECT * FROM purchases ORDER BY createdat DESC LIMIT 5;
```

The purchase record should be created with:
- `studentid`: Your student ID
- `packageid`: Your package ID  
- `status`: 'active'
