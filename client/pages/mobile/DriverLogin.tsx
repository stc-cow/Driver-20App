import { FormEvent, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DriverLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (remember && username) localStorage.setItem("driver.remember", username);
    if (!remember) localStorage.removeItem("driver.remember");
    window.location.hash = "#/driver-dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-[#001E60] via-[#0b1b3a] to-[#F5F7FB] font-sans text-slate-800 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col items-center">
        <img src="https://cdn.builder.io/api/v1/image/assets%2Fbd65b3cd7a86452e803a3d7dc7a3d048%2F4447a86c5269426e9a4e9dfb765a6409" alt="ACES Logo" className="h-24 w-auto mb-4" />
        <h1 className="text-2xl font-semibold text-white mb-1">Driver App</h1>
        <p className="text-slate-200 text-sm text-center max-w-xs">
          Sign in with your assigned credentials to access fueling tasks.
        </p>
      </div>

      {/* Floating Card */}
      <Card className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
        <CardContent className="p-0">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
              <Input
                type="text"
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:outline-none shadow-sm text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <Input
                type="password"
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:outline-none shadow-sm text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="accent-blue-700" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <a href="#" className="text-blue-700 font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full bg-blue-800 text-white font-semibold py-2.5 rounded-lg shadow-md hover:bg-blue-900 transition">
              LOGIN
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-xs text-center mt-6 text-[#0B1759]">
        <span>Powered by</span>
        <strong> ACES MSD</strong>
      </p>
    </div>
  );
}
