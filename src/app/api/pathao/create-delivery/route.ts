import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const PATHAO_API_URL = 'https://api-hermes.pathao.com'
const PATHAO_CLIENT_ID = process.env.PATHAO_CLIENT_ID
const PATHAO_CLIENT_SECRET = process.env.PATHAO_CLIENT_SECRET
const PATHAO_ACCESS_TOKEN = process.env.PATHAO_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { orderId, pickupAddress, deliveryAddress, recipientName, recipientPhone, itemDescription, itemQuantity, itemPrice } = await request.json()

    if (!orderId || !pickupAddress || !deliveryAddress || !recipientName || !recipientPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get access token if not set
    let accessToken = PATHAO_ACCESS_TOKEN
    if (!accessToken && PATHAO_CLIENT_ID && PATHAO_CLIENT_SECRET) {
      const tokenResponse = await fetch(`${PATHAO_API_URL}/aladdin/api/v1/issue-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: PATHAO_CLIENT_ID,
          client_secret: PATHAO_CLIENT_SECRET,
          username: process.env.PATHAO_USERNAME,
          password: process.env.PATHAO_PASSWORD,
          grant_type: 'password'
        })
      })

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        accessToken = tokenData.access_token
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Pathao authentication failed' }, { status: 500 })
    }

    // Create delivery request
    const deliveryResponse = await fetch(`${PATHAO_API_URL}/aladdin/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        store_id: process.env.PATHAO_STORE_ID,
        merchant_order_id: orderId,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_address: deliveryAddress,
        delivery_type: 48, // Standard delivery
        item_type: 2, // Parcel
        special_instruction: '',
        item_quantity: itemQuantity || 1,
        item_weight: 0.5, // Default weight
        amount_to_collect: itemPrice,
        item_description: itemDescription || 'E-commerce order'
      })
    })

    if (!deliveryResponse.ok) {
      const errorData = await deliveryResponse.json()
      return NextResponse.json({ error: 'Pathao delivery creation failed', details: errorData }, { status: 500 })
    }

    const deliveryData = await deliveryResponse.json()

    // Update order with delivery ID
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        delivery_id: deliveryData.order_id || deliveryData.id,
        status: 'packed'
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order:', updateError)
    }

    return NextResponse.json({
      success: true,
      delivery_id: deliveryData.order_id || deliveryData.id,
      tracking_url: deliveryData.tracking_url || null
    })

  } catch (error) {
    console.error('Pathao API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}