"use client"

import { Card } from "@/components/ui/Card";
import { Clock } from "lucide-react";

interface BookingTrendsProps {
  hourlyData: number[];
}

export function BookingTrends({ hourlyData }: BookingTrendsProps) {
  const max = Math.max(...hourlyData, 1);
  const eveningHours = [17, 18, 19, 20, 21, 22]; // Typical peak hours

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Clock className="h-4 w-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Peak Hour Intensity</h3>
      </div>

      <div className="flex-1 flex items-end gap-1 px-2 h-32 mb-4">
        {hourlyData.map((val, i) => {
          const height = (val / max) * 100;
          const isPeakTime = eveningHours.includes(i);
          
          return (
            <div 
              key={i} 
              className="group relative flex-1"
              title={`${i}:00 - ${val} bookings`}
            >
              <div 
                style={{ height: `${Math.max(4, height)}%` }}
                className={`w-full rounded-t-sm transition-all duration-500 hover:opacity-80 ${
                  isPeakTime ? 'bg-orange-500/40' : 'bg-muted-foreground/10'
                } ${val > 0 ? (isPeakTime ? 'bg-orange-500' : 'bg-primary') : ''}`}
              />
              <div className="absolute opacity-0 group-hover:opacity-100 -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] px-1 rounded font-bold whitespace-nowrap transition-opacity">
                {i}:00
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-tighter pt-2 border-t border-border/50">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </Card>
  );
}
