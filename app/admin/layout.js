import AdminSidebar from '@/components/admin/Sidebar';


export default function AdminLayout({ children }) {
  return (
   
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8 ml-64"> {/* Adjust margin to match sidebar width */}
            {children}
          </main>
        </div>
      </div>
  
  );
}