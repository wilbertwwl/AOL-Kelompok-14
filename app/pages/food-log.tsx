import { useState, useEffect } from "react";
import { UserProfile, FoodEntry } from "../types";
import { foodDatabase, foodAlternatives } from "../data/mock-data";
import { Search, Plus, AlertTriangle, Trash2, Info } from "lucide-react";

export function FoodLog() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [showWarning, setShowWarning] = useState(false);
  const [alternatives, setAlternatives] = useState<string[]>([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("healthProfile");
    const savedFoods = localStorage.getItem("foodEntries");

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedFoods) setFoodEntries(JSON.parse(savedFoods));
  }, []);

  const filteredFoods = searchQuery
    ? foodDatabase.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : foodDatabase;

  const handleSelectFood = (foodId: string) => {
    setSelectedFood(foodId);
    setServings(1);

    const food = foodDatabase.find((f) => f.id === foodId);
    if (food && profile?.healthCondition.includes("Diabetes") && food.glycemicIndex === "high") {
      setShowWarning(true);
      setAlternatives(foodAlternatives[foodId] || []);
    } else {
      setShowWarning(false);
      setAlternatives([]);
    }
  };

  const handleAddFood = () => {
    if (!selectedFood) return;

    const food = foodDatabase.find((f) => f.id === selectedFood);
    if (!food) return;

    const entry: FoodEntry = {
      id: Date.now().toString(),
      foodId: food.id,
      foodName: food.name,
      servings,
      calories: food.calories * servings,
      protein: food.protein * servings,
      fat: food.fat * servings,
      carbs: food.carbs * servings,
      date: new Date().toISOString().split("T")[0],
      mealType,
    };

    const newEntries = [...foodEntries, entry];
    setFoodEntries(newEntries);
    localStorage.setItem("foodEntries", JSON.stringify(newEntries));

    // Reset form
    setSelectedFood(null);
    setServings(1);
    setSearchQuery("");
    setShowWarning(false);
    setAlternatives([]);
  };

  const handleDeleteEntry = (id: string) => {
    const newEntries = foodEntries.filter((entry) => entry.id !== id);
    setFoodEntries(newEntries);
    localStorage.setItem("foodEntries", JSON.stringify(newEntries));
  };

  const today = new Date().toISOString().split("T")[0];
  const todayEntries = foodEntries.filter((entry) => entry.date === today);

  const selectedFoodData = selectedFood ? foodDatabase.find((f) => f.id === selectedFood) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        <h2 className="mb-6">Catat Makanan</h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Cari makanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Food List */}
        {searchQuery && (
          <div className="mb-6 max-h-64 overflow-y-auto space-y-2">
            {filteredFoods.map((food) => (
              <button
                key={food.id}
                onClick={() => handleSelectFood(food.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedFood === food.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-accent border-border hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm opacity-80">{food.servingSize}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{food.calories} kal</div>
                    <div className="text-xs opacity-80">
                      P:{food.protein}g F:{food.fat}g C:{food.carbs}g
                    </div>
                  </div>
                </div>
                {profile?.healthCondition.includes("Diabetes") && food.glycemicIndex === "high" && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Tinggi Gula - Tidak disarankan
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Selected Food Details */}
        {selectedFoodData && (
          <div className="mb-6 p-4 bg-accent rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-primary">{selectedFoodData.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedFoodData.servingSize}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedFood(null);
                  setShowWarning(false);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Warning */}
            {showWarning && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-amber-900 mb-2">⚠️ Peringatan Diabetes</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      Makanan ini memiliki indeks glikemik tinggi dan tidak disarankan untuk penderita diabetes.
                    </p>
                    {alternatives.length > 0 && (
                      <div>
                        <p className="text-sm text-amber-800 mb-2">Saran alternatif yang lebih sehat:</p>
                        <div className="space-y-2">
                          {alternatives.map((altId) => {
                            const altFood = foodDatabase.find((f) => f.id === altId);
                            return altFood ? (
                              <button
                                key={altId}
                                onClick={() => handleSelectFood(altId)}
                                className="w-full text-left p-3 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                              >
                                <div className="font-medium text-sm text-amber-900">{altFood.name}</div>
                                <div className="text-xs text-amber-700">{altFood.calories} kal • GI Rendah</div>
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Serving Size */}
            <div className="mb-4">
              <label className="block mb-2 text-sm">Jumlah Porsi</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  className="w-10 h-10 bg-secondary rounded-lg hover:bg-secondary/80"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={servings}
                  onChange={(e) => setServings(parseFloat(e.target.value))}
                  className="w-20 text-center px-4 py-2 bg-input-background border border-border rounded-lg"
                />
                <button
                  onClick={() => setServings(servings + 0.5)}
                  className="w-10 h-10 bg-secondary rounded-lg hover:bg-secondary/80"
                >
                  +
                </button>
              </div>
            </div>

            {/* Nutritional Info */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="text-lg text-primary">{(selectedFoodData.calories * servings).toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Kalori</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="text-lg text-blue-600">{(selectedFoodData.protein * servings).toFixed(1)}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="text-lg text-amber-600">{(selectedFoodData.fat * servings).toFixed(1)}g</div>
                <div className="text-xs text-muted-foreground">Lemak</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="text-lg text-green-600">{(selectedFoodData.carbs * servings).toFixed(1)}g</div>
                <div className="text-xs text-muted-foreground">Karbo</div>
              </div>
            </div>

            {/* Meal Type */}
            <div className="mb-4">
              <label className="block mb-2 text-sm">Waktu Makan</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "breakfast", label: "Sarapan", icon: "🌅" },
                  { value: "lunch", label: "Makan Siang", icon: "☀️" },
                  { value: "dinner", label: "Makan Malam", icon: "🌙" },
                  { value: "snack", label: "Camilan", icon: "🍪" },
                ].map((meal) => (
                  <button
                    key={meal.value}
                    onClick={() => setMealType(meal.value as any)}
                    className={`p-2 rounded-lg text-xs transition-all ${
                      mealType === meal.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <div>{meal.icon}</div>
                    <div>{meal.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddFood}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambahkan
            </button>
          </div>
        )}
      </div>

      {/* Today's Log */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
        <h3 className="mb-4">Catatan Hari Ini</h3>
        {todayEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada makanan yang dicatat</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEntries.map((entry) => (
              <div key={entry.id} className="p-4 bg-accent rounded-lg flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{entry.foodName}</span>
                    <span className="text-xs px-2 py-1 bg-card rounded">
                      {entry.mealType === "breakfast" && "🌅 Sarapan"}
                      {entry.mealType === "lunch" && "☀️ Makan Siang"}
                      {entry.mealType === "dinner" && "🌙 Makan Malam"}
                      {entry.mealType === "snack" && "🍪 Camilan"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.servings}x porsi • {entry.calories} kal • P:{entry.protein.toFixed(1)}g F:
                    {entry.fat.toFixed(1)}g C:{entry.carbs.toFixed(1)}g
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
    </div>
  );
}
