import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return <h2>Carregando...</h2>;
  }

  if (!session) {
    return <Navigate to="/admin/login" />;
  }

  return children;
}

export default ProtectedRoute;