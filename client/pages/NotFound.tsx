import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <AppShell>
      <Header />
      <div className="px-4 pb-10 pt-6">
        <div className="grid min-h-[60vh] place-items-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <p className="text-muted-foreground mb-4">Oops! Page not found</p>
            <a
              href="/"
              className="text-primary underline-offset-4 hover:underline"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default NotFound;
