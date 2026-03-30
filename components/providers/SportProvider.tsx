"use client"

import React, { createContext, useContext, useState, useEffect } from "react";

type Sport = "footshall" | "cricshall";

interface SportContextType {
  sport: Sport;
  setSport: (sport: Sport) => void;
  facilityType?: string;
}

const SportContext = createContext<SportContextType | undefined>(undefined);

export function SportProvider({ children, facilityType }: { children: React.ReactNode, facilityType?: string }) {
  const [sport, setSportState] = useState<Sport>("footshall");

  // Load from localStorage or force based on facility type
  useEffect(() => {
    // If facility is footshall ONLY, force it
    if (facilityType === 'football') {
      setSportState('footshall');
      return;
    }
    // If facility is cricshall ONLY, force it
    if (facilityType === 'cricket') {
      setSportState('cricshall');
      return;
    }

    const savedSport = localStorage.getItem("selectedSport") as Sport;
    if (savedSport && (savedSport === "footshall" || savedSport === "cricshall")) {
      setSportState(savedSport);
    }
  }, [facilityType]);

  const setSport = (newSport: Sport) => {
    // Prevent switching if facility is locked to one sport
    if (facilityType === 'football' || facilityType === 'cricket') return;
    
    setSportState(newSport);
    localStorage.setItem("selectedSport", newSport);
  };

  return (
    <SportContext.Provider value={{ sport, setSport, facilityType }}>
      {children}
    </SportContext.Provider>
  );
}

export function useSport() {
  const context = useContext(SportContext);
  if (context === undefined) {
    throw new Error("useSport must be used within a SportProvider");
  }
  return context;
}
