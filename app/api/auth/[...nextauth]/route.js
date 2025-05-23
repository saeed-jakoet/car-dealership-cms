import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
  async authorize(credentials) {
    try {
      await dbConnect();
      
      const user = await User.findOne({ email: credentials.email })
        .select('+password')
        .lean();
  
      if (!user) {
        console.log('User not found');
        return null;
      }
  
      // Add bcrypt comparison
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );
  
      if (!isPasswordValid) {
        console.log('Invalid password');
        return null;
      }
  
      return {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      };
  
    } catch (error) {
      console.error('Auth error:', error);
      return null;
    }
  }
}),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: "/admin",
    error: "/auth/error"
  },

};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };