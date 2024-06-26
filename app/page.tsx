"use client";
import Image from "next/image";
import "bootstrap/dist/css/bootstrap.min.css";
import "mapbox-gl/dist/mapbox-gl.css";
import ShopOffcanvas from "./components/ShopOffcanvas";
import useUserStore from "./useUserStore";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";

export default function Home() {
  const supabase = createClientComponentClient();
  const { setUser, user } = useUserStore();

  useEffect(() => {
    async function checkUser() {
      const res = await supabase.auth.getUser();

      if (res.data.user) {
        const userId = res.data.user.id;
        localStorage.setItem("userId", userId);
      } else {
        localStorage.removeItem("userId");
      }
    }

    checkUser();
  }, []);
  return <ShopOffcanvas />;
}
