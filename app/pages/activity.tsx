import { useState, useEffect } from "react";
import { ExerciseEntry } from "../types";
import { exerciseTypes } from "../data/mock-data";
import { Dumbbell, Plus, Trash2, Clock, Flame, Info } from "lucide-react";

export function Activity() {
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [duration, setDuration] = useState(30);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const savedExercises = localStorage.getItem("exerciseEntries");
    if (savedExercises) setExerciseEntries(JSON.parse(savedExercises));
  }, []);

  const handleAddExercise = () => {
    if (!selectedExercise) return;

    const exercise = exerciseTypes.find((e) => e.name === selectedExercise);
    if (!exercise) return;

    const entry: ExerciseEntry = {
      id: Date.now().toString(),
      type: exercise.name,
      duration,
      caloriesBurned: Math.round(exercise.caloriesPerMinute * duration),
      date: new Date().toISOString().split("T")[0],
    };

    const newEntries = [...exerciseEntries, entry];
    setExerciseEntries(newEntries);
    localStorage.setItem("exerciseEntries", JSON.stringify(newEntries));

    // Reset form
    setSelectedExercise("");
    setDuration(30);
    setShowForm(false);
  };

  const handleDeleteEntry = (id: string) => {
    const newEntries = exerciseEntries.filter((entry) => entry.id !== id);
    setExerciseEntries(newEntries);
    localStorage.setItem("exerciseEntries", JSON.stringify(newEntries));
  };

  const today = new Date().toISOString().split("T")[0];
  const todayEntries = exerciseEntries.filter((entry) => entry.date === today);
  const totalCaloriesBurned = todayEntries.reduce((sum, entry) => sum + entry.caloriesBurned, 0);
  const totalDuration = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);

  const selectedExerciseData = exerciseTypes.find((e) => e.name === selectedExercise);
  const estimatedCalories = selectedExerciseData
    ? Math.round(selectedExerciseData.caloriesPerMinute * duration)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-destructive/10 rounded-xl">
              <Flame className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <div className="text-2xl text-primary">{totalCaloriesBurned}</div>
              <div className="text-sm text-muted-foreground">Kalori Terbakar</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl text-primary">{totalDuration}</div>
              <div className="text-sm text-muted-foreground">Menit Aktif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2>Catat Aktivitas</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tambah
          </button>
        </div>

        {showForm && (
          <div className="space-y-4">
            {/* Exercise Type */}
            <div>
              <label className="block mb-2 text-sm">Jenis Aktivitas</label>
              <div className="grid md:grid-cols-2 gap-2">
                {exerciseTypes.map((exercise) => (
                  <button
                    key={exercise.name}
                    onClick={() => setSelectedExercise(exercise.name)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedExercise === exercise.name
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-accent border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm opacity-80">{exercise.caloriesPerMinute} kal/menit</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedExercise && (
              <>
                {/* Duration */}
                <div>
                  <label className="block mb-2 text-sm">Durasi (menit)</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDuration(Math.max(5, duration - 5))}
                      className="w-10 h-10 bg-secondary rounded-lg hover:bg-secondary/80"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-24 text-center px-4 py-2 bg-input-background border border-border rounded-lg"
                    />
                    <button
                      onClick={() => setDuration(duration + 5)}
                      className="w-10 h-10 bg-secondary rounded-lg hover:bg-secondary/80"
                    >
                      +
                    </button>
                    <div className="flex-1 text-right">
                      <div className="text-2xl text-destructive">{estimatedCalories}</div>
                      <div className="text-xs text-muted-foreground">kalori terbakar</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddExercise}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedExercise("");
                      setDuration(30);
                    }}
                    className="px-6 bg-secondary py-3 rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Today's Activities */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        <h3 className="mb-4">Aktivitas Hari Ini</h3>
        {todayEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada aktivitas yang dicatat</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEntries.map((entry) => (
              <div key={entry.id} className="p-4 bg-accent rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{entry.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.duration} menit • {entry.caloriesBurned} kalori terbakar
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="text-blue-900 mb-2">Tips Aktivitas Fisik</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Lakukan minimal 30 menit aktivitas fisik setiap hari</li>
              <li>• Mulai dengan intensitas ringan dan tingkatkan secara bertahap</li>
              <li>• Kombinasikan cardio dan latihan kekuatan untuk hasil optimal</li>
              <li>• Jangan lupa pemanasan sebelum dan pendinginan setelah olahraga</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
