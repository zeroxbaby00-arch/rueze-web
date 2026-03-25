import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { name, phone, email, password, role } = await req.json()

  if (!name || !phone || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Create auth user using service role key (server-side)
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, phone, role }
  })

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 })
  }

  if (!userData.user?.id) {
    return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
  }

  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert([{ id: userData.user.id, name, phone, role }])

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (role === 'seller') {
    const { error: sellerError } = await supabaseAdmin
      .from('sellers')
      .insert([{ user_id: userData.user.id, approved: false }])

    if (sellerError) {
      return NextResponse.json({ error: sellerError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'User created' }, { status: 201 })
}
