'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribed as checkIsSubscribed,
  registerServiceWorker
} from '@/lib/push';

interface NotificationToggleProps {
  token: string;
  compact?: boolean;
}

export default function NotificationToggle({ token, compact = false }: NotificationToggleProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initNotifications = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        setPermission(getNotificationPermission());
        await registerServiceWorker();
        const subscribed = await checkIsSubscribed();
        setIsSubscribed(subscribed);
      }

      setIsLoading(false);
    };

    initNotifications();
  }, []);

  const handleToggle = async () => {
    if (!isSupported || isLoading) return;

    setIsLoading(true);

    try {
      if (isSubscribed) {
        const success = await unsubscribeFromPush(token);
        if (success) {
          setIsSubscribed(false);
        }
      } else {
        const success = await subscribeToPush(token);
        if (success) {
          setIsSubscribed(true);
          setPermission('granted');
        } else {
          setPermission(getNotificationPermission());
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${compact ? 'text-sm' : ''}`}>
        <BellOff className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        {!compact && <span>Bildirishnomalar bloklangan</span>}
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`p-2 rounded-lg transition-colors ${
          isSubscribed
            ? 'bg-orange-100 text-orange-600'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
        title={isSubscribed ? "Bildirishnomalar yoqilgan" : "Bildirishnomalarni yoqish"}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSubscribed ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-orange-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Bildirishnomalar</h3>
            <p className="text-sm text-gray-500">
              {isSubscribed
                ? "Yangi bronlar haqida xabar olasiz"
                : "Push-bildirishnomalarni yoqing"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isSubscribed ? 'bg-orange-500' : 'bg-gray-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSubscribed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
          {isLoading && (
            <Loader2 className="absolute inset-0 m-auto w-4 h-4 animate-spin text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );
}
