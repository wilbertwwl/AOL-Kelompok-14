import { useState, useEffect } from "react";
import { UserProfile, FoodEntry, ExerciseEntry } from "../types";
import { Activity as ActivityIcon, Flame, TrendingUp, Apple, Dumbbell } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);

  useEffect(() => {
    // Load from localStorage
    const savedProfile = localStorage.getItem("healthProfile");
    const savedFoods = localStorage.getItem("foodEntries");
    const savedExercises = localStorage.getItem("exerciseEntries");

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedFoods) setFoodEntries(JSON.parse(savedFoods));
    if (savedExercises) setExerciseEntries(JSON.parse(savedExercises));
  }, []);

  // Calculate today's stats
  const today = new Date().toISOString().split("T")[0];
  const todayFoods = foodEntries.filter((entry) => entry.date === today);
  const todayExercises = exerciseEntries.filter((entry) => entry.date === today);

  const totalCaloriesConsumed = todayFoods.reduce((sum, entry) => sum + entry.calories, 0);
  const totalCaloriesBurned = todayExercises.reduce((sum, entry) => sum + entry.caloriesBurned, 0);
  const totalProtein = todayFoods.reduce((sum, entry) => sum + entry.protein, 0);
  const totalFat = todayFoods.reduce((sum, entry) => sum + entry.fat, 0);
  const totalCarbs = todayFoods.reduce((sum, entry) => sum + entry.carbs, 0);

  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
  const remainingCalories = profile ? profile.calorieTarget - netCalories : 0;

  // Macro data for chart
  const macroData = [
    { name: "Protein", value: totalProtein, color: "#3b82f6" },
    { name: "Lemak", value: totalFat, color: "#f59e0b" },
    { name: "Karbo", value: totalCarbs, color: "#10b981" },
  ];

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <ActivityIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="mb-4">Selamat Datang! 👋</h2>
          <p className="text-muted-foreground mb-6">
            Untuk memulai tracking kesehatan Anda, silakan lengkapi profil terlebih dahulu.
          </p>
          <a
            href="/profile"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Lengkapi Profil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-border">
        <h2 className="mb-2">Halo! 👋</h2>
        <p className="text-muted-foreground">
          Target harian: <span className="text-primary">{profile.calorieTarget} kalori</span>
        </p>
      </div>

      {/* Calorie Counter */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-destructive" />
            Kalori Hari Ini
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-accent rounded-xl">
            <div className="text-2xl text-primary mb-1">{totalCaloriesConsumed}</div>
            <div className="text-xs text-muted-foreground">Dikonsumsi</div>
          </div>
          <div className="text-center p-4 bg-accent rounded-xl">
            <div className="text-2xl text-primary mb-1">{totalCaloriesBurned}</div>
            <div className="text-xs text-muted-foreground">Terbakar</div>
          </div>
          <div className="text-center p-4 bg-accent rounded-xl">
            <div className="text-2xl text-primary mb-1">{Math.max(0, remainingCalories)}</div>
            <div className="text-xs text-muted-foreground">Sisa</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              remainingCalories < 0 ? "bg-destructive" : "bg-primary"
            }`}
            style={{
              width: `${Math.min(100, (netCalories / profile.calorieTarget) * 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-center mt-2 text-muted-foreground">
          {remainingCalories < 0
            ? `Anda sudah melebihi target ${Math.abs(remainingCalories)} kalori`
            : `Anda masih bisa konsumsi ${remainingCalories} kalori`}
        </p>
      </div>

      {/* Macro Breakdown */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        <h3 className="mb-4">Makronutrien Hari Ini</h3>
        
        {totalProtein + totalFat + totalCarbs > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm">Protein</span>
                <span className="font-medium text-primary">{totalProtein.toFixed(1)}g</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-sm">Lemak</span>
                <span className="font-medium" style={{ color: "#f59e0b" }}>{totalFat.toFixed(1)}g</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm">Karbohidrat</span>
                <span className="font-medium" style={{ color: "#10b981" }}>{totalCarbs.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Apple className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada makanan yang dicatat hari ini</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Apple className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl text-primary">{todayFoods.length}</div>
              <div className="text-sm text-muted-foreground">Makanan Tercatat</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl text-primary">{todayExercises.length}</div>
              <div className="text-sm text-muted-foreground">Aktivitas Tercatat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Tips */}
      {profile.healthCondition.includes("Diabetes") && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-amber-600 mt-1" />
            <div>
              <h4 className="text-amber-900 mb-2">Tips untuk Diabetes</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Pilih makanan dengan indeks glikemik rendah</li>
                <li>• Makan secara teratur dalam porsi kecil</li>
                <li>• Hindari makanan tinggi gula dan karbohidrat sederhana</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
