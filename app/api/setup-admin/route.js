import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcryptjs'; // Add missing import

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // Check for existing admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return Response.json(
        { error: 'Admin already exists' },
        { status: 400 }
      );
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('New admin created:', newAdmin);
    return Response.json({ success: true });

  } catch (error) {
    console.error('Setup admin error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}