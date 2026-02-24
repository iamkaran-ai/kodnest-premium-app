import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getPassedCount, getTestChecklistState, isChecklistComplete, TEST_ITEMS } from "../lib/testChecklist";

export default function ShipGatePage() {
  const checklistState = getTestChecklistState();
  const passedCount = getPassedCount(checklistState);
  const complete = isChecklistComplete(checklistState);

  if (!complete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Locked</CardTitle>
          <CardDescription>Complete the full test checklist before shipping.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-700">Tests Passed: {passedCount} / {TEST_ITEMS.length}</p>
            <p className="mt-1 text-sm text-amber-700">Fix issues before shipping.</p>
          </div>
          <Link
            to="/prp/07-test"
            className="inline-block rounded-lg bg-[hsl(245,58%,51%)] px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Test Checklist
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Unlocked</CardTitle>
        <CardDescription>All checklist tests are complete.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-700">
            Ready to ship. Tests Passed: {passedCount} / {TEST_ITEMS.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
