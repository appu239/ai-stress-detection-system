import PublicLayout from "../components/PublicLayout";

export default function HelpCenter() {
  return (
    <PublicLayout>

      <div className="max-w-4xl mx-auto px-8 py-20">

        <h1 className="text-4xl font-bold mb-10">
          Help Center
        </h1>

        <div className="space-y-10">

          <div>
            <h2 className="text-xl font-semibold mb-3">
              Account & Login Issues
            </h2>
            <p className="text-gray-600">
              Ensure credentials are correct and backend server is running.
              If problem persists, contact support.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              Audio Not Working?
            </h2>
            <p className="text-gray-600">
              Enable microphone permissions and check internet connection.
            </p>
          </div>

        </div>

      </div>

    </PublicLayout>
  );
}