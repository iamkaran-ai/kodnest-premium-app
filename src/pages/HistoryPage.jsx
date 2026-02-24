import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getHistoryState, setSelectedAnalysisId } from "../lib/history";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, hadCorrupted } = useMemo(() => {
    const state = getHistoryState();
    return {
      history: state.entries,
      hadCorrupted: state.hadCorrupted,
    };
  }, []);

  const openResult = (id) => {
    setSelectedAnalysisId(id);
    navigate(`/results?id=${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
      </CardHeader>
      <CardContent>
        {hadCorrupted ? (
          <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            One saved entry couldn't be loaded. Create a new analysis.
          </p>
        ) : null}
        {!history.length ? (
          <p className="text-sm text-slate-600">No entries yet. Run analysis from Practice page.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openResult(item.id)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{item.company}</p>
                    <p className="text-sm text-slate-600">{item.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-indigo-700">Score: {item.finalScore}/100</p>
                    <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
