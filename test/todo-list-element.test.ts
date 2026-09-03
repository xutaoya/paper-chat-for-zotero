import { assert } from "chai";
import type { ExecutionPlan } from "../src/types/chat.ts";
import {
  mapExecutionPlanToTodoItems,
  mapStepStatusToTodoStatus,
} from "../src/modules/ui/chat-panel/TodoListElement.ts";

describe("todo list element", function () {
  it("maps execution plan steps to todo items", function () {
    const plan: ExecutionPlan = {
      id: "plan-1",
      summary: "Inspect and update schema",
      status: "in_progress",
      steps: [
        {
          id: "step-1",
          title: "Inspect the current data flow",
          status: "completed",
        },
        {
          id: "step-2",
          title: "Update the response schema",
          status: "in_progress",
          detail: "25%",
        },
        {
          id: "step-3",
          title: "Add coverage for edge cases",
          status: "pending",
        },
      ],
      createdAt: 1,
      updatedAt: 2,
    };

    const items = mapExecutionPlanToTodoItems(plan);
    assert.equal(items.length, 3);
    assert.equal(items[0].status, "completed");
    assert.equal(items[1].status, "in-progress");
    assert.equal(items[1].detail, "25%");
    assert.equal(items[2].status, "pending");
  });

  it("maps denied and failed steps to cancelled", function () {
    assert.equal(mapStepStatusToTodoStatus("denied"), "cancelled");
    assert.equal(mapStepStatusToTodoStatus("failed"), "cancelled");
    assert.equal(mapStepStatusToTodoStatus("in_progress"), "in-progress");
  });
});
