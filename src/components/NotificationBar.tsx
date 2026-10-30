import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, X, Truck, User, ArrowRight, ShieldCheck } from 'lucide-react';

export interface BookingNotification {
  id: string;
  type: 'ACCEPTED' | 'REJECTED';
  orderId: string;
  cargoDesc?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleUnit?: string;
  vehicleModel?: string;
  plateNumber?: string;
  route?: string;
  reason?: string;
  timestamp: string;
}

interface NotificationBarProps {
  notification: BookingNotification | null;
  onDismiss: () => void;
  onViewTracking?: (orderId: string) => void;
}

export const NotificationBar: React.FC<NotificationBarProps> = ({
  notification,
  onDismiss,
  onViewTracking
}) => {
  if (!notification) return null;

  const isAccepted = notification.type === 'ACCEPTED';

  return (
    <div className={`w-full py-2.5 px-4 transition-all duration-300 z-50 sticky top-0 shadow-md ${
      isAccepted 
        ? 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white border-b border-emerald-500/30' 
        : 'bg-gradient-to-r from-rose-950 via-red-900 to-amber-950 text-white border-b border-red-500/30'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        {/* Left Side: Status & Message */}
        <div className="flex items-start md:items-center gap-3">
          <div className="shrink-0 mt-0.5 md:mt-0">
            {isAccepted ? (
              <span className="p-1 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              </span>
            ) : (
              <span className="p-1 rounded-full bg-rose-400/20 text-rose-300 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-rose-300" />
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-wrap">
            <span className="font-extrabold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-full bg-black/25">
              {isAccepted ? 'BOOKING REQUEST ACCEPTED & DISPATCHED' : 'BOOKING REQUEST DECLINED'}
            </span>
            <span className="font-mono font-bold text-white">
              Order #{notification.orderId}
            </span>

            {isAccepted && notification.driverName && (
              <span className="flex items-center gap-1.5 text-emerald-100 font-medium">
                <User className="w-3.5 h-3.5 text-emerald-300" />
                <span>Driver: <strong className="text-white">{notification.driverName}</strong> ({notification.driverPhone})</span>
              </span>
            )}

            {isAccepted && notification.vehicleUnit && (
              <span className="flex items-center gap-1.5 text-emerald-100 font-medium">
                <Truck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Vehicle: <strong className="text-white">{notification.vehicleUnit}</strong> ({notification.vehicleModel || notification.plateNumber})</span>
              </span>
            )}

            {!isAccepted && (
              <span className="text-rose-200">
                {notification.reason || 'Requested corridor slot at full capacity. Please choose alternate time slot.'}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action & Close */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          {isAccepted && onViewTracking && (
            <button
              onClick={() => onViewTracking(notification.orderId)}
              className="px-3 py-1 rounded-full bg-emerald-400 text-emerald-950 font-bold hover:bg-emerald-300 transition-all liquid-btn flex items-center gap-1 cursor-pointer text-[11px]"
            >
              <span>Open Live GPS Track</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
