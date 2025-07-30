'use client'

import { useEffect, useState } from 'react'
import { subscribeUser, unsubscribeUser } from '../actions'

export default function PushNotificationManager() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        reg.pushManager.getSubscription().then((sub) => {
          setSubscription(sub)
        })
      })
    }
  }, [])

  const subscribeToNotifications = async () => {
    if (!registration) return

    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      setSubscription(sub)
      await subscribeUser(sub)
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
    }
  }

  const unsubscribeFromNotifications = async () => {
    if (!subscription) return

    try {
      await subscription.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error)
    }
  }

  if (!registration) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {subscription ? (
        <button
          onClick={unsubscribeFromNotifications}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Disable Notifications
        </button>
      ) : (
        <button
          onClick={subscribeToNotifications}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Enable Notifications
        </button>
      )}
    </div>
  )
} 