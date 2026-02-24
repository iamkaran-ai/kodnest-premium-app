import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  getPassedCount,
  getTestChecklistState,
  isChecklistComplete,
  resetTestChecklistState,
  TEST_ITEMS,
  updateTestChecklistItem,
} from "../lib/testChecklist";

export default function TestChecklistPage() {
  const [checklistState, setChecklistState] = useState(() => getTestChecklistState());

  const passedCount = useMemo(() => getPassedCount(checklistState), [checklistState]);
  const complete = useMemo(() => isChecklistComplete(checklistState), [checklistState]);

  const handleToggle = (id, checked) => {
    const next = updateTestChecklistItem(id, checked);
    setChecklistState(next);
  };

  const handleReset = () => {
    const next = resetTestChecklistState();
    setChecklistState(next);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Release Test Checklist</CardTitle>
          <CardDescription>Complete all tests before unlocking ship mode.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-sm font-semibold text-indigo-700">Tests Passed: {passedCount} / 10</p>
            {!complete ? (
              <p className="mt-1 text-sm text-amber-700">Fix issues before shipping.</p>
            ) : (
              <p className="mt-1 text-sm text-emerald-700">All tests passed. Shipping is unlocked.</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300"
          >
            Reset checklist
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TEST_ITEMS.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-indigo-600"
                  checked={Boolean(checklistState[item.id])}
                  onChange={(event) => handleToggle(item.id, event.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  {item.hint ? <p className="mt-1 text-xs text-slate-500">How to test: {item.hint}</p> : null}
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
