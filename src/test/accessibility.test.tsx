import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import fs from "fs";
import path from "path";
import SeatPicker from "@/components/SeatPicker";
import CreateEventForm from "@/components/CreateEventForm";

const noop = () => {};

// ---------------------------------------------------------------------------
// Source audit: every icon-only <button> in src/ must carry an aria-label
// ---------------------------------------------------------------------------

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function unlabeledIconOnlyButtons(root: string): string[] {
  const bad: string[] = [];
  for (const file of walk(root)) {
    const src = fs.readFileSync(file, "utf8");
    // opening tag: allow => and quoted/backtick attribute values
    const re = /<(?:motion\.)?button\b((?:=>|[^>"'`]|"[^"]*"|'[^']*'|`[^`]*`)*)>([\s\S]*?)<\/(?:motion\.)?button>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const attrs = m[1];
      const inner = m[2];
      const hasIcon = /<[A-Z]/.test(inner);
      // strip JSX tags, then drop brace expressions that hold no string literal
      let text = inner.replace(/<[^>]*>/g, "");
      text = text.replace(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, (expr) =>
        /'[^']*'|"[^"]*"/.test(expr) ? expr : ""
      );
      text = text.replace(/[{}]/g, "");
      if (hasIcon && !text.trim() && !/aria-label/.test(attrs)) {
        bad.push(`${file}: ${attrs.trim().slice(0, 60)}`);
      }
    }
  }
  return bad;
}

describe("icon-only buttons", () => {
  it("every icon-only button in src/ has an aria-label", () => {
    const srcRoot = path.resolve(__dirname, "..");
    expect(unlabeledIconOnlyButtons(srcRoot)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// SeatPicker: keyboard operable, named seats
// ---------------------------------------------------------------------------

describe("SeatPicker accessibility", () => {
  it("renders every seat as a focusable button with an accessible name", () => {
    render(<SeatPicker maxSelectable={4} selectedSeats={[]} onSelectionChange={noop} />);
    const seats = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label")?.startsWith("Seat "));
    // 8 rows: 8+10+12+14+14+12+10+8 = 88 seats
    expect(seats.length).toBe(88);
    for (const seat of seats) {
      expect(seat.tagName).toBe("BUTTON");
      expect(seat).toHaveAttribute("type", "button");
      expect(seat).not.toHaveAttribute("tabindex", "-1");
      expect(seat.getAttribute("aria-pressed")).toBe("false");
    }
    expect(screen.getByLabelText("Seat A1, available")).toBeInTheDocument();
  });

  it("selects a seat with Enter and Space and reports pressed state", () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <SeatPicker maxSelectable={4} selectedSeats={[]} onSelectionChange={onSelectionChange} />
    );
    const seat = screen.getByLabelText("Seat B3, available");
    fireEvent.keyDown(seat, { key: "Enter" });
    expect(onSelectionChange).toHaveBeenCalledWith(["B3"]);
    fireEvent.keyDown(seat, { key: " " });
    expect(onSelectionChange).toHaveBeenCalledWith(["B3"]);

    rerender(<SeatPicker maxSelectable={4} selectedSeats={["B3"]} onSelectionChange={onSelectionChange} />);
    const selected = screen.getByLabelText("Seat B3, selected");
    expect(selected).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(selected, { key: "Enter" });
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  it("locks booked and pending seats with descriptive labels", () => {
    render(
      <SeatPicker
        maxSelectable={4}
        selectedSeats={[]}
        onSelectionChange={noop}
        bookedSeats={["A1"]}
        pendingSeats={["A2"]}
      />
    );
    const booked = screen.getByLabelText("Seat A1, booked");
    expect(booked).toBeDisabled();
    const pending = screen.getByLabelText("Seat A2, locked by another user");
    expect(pending).toBeDisabled();
    fireEvent.keyDown(booked, { key: "Enter" });
    // disabled seats must not react
    expect(booked).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// CreateEventForm: close button is named
// ---------------------------------------------------------------------------

describe("CreateEventForm accessibility", () => {
  it("the icon-only close button has an aria-label", () => {
    render(<CreateEventForm onClose={noop} onCreated={noop} />);
    expect(screen.getByLabelText("Close form")).toBeInTheDocument();
  });
});
