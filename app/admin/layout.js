import AuthGuard from '@/components/common/AuthGuard';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  return (
    
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8 ml-64">
          {children}
        </main>
      </div>
    
  );
}