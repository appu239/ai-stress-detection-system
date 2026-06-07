export default function Security() {
  return (
    <div className="min-h-screen bg-white p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Security & Data Protection</h1>

      <p className="mb-6 text-gray-600">
        At StressAI, protecting user data is our top priority. We follow industry
        best practices to ensure data privacy and system security.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">🔐 Data Encryption</h2>
      <p className="text-gray-600">
        All user data is encrypted during transmission using secure HTTPS protocols.
        Sensitive information is protected against unauthorized access.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">🔐 Account Protection</h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>Password-based authentication.</li>
        <li>Role-based access control (Admin / User).</li>
        <li>Secure backend validation for all API requests.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">🔐 Privacy Commitment</h2>
      <p className="text-gray-600">
        We do not sell user data. Audio recordings are processed only for stress
        analysis and are not shared with third parties.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">🔐 Reporting Vulnerabilities</h2>
      <p className="text-gray-600">
        If you discover a security issue, please report it to:
        <span className="font-semibold"> security@stressai.com</span>
      </p>
    </div>
  );
}