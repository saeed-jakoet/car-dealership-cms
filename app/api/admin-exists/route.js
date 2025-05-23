import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    // Check for admin users specifically
    const count = await User.countDocuments({ role: 'admin' });
    return Response.json({ exists: count > 0 });
  } catch (error) {
    console.error('Admin exists check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}