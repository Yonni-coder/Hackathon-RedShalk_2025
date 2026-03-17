import { useAuthStore } from "@/stores/useAuthStore";
import Footer from "../navigation/footer"
import Navbar from "../navigation/navbar"
import useRoomsStore from "@/stores/roomsStore";
import { useEffect } from "react";

export default function Wrapper ({ children }: { children: React.ReactNode }) {
    const loadingRooms = useRoomsStore((s) => s.loading);
      const error = useRoomsStore((s) => s.error);
      const loadRooms = useRoomsStore((s) => s.loadRooms);
      const { authenticated } = useAuthStore()
    
      useEffect(() => {
        if (authenticated) loadRooms();
      }, [loadRooms]);
      
      if (loadingRooms) return
    return (
        <>
            <div className="z-10 border-box relative flex-col">
                <Navbar />
                <div className="px-5 md:px-[10%]">
                    {children}
                </div>
                <Footer />
            </div>
        </>
    )
}