import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin user
    const newAdmin = await User.create({
      email,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('New admin created:', newAdmin);

    return new Response(
      JSON.stringify({ success: true, message: 'Admin account created successfully' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin setup error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', detail: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
