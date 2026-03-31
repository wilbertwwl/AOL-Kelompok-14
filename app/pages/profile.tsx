import { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { User, Target, AlertCircle } from "lucide-react";

export function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    gender: "male",
    height: 170,
    weight: 65,
    healthCondition: [],
    goal: "maintain",
    calorieTarget: 2000,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("healthProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    // Calculate BMR and calorie target
    const bmr =
      profile.gender === "male"
        ? 88.362 + 13.397 * profile.weight + 4.799 * profile.height - 5.677 * profile.age
        : 447.593 + 9.247 * profile.weight + 3.098 * profile.height - 4.33 * profile.age;

    let calorieTarget = bmr * 1.375; // Light activity

    if (profile.goal === "lose") {
      calorieTarget -= 500; // Deficit for weight loss
    } else if (profile.goal === "gain") {
      calorieTarget += 500; // Surplus for weight gain
    }

    setProfile((prev) => ({ ...prev, calorieTarget: Math.round(calorieTarget) }));
  }, [profile.age, profile.gender, profile.height, profile.weight, profile.goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("healthProfile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleHealthCondition = (condition: string) => {
    setProfile((prev) => ({
      ...prev,
      healthCondition: prev.healthCondition.includes(condition)
        ? prev.healthCondition.filter((c) => c !== condition)
        : [...prev.healthCondition, condition],
    }));
  };

  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "Kurang Berat", color: "text-amber-600" };
    if (bmi < 25) return { text: "Normal", color: "text-green-600" };
    if (bmi < 30) return { text: "Kelebihan Berat", color: "text-amber-600" };
    return { text: "Obesitas", color: "text-red-600" };
  };

  const bmiCategory = getBMICategory(parseFloat(bmi));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2>Profil Kesehatan</h2>
            <p className="text-sm text-muted-foreground">Kelola informasi kesehatan Anda</p>
          </div>
        </div>

        {saved && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            ✓ Profil berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm">Usia</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Jenis Kelamin</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as "male" | "female" })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm">Tinggi Badan (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Berat Badan (kg)</label>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* BMI Display */}
          <div className="p-4 bg-accent rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">BMI Anda</div>
                <div className="text-2xl text-primary">{bmi}</div>
              </div>
              <div className={`${bmiCategory.color}`}>{bmiCategory.text}</div>
            </div>
          </div>

          {/* Health Conditions */}
          <div>
            <label className="block mb-3 text-sm">Kondisi Kesehatan</label>
            <div className="space-y-2">
              {["Diabetes", "Hipertensi", "Kolesterol Tinggi"].map((condition) => (
                <label
                  key={condition}
                  className="flex items-center gap-3 p-3 bg-accent rounded-lg cursor-pointer hover:bg-accent/70 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={profile.healthCondition.includes(condition)}
                    onChange={() => toggleHealthCondition(condition)}
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="block mb-3 text-sm">
              <Target className="inline w-4 h-4 mr-2" />
              Target Kesehatan
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { value: "lose", label: "Turunkan BB", icon: "📉" },
                { value: "maintain", label: "Jaga BB", icon: "⚖️" },
                { value: "gain", label: "Naikkan BB", icon: "📈" },
              ].map((goal) => (
                <label
                  key={goal.value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    profile.goal === goal.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="goal"
                    value={goal.value}
                    checked={profile.goal === goal.value}
                    onChange={(e) => setProfile({ ...profile, goal: e.target.value as any })}
                    className="sr-only"
                  />
                  <span className="text-2xl">{goal.icon}</span>
                  <span className="text-sm text-center">{goal.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Calorie Target */}
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm mb-1">Target Kalori Harian Anda</div>
                <div className="text-2xl text-primary">{profile.calorieTarget} kalori</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Dihitung berdasarkan BMR dan tingkat aktivitas ringan
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Simpan Profil
          </button>
        </form>
      </div>
    </div>
  );
}
