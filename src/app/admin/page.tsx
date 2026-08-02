import Link from "next/link";
import { getAllProducts } from "@/services/productService";

export default function AdminDashboard() {
  const products = getAllProducts();
  const clothing = products.filter((p) => p.category === "clothing");
  const watches = products.filter((p) => p.category === "watches");
  const shoes = products.filter((p) => p.category === "shoes");
  const featured = products.filter((p) => p.featured);

  const stats = [
    { label: "Total Products", value: products.length, icon: "📦" },
    { label: "Clothing", value: clothing.length, icon: "👕" },
    { label: "Watches", value: watches.length, icon: "⌚" },
    { label: "Shoes", value: shoes.length, icon: "👟" },
    { label: "Featured", value: featured.length, icon: "⭐" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your Brand Industrys catalogue
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-accent px-4 py-2 text-sm font-medium tracking-wider uppercase text-background transition-colors hover:bg-accent-hover"
        >
          Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border p-4"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="mt-8">
        <h2 className="text-lg font-bold tracking-wider text-foreground mb-4">
          Recent Products
        </h2>
        <div className="border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-sm text-foreground">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted capitalize">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {product.currency} {product.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-xs text-accent hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href="/admin/products"
          className="mt-4 inline-block text-xs text-muted hover:text-accent transition-colors"
        >
          View all products →
        </Link>
      </div>
    </div>
  );
}
