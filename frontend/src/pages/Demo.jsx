import PublicLayout from "../components/PublicLayout";

export default function Demo() {
  return (
    <PublicLayout>

      <div className="max-w-5xl mx-auto px-8 py-20">

        <h1 className="text-4xl font-bold mb-8">
          Platform Demonstration
        </h1>

        <div className="space-y-8 text-gray-600 leading-relaxed">

          <p>
            StressAI uses machine learning algorithms trained on
            speech features to detect stress levels.
          </p>

          <div className="p-6 border rounded-xl bg-gray-50">
            <h2 className="font-semibold text-lg mb-2">How It Works</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload or record speech</li>
              <li>MFCC feature extraction</li>
              <li>ML classification model</li>
              <li>Stress level prediction</li>
            </ul>
          </div>

        </div>

      </div>

    </PublicLayout>
  );
}