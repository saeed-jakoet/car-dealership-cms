export default function DashboardStats({ cars }) {
  const stats = [
    { title: 'Total Listings', value: cars.length },
    { title: 'Featured Models', value: cars.filter(c => c.featured).length },
    { title: 'Average Price', value: cars.reduce((a, b) => a + b.price, 0) / cars.length },
    { title: 'New This Week', value: cars.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 86400000)).length },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}