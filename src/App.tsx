import { useEffect, useState } from "react";
import axios from "axios";
import { type TodoItem } from "./types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "cally";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Weekend",
];

function App() {
  const [inputText, setInputText] = useState("");
  const [activeDay, setActiveDay] = useState("Monday");
  const [weekTodos, setWeekTodos] = useState<TodoItem[]>([]);
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [curTodoId, setCurTodoId] = useState("");
  const [currentTime, setCurrentTime] = useState(dayjs());

  /* fetchData */
  async function fetchData() {
    try {
      const res = await axios.get<TodoItem[]>("/api/todo");
      const sortedData = res.data.sort(compareDate);
      setWeekTodos(sortedData);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* handle user key down */
  async function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    day: string,
  ) {
    if (e.key === "Enter") {
      if (inputText.trim() === "") {
        alert("Your to-do is empty!!!");
        return;
      }

      if (mode === "ADD") {
        try {
          await axios.post("/api/todo", {
            day: day,
            todoText: inputText,
          });

          await fetchData();
        } catch (error) {
          console.error("Add todo error:", error);
          alert("Failed to save to-do. Please try again.");
          return;
        }
      } else if (mode === "EDIT") {
        try {
          const res = await axios.patch<TodoItem>("/api/todo", {
            id: curTodoId,
            todoText: inputText,
          });
          setWeekTodos((prev) =>
            prev.map((todo) => (todo.id === curTodoId ? res.data : todo)),
          );
        } catch (error) {
          console.error("Edit todo error:", error);
          alert("Failed to update to-do. Please try again.");
          return;
        }
        setMode("ADD");
        setCurTodoId("");
      }

      setInputText("");
    }
  }

  /* Toggle Checkbox */
  const toggleDone = async (id: string) => {
    const target = weekTodos.find((todo) => todo.id === id);
    if (!target) return;

    try {
      const res = await axios.patch<TodoItem>("/api/todo", {
        id,
        isDone: !target.isDone,
      });
      setWeekTodos((prev) =>
        prev.map((todo) => (todo.id === id ? res.data : todo)),
      );
    } catch (error) {
      console.error("Toggle done error:", error);
      alert("Failed to update to-do. Please try again.");
    }
  };

  /* Delete Todo */
  const handleDelete = async (id: string) => {
    try {
      await axios.delete("/api/todo", { data: { id } });
      setWeekTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Delete todo error:", error);
      alert("Failed to delete to-do. Please try again.");
    }
  };

  /* Open Edit Mode */
  const handleEdit = (todo: TodoItem) => {
    setMode("EDIT");
    setCurTodoId(todo.id);
    setInputText(todo.todoText);
    setActiveDay(todo.day);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col items-center">
      <header className="mb-6 text-center">
  <h1 className="text-3xl font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]">
    My Weekly Dashboard
  </h1>
  <p className="text-gray-500 text-sm mt-2">
    {currentTime.format("dddd, D MMMM YYYY")}
  </p>
  <div className="flex justify-center gap-2 mt-3">
    <div className="aura aura-silver">
    <div className="flex flex-col items-center bg-white text-gray-500-content rounded-box px-3 py-2 min-w-[60px]">
      <span className="text-3xl font-bold tabular-nums">
        {currentTime.format("hh")}
      </span>
      <span className="text-xs">hour</span>
    </div>
    </div>

    <div className="aura aura-silver">
    <div className="flex flex-col items-center bg-white text-gray-500-content rounded-box px-3 py-2 min-w-[60px]">
      <span className="text-3xl font-bold tabular-nums">
        {currentTime.format("mm")}
      </span>
      <span className="text-xs">min</span>
    </div>
    </div>

    <div className="aura aura-silver">
    <div className="flex flex-col items-center bg-white text-gray-500-content rounded-box px-3 py-2 min-w-[60px]">
      <span className="text-3xl font-bold tabular-nums">
        {currentTime.format("ss")}
      </span>
      <span className="text-xs">sec</span>
    </div>
    </div>

    <div className="aura aura-silver">
    <div className="flex flex-col items-center bg-white text-gray-500-content rounded-box px-3 py-2 min-w-[60px]">
      <span className="text-3xl font-bold tabular-nums">
        {currentTime.format("A")}
      </span>
      <span className="text-xs">period</span>
    </div>
  </div>
  </div>
</header>

      {/* Grid 3 Columns x 2 Rows (6 Cards) */}
      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 p-3 items-start">
        {DAYS_OF_WEEK.map((day) => {
          const dayTodos = weekTodos.filter((todo) => todo.day === day);

          return (
            <div className="aura aura-rainbow">
              <div
                key={day}
                className="card bg-base-100 shadow-xl border-2 p-5 w-full flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold mb-3 drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]">
                    {day}
                  </h2>

                  {/* Input Area */}

                  <div className="form-control  bg-base-100mb-4">
                    <label className="label">
                      <span className="label-text">
                        {mode === "EDIT" && curTodoId && activeDay === day
                          ? "Editing To-Do (Enter to Save):"
                          : "Add New To-Do:"}
                      </span>
                    </label>
                    <div className="aura aura-dual">
                      <input
                        type="text"
                        data-cy={`input-text-${day}`}
                        placeholder={
                          mode === "EDIT" && activeDay === day
                            ? "Edit your to-do..."
                            : "What needs to be done?"
                        }
                        className="input input-bordered w-full"
                        value={
                          mode === "EDIT" && activeDay === day
                            ? inputText
                            : activeDay === day
                              ? inputText
                              : ""
                        }
                        onFocus={() => {
                          if (mode === "ADD") setActiveDay(day);
                        }}
                        onChange={(e) => {
                          setActiveDay(day);
                          setInputText(e.target.value);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, day)}
                      />
                    </div>
                  </div>

                  {/* Todo List Area */}

                  <div className="flex flex-col gap-2 max-h-60 overflow-auto px-3 py-2 -mx-3">
                    {dayTodos.length === 0 ? (
                      <p className="text-center text-gray-400 py-4">
                        No to-dos yet!
                      </p>
                    ) : (
                      dayTodos.map((todo) => {
                        const { date, time } = formatDateTime(todo.createdAt);

                        return (
                          <div className="aura text-purple-300">
                            <div
                              key={todo.id}
                              className="flex items-center justify-between border p-3 rounded-xl bg-base-100 hover:bg-base-200 transition-colors shadow-sm"
                            >
                              <label className="flex items-center gap-3 cursor-pointer flex-1 mr-2">
                                <input
                                  type="checkbox"
                                  checked={todo.isDone}
                                  onChange={() => toggleDone(todo.id)}
                                  className="checkbox checkbox-success"
                                />
                                <div className="flex flex-col">
                                  <span
                                    className={`text-sm font-medium ${
                                      todo.isDone
                                        ? "line-through text-gray-400"
                                        : ""
                                    }`}
                                  >
                                    {todo.todoText}
                                  </span>
                                  {time !== "N/A" && (
                                    <span className="text-xs text-gray-500">
                                      {date} {time}
                                    </span>
                                  )}
                                </div>
                              </label>

                              {/* Action Buttons */}
                              <div className="flex gap-1">
                                <div className="aura aura-glow text-blue-400">
                                  <button
                                    onClick={() => handleEdit(todo)}
                                    className="btn btn-xs text-blue-400"
                                  >
                                    Edit
                                  </button>
                                </div>
                                <div className="aura aura-glow  text-red-400">
                                  <button
                                    onClick={() => handleDelete(todo.id)}
                                    className="btn btn-xs text-red-400"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <div className="aura aura-gold">
        <calendar-date className="cally bg-base-100 border border-base-300 shadow-lg rounded-box">
          <svg
            aria-label="Previous"
            className="fill-current size-4"
            slot="previous"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
          </svg>
          <svg
            aria-label="Next"
            className="fill-current size-4"
            slot="next"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
          </svg>
          <calendar-month></calendar-month>
        </calendar-date>
      </div>
    </div>
  );
}

export default App;

dayjs.extend(utc);
dayjs.extend(timezone);

function formatDateTime(dateStr: string) {
  if (!dayjs(dateStr).isValid()) {
    return { date: "N/A", time: "N/A" };
  }
  const dt = dayjs.utc(dateStr).local();
  const date = dt.format("D/MM/YY");
  const time = dt.format("hh:mm A");
  return { date, time };
}

function compareDate(a: TodoItem, b: TodoItem) {
  const da = dayjs(a.createdAt);
  const db = dayjs(b.createdAt);
  return da.isBefore(db) ? -1 : 1;
}