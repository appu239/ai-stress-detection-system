import PublicLayout from "../components/PublicLayout";

export default function Pricing() {
  return (
    <PublicLayout>

      <div className="max-w-6xl mx-auto px-8 py-24">

        <h1 className="text-5xl font-bold text-center mb-16">
          Simple Transparent Pricing
        </h1>

        <div className="grid md:grid-cols-3 gap-10">

          <div className="border p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Starter</h2>
            <p className="text-3xl font-bold mb-6">Free</p>
            <ul className="space-y-2 text-gray-600">
              <li>Basic Stress Analysis</li>
              <li>Limited History</li>
              <li>Email Support</li>
            </ul>
          </div>

          <div className="border p-8 rounded-2xl shadow-xl scale-105 bg-blue-50">
            <h2 className="text-xl font-bold mb-4">Professional</h2>
            <p className="text-3xl font-bold mb-6">₹999/month</p>
            <ul className="space-y-2 text-gray-600">
              <li>Advanced Analytics</li>
              <li>Unlimited History</li>
              <li>Priority Support</li>
            </ul>
          </div>

          <div className="border p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Enterprise</h2>
            <p className="text-3xl font-bold mb-6">Custom</p>
            <ul className="space-y-2 text-gray-600">
              <li>Institution Dashboard</li>
              <li>Admin Controls</li>
              <li>Dedicated Support</li>
            </ul>
          </div>

        </div>

      </div>

    </PublicLayout>
  );
}