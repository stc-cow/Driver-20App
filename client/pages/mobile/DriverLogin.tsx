import { FormEvent, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function DriverLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (remember && username) localStorage.setItem("driver.remember", username);
    if (!remember) localStorage.removeItem("driver.remember");
    window.location.hash = "#/driver-dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#001E60] to-[#F5F7FB] px-5 font-sans">
      <Card className="w-full max-w-sm bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
        <CardContent className="p-8">
          <div className="flex justify-center mb-5">
            <img src="aces-logo.png" alt="ACES Logo" className="h-12 w-auto" />
          </div>

          <h1 className="text-2xl font-semibold text-center text-blue-900 mb-1">Driver App</h1>
          <p className="text-center text-slate-500 text-sm mb-6">
            Sign in with your assigned credentials to access fueling tasks.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
              <Input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <Input
                type="password"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-700" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <a href="#" className="text-blue-700 hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-semibold shadow hover:bg-blue-900 transition">LOGIN</Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Powered by <span className="text-blue-800 font-semibold">ACES</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
